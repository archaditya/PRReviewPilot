const express = require('express');
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

// Statutory Data Principal Rights (DPDP Act, 2023)
router.get('/me/export', authenticate, (req, res, next) => userController.exportUserData(req, res, next));
router.delete('/me', authenticate, (req, res, next) => userController.deleteCurrentUser(req, res, next));

module.exports = router;
