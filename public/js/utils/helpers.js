/**
 * Helper utilities for the relocation planner app
 */

import moment from 'https://cdn.jsdelivr.net/npm/moment@2.30.1/+esm';

const Helpers = {
  /**
   * Generate a unique ID
   * @returns {string} A unique ID
   */
  generateId() {
    return `id_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 5)}`;
  },

  /**
   * Format a date in a user-friendly format
   * @param {string} dateStr The date string
   * @returns {string} The formatted date
   */
  formatDate(dateStr) {
    if (!dateStr) return '';
    return moment(dateStr).format('YYYY-MM-DD');
  },

  /**
   * Format a date relative to now (e.g., "Today", "Tomorrow", "in 3 days")
   * @param {string} dateStr The date string
   * @returns {string} The formatted relative date
   */
  formatRelativeDate(dateStr) {
    if (!dateStr) return '';
    
    const date = moment(dateStr);
    const now = moment();
    const diffDays = date.diff(now, 'days');

    if (date.isSame(now, 'day')) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays > 1 && diffDays <= 7) return `in ${diffDays} days`;
    if (diffDays < -1 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;
    
    return this.formatDate(dateStr);
  },

  /**
   * Escape HTML to prevent XSS attacks
   * @param {string} str The string to escape
   * @returns {string} The escaped string
   */
  escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  /**
   * Get HTML for an assignee avatar
   * @param {string} assignee The assignee name
   * @returns {string} HTML for the avatar
   */
  getAssigneeAvatar(assignee) {
    if (assignee === 'paul') {
      return `<div class="avatar">
                <div class="w-8 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                  <img src="https://cdn.glitch.global/28a8db60-3e87-444d-b696-85305b514935/paul.jpg?v=1745688322398" alt="Paul" />
                </div>
              </div>`;
    }
    if (assignee === 'darya') {
      return `<div class="avatar">
                <div class="w-8 rounded-full ring ring-secondary ring-offset-base-100 ring-offset-2">
                  <img src="https://cdn.glitch.global/28a8db60-3e87-444d-b696-85305b514935/darya.jpg?v=1745688318139" alt="Darya" />
                </div>
              </div>`;
    }
    if (assignee === 'both') {
      return `<div class="avatar-group -space-x-6 rtl:space-x-reverse">
                <div class="avatar">
                  <div class="w-8">
                    <img src="https://cdn.glitch.global/28a8db60-3e87-444d-b696-85305b514935/paul.jpg?v=1745688322398" alt="Paul" />
                  </div>
                </div>
                <div class="avatar">
                  <div class="w-8">
                    <img src="https://cdn.glitch.global/28a8db60-3e87-444d-b696-85305b514935/darya.jpg?v=1745688318139" alt="Darya" />
                  </div>
                </div>
              </div>`;
    }
    return '';
  },

  /**
   * Show a toast notification
   * @param {string} message The notification message
   * @param {string} type The notification type (success, error, warning, info)
   */
  showToast(message, type = 'success') {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      toastContainer.className = 'toast toast-end z-50';
      document.body.appendChild(toastContainer);
    }

    // Create and add toast
    const toast = document.createElement('div');
    toast.className = `alert alert-${type} mt-2`;
    toast.innerHTML = `<span>${message}</span>`;
    toastContainer.appendChild(toast);

    // Remove toast after 3 seconds
    setTimeout(() => {
      toast.classList.add('opacity-0');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3000);
  },

  /**
   * Get a category badge
   * @param {string} category The category name
   * @returns {string} HTML for the badge
   */
  getCategoryBadge(category) {
    const categoryColors = {
      docs: 'badge-success',
      apartment: 'badge-warning',
      services: 'badge-secondary',
      moving: 'badge-info',
      finances: 'badge-error',
      paperwork: 'badge-primary',
      other: 'badge-neutral'
    };

    const color = categoryColors[category] || 'badge-neutral';
    const label = {
      docs: 'Docs',
      apartment: 'Apartment',
      services: 'Services',
      moving: 'Moving',
      finances: 'Finances',
      paperwork: 'Paperwork',
      other: 'Other'
    }[category] || category;

    return `<span class="badge ${color}">${label}</span>`;
  },

  /**
   * Get category background color class for card styling
   * @param {string} category The category name
   * @returns {string} CSS classes for the background
   */
  getCategoryBackgroundClass(category) {
    // Force category to one of our valid values to ensure it always gets styled
    if (!category || !['docs', 'apartment', 'services', 'moving', 'finances', 'paperwork', 'other'].includes(category)) {
      category = 'other';
    }
    
    // Use direct solid background colors for better visibility
    const categoryColors = {
      docs: 'bg-green-100 border-green-300',
      apartment: 'bg-yellow-100 border-yellow-300',
      services: 'bg-purple-100 border-purple-300',
      moving: 'bg-blue-100 border-blue-300',
      finances: 'bg-red-100 border-red-300',
      paperwork: 'bg-indigo-100 border-indigo-300',
      other: 'bg-gray-100 border-gray-300'
    };

    // Return matching color
    return categoryColors[category];
  },

  /**
   * Gets a random motivational quote
   * @returns {Object} A quote object with text and author
   */
  getRandomQuote() {
    const quotes = [
      { text: "Your new beginning is just around the corner.", author: "Unknown" },
      { text: "Home is where your story begins.", author: "Unknown" },
      { text: "The magic happens when you move out of your comfort zone.", author: "Unknown" },
      { text: "Adventure awaits on the other side of fear.", author: "Unknown" },
      { text: "Every new place is a chance to reinvent yourself.", author: "Unknown" },
      { text: "A journey of a thousand miles begins with a single step.", author: "Lao Tzu" },
      { text: "Life begins at the end of your comfort zone.", author: "Neale Donald Walsch" },
      { text: "The best way to predict your future is to create it.", author: "Abraham Lincoln" },
      { text: "Change is the only constant in life.", author: "Heraclitus" },
      { text: "New city, new memories, new you.", author: "Unknown" }
    ];

    return quotes[Math.floor(Math.random() * quotes.length)];
  }
};

export default Helpers; 