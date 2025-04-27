#!/bin/bash

# Enhanced start.sh script for Glitch and other environments
# Provides robust Node.js detection and error handling

set -e
echo "Starting application setup process..."

# Function to find Node.js executable
find_node() {
    echo "Looking for Node.js executable..."
    
    # Check common locations for Node.js
    local POSSIBLE_NODE_PATHS=(
        "/app/.nvm/versions/node/*/bin"
        "/usr/local/nvm/versions/node/*/bin"
        "/opt/nvm/versions/node/*/bin"
        "/opt/node*/bin"
        "/app/node*/bin"
        "/usr/local/bin"
        "/usr/bin"
        "/bin"
    )
    
    for path_pattern in "${POSSIBLE_NODE_PATHS[@]}"; do
        for path in $(ls -d $path_pattern 2>/dev/null); do
            if [ -x "$path/node" ]; then
                echo "Found Node.js at: $path/node"
                export PATH="$path:$PATH"
                return 0
            fi
        done
    done
    
    # Check if node is already in PATH
    if command -v node >/dev/null 2>&1; then
        echo "Node.js found in PATH"
        return 0
    fi
    
    # Try to find node version from package.json
    if [ -f package.json ]; then
        NODE_VERSION=$(grep '"node":' package.json | grep -o '[0-9]*\.[0-9x]*' | head -1)
        if [ ! -z "$NODE_VERSION" ]; then
            echo "Detected Node.js version $NODE_VERSION in package.json"
            # Try specific version paths
            NODE_VERSION_PATH=$(echo $NODE_VERSION | sed 's/\.x//')
            for VERSION_PATH in $(find /app/.nvm/versions/node -name "v$NODE_VERSION*" -type d 2>/dev/null); do
                if [ -x "$VERSION_PATH/bin/node" ]; then
                    echo "Found matching Node.js version at: $VERSION_PATH/bin"
                    export PATH="$VERSION_PATH/bin:$PATH"
                    return 0
                fi
            done
        fi
    fi
    
    echo "ERROR: Node.js executable not found."
    echo "Current PATH: $PATH"
    return 1
}

# Check if Node.js is available
if ! find_node; then
    echo "Failed to find Node.js executable. Trying alternate approaches..."
    
    # Install node if on a system with apt-get
    if command -v apt-get >/dev/null 2>&1; then
        echo "Attempting to install Node.js via apt-get..."
        apt-get update && apt-get install -y nodejs npm
        
        # Verify installation
        if command -v node >/dev/null 2>&1; then
            echo "Node.js installed successfully via apt-get"
        else
            echo "ERROR: Failed to install Node.js via apt-get"
            exit 1
        fi
    else
        echo "FATAL ERROR: Could not find or install Node.js"
        exit 1
    fi
fi

# Display Node.js version
NODE_VERSION=$(node -v)
echo "Using Node.js version: $NODE_VERSION"

# Check if npm is available
NPM_PATH=$(dirname $(which node))/npm
if [ -x "$NPM_PATH" ]; then
    echo "Found npm at: $NPM_PATH"
    NPM_VERSION=$($NPM_PATH -v)
    echo "Using npm version: $NPM_VERSION"
else
    echo "WARNING: npm not found in expected location: $NPM_PATH"
    
    # Check if npm is in PATH
    if command -v npm >/dev/null 2>&1; then
        echo "npm found in PATH"
        NPM_VERSION=$(npm -v)
        echo "Using npm version: $NPM_VERSION"
    else
        echo "ERROR: npm not found in PATH"
        echo "Will attempt to run without npm. Some functionality may be limited."
    fi
fi

# Ensure data directory exists
mkdir -p data

# Install dependencies using npm if available
if command -v npm >/dev/null 2>&1; then
    echo "Installing dependencies..."
    if ! npm install; then
        echo "Standard installation failed, trying with --no-optional flag..."
        npm install --no-optional
    fi
    
    # Build the CSS if needed
    if [ -f "./node_modules/.bin/tailwindcss" ]; then
        echo "Building CSS with Tailwind..."
        npm run build || echo "WARNING: CSS build failed, using fallback styling"
    else
        echo "Tailwind not found, skipping CSS build"
    fi
    
    # Start the app using npm
    echo "Starting application via npm start..."
    npm start
else
    echo "WARNING: npm not available, attempting to start directly with node"
    
    # Start the app directly with node
    if [ -f "server.js" ]; then
        echo "Starting application with node server.js..."
        node server.js
    else
        echo "ERROR: server.js not found"
        exit 1
    fi
fi 