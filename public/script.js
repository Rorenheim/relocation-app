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
    if (e.target.classList.contains('modal-backdrop')) {
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
      e.stopPropagation();
    }, { passive: true });
  });

  // Add specific class to the apartment URL form
  const apartmentUrlForm = document.getElementById('add-url-form');
  if (apartmentUrlForm) {
    apartmentUrlForm.classList.add('apartment-url-form');
  }
}

/**
 * Set up keyboard detection for form inputs
 * This helps adjust the UI when the virtual keyboard appears
 */
function setupKeyboardDetection() {
  const keyboardTriggerElements = 'input:not([type="button"]):not([type="submit"]), textarea, select';
  let isKeyboardVisible = false;
  let originalViewportHeight = window.innerHeight;
  let activeInput = null;

  const applyKeyboardStyles = (isShowing) => {
    isKeyboardVisible = isShowing;
    if (isShowing) {
      document.body.classList.add('keyboard-visible');
      // Scroll focused input into view if needed
      if (activeInput && activeInput.closest('.modal-box')) {
          setTimeout(() => {
              activeInput.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }, 250); // Delay slightly for keyboard animation
      }
    } else {
      document.body.classList.remove('keyboard-visible');
      activeInput = null; // Clear active input when keyboard hides
    }
    
    // iOS Specific body locking (experimental)
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        document.body.style.position = isShowing ? 'fixed' : '';
        document.body.style.width = isShowing ? '100%' : '';
    }
  };

  document.addEventListener('focusin', (e) => {
    if (e.target.matches(keyboardTriggerElements)) {
      activeInput = e.target; // Store the focused element
      // Assume keyboard is showing on focus for immediate visual feedback
      if (!isKeyboardVisible) {
          applyKeyboardStyles(true);
      }
    }
  });

  document.addEventListener('focusout', (e) => {
    if (e.target.matches(keyboardTriggerElements)) {
       // Delay check slightly to see if focus moved to another input
      setTimeout(() => {
          const currentlyFocused = document.activeElement;
          if (!currentlyFocused || !currentlyFocused.matches(keyboardTriggerElements)) {
              applyKeyboardStyles(false);
          }
      }, 100);
    }
  });

  // Visual Viewport API for more reliable detection (where available)
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', () => {
      const newHeight = window.visualViewport.height;
      // If viewport height is significantly smaller than window height, keyboard is likely up
      const keyboardLikelyVisible = newHeight < originalViewportHeight * 0.9;
      
      if (keyboardLikelyVisible !== isKeyboardVisible) {
          applyKeyboardStyles(keyboardLikelyVisible);
      }
    });
  } else {
    // Fallback to window resize event (less reliable)
    window.addEventListener('resize', () => {
        const newHeight = window.innerHeight;
        const heightChangedSignificantly = Math.abs(newHeight - originalViewportHeight) > originalViewportHeight * 0.15;
        
        if(heightChangedSignificantly){
            const keyboardLikelyVisible = newHeight < originalViewportHeight;
             if (keyboardLikelyVisible !== isKeyboardVisible) {
                applyKeyboardStyles(keyboardLikelyVisible);
            }
            originalViewportHeight = newHeight; // Update reference height
        }
    });
  }

  // Initial check in case keyboard is already visible on load
  originalViewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
} 