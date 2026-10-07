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

router.get('/stats', (req, res, next) => adminController.getPlatformStats(req, res, next));
router.get('/users', (req, res, next) => adminController.listUsersWithUsage(req, res, next));
router.patch('/users/:id/quota', (req, res, next) => adminController.updateUserQuota(req, res, next));
router.patch('/users/:id/status', (req, res, next) => adminController.updateUserStatus(req, res, next));
router.post('/users/:id/reset-usage', (req, res, next) => adminController.resetUserUsage(req, res, next));

module.exports = router;
