#!/bin/bash
# Minimal startup script for Glitch

echo "Starting Relocation Planner"
echo "Node.js $(node -v)"

# Force install compatible express and finalhandler
echo "Ensuring compatible dependencies..."
if ! [ -d "node_modules/express" ] || [ -d "node_modules/finalhandler" ]; then
  npm install --no-save express@4.16.4 finalhandler@1.1.2
fi

# Create data.json if it doesn't exist
if [ ! -f "data.json" ]; then
  echo "Creating empty data.json"
  echo '{"tasks":[],"notes":[],"apartments":[]}' > data.json
fi

# Ensure styles.css exists
if [ ! -f "public/styles.css" ]; then
  echo "Creating styles.css"
  mkdir -p public
  cp src/input.css public/styles.css 2>/dev/null || echo "/* Base styles */" > public/styles.css
fi

# Start the application
echo "Starting application..."
exec node server.js 