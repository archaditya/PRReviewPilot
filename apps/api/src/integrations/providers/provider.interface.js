/**
 * Base Git Provider interface defining the contract that both
 * GitHub and Bitbucket Cloud implementations must satisfy.
 */
class BaseGitProvider {
  /**
   * Exchange an OAuth code for access (+ refresh) tokens
   * @param {string} code
   * @returns {Promise<{ accessToken: string, refreshToken?: string, expiresIn?: number }>}
   */
  async exchangeCodeForToken(code) {
    throw new Error('exchangeCodeForToken must be implemented');
  }

  /**
   * Get user profile from the provider
   * @param {string} accessToken
   * @returns {Promise<{ id: string|number, username: string, name: string, email: string, avatarUrl: string }>}
   */
  async getUserProfile(accessToken) {
    throw new Error('getUserProfile must be implemented');
  }

  /**
   * List repositories accessible to the user
   * @param {string} accessToken
   * @param {object} [options]
   * @returns {Promise<Array<{ id: string|number, fullName: string, name: string, isPrivate: boolean, cloneUrl: string, htmlUrl: string, defaultBranch: string }>>}
   */
  async listRepositories(accessToken, options = {}) {
    throw new Error('listRepositories must be implemented');
  }

  /**
   * Fetch pull request metadata
   * @param {string} accessToken
   * @param {string} repoFullName - e.g. 'owner/repo' or 'workspace/repo_slug'
   * @param {number} prNumber
   * @returns {Promise<{ number: number, title: string, author: string, baseBranch: string, headBranch: string, headSha: string, state: string }>}
   */
  async getPullRequest(accessToken, repoFullName, prNumber) {
    throw new Error('getPullRequest must be implemented');
  }

  /**
   * Fetch pull request unified diff
   * @param {string} accessToken
   * @param {string} repoFullName
   * @param {number} prNumber
   * @returns {Promise<string>} Raw unified diff
   */
  async getPullRequestDiff(accessToken, repoFullName, prNumber) {
    throw new Error('getPullRequestDiff must be implemented');
  }

  /**
   * Post a review comment or inline comment on a pull request
   * @param {string} accessToken
   * @param {string} repoFullName
   * @param {number} prNumber
   * @param {object} comment - { body: string, filePath?: string, lineNumber?: number, commitSha?: string }
   * @returns {Promise<{ id: string|number, url: string }>}
   */
  async postComment(accessToken, repoFullName, prNumber, comment) {
    throw new Error('postComment must be implemented');
  }

  /**
   * Register a webhook on the repository
   * @param {string} accessToken
   * @param {string} repoFullName
   * @param {string} webhookUrl
   * @param {string} secret
   * @returns {Promise<{ id: string|number }>}
   */
  async createWebhook(accessToken, repoFullName, webhookUrl, secret) {
    throw new Error('createWebhook must be implemented');
  }

  /**
   * Verify signature of incoming webhook
   * @param {string|Buffer} rawBody
   * @param {string} signature
   * @param {string} secret
   * @returns {boolean}
   */
  verifyWebhookSignature(rawBody, signature, secret) {
    throw new Error('verifyWebhookSignature must be implemented');
  }
}

module.exports = BaseGitProvider;
