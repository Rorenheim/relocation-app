#!/bin/bash
# This script is used by Glitch to start the application

# Optimize for Glitch environment
export NODE_ENV=production

# Only install dependencies if node_modules doesn't exist or if package.json has changed
if [ ! -d "node_modules" ] || [ package.json -nt node_modules ]; then
  echo "Installing dependencies..."
  npm install --no-optional --no-audit --no-fund
else
  echo "Using cached dependencies"
fi

# Build CSS for production
echo "Building CSS..."
npm run build

# Start the application
echo "Starting application..."
node server.js 