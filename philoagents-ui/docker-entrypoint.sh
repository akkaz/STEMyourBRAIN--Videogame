#!/bin/sh
set -e

# Railway provides PORT env var, default to 8080 if not set
PORT=${PORT:-8080}

# Update nginx to listen on the correct port
sed -i "s/listen 8080/listen $PORT/g" /etc/nginx/conf.d/default.conf

# Execute the main command
exec "$@"
