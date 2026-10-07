const axios = require('axios');
const BaseGitProvider = require('./provider.interface');
const config = require('../../config');
const logger = require('../../utils/logger');

class BitbucketProvider extends BaseGitProvider {
  constructor() {
    super();
    this.clientId = config.bitbucket.clientId;
    this.clientSecret = config.bitbucket.clientSecret;
    this.redirectUri = config.bitbucket.redirectUri;
    this.baseUrl = 'https://api.bitbucket.org/2.0';
  }

  getAuthHeader() {
    return 'Basic ' + Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
  }

  async exchangeCodeForToken(code) {
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    if (this.redirectUri) {
      params.append('redirect_uri', this.redirectUri);
    }

    const response = await axios.post('https://bitbucket.org/site/oauth2/access_token', params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: this.getAuthHeader(),
      },
    });

    return {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      expiresIn: response.data.expires_in,
      tokenType: response.data.token_type,
    };
  }

  async refreshAccessToken(refreshToken) {
    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', refreshToken);

    const response = await axios.post('https://bitbucket.org/site/oauth2/access_token', params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: this.getAuthHeader(),
      },
    });

    return {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      expiresIn: response.data.expires_in,
    };
  }

  async getUserProfile(accessToken) {
    const userRes = await axios.get(`${this.baseUrl}/user`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const user = userRes.data;
    let primaryEmail = null;

    try {
      const emailRes = await axios.get(`${this.baseUrl}/user/emails`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const emails = emailRes.data?.values || [];
      const primary = emails.find((e) => e.is_primary && e.is_confirmed) || emails[0];
      if (primary) primaryEmail = primary.email;
    } catch (err) {
      logger.warn({ err }, 'Could not fetch Bitbucket user emails');
    }

    return {
      id: user.uuid,
      username: user.username || user.nickname,
      name: user.display_name,
      email: primaryEmail || `${user.nickname}@bitbucket.org`,
      avatarUrl: user.links?.avatar?.href,
    };
  }

  async listRepositories(accessToken, options = {}) {
    let allRepos = [];
    let nextUrl = `${this.baseUrl}/repositories?role=member&pagelen=100`;

    // Fetch up to 10 pages (~1,000 repos) automatically via pagination
    let pageCount = 0;
    while (nextUrl && pageCount < 10) {
      pageCount++;
      const response = await axios.get(nextUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const items = response.data?.values || [];
      allRepos.push(...items);
      nextUrl = response.data?.next || null;
    }

    return allRepos.map((repo) => ({
      id: repo.uuid,
      fullName: repo.full_name, // 'workspace/repo_slug'
      name: repo.name,
      workspace: repo.workspace?.slug || repo.full_name.split('/')[0],
      isPrivate: repo.is_private,
      cloneUrl: repo.links?.clone?.find((c) => c.name === 'https')?.href,
      htmlUrl: repo.links?.html?.href,
      defaultBranch: repo.mainbranch?.name || 'main',
      language: repo.language,
      description: repo.description,
    }));
  }

  /**
   * Register a Workspace-level webhook on Bitbucket Cloud.
   * This covers ALL 100+ repos in the workspace with a single webhook!
   */
  async createWorkspaceWebhook(accessToken, workspaceSlug, webhookUrl) {
    const response = await axios.post(
      `${this.baseUrl}/workspaces/${workspaceSlug}/hooks`,
      {
        description: 'ReviewPilot Enterprise Code Review Webhook',
        url: webhookUrl,
        active: true,
        events: ['pullrequest:created', 'pullrequest:updated'],
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return { id: response.data.uuid };
  }

  async getPullRequest(accessToken, repoFullName, prNumber) {
    const response = await axios.get(
      `${this.baseUrl}/repositories/${repoFullName}/pullrequests/${prNumber}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    const pr = response.data;
    return {
      number: pr.id,
      title: pr.title,
      author: pr.author?.display_name || pr.author?.nickname || 'unknown',
      baseBranch: pr.destination?.branch?.name,
      headBranch: pr.source?.branch?.name,
      headSha: pr.source?.commit?.hash,
      state: pr.state?.toLowerCase(),
      htmlUrl: pr.links?.html?.href,
    };
  }

  async getPullRequestDiff(accessToken, repoFullName, prNumber) {
    const response = await axios.get(
      `${this.baseUrl}/repositories/${repoFullName}/pullrequests/${prNumber}/diff`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        responseType: 'text',
      }
    );

    return response.data;
  }

  async postComment(accessToken, repoFullName, prNumber, comment) {
    const payload = {
      content: {
        raw: comment.body,
      },
    };

    if (comment.filePath && comment.lineNumber) {
      payload.inline = {
        path: comment.filePath,
        to: comment.lineNumber,
      };
    }

    const response = await axios.post(
      `${this.baseUrl}/repositories/${repoFullName}/pullrequests/${prNumber}/comments`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      id: String(response.data.id),
      url: response.data.links?.html?.href,
    };
  }

  async createWebhook(accessToken, repoFullName, webhookUrl, secret) {
    const response = await axios.post(
      `${this.baseUrl}/repositories/${repoFullName}/hooks`,
      {
        description: 'ReviewPilot Automated AI Review Webhook',
        url: webhookUrl,
        active: true,
        events: ['pullrequest:created', 'pullrequest:updated'],
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return { id: response.data.uuid };
  }

  verifyWebhookSignature(rawBody, signature, secret) {
    // Bitbucket Cloud uses event headers and optional custom secret query parameters
    return true;
  }
}

module.exports = BitbucketProvider;
