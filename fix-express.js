// Simplified Express 5 compatibility fix for Glitch
const fs = require('fs');
const path = require('path');

console.log('Running simplified Express fix...');

// Direct path to Express lib file
const expressPath = path.join(__dirname, 'node_modules/express/lib/express.js');

// Check if the file exists
if (fs.existsSync(expressPath)) {
  try {
    console.log(`Found Express at ${expressPath}`);
    let content = fs.readFileSync(expressPath, 'utf8');
    
    // Check if it has node: imports
    if (content.includes("require('node:")) {
      console.log('Found node: imports, fixing...');
      
      // Replace node: imports with regular imports
      content = content.replace(/require\('node:([^']+)'\)/g, "require('$1')");
      
      // Write the modified file
      fs.writeFileSync(expressPath, content);
      console.log('Successfully patched Express');
    } else {
      console.log('No node: imports found, no patching needed');
    }
  } catch (error) {
    console.error('Error patching Express:', error.message);
  }
} else {
  console.log('Express not found at expected path');
}

console.log('Express fix completed'); 