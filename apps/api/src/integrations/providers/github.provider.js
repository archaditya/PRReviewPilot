const crypto = require('crypto');
const axios = require('axios');
const { Octokit } = require('@octokit/rest');
const BaseGitProvider = require('./provider.interface');
const config = require('../../config');
const logger = require('../../utils/logger');

class GitHubProvider extends BaseGitProvider {
  constructor() {
    super();
    this.clientId = config.github.clientId;
    this.clientSecret = config.github.clientSecret;
  }

  getOctokit(accessToken) {
    return new Octokit({ auth: accessToken });
  }

  async exchangeCodeForToken(code) {
    const response = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
      },
      {
        headers: { Accept: 'application/json' },
      }
    );

    if (response.data.error) {
      throw new Error(`GitHub OAuth error: ${response.data.error_description || response.data.error}`);
    }

    return {
      accessToken: response.data.access_token,
      tokenType: response.data.token_type,
      scope: response.data.scope,
    };
  }

  async getUserProfile(accessToken) {
    const octokit = this.getOctokit(accessToken);
    const { data: user } = await octokit.rest.users.getAuthenticated();

    let primaryEmail = user.email;
    if (!primaryEmail) {
      try {
        const { data: emails } = await octokit.rest.users.listEmailsForAuthenticatedUser();
        const primary = emails.find((e) => e.primary && e.verified) || emails[0];
        if (primary) primaryEmail = primary.email;
      } catch (err) {
        logger.warn({ err }, 'Could not fetch GitHub user emails');
      }
    }

    return {
      id: user.id,
      username: user.login,
      name: user.name || user.login,
      email: primaryEmail || `${user.login}@users.noreply.github.com`,
      avatarUrl: user.avatar_url,
    };
  }

  async listRepositories(accessToken, options = {}) {
    const octokit = this.getOctokit(accessToken);
    const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser({
      sort: 'updated',
      per_page: options.perPage || 50,
      page: options.page || 1,
    });

    return repos.map((repo) => ({
      id: String(repo.id),
      fullName: repo.full_name,
      name: repo.name,
      isPrivate: repo.private,
      cloneUrl: repo.clone_url,
      htmlUrl: repo.html_url,
      defaultBranch: repo.default_branch,
      language: repo.language,
      description: repo.description,
    }));
  }

  async getPullRequest(accessToken, repoFullName, prNumber) {
    const [owner, repo] = repoFullName.split('/');
    const octokit = this.getOctokit(accessToken);

    const { data: pr } = await octokit.rest.pulls.get({
      owner,
      repo,
      pull_number: prNumber,
    });

    return {
      number: pr.number,
      title: pr.title,
      author: pr.user?.login || 'unknown',
      baseBranch: pr.base.ref,
      headBranch: pr.head.ref,
      headSha: pr.head.sha,
      state: pr.state,
      htmlUrl: pr.html_url,
    };
  }

  async getPullRequestDiff(accessToken, repoFullName, prNumber) {
    const [owner, repo] = repoFullName.split('/');
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3.diff',
          'User-Agent': 'ReviewPilot-Bot',
        },
      }
    );

    return response.data;
  }

  async postComment(accessToken, repoFullName, prNumber, comment) {
    const [owner, repo] = repoFullName.split('/');
    const octokit = this.getOctokit(accessToken);

    // If it's an inline review comment
    if (comment.filePath && comment.commitSha && comment.lineNumber) {
      try {
        const { data } = await octokit.rest.pulls.createReviewComment({
          owner,
          repo,
          pull_number: prNumber,
          body: comment.body,
          commit_id: comment.commitSha,
          path: comment.filePath,
          line: comment.lineNumber,
          side: 'RIGHT',
        });
        return { id: String(data.id), url: data.html_url };
      } catch (err) {
        logger.warn({ err: err.message, file: comment.filePath }, 'Inline comment failed, falling back to PR comment');
      }
    }

    // Fallback or general summary comment
    const { data } = await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: prNumber,
      body: comment.body,
    });

    return { id: String(data.id), url: data.html_url };
  }

  async createWebhook(accessToken, repoFullName, webhookUrl, secret) {
    const [owner, repo] = repoFullName.split('/');
    const octokit = this.getOctokit(accessToken);

    const { data } = await octokit.rest.repos.createWebhook({
      owner,
      repo,
      config: {
        url: webhookUrl,
        content_type: 'json',
        secret: secret || config.github.webhookSecret,
      },
      events: ['pull_request'],
      active: true,
    });

    return { id: String(data.id) };
  }

  verifyWebhookSignature(rawBody, signature, secret) {
    if (!signature) return false;
    const hmac = crypto.createHmac('sha256', secret || config.github.webhookSecret);
    const digest = `sha256=${hmac.update(rawBody).digest('hex')}`;
    try {
      return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
    } catch {
      return false;
    }
  }
}

module.exports = GitHubProvider;
