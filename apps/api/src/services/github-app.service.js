const fs = require('fs');
const { App } = require('@octokit/app');
const { Octokit } = require('@octokit/rest');
const config = require('../config');
const db = require('../models');
const logger = require('../utils/logger');

class GitHubAppService {
  constructor() {
    this.app = null;
    this.initApp();
  }

  initApp() {
    try {
      let privateKey = process.env.GITHUB_APP_PRIVATE_KEY;
      if (!privateKey && config.github.privateKeyPath && fs.existsSync(config.github.privateKeyPath)) {
        privateKey = fs.readFileSync(config.github.privateKeyPath, 'utf8');
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
    if (!this.app) {
      throw new Error('GitHub App is not configured on this server');
    }
    return this.app.getInstallationOctokit(parseInt(installationId, 10));
  }

  /**
   * Handle installation.created webhook: links GitHub installation to organization
   */
  async handleInstallationCreated(payload) {
    const { installation, sender } = payload;
    const providerInstallationId = String(installation.id);
    const accountLogin = installation.account.login;
    const accountType = installation.account.type;

    logger.info({ providerInstallationId, accountLogin }, 'GitHub App installed');

    // Find the user who installed the app or the matching organization
    let user = await db.User.findOne({
      where: { githubUsername: sender.login },
    });

    let org = null;
    if (user) {
      const membership = await db.OrganizationMember.findOne({
        where: { userId: user.id, role: ['owner', 'admin'] },
        include: [{ model: db.Organization, as: 'organization' }],
      });
      if (membership) org = membership.organization;
    }

    if (!org) {
      // Find or create an organization for this GitHub entity
      org = await db.Organization.findOne({ where: { slug: accountLogin.toLowerCase() } });
      if (!org && user) {
        org = await db.Organization.create({
          name: accountLogin,
          slug: accountLogin.toLowerCase(),
          ownerUserId: user.id,
        });
        await db.OrganizationMember.create({
          organizationId: org.id,
          userId: user.id,
          role: 'owner',
          status: 'active',
        });
      }
    }

    if (org) {
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
          permissions: installation.permissions || {},
          installedByUserId: user ? user.id : null,
          status: 'active',
        },
      });

      return instRecord;
    }
  }

  /**
   * Handle installation_repositories.added: automatically discovers and imports repos
   */
  async handleRepositoriesAdded(payload) {
    const { installation, repositories_added } = payload;
    const providerInstallationId = String(installation.id);

    const instRecord = await db.Installation.findOne({
      where: { provider: 'github', providerInstallationId },
    });

    if (!instRecord) {
      logger.warn({ providerInstallationId }, 'Installation not found for added repositories');
      return;
    }

    const orgId = instRecord.organizationId;
    const octokit = await this.getInstallationOctokit(installation.id);

    for (const repoMeta of repositories_added) {
      try {
        const { data: repoDetails } = await octokit.rest.repos.get({
          owner: repoMeta.full_name.split('/')[0],
          repo: repoMeta.name,
        });

        await db.Repository.findOrCreate({
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
