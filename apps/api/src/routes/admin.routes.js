const express = require('express');
const adminController = require('../controllers/admin.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

// Guard: Must be authenticated and have admin or superadmin role
function requireAdmin(req, res, next) {
  if (!req.user || !['admin', 'superadmin'].includes(req.user.role)) {
    return res.status(403).json({ success: false, error: 'Unauthorized: Admin access required.' });
  }
  next();
}

router.use(authenticate);
router.use(requireAdmin);

// Platform & Observability
router.get('/stats', (req, res, next) => adminController.getPlatformStats(req, res, next));
router.get('/health', (req, res, next) => adminController.getSystemHealth(req, res, next));
router.get('/config', (req, res, next) => adminController.getSystemConfig(req, res, next));
router.post('/system/test-service', (req, res, next) => adminController.testServiceConnection(req, res, next));
router.post('/system/cache-flush', (req, res, next) => adminController.flushCache(req, res, next));

// Jobs Audit & Queue Control
router.get('/jobs', (req, res, next) => adminController.getJobsAudit(req, res, next));
router.post('/jobs/:id/retry', (req, res, next) => adminController.retryReviewJob(req, res, next));

// User Management & Access Controls
router.get('/users', (req, res, next) => adminController.listUsersWithUsage(req, res, next));
router.get('/users/:id/details', (req, res, next) => adminController.getUserDetails(req, res, next));
router.delete('/users/:id', (req, res, next) => adminController.deleteUser(req, res, next));
router.patch('/users/:id/restrictions', (req, res, next) => adminController.updateUserRestrictions(req, res, next));
router.patch('/users/:id/quota', (req, res, next) => adminController.updateUserQuota(req, res, next));
router.patch('/users/:id/status', (req, res, next) => adminController.updateUserStatus(req, res, next));
router.patch('/users/:id/role', (req, res, next) => adminController.updateUserRole(req, res, next));
router.post('/users/:id/reset-password', (req, res, next) => adminController.resetUserPassword(req, res, next));
router.post('/users/:id/reset-usage', (req, res, next) => adminController.resetUserUsage(req, res, next));

module.exports = router;
