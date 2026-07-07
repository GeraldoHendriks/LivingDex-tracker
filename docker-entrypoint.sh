#!/bin/sh
set -eu

mkdir -p /app/data
chown -R node:node /app/data

if [ "${REBUILD_FRONTEND_ON_START:-false}" = "true" ]; then
  su-exec node npm run build
fi

exec su-exec node "$@"
