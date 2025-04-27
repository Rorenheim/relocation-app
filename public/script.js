/**
 * Main entry point for the application
 */

import App from './js/App.js';

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
  
  // Fix modal interactions on mobile devices
  fixMobileModals();
});

/**
 * Fix modal interaction issues on mobile devices
 */
function fixMobileModals() {
  // Handle clicks on modal backdrops to ensure they function correctly
  document.addEventListener('click', (e) => {
    // Check if the click is on a modal backdrop
    if (e.target.classList.contains('modal-backdrop')) {
      // Find the associated modal-toggle and uncheck it
      const forAttr = e.target.getAttribute('for');
      if (forAttr) {
        const toggle = document.getElementById(forAttr);
        if (toggle && toggle.classList.contains('modal-toggle')) {
          toggle.checked = false;
        }
      }
    }
  });
  
  // Ensure modals can receive touch events on mobile
  const modals = document.querySelectorAll('.modal, .modal-box');
  modals.forEach(modal => {
    modal.addEventListener('touchstart', (e) => {
      // Prevent event from being immediately canceled
      e.stopPropagation();
    }, { passive: true });
  });
} 