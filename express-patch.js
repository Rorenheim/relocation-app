/**
 * Simplified Express patch for Glitch
 * This file only modifies the require system if necessary
 */

console.log('Express compatibility patch loaded');

// Only apply the patch if we detect Express 5
try {
  const fs = require('fs');
  const path = require('path');
  
  // Check if express exists and has node: imports
  const expressPath = path.join(__dirname, 'node_modules/express/lib/express.js');
  
  if (fs.existsSync(expressPath)) {
    const content = fs.readFileSync(expressPath, 'utf8');
    
    if (content.includes("require('node:")) {
      console.log('Patching require system for Express 5 compatibility');
      
      // Store the original require
      const originalRequire = module.constructor.prototype.require;
      
      // Create a patched version that simply removes the 'node:' prefix
      module.constructor.prototype.require = function(id) {
        if (id.startsWith('node:')) {
          return originalRequire.call(this, id.substring(5));
        }
        return originalRequire.call(this, id);
      };
      
      console.log('Express compatibility patch applied');
    }
  }
} catch (err) {
  // In case of any errors, don't modify the require system
  console.warn('Express patch not applied:', err.message);
} 