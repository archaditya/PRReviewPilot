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

      // Fetch recent review jobs for this repository
      const jobs = await db.ReviewJob.findAll({
        where: { repositoryId: id },
        include: [{ model: db.PullRequest, as: 'pullRequest' }],
        order: [['createdAt', 'DESC']],
        limit: 30,
      });

      const totalJobs = await db.ReviewJob.count({ where: { repositoryId: id } });
      const completedJobs = await db.ReviewJob.count({ where: { repositoryId: id, status: 'completed' } });
      const highRiskJobs = await db.ReviewJob.count({
        where: {
          repositoryId: id,
          riskLevel: ['high', 'critical'],
        },
      });

      let totalFindings = 0;
      let totalTokens = 0;
      jobs.forEach((j) => {
        totalFindings += (j.findingsCount || 0);
        totalTokens += (j.tokensUsed || 0);
      });

      return res.json({
        success: true,
        repository: repo,
        jobs,
        stats: {
          totalReviews: totalJobs,
          completedReviews: completedJobs,
          highRiskReviews: highRiskJobs,
          totalFindings,
          totalTokens,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  // PATCH /api/repositories/:id/config
  async updateRepositoryConfig(req, res, next) {
    try {
      const { id } = req.params;
      const { reviewConfig, status } = req.body;

      const repo = await db.Repository.findByPk(id);
      if (!repo) {
        return res.status(404).json({ success: false, error: 'Repository not found' });
      }

      if (status && ['active', 'paused', 'archived'].includes(status)) {
        repo.status = status;
      }

      if (reviewConfig) {
        repo.reviewConfig = {
          ...repo.reviewConfig,
          ...reviewConfig,
        };
      }

      await repo.save();
      return res.json({ success: true, repository: repo });
    } catch (err) {
      next(err);
    }
  }

  // POST /api/repositories/:id/reindex
  async reindexRepository(req, res, next) {
    try {
      const { id } = req.params;
      const repo = await db.Repository.findByPk(id);
      if (!repo) {
        return res.status(404).json({ success: false, error: 'Repository not found' });
      }

      repo.indexStatus = 'INDEXING';
      repo.indexError = null;
      await repo.save();

      const { inngest } = require('../jobs');
      const repositoryService = require('../services/repository.service');
      const { resolveNumericInstallationId } = require('../integrations/github/app-auth');
      const fullName = repo.providerFullName || repo.name;
      const parts = fullName.split('/');
      const owner = parts.length > 1 ? parts[0] : 'owner';
      const repoName = parts.length > 1 ? parts[1] : repo.name;

      const numericInstallationId = await resolveNumericInstallationId(repo.installationId || repo.id);

      const jobPayload = {
        repositoryId: repo.id,
        installationId: numericInstallationId || repo.installationId,
        owner,
        repo: repoName,
        branch: repo.defaultBranch || 'main',
      };

      // Directly trigger runIndexJob in background immediately
      repositoryService.runIndexJob(jobPayload).catch((err) => {
        const logger = require('../utils/logger');
        logger.error({ repositoryId: repo.id, err: err?.message || err }, 'Direct background runIndexJob error');
      });

      // Also send event to Inngest if Inngest runner is available
      inngest
        .send({
          name: 'repo/index.requested',
          data: jobPayload,
        })
        .catch(() => {});

      return res.json({ success: true, message: 'Reindexing triggered', repository: repo });
    } catch (err) {
      next(err);
    }
  }

  // POST /api/repositories/:id/reset-index
  async resetIndexRepository(req, res, next) {
    try {
      const { id } = req.params;
      const repo = await db.Repository.findByPk(id);
      if (!repo) {
        return res.status(404).json({ success: false, error: 'Repository not found' });
      }

      repo.indexStatus = 'NOT_INDEXED';
      repo.indexError = null;
      await repo.save();

      const eventBus = require('../services/event-bus.service');
      eventBus.emitIndexStatusChange({ repositoryId: repo.id, indexStatus: 'NOT_INDEXED' });

      return res.json({ success: true, message: 'Index state reset', repository: repo });
    } catch (err) {
      next(err);
    }
  }

  // POST /api/repositories/:id/chat
  async chatWithRepo(req, res, next) {
    try {
      const { id } = req.params;
      const { message, history } = req.body;
      const repo = await db.Repository.findByPk(id);
      if (!repo) {
        return res.status(404).json({ success: false, error: 'Repository not found' });
      }

      const chatService = require('../services/chat.service');
      const response = await chatService.answerQuestion({
        repositoryId: id,
        userId: req.user.id,
        message,
        history,
      });

      return res.json({ success: true, ...response });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/repositories/:id/graph
  async getGraphOverview(req, res, next) {
    try {
      const { id } = req.params;
      const repo = await db.Repository.findByPk(id);
      if (!repo) {
        return res.status(404).json({ success: false, error: 'Repository not found' });
      }

      const indexerClient = require('../integrations/indexer-service-client');
      const status = await indexerClient.getIndexStatus(id).catch(() => null);

      return res.json({
        success: true,
        graph: {
          repositoryId: id,
          status: repo.indexStatus,
          fileCount: repo.fileCount,
          symbolCount: repo.symbolCount,
          indexedCommitSha: repo.indexedCommitSha,
          indexedAt: repo.indexedAt,
          details: status,
        },
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new RepoController();
