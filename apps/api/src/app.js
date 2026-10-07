const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const pinoHttp = require('pino-http');
const config = require('./config');
const logger = require('./utils/logger');
const { errorHandler } = require('./middlewares/error.middleware');

// Route imports
const authRoutes = require('./routes/auth.routes');
const repoRoutes = require('./routes/repo.routes');
const reviewRoutes = require('./routes/review.routes');
const webhookRoutes = require('./routes/webhook.routes');
const adminRoutes = require('./routes/admin.routes');
const integrationRoutes = require('./routes/integration.routes');

const app = express();

// Security and utility middlewares
app.use(helmet());
app.use(cors({
  origin: config.appUrl,
  credentials: true,
}));
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (config.env !== 'test') {
  app.use(pinoHttp({ logger, autoLogging: false }));
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'prreviewpilot-api',
    timestamp: new Date().toISOString(),
    env: config.env,
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/repositories', repoRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/integrations', integrationRoutes);

// Global Error Handler
app.use(errorHandler);

module.exports = app;
