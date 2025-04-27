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
  
  // Set up keyboard detection for form inputs
  setupKeyboardDetection();
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

/**
 * Set up keyboard detection for form inputs
 * This helps adjust the UI when the virtual keyboard appears
 */
function setupKeyboardDetection() {
  // Define elements that trigger the keyboard
  const keyboardTriggerElements = 'input:not([type="button"]):not([type="submit"]), textarea, select';
  
  // Track the active element to determine if keyboard should be showing
  let activeElement = null;
  
  // Add focus event listeners to all inputs/textareas
  document.addEventListener('focusin', (e) => {
    if (e.target.matches(keyboardTriggerElements)) {
      activeElement = e.target;
      
      // Find the parent modal if any
      const modalBox = activeElement.closest('.modal-box');
      if (modalBox) {
        // Add class to indicate keyboard is visible
        document.body.classList.add('keyboard-visible');
        
        // Scroll the input into view with a small delay to let keyboard appear
        setTimeout(() => {
          activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      }
    }
  });
  
  // Handle focus out events
  document.addEventListener('focusout', (e) => {
    // Small delay to check if another input was focused
    setTimeout(() => {
      if (!document.activeElement.matches(keyboardTriggerElements)) {
        // Remove keyboard visible class
        document.body.classList.remove('keyboard-visible');
      }
    }, 100);
  });
  
  // Listen for resize events which might indicate keyboard appearance/disappearance
  let windowHeight = window.innerHeight;
  window.addEventListener('resize', () => {
    // If the window height decreased significantly, keyboard likely appeared
    if (window.innerHeight < windowHeight * 0.8) {
      document.body.classList.add('keyboard-visible');
    } 
    // If window height increased back to normal, keyboard likely disappeared
    else if (window.innerHeight > windowHeight * 0.9) {
      document.body.classList.remove('keyboard-visible');
    }
    
    // Update stored window height
    windowHeight = window.innerHeight;
  });
} 