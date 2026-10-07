const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');

class AiClientService {
  constructor() {
    this.client = axios.create({
      baseURL: config.aiService.url,
      timeout: config.aiService.timeoutMs,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': config.aiService.apiKey,
      },
    });
  }

  /**
   * Request diff analysis from the AI service
   */
  async analyzeDiff({ prTitle, repoFullName, diff, config: reviewConfig }) {
    try {
      const response = await this.client.post('/api/v1/review/analyze', {
        repo_name: repoFullName,
        pr_title: prTitle,
        diff,
        strictness: reviewConfig?.review_strictness || 'balanced',
        custom_rules: reviewConfig?.custom_rules || [],
        language: reviewConfig?.review_language || 'en',
      });

      return response.data;
    } catch (err) {
      logger.error({ err: err.message }, 'Failed to call Python AI service');
      throw new Error(`AI Service analysis failed: ${err.message}`);
    }
  }
}

module.exports = new AiClientService();
