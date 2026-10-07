const logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
  logger.error(
    {
      err: {
        message: err.message,
        stack: err.stack,
        name: err.name,
      },
      url: req.originalUrl,
      method: req.method,
    },
    'Unhandled error during request processing'
  );

  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);

  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
}

module.exports = {
  errorHandler,
};
