/**
 * Main entry point for the application
 */

import App from './js/App.js';

// Store initial viewport height for iOS keyboard detection
let initialViewportHeight = window.innerHeight;

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
  
  // Fix modal interactions on mobile devices
  fixMobileModals();
  
  // Set up keyboard detection for form inputs
  setupKeyboardDetection();
  
  // Store the initial viewport height for iOS keyboard detection
  initialViewportHeight = window.innerHeight;
  
  // Add iOS-specific class if needed
  if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
    document.documentElement.classList.add('ios-device');
  }
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
          
          // Remove keyboard visible class when closing modal
          document.body.classList.remove('keyboard-visible');
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

  // Add specific class to the apartment URL form
  const apartmentUrlForm = document.getElementById('add-url-form');
  if (apartmentUrlForm) {
    apartmentUrlForm.classList.add('apartment-url-form');
  }
  
  // Fix modal toggle behavior
  const modalToggles = document.querySelectorAll('.modal-toggle');
  modalToggles.forEach(toggle => {
    toggle.addEventListener('change', (e) => {
      // When a modal is closed, remove keyboard visible class
      if (!e.target.checked) {
        document.body.classList.remove('keyboard-visible');
      }
    });
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
  let keyboardVisible = false;
  
  // Add focus event listeners to all inputs/textareas
  document.addEventListener('focusin', (e) => {
    if (e.target.matches(keyboardTriggerElements)) {
      activeElement = e.target;
      
      // Find the parent modal if any
      const modalBox = activeElement.closest('.modal-box');
      if (modalBox) {
        // Add class to indicate keyboard is visible
        document.body.classList.add('keyboard-visible');
        keyboardVisible = true;
        
        // Add iOS specific fixes
        if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
          // Apply specific CSS fixes for iOS
          modalBox.style.webkitTransform = 'translate3d(0,0,0)';
          
          // Set a timeout to scroll the input into view after the keyboard appears
          setTimeout(() => {
            activeElement.scrollIntoView({ behavior: 'auto', block: 'center' });
            
            // Add extra padding to push content up more on iOS
            modalBox.style.paddingBottom = '120px';
          }, 300);
        }
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
        keyboardVisible = false;
        
        // Reset iOS specific fixes
        if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
          const modalBoxes = document.querySelectorAll('.modal-box');
          modalBoxes.forEach(box => {
            box.style.paddingBottom = '';
          });
        }
      }
    }, 100);
  });
  
  // Listen for resize events which might indicate keyboard appearance/disappearance
  window.addEventListener('resize', () => {
    // Check if it's an iOS device
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    // iOS has a significant height change when keyboard appears
    if (isIOS) {
      // If the window height decreased significantly, keyboard likely appeared
      if (window.innerHeight < initialViewportHeight * 0.75) {
        document.body.classList.add('keyboard-visible');
        keyboardVisible = true;
        
        // If an input is focused, scroll it into view
        if (document.activeElement && document.activeElement.matches(keyboardTriggerElements)) {
          setTimeout(() => {
            document.activeElement.scrollIntoView({ behavior: 'auto', block: 'center' });
            
            // Find parent modal box if any
            const modalBox = document.activeElement.closest('.modal-box');
            if (modalBox) {
              modalBox.style.paddingBottom = '120px';
            }
          }, 100);
        }
      } 
      // If window height increased back to normal, keyboard likely disappeared
      else if (window.innerHeight > initialViewportHeight * 0.9) {
        document.body.classList.remove('keyboard-visible');
        keyboardVisible = false;
        
        // Reset padding
        const modalBoxes = document.querySelectorAll('.modal-box');
        modalBoxes.forEach(box => {
          box.style.paddingBottom = '';
        });
      }
    } else {
      // For non-iOS devices, use a simpler approach
      if (window.innerHeight < window.outerHeight * 0.75) {
        document.body.classList.add('keyboard-visible');
      } else {
        document.body.classList.remove('keyboard-visible');
      }
    }
  });
  
  // Special handling for input elements
  document.addEventListener('click', (e) => {
    // If clicking an input while keyboard is not visible, make it visible
    if (e.target.matches(keyboardTriggerElements) && !keyboardVisible) {
      document.body.classList.add('keyboard-visible');
      keyboardVisible = true;
      
      // For iOS
      if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        setTimeout(() => {
          e.target.scrollIntoView({ behavior: 'auto', block: 'center' });
        }, 300);
      }
    }
  });
} 