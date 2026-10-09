require('dotenv').config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  apiUrl: process.env.API_URL || 'http://localhost:4000',

  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-in-production-min32chars',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  db: {
    url: process.env.DATABASE_URL || 'postgres://reviewpilot:reviewpilot_secret@localhost:5433/reviewpilot_dev',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5433', 10),
    name: process.env.DB_NAME || 'reviewpilot_dev',
    user: process.env.DB_USER || 'reviewpilot',
    password: process.env.DB_PASSWORD || 'reviewpilot_secret',
    pool: {
      max: parseInt(process.env.DB_POOL_MAX || '20', 10),
      min: parseInt(process.env.DB_POOL_MIN || '2', 10),
      idle: 10000,
      acquire: 30000,
    },
  },

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6380',
  },

  aiService: {
    url: process.env.AI_SERVICE_URL || 'http://localhost:8001',
    apiKey: process.env.AI_SERVICE_API_KEY || 'internal-key',
    timeoutMs: 120000,
  },

  github: {
    clientId: process.env.GITHUB_CLIENT_ID || '',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    appId: process.env.GITHUB_APP_ID || '',
    slug: process.env.GITHUB_APP_SLUG || '',
    privateKey: process.env.GITHUB_APP_PRIVATE_KEY || process.env.GITHUB_PRIVATE_KEY || '',
    privateKeyPath: process.env.GITHUB_APP_PRIVATE_KEY_PATH || '',
    webhookSecret: process.env.GITHUB_WEBHOOK_SECRET || '',
  },

  bitbucket: {
    clientId: process.env.BITBUCKET_CLIENT_ID || '',
    clientSecret: process.env.BITBUCKET_CLIENT_SECRET || '',
    webhookSecret: process.env.BITBUCKET_WEBHOOK_SECRET || '',
    redirectUri: process.env.BITBUCKET_REDIRECT_URI || 'http://localhost:4000/api/auth/callback/bitbucket',
  },

  inngest: {
    eventKey: process.env.INNGEST_EVENT_KEY || 'dev-event-key',
    signingKey: process.env.INNGEST_SIGNING_KEY || '',
  },

  indexerServiceUrl: process.env.INDEXER_SERVICE_URL || 'http://indexer-service:8001',

  neo4j: {
    uri: process.env.NEO4J_URI || 'bolt://neo4j:7687',
    user: process.env.NEO4J_USER || 'neo4j',
    password: process.env.NEO4J_PASSWORD || 'archadi_prod_neo4j_sec_88492019384729182',
  },

  brevo: {
    apiKey: process.env.BREVO_API_KEY || '',
    senderEmail: process.env.BREVO_SENDER_EMAIL || process.env.ADMIN_EMAIL || 'support@archadi.dev',
    senderName: process.env.BREVO_SENDER_NAME || 'PRReviewPilot',
  },
};

module.exports = config;
