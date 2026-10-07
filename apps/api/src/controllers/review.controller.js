const db = require('../models');
const reviewService = require('../services/review.service');

class ReviewController {
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

      const repo = await db.Repository.findByPk(repositoryId);
      if (!repo) {
        return res.status(404).json({ success: false, error: 'Repository not found' });
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

  // GET /api/reviews?repoId=...&orgId=...
  async listReviews(req, res, next) {
    try {
      const { repoId, orgId, status } = req.query;

      const where = {};
      if (repoId) where.repositoryId = repoId;
      if (status) where.status = status;

      const jobs = await db.ReviewJob.findAll({
        where,
        include: [
          {
            model: db.Repository,
            as: 'repository',
            attributes: ['id', 'name', 'provider', 'providerFullName'],
            ...(orgId ? { where: { organizationId: orgId } } : {}),
          },
          {
            model: db.PullRequest,
            as: 'pullRequest',
            attributes: ['title', 'author', 'baseBranch', 'headBranch'],
          },
        ],
        order: [['createdAt', 'DESC']],
        limit: 50,
      });

      return res.json({ success: true, reviews: jobs });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/reviews/:id
  async getReviewDetails(req, res, next) {
    try {
      const { id } = req.params;

      const job = await db.ReviewJob.findByPk(id, {
        include: [
          { model: db.Repository, as: 'repository' },
          { model: db.PullRequest, as: 'pullRequest' },
          { model: db.ReviewFinding, as: 'findings' },
          { model: db.JobEvent, as: 'events', order: [['createdAt', 'ASC']] },
        ],
      });

      if (!job) {
        return res.status(404).json({ success: false, error: 'Review job not found' });
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
