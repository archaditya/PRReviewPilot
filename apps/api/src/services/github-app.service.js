const fs = require('fs');
const config = require('../config');
const db = require('../models');
const logger = require('../utils/logger');

let AppClass = null;
async function getAppClass() {
  if (!AppClass) {
    const mod = await import('@octokit/app');
    AppClass = mod.App;
  }
  return AppClass;
}

class GitHubAppService {
  constructor() {
    this.app = null;
    this.initPromise = this.initApp();
  }

  async initApp() {
    try {
      const App = await getAppClass();
      let privateKey = process.env.GITHUB_APP_PRIVATE_KEY;
      if (!privateKey && config.github.privateKeyPath && fs.existsSync(config.github.privateKeyPath)) {
        privateKey = fs.readFileSync(config.github.privateKeyPath, 'utf8');
      }

      if (privateKey) {
        if (!privateKey.includes('-----BEGIN') && !privateKey.includes('-----BEGIN RSA')) {
          try {
            privateKey = Buffer.from(privateKey, 'base64').toString('utf8');
          } catch (e) {
            // fallback if not base64
          }
        }
        privateKey = privateKey.replace(/\\n/g, '\n');
      }

      if (config.github.appId && privateKey) {
        this.app = new App({
          appId: config.github.appId,
          privateKey,
          oauth: {
            clientId: config.github.clientId,
            clientSecret: config.github.clientSecret,
          },
          webhooks: {
            secret: config.github.webhookSecret,
          },
        });
        logger.info('GitHub App service initialized');
      } else {
        logger.warn('GitHub App credentials not configured; running in fallback mode');
      }
    } catch (err) {
      logger.error({ err: err.message }, 'Failed to initialize GitHub App');
    }
  }

  async getInstallationOctokit(installationId) {
    if (!this.app && this.initPromise) {
      await this.initPromise;
    }
    if (!this.app) {
      throw new Error('GitHub App is not configured on this server');
    }
    return this.app.getInstallationOctokit(parseInt(installationId, 10));
  }

  /**
   * Sync a specific installation by ID: fetches metadata and all granted repositories
   */
  async syncInstallation(installationId, userId = null) {
    if (!this.app && this.initPromise) {
      await this.initPromise;
    }
    if (!this.app) {
      throw new Error('GitHub App is not configured on this server');
    }

    const octokit = await this.getInstallationOctokit(installationId);

    // 1. Fetch installation details
    const { data: instData } = await octokit.request('GET /app/installations/{installation_id}', {
      installation_id: parseInt(installationId, 10),
    });

    const accountLogin = instData.account?.login || 'github-account';
    const accountType = instData.account?.type || 'User';
    const providerInstallationId = String(instData.id);

    // 2. Locate or create organization
    let org = null;
    if (userId) {
      const membership = await db.OrganizationMember.findOne({
        where: { userId },
        include: [{ model: db.Organization, as: 'organization' }],
      });
      if (membership) org = membership.organization;
    }

    if (!org) {
      org = await db.Organization.findOne({ where: { slug: accountLogin.toLowerCase() } });
    }
    if (!org) {
      // Find first organization in DB (e.g. Admin Workspace)
      org = await db.Organization.findOne({ order: [['createdAt', 'ASC']] });
    }
    if (!org) {
      org = await db.Organization.create({
        name: accountLogin,
        slug: accountLogin.toLowerCase(),
      });
    }

    // 3. Upsert Installation record
    const [instRecord] = await db.Installation.findOrCreate({
      where: {
        provider: 'github',
        providerInstallationId,
      },
      defaults: {
        organizationId: org.id,
        provider: 'github',
        providerInstallationId,
        accountLogin,
        accountType,
        permissions: instData.permissions || {},
        installedByUserId: userId,
        status: 'active',
      },
    });

    if (instRecord.status !== 'active' || instRecord.organizationId !== org.id) {
      instRecord.status = 'active';
      instRecord.organizationId = org.id;
      await instRecord.save();
    }

    // 4. Fetch all repositories accessible to this installation
    const { data: repoList } = await octokit.request('GET /installation/repositories');
    const repos = repoList.repositories || [];
    const synced = [];

    for (const r of repos) {
      const [repo] = await db.Repository.findOrCreate({
        where: {
          organizationId: org.id,
          provider: 'github',
          providerRepoId: String(r.id),
        },
        defaults: {
          organizationId: org.id,
          installationId: instRecord.id,
          provider: 'github',
          providerRepoId: String(r.id),
          providerFullName: r.full_name,
          name: r.name,
          defaultBranch: r.default_branch || 'main',
          language: r.language,
          isPrivate: r.private,
          cloneUrl: r.clone_url,
          htmlUrl: r.html_url,
          description: r.description,
          status: 'active',
        },
      });

      if (repo.status !== 'active' || repo.providerFullName !== r.full_name) {
        repo.status = 'active';
        repo.providerFullName = r.full_name;
        repo.defaultBranch = r.default_branch || 'main';
        await repo.save();
      }
      synced.push(repo);
    }

    logger.info({ installationId, accountLogin, count: synced.length }, 'Synced GitHub App installation and repositories');
    return { installation: instRecord, repositories: synced, count: synced.length };
  }

