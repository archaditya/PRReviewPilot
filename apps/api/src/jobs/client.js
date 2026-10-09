const { Inngest } = require('inngest');
const config = require('../config');

/**
 * Shared Inngest client — used to both send events (services/webhook.service.js) and
 * register functions (jobs/index.js). One instance for the whole app (ADR-005).
 */
const inngest = new Inngest({
  id: 'archadi-pr-review-api',
  eventKey: config.inngest.eventKey,
  baseUrl: process.env.INNGEST_BASE_URL || (process.env.NODE_ENV === 'production' ? 'http://inngest:8288' : 'http://localhost:8288'),
});

module.exports = inngest;
