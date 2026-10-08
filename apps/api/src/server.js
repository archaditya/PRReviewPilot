const app = require('./app');
const config = require('./config');
const logger = require('./utils/logger');
const db = require('./models');

let server;

async function start() {
  try {
    // Authenticate database connection
    await db.sequelize.authenticate();
    logger.info('Database connection successfully established');

    // Sync database schema (create tables if they don't exist)
    await db.sequelize.sync({ alter: true });
    logger.info('Database models synchronized with PostgreSQL schema');

    server = app.listen(config.port, () => {
      logger.info(`PRReviewPilot API running on port ${config.port} [${config.env}]`);
    });
  } catch (err) {
    logger.fatal({ err }, 'Failed to initialize PRReviewPilot API');
    process.exit(1);
  }
}

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  if (server) {
    server.close(() => {
      logger.info('HTTP server closed');
      db.sequelize.close().then(() => {
        logger.info('Database connection pool closed');
        process.exit(0);
      });
    });
  }
});

start();
