const db = require('../models');
const config = require('../config');
const { NotFoundError, ForbiddenError, ConflictError } = require('../utils/errors');
const githubPr = require('../integrations/github/pull-request-client');
const repositoryService = require('./repository.service');
const logger = require('../utils/logger');

/**
 * Merge a pull request via the GitHub API.
 * Uses the bot's existing GitHub App installation credentials.
 */
async function mergePullRequest(userId, pullRequestId, { mergeMethod = 'merge' } = {}) {
  const pr = await db.PullRequest.findByPk(pullRequestId, {
    include: [
      {
        model: db.Repository,
        as: 'repository',
        include: [{ model: db.Installation, as: 'installation' }],
      },
    ],
  });

  if (!pr) throw new NotFoundError('Pull request not found');
  await repositoryService.getForUser(userId, pr.repository.id);

  const installation = pr.repository.installation;
  const fullName = pr.repository.fullName || pr.repository.providerFullName || pr.repository.name || '';
  const [owner, repo] = fullName.includes('/') ? fullName.split('/') : ['', fullName];
  const instId = installation?.providerInstallationId || installation?.githubInstallationId || installation?.id;
  const pullNumber = pr.prNumber || pr.githubPrNumber;

  let result;
  try {
    result = await githubPr.mergePullRequest({
      installationId: instId,
      owner,
      repo,
      pullNumber,
      mergeMethod,
    });
  } catch (err) {
    if (err.status === 403 || err.message?.includes('Resource not accessible by integration')) {
      throw new ForbiddenError(
        'GitHub App requires "Contents: Read and write" permission to merge pull requests. Please update the permission in your GitHub App settings and accept the updated permissions on your repository.'
      );
    }
    if (err.status === 405) {
      throw new ConflictError(
        err.response?.data?.message || 'Pull request cannot be merged (e.g., merge conflicts or blocking status checks).'
      );
    }
    if (err.status === 409) {
      throw new ConflictError('Head branch was modified or PR is in conflict. Please update branch.');
    }
    throw err;
  }

  logger.info(
    { pullRequestId, prNumber: pullNumber, repo: fullName },
    'PR merged via dashboard',
  );

  return {
    merged: result.merged,
    sha: result.sha,
    message: result.message,
  };
}

module.exports = { mergePullRequest };
