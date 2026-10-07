const db = require('../models');
const { getProvider } = require('../integrations/providers');
const config = require('../config');

class RepoController {
  // GET /api/repositories/provider-repos?provider=github|bitbucket&orgId=...
  async listAvailableProviderRepos(req, res, next) {
    try {
      const { provider: providerName } = req.query;
      const user = req.user;

      if (!providerName || !['github', 'bitbucket'].includes(providerName)) {
        return res.status(400).json({ success: false, error: 'Valid provider (github or bitbucket) is required' });
      }

      const token = providerName === 'github' ? user.githubAccessToken : user.bitbucketAccessToken;
      if (!token) {
        return res.status(400).json({
          success: false,
          error: `Please connect your ${providerName} account first.`,
        });
      }

      const provider = getProvider(providerName);
      const repos = await provider.listRepositories(token);

      return res.json({ success: true, repositories: repos });
    } catch (err) {
      next(err);
    }
  }

  // POST /api/repositories/connect
  async connectRepository(req, res, next) {
    try {
      const { organizationId, provider: providerName, repoFullName } = req.body;
      const user = req.user;

      if (!organizationId || !providerName || !repoFullName) {
        return res.status(400).json({
          success: false,
          error: 'organizationId, provider, and repoFullName are required',
        });
      }

      // Check organization membership
      const membership = await db.OrganizationMember.findOne({
        where: { organizationId, userId: user.id },
      });

      if (!membership || !['owner', 'admin'].includes(membership.role)) {
        return res.status(403).json({
          success: false,
          error: 'Only organization owners or admins can connect repositories',
        });
      }

      const token = providerName === 'github' ? user.githubAccessToken : user.bitbucketAccessToken;
      if (!token) {
        return res.status(400).json({
          success: false,
          error: `User does not have an active ${providerName} token`,
        });
      }

      const provider = getProvider(providerName);
      // Fetch repo details to confirm existence
      const repos = await provider.listRepositories(token);
      const repoData = repos.find((r) => r.fullName.toLowerCase() === repoFullName.toLowerCase());

      if (!repoData) {
        return res.status(404).json({
          success: false,
          error: `Repository ${repoFullName} not found on ${providerName}`,
        });
      }

      // Register webhook on GitHub/Bitbucket
      const webhookUrl = `${config.apiUrl}/api/webhooks/${providerName}`;
      let webhookId = null;
      try {
        const hook = await provider.createWebhook(token, repoFullName, webhookUrl);
        webhookId = hook.id;
      } catch (err) {
        // Proceed even if webhook setup needs admin permissions or already exists
      }

      // Upsert repository in database
      const [repo, created] = await db.Repository.findOrCreate({
        where: {
          organizationId,
          provider: providerName,
          providerRepoId: String(repoData.id),
        },
        defaults: {
          organizationId,
          provider: providerName,
          providerRepoId: String(repoData.id),
          providerFullName: repoData.fullName,
          name: repoData.name,
          defaultBranch: repoData.defaultBranch || 'main',
          language: repoData.language,
          isPrivate: repoData.isPrivate,
          cloneUrl: repoData.cloneUrl,
          htmlUrl: repoData.htmlUrl,
          description: repoData.description,
          webhookId,
          status: 'active',
        },
      });

      if (!created) {
        repo.providerFullName = repoData.fullName;
        repo.status = 'active';
        if (webhookId) repo.webhookId = webhookId;
        await repo.save();
      }

      return res.status(201).json({ success: true, repository: repo });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/repositories?orgId=...
  async listConnectedRepositories(req, res, next) {
    try {
      const { orgId } = req.query;
      const user = req.user;

      const whereClause = { status: 'active' };
      if (orgId) {
        whereClause.organizationId = orgId;
      }

      const repos = await db.Repository.findAll({
        where: whereClause,
        include: [{ model: db.Organization, as: 'organization', attributes: ['id', 'name', 'slug'] }],
        order: [['createdAt', 'DESC']],
      });

      return res.json({ success: true, repositories: repos });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/repositories/:id
  async getRepositoryDetails(req, res, next) {
    try {
      const { id } = req.params;
      const repo = await db.Repository.findByPk(id, {
        include: [{ model: db.Organization, as: 'organization' }],
      });

      if (!repo) {
        return res.status(404).json({ success: false, error: 'Repository not found' });
      }

      return res.json({ success: true, repository: repo });
    } catch (err) {
      next(err);
    }
  }

  // PATCH /api/repositories/:id/config
  async updateRepositoryConfig(req, res, next) {
    try {
      const { id } = req.params;
      const { reviewConfig } = req.body;

      const repo = await db.Repository.findByPk(id);
      if (!repo) {
        return res.status(404).json({ success: false, error: 'Repository not found' });
      }

      repo.reviewConfig = {
        ...repo.reviewConfig,
        ...reviewConfig,
      };

      await repo.save();
      return res.json({ success: true, repository: repo });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new RepoController();
