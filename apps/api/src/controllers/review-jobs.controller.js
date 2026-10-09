const reviewJobService = require('../services/review-job.service');

async function listByRepository(req, res, next) {
  try {
    const { repositoryId, limit, cursor } = req.query;
    const userId = req.user ? (req.user.id || req.user.sub) : null;
    const jobs = await reviewJobService.listForRepository(userId, repositoryId, {
      limit,
      cursor,
    });
    res.json({ data: jobs });
  } catch (err) {
    next(err);
  }
}

async function get(req, res, next) {
  try {
    const userId = req.user ? (req.user.id || req.user.sub) : null;
    const job = await reviewJobService.getById(userId, req.params.id);
    res.json({ data: job });
  } catch (err) {
    next(err);
  }
}

async function cancel(req, res, next) {
  try {
    const userId = req.user ? (req.user.id || req.user.sub) : null;
    const job = await reviewJobService.cancelJob(userId, req.params.id);
    res.json({ data: job });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const userId = req.user ? (req.user.id || req.user.sub) : null;
    const result = await reviewJobService.deleteJob(userId, req.params.id);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
}

async function retry(req, res, next) {
  try {
    const userId = req.user ? (req.user.id || req.user.sub) : null;
    const job = await reviewJobService.retryJob(userId, req.params.id);
    res.json({ data: job });
  } catch (err) {
    next(err);
  }
}

module.exports = { listByRepository, get, cancel, remove, retry };