  /**
   * Sync all installations registered to this GitHub App
   */
  async syncAllInstallations(userId = null) {
    if (!this.app && this.initPromise) {
      await this.initPromise;
    }
    if (!this.app) {
      throw new Error('GitHub App is not configured on this server');
    }

    const { data: installations } = await this.app.octokit.request('GET /app/installations');
    const allRepos = [];

    for (const inst of installations) {
      try {
        const res = await this.syncInstallation(inst.id, userId);
        allRepos.push(...res.repositories);
      } catch (err) {
        logger.error({ err: err.message, installationId: inst.id }, 'Failed to sync installation');
      }
    }

    return allRepos;
  }

  /**
   * Handle installation.created webhook: links GitHub installation and syncs all repos
   */
  async handleInstallationCreated(payload) {
    const { installation, sender } = payload;
    const providerInstallationId = String(installation.id);
    const accountLogin = installation.account.login;

    logger.info({ providerInstallationId, accountLogin }, 'GitHub App installed webhook received');

    let user = await db.User.findOne({
      where: { githubUsername: sender.login },
    });

    return await this.syncInstallation(installation.id, user ? user.id : null);
  }

  /**
   * Handle installation_repositories.added: automatically discovers and imports repos
   */
  async handleRepositoriesAdded(payload) {
    const { installation, repositories_added } = payload;
    const providerInstallationId = String(installation.id);

    let instRecord = await db.Installation.findOne({
      where: { provider: 'github', providerInstallationId },
    });

    if (!instRecord) {
      logger.info({ providerInstallationId }, 'Installation not cached, running full sync');
      return await this.syncInstallation(installation.id);
    }

    const orgId = instRecord.organizationId;
    const octokit = await this.getInstallationOctokit(installation.id);

    for (const repoMeta of repositories_added) {
      try {
        const { data: repoDetails } = await octokit.rest.repos.get({
          owner: repoMeta.full_name.split('/')[0],
          repo: repoMeta.name,
        });

        const [repo] = await db.Repository.findOrCreate({
          where: {
            organizationId: orgId,
            provider: 'github',
            providerRepoId: String(repoDetails.id),
          },
          defaults: {
            organizationId: orgId,
            installationId: instRecord.id,
            provider: 'github',
            providerRepoId: String(repoDetails.id),
            providerFullName: repoDetails.full_name,
            name: repoDetails.name,
            defaultBranch: repoDetails.default_branch || 'main',
            language: repoDetails.language,
            isPrivate: repoDetails.private,
            cloneUrl: repoDetails.clone_url,
            htmlUrl: repoDetails.html_url,
            description: repoDetails.description,
            status: 'active',
          },
        });

        if (repo.status !== 'active') {
          repo.status = 'active';
          await repo.save();
        }
        logger.info({ repo: repoDetails.full_name }, 'Auto-imported repository via GitHub App');
      } catch (err) {
        logger.error({ err: err.message, repo: repoMeta.full_name }, 'Failed to auto-import repo');
      }
    }
  }

  /**
   * Handle installation_repositories.removed: deactivate repositories
   */
  async handleRepositoriesRemoved(payload) {
    const { repositories_removed } = payload;
    for (const repoMeta of repositories_removed) {
      await db.Repository.update(
        { status: 'archived' },
        { where: { provider: 'github', providerRepoId: String(repoMeta.id) } }
      );
    }
  }
}

module.exports = new GitHubAppService();
