#!/bin/sh
set -e

# Ensure logs directory exists and is writable by app user
mkdir -p /app/logs
chown -R app:app /app/logs 2>/dev/null || true
chmod 777 /app/logs 2>/dev/null || true

# Execute container command as 'app' user
exec su-exec app "$@"
