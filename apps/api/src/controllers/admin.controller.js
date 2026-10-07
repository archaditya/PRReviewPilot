const db = require('../models');

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
      const avgDurationMs = completedJobs.length > 0
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

  // PATCH /api/admin/users/:id/status
  async updateUserStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['active', 'suspended', 'deactivated'].includes(status)) {
        return res.status(400).json({ success: false, error: 'Invalid status' });
      }

      const user = await db.User.findByPk(id);
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      user.status = status;
      await user.save();

      return res.json({ success: true, user });
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
