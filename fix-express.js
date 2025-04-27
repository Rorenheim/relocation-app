// This script ensures Express 4.17.1 is being used, not Express 5.x
// It's a workaround for Glitch using pnpm which might still use Express 5
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Running Express version fix...');

// Function to check if we have Express 5.x installed
function hasExpress5() {
  try {
    // Check in various potential locations
    const possiblePaths = [
      path.join(__dirname, 'node_modules/express/package.json'),
      path.join(__dirname, '../express/package.json'),
      // pnpm specific paths
      path.join(__dirname, 'node_modules/.pnpm/express@*/node_modules/express/package.json')
    ];
    
    for (const pkgPath of possiblePaths) {
      if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        const version = pkg.version;
        console.log(`Found Express version ${version} at ${pkgPath}`);
        if (version.startsWith('5.')) {
          return { hasV5: true, path: pkgPath };
        }
      }
    }
    
    return { hasV5: false };
  } catch (error) {
    console.error('Error checking Express version:', error);
    return { hasV5: false };
  }
}

// Main function
function fixExpress() {
  // Check for Express 5
  const { hasV5, path: expressPath } = hasExpress5();
  
  if (!hasV5) {
    console.log('Express 5 not found, no fix needed.');
    return;
  }
  
  console.log('Express 5 detected, attempting to force install Express 4.17.1...');
  
  try {
    // Try to force install Express 4.17.1
    execSync('npm install express@4.17.1 --save-exact --no-package-lock', { 
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'development' }
    });
    
    console.log('Successfully installed Express 4.17.1');
  } catch (error) {
    console.error('Failed to install Express 4.17.1:', error.message);
    console.log('Will try to create an Express alias...');
    
    // As a fallback, try to modify the express.js file to remove node: imports
    try {
      // Find the express lib directory
      const expressDir = path.dirname(expressPath);
      const libPath = path.join(expressDir, 'lib/express.js');
      
      if (fs.existsSync(libPath)) {
        let content = fs.readFileSync(libPath, 'utf8');
        
        // Replace node: imports with regular imports
        content = content.replace(/require\('node:([^']+)'\)/g, "require('$1')");
        
        fs.writeFileSync(libPath, content);
        console.log(`Modified ${libPath} to remove node: imports`);
      } else {
        console.log(`Could not find ${libPath}`);
      }
    } catch (error) {
      console.error('Failed to modify Express:', error.message);
    }
  }
}

// Run the fix
fixExpress();

console.log('Express version fix completed.'); 