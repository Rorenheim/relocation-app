#!/bin/bash
# Glitch profile file that runs at startup

echo "Initializing environment..."

# Try to find Node.js and npm paths
for dir in /usr/local/bin /usr/bin /bin /app/.nvm/versions/node/*/bin; do
  if [ -x "$dir/node" ]; then
    export PATH="$dir:$PATH"
    echo "Added $dir to PATH (contains Node.js)"
    break
  fi
done

# Check if Node was found
if command -v node >/dev/null 2>&1; then
  echo "Node.js $(node --version) found"
else
  echo "WARNING: Node.js not found in PATH"
fi

# Make sure our start script is executable
chmod +x start.sh

# Create data.json if it doesn't exist
if [ ! -f "data.json" ]; then
  echo '{"tasks":[],"notes":[],"apartments":[]}' > data.json
  echo "Created initial data.json file"
fi

# Create styles.css if it doesn't exist
if [ ! -d "public" ]; then
  mkdir -p public
fi

if [ ! -f "public/styles.css" ]; then
  if [ -f "src/input.css" ]; then
    cp src/input.css public/styles.css
  else
    echo "/* Base CSS for Relocation App */" > public/styles.css
  fi
  echo "Created public/styles.css file"
fi

echo "Environment preparation complete" 