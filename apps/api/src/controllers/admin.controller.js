const bcrypt = require('bcryptjs');
const db = require('../models');
const config = require('../config');
const logger = require('../utils/logger');

class AdminController {
  // GET /api/admin/stats
  async getPlatformStats(req, res, next) {
    try {
      const totalUsers = await db.User.count();
      const totalRepos = await db.Repository.count();
      const totalReviews = await db.ReviewJob.count();

      const jobs = await db.ReviewJob.findAll({
        attributes: ['tokensUsed', 'estimatedCostUsd', 'durationMs', 'status'],
      });

      const totalTokens = jobs.reduce((sum, j) => sum + (j.tokensUsed || 0), 0);
      const totalCostUsd = jobs.reduce((sum, j) => sum + (j.estimatedCostUsd || 0.0), 0.0);
      const completedJobs = jobs.filter((j) => j.status === 'completed');
      const avgDurationMs =
        completedJobs.length > 0
          ? Math.round(completedJobs.reduce((sum, j) => sum + (j.durationMs || 0), 0) / completedJobs.length)
          : 0;

      return res.json({
        success: true,
        stats: {
          totalUsers,
          totalRepos,
          totalReviews,
          totalTokens,
          totalCostUsd: Number(totalCostUsd.toFixed(4)),
          avgDurationMs,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/admin/health
  async getSystemHealth(req, res, next) {
    try {
      const results = {};

      // 1. PostgreSQL
      const pgStart = Date.now();
      try {
        await db.sequelize.query('SELECT 1');
        results.postgres = {
          status: 'healthy',
          latencyMs: Date.now() - pgStart,
          message: 'PostgreSQL connection active',
        };
      } catch (err) {
        results.postgres = {
          status: 'unhealthy',
          latencyMs: Date.now() - pgStart,
          error: err.message,
        };
      }

      // 2. Redis
      const redisStart = Date.now();
      try {
        const { getRedisClient } = require('../db/redis');
        const redisClient = getRedisClient();
        await redisClient.ping();
        results.redis = {
          status: 'healthy',
          latencyMs: Date.now() - redisStart,
          message: 'Redis ping OK',
        };
      } catch (err) {
        results.redis = {
          status: 'unhealthy',
          latencyMs: Date.now() - redisStart,
          error: err.message,
        };
      }

      // 3. Neo4j Graph DB
      const neo4jStart = Date.now();
      try {
        const { runQuery } = require('../integrations/neo4j/client');
        const queryRes = await runQuery('MATCH (n) RETURN count(n) AS nodeCount LIMIT 1');
        const nodeCount = queryRes?.[0]?.nodeCount?.low ?? queryRes?.[0]?.nodeCount ?? 0;
        results.neo4j = {
          status: 'healthy',
          latencyMs: Date.now() - neo4jStart,
          nodeCount: Number(nodeCount),
          message: `Neo4j operational (${nodeCount} nodes)`,
        };
      } catch (err) {
        results.neo4j = {
          status: 'unhealthy',
          latencyMs: Date.now() - neo4jStart,
          error: err.message,
        };
      }

      // 4. AI Microservice
      const aiStart = Date.now();
      try {
        const aiUrl = config.aiService?.url || 'http://ai-service:8001';
        const aiRes = await fetch(`${aiUrl}/health`, { signal: AbortSignal.timeout(4000) });
        if (aiRes.ok) {
          results.aiService = {
            status: 'healthy',
            latencyMs: Date.now() - aiStart,
            model: config.openaiModel || 'gpt-4o-mini',
            message: 'AI Service response OK',
          };
        } else {
          results.aiService = {
            status: 'degraded',
            latencyMs: Date.now() - aiStart,
            error: `HTTP ${aiRes.status}`,
          };
        }
      } catch (err) {
        results.aiService = {
          status: 'unhealthy',
          latencyMs: Date.now() - aiStart,
          error: err.message,
        };
      }

      // 5. Indexer Microservice (Tree-sitter AST)
      const indexerStart = Date.now();
      try {
        const indexerUrl = config.indexerServiceUrl || 'http://indexer-service:8001';
        const indexerRes = await fetch(`${indexerUrl}/health`, { signal: AbortSignal.timeout(4000) });
        if (indexerRes.ok) {
          results.indexerService = {
            status: 'healthy',
            latencyMs: Date.now() - indexerStart,
            message: 'Tree-sitter Indexer response OK',
          };
        } else {
          results.indexerService = {
            status: 'degraded',
            latencyMs: Date.now() - indexerStart,
            error: `HTTP ${indexerRes.status}`,
          };
        }
      } catch (err) {
        results.indexerService = {
          status: 'unhealthy',
          latencyMs: Date.now() - indexerStart,
          error: err.message,
        };
      }

      // 6. Node.js API Process Details
      const mem = process.memoryUsage();
      const processInfo = {
        uptimeSeconds: Math.floor(process.uptime()),
        nodeVersion: process.version,
        platform: process.platform,
        heapUsedMb: (mem.heapUsed / 1024 / 1024).toFixed(1),
        rssMb: (mem.rss / 1024 / 1024).toFixed(1),
        environment: config.env || 'production',
      };

      return res.json({
        success: true,
        health: results,
        process: processInfo,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/admin/config
  async getSystemConfig(req, res, next) {
    try {
      const ghKey = config.github?.privateKey || '';
      const sanitized = {
        app: {
          name: 'ReviewPilot Enterprise',
          environment: config.env || 'production',
          appUrl: config.appUrl || 'https://prreviewpilot.archadi.dev',
          apiUrl: config.apiUrl || 'https://prreviewpilot.archadi.dev/api',
        },
        github: {
          appId: config.github?.appId || 'Not configured',
          slug: config.github?.slug || 'Not configured',
          clientId: config.github?.clientId ? `${config.github.clientId.substring(0, 8)}...` : 'Not configured',
          hasClientSecret: Boolean(config.github?.clientSecret),
          hasWebhookSecret: Boolean(config.github?.webhookSecret),
          hasPrivateKey: Boolean(ghKey && ghKey.length > 50),
          privateKeyLength: ghKey ? ghKey.length : 0,
        },
        bitbucket: {
          clientId: config.bitbucket?.clientId ? `${config.bitbucket.clientId.substring(0, 8)}...` : 'Not configured',
          redirectUri: config.bitbucket?.redirectUri || 'Not configured',
          hasClientSecret: Boolean(config.bitbucket?.clientSecret),
        },
        aiService: {
          url: config.aiService?.url || 'http://ai-service:8001',
          model: config.openaiModel || 'gpt-4o-mini',
          hasApiKey: Boolean(config.aiService?.apiKey),
          timeoutMs: config.aiService?.timeoutMs || 120000,
        },
        graph: {
          neo4jUri: config.neo4j?.uri || 'bolt://neo4j:7687',
          neo4jUser: config.neo4j?.user || 'neo4j',
          indexerServiceUrl: config.indexerServiceUrl || 'http://indexer-service:8001',
        },
      };

      return res.json({ success: true, config: sanitized });
    } catch (err) {
      next(err);
    }
  }

  // POST /api/admin/system/test-service
  async testServiceConnection(req, res, next) {
    try {
      const { service } = req.body;
      const start = Date.now();

      if (service === 'github') {
        const { getApp } = require('../integrations/github/app-auth');
        const app = await getApp();
        const { data } = await app.octokit.request('GET /app');
        return res.json({
          success: true,
          latencyMs: Date.now() - start,
          message: `GitHub App authenticated as "${data.name}" (ID: ${data.id})`,
        });
      }

      if (service === 'neo4j') {
        const { runQuery } = require('../integrations/neo4j/client');
        const r = await runQuery('RETURN datetime() AS now');
        return res.json({
          success: true,
          latencyMs: Date.now() - start,
          message: `Neo4j Bolt connection verified: ${JSON.stringify(r[0])}`,
        });
      }

      if (service === 'redis') {
        const { getRedisClient } = require('../db/redis');
        const pong = await getRedisClient().ping();
        return res.json({
          success: true,
          latencyMs: Date.now() - start,
          message: `Redis replied: ${pong}`,
        });
      }

      if (service === 'ai') {
        const aiUrl = config.aiService?.url || 'http://ai-service:8001';
        const r = await fetch(`${aiUrl}/health`, { signal: AbortSignal.timeout(5000) });
        const text = await r.text();
        return res.json({
          success: r.ok,
          latencyMs: Date.now() - start,
          message: `AI Service HTTP ${r.status}: ${text}`,
        });
      }

      if (service === 'indexer') {
        const indexerUrl = config.indexerServiceUrl || 'http://indexer-service:8001';
        const r = await fetch(`${indexerUrl}/health`, { signal: AbortSignal.timeout(5000) });
        const text = await r.text();
        return res.json({
          success: r.ok,
          latencyMs: Date.now() - start,
          message: `Indexer Service HTTP ${r.status}: ${text}`,
        });
      }

      return res.status(400).json({ success: false, error: 'Unknown service to test' });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // GET /api/admin/jobs
  async getJobsAudit(req, res, next) {
    try {
      let reviewJobs = [];
      try {
        reviewJobs = await db.ReviewJob.findAll({
          limit: 50,
          order: [['createdAt', 'DESC']],
          include: [
            {
              model: db.Repository,
              as: 'repository',
              attributes: ['id', 'name', 'providerFullName', 'defaultBranch'],
              required: false,
            },
            {
              model: db.PullRequest,
              as: 'pullRequest',
              attributes: ['id', 'prNumber', 'title', 'headBranch', 'baseBranch'],
              required: false,
            },
          ],
        });
      } catch (qErr) {
        logger.warn({ err: qErr.message }, 'Failed detailed reviewJobs join in admin, falling back');
        reviewJobs = await db.ReviewJob.findAll({
          limit: 50,
          order: [['createdAt', 'DESC']],
        });
      }

      let repoIndexing = [];
      try {
        repoIndexing = await db.Repository.findAll({
          attributes: [
            'id',
            'name',
            'providerFullName',
            'indexStatus',
            'indexedCommitSha',
            'indexedAt',
            'fileCount',
            'symbolCount',
            'indexError',
            'updatedAt',
          ],
          order: [['updatedAt', 'DESC']],
        });
      } catch (rErr) {
        logger.warn({ err: rErr.message }, 'Failed repoIndexing query in admin');
      }

      return res.json({
        success: true,
        reviewJobs,
        repoIndexing,
      });
    } catch (err) {
      next(err);
    }
  }

  // POST /api/admin/jobs/:id/retry
  async retryReviewJob(req, res, next) {
    try {
      const { id } = req.params;
      const job = await db.ReviewJob.findByPk(id);
      if (!job) {
        return res.status(404).json({ success: false, error: 'Job not found' });
      }

      job.status = 'pending';
      job.error = null;
      await job.save();

      const reviewService = require('../services/review.service');
      reviewService.executeReviewJob(job.id).catch((err) => {
        logger.error({ jobId: job.id, err: err.message }, 'Admin retried job failed in background');
      });

      return res.json({ success: true, message: 'Review job queued for retry', job });
    } catch (err) {
      next(err);
    }
  }

  // POST /api/admin/system/cache-flush
  async flushCache(req, res, next) {
    try {
      const { getRedisClient } = require('../db/redis');
      const redis = getRedisClient();
      await redis.flushdb();
      return res.json({ success: true, message: 'Redis cache flushed successfully' });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/admin/users
  async listUsersWithUsage(req, res, next) {
    try {
      const users = await db.User.findAll({
        attributes: [
          'id',
          'name',
          'email',
          'role',
          'status',
          'githubUsername',
          'bitbucketUsername',
          'usage',
          'createdAt',
          'lastLoginAt',
        ],
        include: [
          {
            model: db.Organization,
            as: 'ownedOrganizations',
            attributes: ['id', 'name', 'slug', 'features'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      return res.json({ success: true, users });
    } catch (err) {
      next(err);
    }
  }

  // PATCH /api/admin/users/:id/quota
  async updateUserQuota(req, res, next) {
    try {
      const { id } = req.params;
      const { maxReviewsPerMonth } = req.body;

      const user = await db.User.findByPk(id, {
        include: [{ model: db.Organization, as: 'ownedOrganizations' }],
      });

      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      for (const org of user.ownedOrganizations) {
        org.features = {
          ...org.features,
          max_reviews_per_month: parseInt(maxReviewsPerMonth, 10),
        };
        await org.save();
      }

      return res.json({ success: true, message: 'Quota updated successfully' });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/admin/users/:id/details
  async getUserDetails(req, res, next) {
    try {
      const { id } = req.params;
      const { Op } = require('sequelize');

      const user = await db.User.findByPk(id, {
        attributes: [
          'id',
          'name',
          'email',
          'role',
          'status',
          'githubUsername',
          'githubUserId',
          'bitbucketUsername',
          'avatarUrl',
          'usage',
          'emailVerified',
          'createdAt',
          'lastLoginAt',
          'updatedAt',
        ],
        include: [
          {
            model: db.Organization,
            as: 'ownedOrganizations',
            attributes: ['id', 'name', 'slug', 'features'],
          },
          {
            model: db.Organization,
            as: 'organizations',
            attributes: ['id', 'name', 'slug', 'features'],
            through: { attributes: ['role'] },
          },
        ],
      });

      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      // Installations linked to this user
      const installations = await db.Installation.findAll({
        where: { installedByUserId: id },
        attributes: ['id', 'provider', 'providerInstallationId', 'accountLogin', 'accountType', 'status', 'createdAt'],
      });

      const instIds = installations.map((i) => i.id);
      const ownedOrgIds = (user.ownedOrganizations || []).map((o) => o.id);
      const memberOrgIds = (user.organizations || []).map((o) => o.id);
      const allOrgIds = Array.from(new Set([...ownedOrgIds, ...memberOrgIds]));

      // Repositories associated with this user
      const whereConditions = [];
      if (instIds.length > 0) whereConditions.push({ installationId: { [Op.in]: instIds } });
      if (allOrgIds.length > 0) whereConditions.push({ organizationId: { [Op.in]: allOrgIds } });

      let repositories = [];
      if (whereConditions.length > 0) {
        repositories = await db.Repository.findAll({
          where: { [Op.or]: whereConditions },
          attributes: [
            'id',
            'name',
            'providerFullName',
            'provider',
            'defaultBranch',
            'status',
            'indexStatus',
            'fileCount',
            'symbolCount',
            'indexedAt',
            'indexError',
            'createdAt',
          ],
          order: [['createdAt', 'DESC']],
        });
      }

      const repoIds = repositories.map((r) => r.id);

      // Pull requests & Review jobs for user's repos
      let pullRequests = [];
      let reviewJobs = [];

      if (repoIds.length > 0) {
        try {
          pullRequests = await db.PullRequest.findAll({
            where: { repositoryId: { [Op.in]: repoIds } },
            attributes: ['id', 'repositoryId', 'prNumber', 'title', 'headBranch', 'baseBranch', 'status', 'createdAt'],
            order: [['createdAt', 'DESC']],
            limit: 25,
          });
        } catch (e) {
          logger.warn({ err: e.message }, 'Failed fetching pull requests for user repos');
        }

        try {
          reviewJobs = await db.ReviewJob.findAll({
            where: { repositoryId: { [Op.in]: repoIds } },
            attributes: ['id', 'repositoryId', 'status', 'tokensUsed', 'estimatedCostUsd', 'durationMs', 'errorMessage', 'createdAt'],
            order: [['createdAt', 'DESC']],
            limit: 25,
          });
        } catch (e) {
          logger.warn({ err: e.message }, 'Failed fetching review jobs for user repos');
        }
      }

      return res.json({
        success: true,
        user,
        installations,
        repositories,
        pullRequests,
        reviewJobs,
      });
    } catch (err) {
      next(err);
    }
  }

  // DELETE /api/admin/users/:id
  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;

      // 1. Edge Case: Prevent admin deleting their own currently logged-in account
      if (req.user && req.user.id === id) {
        return res.status(400).json({ success: false, error: 'Cannot delete your own active administrator account.' });
      }

      const targetUser = await db.User.findByPk(id);
      if (!targetUser) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      // 2. Edge Case: Non-superadmin cannot delete a superadmin
      if (targetUser.role === 'superadmin' && req.user.role !== 'superadmin') {
        return res.status(403).json({ success: false, error: 'Only superadmins are permitted to delete a superadmin account.' });
      }

      // 3. Immediately invalidate all active sessions in Redis so the user is kicked out
      try {
        const sessionService = require('../services/session.service');
        await sessionService.revokeAllUserSessions(id);
      } catch (sessErr) {
        logger.warn({ err: sessErr.message }, 'Failed revoking sessions during user delete');
      }

      // 4. Clean up organization memberships and related user records
      await db.OrganizationMember.destroy({ where: { userId: id } });

      const emailDeleted = targetUser.email;
      await targetUser.destroy();

      logger.info({ adminId: req.user.id, targetUserId: id, targetEmail: emailDeleted }, 'Admin deleted user account');

      return res.json({ success: true, message: `User account ${emailDeleted} has been permanently deleted.` });
    } catch (err) {
      next(err);
    }
  }

  // PATCH /api/admin/users/:id/restrictions
  async updateUserRestrictions(req, res, next) {
    try {
      const { id } = req.params;
      const { maxReviewsPerMonth, isBlocked, notes } = req.body;

      const user = await db.User.findByPk(id, {
        include: [{ model: db.Organization, as: 'ownedOrganizations' }],
      });

      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      if (typeof isBlocked === 'boolean') {
        user.status = isBlocked ? 'blocked' : 'active';
        await user.save();

        if (isBlocked) {
          const sessionService = require('../services/session.service');
          await sessionService.revokeAllUserSessions(id).catch(() => {});
        }
      }

      if (maxReviewsPerMonth !== undefined) {
        for (const org of user.ownedOrganizations || []) {
          org.features = {
            ...org.features,
            max_reviews_per_month: parseInt(maxReviewsPerMonth, 10),
            admin_notes: notes || org.features?.admin_notes,
          };
          await org.save();
        }
      }

      return res.json({ success: true, message: 'User restrictions updated successfully', user });
    } catch (err) {
      next(err);
    }
  }

  // PATCH /api/admin/users/:id/status
  async updateUserStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['active', 'suspended', 'blocked', 'deactivated'].includes(status)) {
        return res.status(400).json({ success: false, error: 'Invalid status. Must be active, suspended, or blocked.' });
      }

      // Edge case: cannot block self
      if (req.user && req.user.id === id && (status === 'suspended' || status === 'blocked')) {
        return res.status(400).json({ success: false, error: 'Cannot suspend or block your own active account.' });
      }

      const user = await db.User.findByPk(id);
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      user.status = status;
      await user.save();

      // If suspended or blocked, kill all active sessions immediately
      if (status === 'suspended' || status === 'blocked' || status === 'deactivated') {
        const sessionService = require('../services/session.service');
        await sessionService.revokeAllUserSessions(id).catch(() => {});
      }

      return res.json({ success: true, user });
    } catch (err) {
      next(err);
    }
  }

  // PATCH /api/admin/users/:id/role
  async updateUserRole(req, res, next) {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!['user', 'admin', 'superadmin'].includes(role)) {
        return res.status(400).json({ success: false, error: 'Invalid role' });
      }

      // Edge case: cannot demote self if superadmin
      if (req.user && req.user.id === id && role !== 'superadmin' && req.user.role === 'superadmin') {
        return res.status(400).json({ success: false, error: 'Cannot demote your own superadmin role.' });
      }

      const user = await db.User.findByPk(id);
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      user.role = role;
      await user.save();

      return res.json({ success: true, user });
    } catch (err) {
      next(err);
    }
  }

  // POST /api/admin/users/:id/reset-password
  async resetUserPassword(req, res, next) {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;

      if (!newPassword || newPassword.length < 8) {
        return res.status(400).json({ success: false, error: 'Password must be at least 8 characters long' });
      }

      const user = await db.User.findByPk(id);
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      const salt = await bcrypt.genSalt(12);
      user.passwordHash = await bcrypt.hash(newPassword, salt);
      await user.save();

      // Invalidate old sessions to enforce login with new password
      const sessionService = require('../services/session.service');
      await sessionService.revokeAllUserSessions(id).catch(() => {});

      return res.json({ success: true, message: `Password successfully updated for ${user.email}` });
    } catch (err) {
      next(err);
    }
  }

  // POST /api/admin/users/:id/reset-usage
  async resetUserUsage(req, res, next) {
    try {
      const { id } = req.params;
      const user = await db.User.findByPk(id);
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      user.usage = { review_count: 0, tokens_used: 0, cost_usd: 0 };
      await user.save();

      return res.json({ success: true, message: 'Usage counter reset to zero' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AdminController();
