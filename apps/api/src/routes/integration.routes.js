const express = require('express');
const config = require('../config');
const db = require('../models');
const { getProvider } = require('../integrations/providers');
const { authenticate, requireOrgAccess } = require('../middlewares/auth.middleware');
const logger = require('../utils/logger');

const router = express.Router();

// GET /api/integrations/github/install?orgId=...
router.get('/github/install', authenticate, async (req, res) => {
  const orgId = req.query.orgId || req.organizationId;
  const appSlug = process.env.GITHUB_APP_SLUG || 'reviewpilot-bot';
  const installUrl = `https://github.com/apps/${appSlug}/installations/new?state=${orgId || ''}`;
  res.redirect(installUrl);
});

// POST /api/integrations/bitbucket/sync-workspace
// Connects an enterprise Bitbucket workspace and bulk-syncs all 100+ repos + 1 workspace webhook
router.post('/bitbucket/sync-workspace', authenticate, async (req, res, next) => {
  try {
    const user = req.user;
    if (!user.bitbucketAccessToken) {
      return res.status(400).json({ success: false, error: 'Bitbucket account is not connected yet.' });
    }

    const orgId = req.body.organizationId || req.organizationId;
    const org = await db.Organization.findByPk(orgId);
    if (!org) {
      return res.status(404).json({ success: false, error: 'Organization not found' });
    }

    const provider = getProvider('bitbucket');
    
    // 1. Fetch all repositories across the workspace (with pagination)
    logger.info({ org: org.name }, 'Fetching all workspace repos from Bitbucket Cloud');
    const repos = await provider.listRepositories(user.bitbucketAccessToken);

    if (repos.length === 0) {
      return res.json({ success: true, message: 'No repositories found in connected Bitbucket account.', count: 0 });
    }

    const workspaceSlug = repos[0].workspace || repos[0].fullName.split('/')[0];

    // 2. Register a single Workspace-Level Webhook on Bitbucket Cloud!
    // This webhook automatically catches PRs for all 100+ repos in this workspace!
    const webhookUrl = `${config.apiUrl}/api/webhooks/bitbucket`;
    let hookId = null;
    try {
      const hookRes = await provider.createWorkspaceWebhook(user.bitbucketAccessToken, workspaceSlug, webhookUrl);
      hookId = hookRes.id;
      logger.info({ workspaceSlug, hookId }, 'Workspace-level Bitbucket webhook registered');
    } catch (err) {
      logger.warn({ err: err.message, workspaceSlug }, 'Workspace webhook already registered or requires higher workspace admin rights');
    }

    // 3. Register Installation record in DB
    const [inst] = await db.Installation.findOrCreate({
      where: {
        provider: 'bitbucket',
        providerInstallationId: workspaceSlug,
      },
      defaults: {
        organizationId: org.id,
        provider: 'bitbucket',
        providerInstallationId: workspaceSlug,
        accountLogin: workspaceSlug,
        accountType: 'Workspace',
        installedByUserId: user.id,
        status: 'active',
      },
    });

    // 4. Bulk upsert all 100+ repositories into database
    let importedCount = 0;
    for (const r of repos) {
      await db.Repository.findOrCreate({
        where: {
          organizationId: org.id,
          provider: 'bitbucket',
          providerRepoId: String(r.id),
        },
        defaults: {
          organizationId: org.id,
          installationId: inst.id,
          provider: 'bitbucket',
          providerRepoId: String(r.id),
          providerFullName: r.fullName,
          name: r.name,
          defaultBranch: r.defaultBranch || 'main',
          language: r.language,
          isPrivate: r.isPrivate,
          cloneUrl: r.cloneUrl,
          htmlUrl: r.htmlUrl,
          description: r.description,
          webhookId: hookId,
          status: 'active',
        },
      });
      importedCount++;
    }

    logger.info({ importedCount, workspaceSlug }, 'Completed bulk sync of Bitbucket workspace repos');

    return res.json({
      success: true,
      workspace: workspaceSlug,
      importedCount,
      message: `Successfully synced ${importedCount} repositories from Bitbucket workspace "${workspaceSlug}" with automated PR reviews!`,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/integrations/installations
router.get('/installations', authenticate, async (req, res, next) => {
  try {
    const orgId = req.query.orgId || req.organizationId;
    const where = {};
    if (orgId) where.organizationId = orgId;

    const installations = await db.Installation.findAll({
      where,
      include: [
        {
          model: db.Repository,
          as: 'repositories',
          attributes: ['id', 'name', 'providerFullName', 'status'],
        },
      ],
    });

    return res.json({ success: true, installations });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
