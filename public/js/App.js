/**
 * Main App Component
 */

import Store from './utils/store.js';
import TasksPage from './pages/TasksPage.js';
import NotesPage from './pages/NotesPage.js';
import ApartmentsPage from './pages/ApartmentsPage.js';
import OverviewPage from './pages/OverviewPage.js';

class App {
  /**
   * Create a new App
   */
  constructor() {
    this.currentPage = null;
    this.contentEl = null;
    this.navButtons = null;
    this.themeToggleBtn = null;
    this.themeToggleButtons = null; // Use a collection for all theme toggles
    
    // Bind methods
    this.handleNavigation = this.handleNavigation.bind(this);
    this.handleThemeToggle = this.handleThemeToggle.bind(this);
  }

  /**
   * Initialize the app
   */
  async init() {
    // Find content element
    this.contentEl = document.getElementById('main-content');
    
    // Find nav buttons
    this.navButtons = document.querySelectorAll('.nav-btn');
    
    // Find theme toggle button
    this.themeToggleBtn = document.getElementById('theme-toggle');
    // Find ALL theme toggle buttons (header + sidebar)
    this.themeToggleButtons = document.querySelectorAll('.theme-toggle-btn');
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Initialize store
    await Store.init();
    
    // Load theme from localStorage
    this.loadTheme();
    
    // Initialize the active page
    this.initActivePage();
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Navigation buttons
    this.navButtons.forEach(button => {
      button.addEventListener('click', () => {
        this.handleNavigation(button.getAttribute('data-page'));
      });
    });
    
    // Theme toggle
    this.themeToggleButtons.forEach(button => {
      button.addEventListener('click', this.handleThemeToggle);
    });
  }

  /**
   * Initialize the active page
   */
  initActivePage() {
    // Check if there's a page in the URL hash
    const hash = window.location.hash.replace('#', '');
    const validPages = ['tasks', 'notes', 'apartments', 'overview'];
    
    // Default to overview if no valid page is in the hash
    const activePage = validPages.includes(hash) ? hash : 'overview';
    
    // Navigate to the active page
    this.handleNavigation(activePage);
    
    // Listen for hash changes
    window.addEventListener('hashchange', () => {
      const newHash = window.location.hash.replace('#', '');
      if (validPages.includes(newHash)) {
        this.handleNavigation(newHash);
      }
    });
  }

  /**
   * Handle navigation
   * @param {string} page The page to navigate to
   */
  handleNavigation(page) {
    // Update URL hash
    window.location.hash = page;
    
    // Update active nav button
    this.navButtons.forEach(button => {
      const buttonPage = button.getAttribute('data-page');
      if (buttonPage === page) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });
    
    // Clear content
    if (this.contentEl) {
      this.contentEl.innerHTML = '';
    }
    
    // Create and render the new page
    let newPage;
    
    switch (page) {
      case 'tasks':
        newPage = new TasksPage(this.contentEl);
        break;
      case 'notes':
        newPage = new NotesPage(this.contentEl);
        break;
      case 'apartments':
        newPage = new ApartmentsPage(this.contentEl);
        break;
      case 'overview':
      default:
        newPage = new OverviewPage(this.contentEl);
        break;
    }
    
    // Initialize the new page
    this.currentPage = newPage;
    this.currentPage.init();
  }

  /**
   * Handle theme toggle
   */
  handleThemeToggle() {
    // Toggle theme
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    // Update HTML
    html.setAttribute('data-theme', newTheme);
    
    // Save to localStorage
    localStorage.setItem('theme', newTheme);
    
    // Update theme toggle button
    this.updateThemeToggleButtons(newTheme);
  }

  /**
   * Load theme from localStorage
   */
  loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light'; // Default to light
    
    // Apply saved theme
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Update theme toggle button
    this.updateThemeToggleButtons(savedTheme);
  }

  /**
   * Update the appearance of all theme toggle buttons
   * @param {string} currentTheme The current theme ('light' or 'dark')
   */
  updateThemeToggleButtons(currentTheme) {
    const isLight = currentTheme === 'light';
    this.themeToggleButtons.forEach(button => {
      // Update icon and text/tooltip based on context (header vs sidebar)
      const iconClass = isLight ? 'ri-moon-line' : 'ri-sun-line';
      const text = isLight ? 'Dark Mode' : 'Light Mode';
      const tooltipText = isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode';

      // Find icon within the button
      const icon = button.querySelector('i');
      if (icon) {
        icon.className = `${iconClass} text-lg`; // Ensure consistent icon size
        // If sidebar button, add margin
        if (button.closest('aside')) {
          icon.classList.add('mr-2');
          // Update text content for sidebar button
          const textNode = button.childNodes[1]; // Assuming text is the second node
           if (textNode && textNode.nodeType === Node.TEXT_NODE) {
             textNode.textContent = ` ${text}`;
           } else {
             // Fallback if structure changes
             button.innerHTML = `<i class="${iconClass} text-lg mr-2"></i> ${text}`;
           }
        }
      }

      // Update tooltip for header button
      if (button.id === 'theme-toggle') {
          button.setAttribute('data-tip', tooltipText);
      }
    });
  }
}

export default App; 