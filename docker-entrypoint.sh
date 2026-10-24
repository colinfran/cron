#!/bin/sh
set -e

echo "[cron] Running database migrations..."
node migrate.mjs

echo "[cron] Starting server..."
exec node server.js
