/**
 * Main entry point for the application
 */

import App from './js/App.js';

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
}); 