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

    // Auto-seed default SuperAdmin if database is empty
    const userCount = await db.User.count();
    if (userCount === 0) {
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@prreviewpilot.archadi.dev';
      const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
      const authService = require('./services/auth.service');
      await authService.registerWithEmail({
        email: adminEmail,
        password: adminPassword,
        name: 'Super Admin',
      });
      logger.info(`[SEED] Default SuperAdmin account ready: ${adminEmail} / ${adminPassword}`);
    }

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
