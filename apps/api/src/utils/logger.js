const pino = require('pino');
const fs = require('fs');
const path = require('path');
const config = require('../config');

const { Writable } = require('stream');

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

class DailyFileLogStream extends Writable {
  constructor(dir) {
    super();
    this.dir = dir;
    this.currentDate = '';
    this.currentStream = null;
    this.hasWarnedPermission = false;
  }

  _getStream() {
    const today = new Date().toISOString().split('T')[0];
    if (this.currentStream && this.currentDate === today) {
      return this.currentStream;
    }

    try {
      if (!fs.existsSync(this.dir)) {
        fs.mkdirSync(this.dir, { recursive: true });
      }
      fs.accessSync(this.dir, fs.constants.W_OK);

      if (this.currentStream) {
        try { this.currentStream.end(); } catch (_) {}
      }

      const filePath = path.join(this.dir, `api-${today}.log`);
      this.currentStream = fs.createWriteStream(filePath, { flags: 'a' });
      this.currentDate = today;
      this.hasWarnedPermission = false;

      this.currentStream.on('error', (err) => {
        console.warn('[Logger] File write stream error:', err.message);
        this.currentStream = null;
      });

      return this.currentStream;
    } catch (err) {
      if (!this.hasWarnedPermission) {
        console.warn(`[Logger] Cannot write to log directory ${this.dir} (${err.message}). Logs will stream to stdout.`);
        this.hasWarnedPermission = true;
      }
      return null;
    }
  }

  _write(chunk, encoding, callback) {
    const stream = this._getStream();
    if (stream) {
      stream.write(chunk, encoding, callback);
    } else {
      callback();
    }
  }
}

// Clean old logs on startup and schedule daily cleanup
cleanOldLogs(14);
const cleanupTimer = setInterval(() => cleanOldLogs(14), 24 * 60 * 60 * 1000);
if (cleanupTimer.unref) cleanupTimer.unref();

const fileStream = new DailyFileLogStream(logDir);

const streams = [
  { stream: process.stdout },
  { stream: fileStream },
];

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
