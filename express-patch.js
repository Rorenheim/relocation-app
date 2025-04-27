/**
 * Express patch for Glitch
 * This file patches the require system to handle 'node:' imports in Express 5
 */

// Store the original require
const originalRequire = module.constructor.prototype.require;

// Create a patched version that handles node: protocol
module.constructor.prototype.require = function patchedRequire(path) {
  // If it's a node: import, remove the prefix
  if (path.startsWith('node:')) {
    const moduleName = path.substring(5); // Remove 'node:'
    try {
      // Try to require without the node: prefix
      return originalRequire.call(this, moduleName);
    } catch (error) {
      console.error(`Error requiring ${moduleName} (from ${path}):`, error.message);
      throw error;
    }
  }
  
  // Otherwise, use the original require
  return originalRequire.call(this, path);
};

console.log('Express compatibility patch applied'); 