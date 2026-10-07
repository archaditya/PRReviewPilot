const db = require('../models');
const reviewService = require('../services/review.service');
const githubAppService = require('../services/github-app.service');
const logger = require('../utils/logger');

class WebhookController {
  // POST /api/webhooks/github
  async handleGitHubWebhook(req, res, next) {
    try {
      const event = req.headers['x-github-event'];
      const payload = req.body;

      // Fast ACK to GitHub webhook delivery
      res.status(202).json({ received: true });

      // 1. GitHub App Installation Events
      if (event === 'installation') {
        const action = payload.action;
        if (action === 'created') {
          await githubAppService.handleInstallationCreated(payload);
        } else if (action === 'deleted') {
          await db.Installation.update(
            { status: 'deleted' },
            { where: { provider: 'github', providerInstallationId: String(payload.installation.id) } }
          );
        }
        return;
      }

      // 2. Repository Selection Events (User chose repos to grant access to)
      if (event === 'installation_repositories') {
        if (payload.action === 'added') {
          await githubAppService.handleRepositoriesAdded(payload);
        } else if (payload.action === 'removed') {
          await githubAppService.handleRepositoriesRemoved(payload);
        }
        return;
      }

      // 3. Pull Request Review Events
      if (event !== 'pull_request') {
        logger.debug({ event }, 'Ignoring non-PR GitHub event');
        return;
      }

      const action = payload.action;
      if (!['opened', 'synchronize', 'reopened'].includes(action)) {
        logger.debug({ action }, 'Ignoring non-reviewable PR action');
        return;
      }

      const repoId = String(payload.repository?.id);
      const prNumber = payload.pull_request?.number;

      // Locate repository in database
      const repo = await db.Repository.findOne({
        where: { provider: 'github', providerRepoId: repoId, status: 'active' },
      });

      if (!repo) {
        logger.warn({ repoId, fullName: payload.repository?.full_name }, 'Webhook received for unmanaged repo');
        return;
      }

      // Check auto-review setting
      if (!repo.reviewConfig?.auto_review_on_pr) {
        logger.info({ repoId }, 'Auto review is disabled for repo');
        return;
      }

      logger.info({ repo: repo.name, prNumber, action }, 'Triggering automated GitHub PR review');
      await reviewService.processPullRequestReview({
        repositoryId: repo.id,
        prNumber,
        commitSha: payload.pull_request?.head?.sha,
      });
    } catch (err) {
      logger.error({ err: err.message }, 'Error handling GitHub webhook');
    }
  }

  // POST /api/webhooks/bitbucket
  async handleBitbucketWebhook(req, res, next) {
    try {
      const eventKey = req.headers['x-event-key'];
      const payload = req.body;

      res.status(202).json({ received: true });

      if (!['pullrequest:created', 'pullrequest:updated'].includes(eventKey)) {
        logger.debug({ eventKey }, 'Ignoring Bitbucket event');
        return;
      }

      const repoUuid = payload.repository?.uuid;
      const prId = payload.pullrequest?.id;

      const repo = await db.Repository.findOne({
        where: { provider: 'bitbucket', providerRepoId: repoUuid, status: 'active' },
      });

      if (!repo) {
        logger.warn({ repoUuid, fullName: payload.repository?.full_name }, 'Webhook received for unmanaged Bitbucket repo');
        return;
      }

      if (!repo.reviewConfig?.auto_review_on_pr) {
        logger.info({ repoUuid }, 'Auto review is disabled for repo');
        return;
      }

      logger.info({ repo: repo.name, prId, eventKey }, 'Triggering automated Bitbucket PR review');
      await reviewService.processPullRequestReview({
        repositoryId: repo.id,
        prNumber: prId,
        commitSha: payload.pullrequest?.source?.commit?.hash,
      });
    } catch (err) {
      logger.error({ err: err.message }, 'Error handling Bitbucket webhook');
    }
  }
}

module.exports = new WebhookController();
