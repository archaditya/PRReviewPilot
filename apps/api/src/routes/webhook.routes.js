const express = require('express');
const webhookController = require('../controllers/webhook.controller');

const router = express.Router();

router.post('/github', (req, res, next) => webhookController.handleGitHubWebhook(req, res, next));
router.post('/bitbucket', (req, res, next) => webhookController.handleBitbucketWebhook(req, res, next));

module.exports = router;
