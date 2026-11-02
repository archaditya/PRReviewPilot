const { Op } = require('sequelize');
const db = require('../models');
const reviewService = require('../services/review.service');
const ApiResponse = require('../utils/api-response');
const QueryParser = require('../utils/query-parser');

class ReviewController {
  // Helper: Get all active organization IDs for the authenticated user
  async getUserOrgIds(userId, requestedOrgId = null) {
    const memberships = await db.OrganizationMember.findAll({
      where: { userId, status: 'active' },
      attributes: ['organizationId'],
    });

    const allowedOrgIds = memberships.map((m) => m.organizationId);

    if (requestedOrgId) {
      if (!allowedOrgIds.includes(requestedOrgId)) {
        return null;
      }
      return [requestedOrgId];
    }

    return allowedOrgIds;
  }

  // POST /api/reviews/trigger
  async triggerReview(req, res, next) {
    try {
      const { repositoryId, prNumber } = req.body;
      const user = req.user;

      if (!repositoryId || !prNumber) {
        return res.status(400).json({
          success: false,
          error: 'repositoryId and prNumber are required',
        });
      }

      const allowedOrgIds = await this.getUserOrgIds(user.id);
      const repo = await db.Repository.findOne({
        where: {
          id: repositoryId,
          organizationId: { [Op.in]: allowedOrgIds },
        },
      });

      if (!repo) {
        return res.status(404).json({ success: false, error: 'Repository not found or access denied.' });
      }

      const token = repo.provider === 'github' ? user.githubAccessToken : user.bitbucketAccessToken;
      const job = await reviewService.processPullRequestReview({
        repositoryId,
        prNumber: parseInt(prNumber, 10),
        userToken: token,
      });

      return res.status(202).json({
        success: true,
        message: 'Review job queued successfully',
        jobId: job.id,
      });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/reviews?repoId=...&orgId=...&page=1&limit=10&search=...&status=...&riskLevel=...
  async listReviews(req, res, next) {
    try {
      const { repoId, orgId, search, q } = req.query;
      const user = req.user;

      const allowedOrgIds = await this.getUserOrgIds(user.id, orgId);
      if (!allowedOrgIds || allowedOrgIds.length === 0) {
        return ApiResponse.paginated(res, {
          data: [],
          total: 0,
          page: 1,
          limit: 10,
          resourceKey: 'reviews',
        });
      }

      const { page, limit, offset } = QueryParser.parsePagination(req.query, 10, 100);

      const where = {};
      if (repoId) where.repositoryId = repoId;

      const filters = QueryParser.parseFilters(req.query, {
        status: 'status',
        riskLevel: 'riskLevel',
      });
      Object.assign(where, filters);

      const searchTerm = search || q;
      const prWhere = {};
      if (searchTerm && searchTerm.trim()) {
        const term = `%${searchTerm.trim()}%`;
        prWhere[Op.or] = [
          { title: { [Op.iLike]: term } },
          { author: { [Op.iLike]: term } },
        ];
      }

      const { rows: jobs, count: total } = await db.ReviewJob.findAndCountAll({
        where,
        include: [
          {
            model: db.Repository,
            as: 'repository',
            attributes: ['id', 'name', 'provider', 'providerFullName', 'organizationId'],
            where: {
              organizationId: { [Op.in]: allowedOrgIds },
            },
            required: true,
          },
          {
            model: db.PullRequest,
            as: 'pullRequest',
            attributes: ['title', 'author', 'baseBranch', 'headBranch'],
            where: Object.keys(prWhere).length > 0 ? prWhere : undefined,
            required: Object.keys(prWhere).length > 0,
          },
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      });

      return ApiResponse.paginated(res, {
        data: jobs,
        total,
        page,
        limit,
        message: 'Review jobs retrieved successfully',
        resourceKey: 'reviews',
      });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/reviews/:id
  async getReviewDetails(req, res, next) {
    try {
      const { id } = req.params;
      const allowedOrgIds = await this.getUserOrgIds(req.user.id);

      const job = await db.ReviewJob.findByPk(id, {
        include: [
          { model: db.Repository, as: 'repository' },
          { model: db.PullRequest, as: 'pullRequest' },
          { model: db.ReviewFinding, as: 'findings' },
          { model: db.JobEvent, as: 'events', order: [['createdAt', 'ASC']] },
        ],
      });

      if (!job || !job.repository || !allowedOrgIds.includes(job.repository.organizationId)) {
        return res.status(404).json({ success: false, error: 'Review job not found or access denied.' });
      }

      return res.json({ success: true, review: job });
    } catch (err) {
      next(err);
    }
  }

  // PATCH /api/reviews/:jobId/findings/:findingId
  async updateFindingStatus(req, res, next) {
    try {
      const { jobId, findingId } = req.params;
      const { status } = req.body;
      const allowedOrgIds = await this.getUserOrgIds(req.user.id);

      const job = await db.ReviewJob.findByPk(jobId, {
        include: [{ model: db.Repository, as: 'repository' }],
      });
      if (!job || !job.repository || !allowedOrgIds.includes(job.repository.organizationId)) {
        return res.status(404).json({ success: false, error: 'Review job not found or access denied.' });
      }

      if (!['resolved', 'dismissed', 'open'].includes(status)) {
        return res.status(400).json({ success: false, error: 'Invalid finding status' });
      }

      const finding = await db.ReviewFinding.findOne({
        where: { id: findingId, reviewJobId: jobId },
      });

      if (!finding) {
        return res.status(404).json({ success: false, error: 'Finding not found' });
      }

      finding.status = status;
      await finding.save();

      return res.json({ success: true, finding });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ReviewController();
