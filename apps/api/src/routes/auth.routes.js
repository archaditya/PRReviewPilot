const express = require('express');
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

// Public Local Auth
router.post('/register', (req, res, next) => authController.register(req, res, next));
router.post('/login', (req, res, next) => authController.login(req, res, next));
router.post('/refresh', (req, res, next) => authController.refresh(req, res, next));
router.post('/forgot-password', (req, res, next) => authController.forgotPassword(req, res, next));
router.post('/reset-password', (req, res, next) => authController.resetPassword(req, res, next));

// GitHub OAuth
router.get('/login/github', (req, res) => authController.githubLogin(req, res));
router.get('/callback/github', (req, res, next) => authController.githubCallback(req, res, next));

// Bitbucket OAuth
router.get('/login/bitbucket', (req, res) => authController.bitbucketLogin(req, res));
router.get('/callback/bitbucket', (req, res, next) => authController.bitbucketCallback(req, res, next));

// Protected Session & Account Management
router.get('/me', authenticate, (req, res, next) => authController.getCurrentUser(req, res, next));
router.post('/change-password', authenticate, (req, res, next) => authController.changePassword(req, res, next));
router.get('/sessions', authenticate, (req, res, next) => authController.listSessions(req, res, next));
router.delete('/sessions/:sessionId', authenticate, (req, res, next) => authController.revokeSession(req, res, next));
router.post('/logout', authenticate, (req, res) => authController.logout(req, res));

module.exports = router;
