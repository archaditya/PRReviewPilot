const pino = require('pino');
const fs = require('fs');
const path = require('path');
const config = require('../config');

// Ensure log directory exists
const logDir = path.resolve(process.env.LOG_DIR || path.join(__dirname, '../../logs'));
// Format today's date for daily log file
const getTodayLogFilePath = () => {
  const dateStr = new Date().toISOString().split('T')[0];
  return path.join(logDir, `api-${dateStr}.log`);
};

// Function to clean logs older than 14 days (2 weeks retention)
const cleanOldLogs = (retentionDays = 14) => {
  try {
    if (!fs.existsSync(logDir)) return;
    const files = fs.readdirSync(logDir);
    const now = Date.now();
    const maxAgeMs = retentionDays * 24 * 60 * 60 * 1000;

    for (const file of files) {
      if (!file.startsWith('api-') || !file.endsWith('.log')) continue;
      
      const fullPath = path.join(logDir, file);
      try {
        const stats = fs.statSync(fullPath);
        if (now - stats.mtimeMs > maxAgeMs) {
          fs.unlinkSync(fullPath);
          console.log(`[Logger] Pruned old log file (> 14 days): ${file}`);
        }
      } catch (err) {
        // Ignore individual file unlink errors
      }
    }
  } catch (err) {
    // Gracefully ignore directory read errors
  }
};

let fileStream = null;
try {
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  // Verify directory is writable before attempting to stream
  fs.accessSync(logDir, fs.constants.W_OK);
  
  // Clean logs older than 14 days on startup
  cleanOldLogs(14);
  // Schedule daily cleanup check (24h) without keeping event loop alive
  const cleanupTimer = setInterval(() => cleanOldLogs(14), 24 * 60 * 60 * 1000);
  if (cleanupTimer.unref) cleanupTimer.unref();

  const stream = fs.createWriteStream(getTodayLogFilePath(), { flags: 'a' });
  stream.on('error', (err) => {
    // Graceful fallback to stdout if file write encounters an error
    console.warn('[Logger] Log file stream write error, falling back to console:', err.message);
  });
  fileStream = stream;
} catch (e) {
  // Directory not writable (e.g. non-root Docker user mounting root-owned host folder)
  // Gracefully fallback to stdout
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
