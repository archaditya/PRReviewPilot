const pino = require('pino');
const fs = require('fs');
const path = require('path');
const config = require('../config');

// Ensure log directory exists
const logDir = path.resolve(process.env.LOG_DIR || path.join(__dirname, '../../logs'));
try {
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
} catch (e) {
  // If filesystem error, fallback gracefully
}

// Format today's date for daily log file
const getTodayLogFilePath = () => {
  const dateStr = new Date().toISOString().split('T')[0];
  return path.join(logDir, `api-${dateStr}.log`);
};

let fileStream;
try {
  fileStream = fs.createWriteStream(getTodayLogFilePath(), { flags: 'a' });
} catch (e) {
  // Ignore if unable to open file stream
}

const streams = [
  { stream: process.stdout },
];

if (fileStream) {
  streams.push({ stream: fileStream });
}

const logger = pino(
  {
    level: process.env.LOG_LEVEL || (config.env === 'development' ? 'debug' : 'info'),
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
      level: (label) => ({ level: label.toUpperCase() }),
    },
  },
  pino.multistream(streams)
);

module.exports = logger;
