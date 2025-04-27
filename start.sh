#!/bin/bash
# Minimal startup script for Glitch

echo "Starting Relocation Planner"
echo "Node.js $(node -v)"

# Fix Express directly if needed
if [ -f "node_modules/express/lib/express.js" ]; then
  echo "Checking Express for compatibility..."
  # Replace node: imports with direct imports
  sed -i 's/require(['"'"']node:\([^'"'"']*\)['"'"'])/require(\1)/g' node_modules/express/lib/express.js || true
fi

# Create data.json if it doesn't exist
if [ ! -f "data.json" ]; then
  echo "Creating empty data.json"
  echo '{"tasks":[],"notes":[],"apartments":[]}' > data.json
fi

# Ensure styles.css exists
if [ ! -f "public/styles.css" ]; then
  echo "Creating styles.css"
  cp src/input.css public/styles.css
fi

# Start the application
echo "Starting application..."
exec node server.js 