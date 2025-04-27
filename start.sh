#!/bin/bash
# This script is used by Glitch to start the application

# Log Node.js version
echo "Node.js version: $(node -v)"
echo "npm version: $(npm -v)"

# Optimize for Glitch environment
export NODE_ENV=production

# Only install dependencies if node_modules doesn't exist or if package.json has changed
if [ ! -d "node_modules" ] || [ package.json -nt node_modules ]; then
  echo "Installing dependencies..."
  npm install --no-optional --no-audit --no-fund --loglevel error
else
  echo "Using cached dependencies"
fi

# Check if data.json exists
if [ ! -f "data.json" ]; then
  echo "Creating empty data.json file..."
  echo '{"tasks":[],"notes":[],"apartments":[]}' > data.json
fi

# Check if public/styles.css exists
if [ ! -f "public/styles.css" ]; then
  echo "Building CSS..."
  # Try with the build script, but have a fallback
  npm run build || cp src/input.css public/styles.css
else
  echo "CSS file already exists"
fi

# Make sure public directory permissions are correct
chmod -R 755 public

# Start the application
echo "Starting application..."
node server.js 