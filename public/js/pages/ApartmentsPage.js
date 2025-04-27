/**
 * Apartments Page Component
 */

import Store from '../utils/store.js';
import ApartmentCard from '../components/ApartmentCard.js';
import Helpers from '../utils/helpers.js';
import API from '../utils/api.js';

class ApartmentsPage {
  /**
   * Create a new ApartmentsPage
   * @param {HTMLElement} container The container element
   */
  constructor(container) {
    this.container = container;
    this.apartmentsListEl = null;
    this.scrapeFormEl = null;
    this.scrapeStatusEl = null;
    this.isLoading = false;
    
    // Bind methods
    this.handleScrapeApartment = this.handleScrapeApartment.bind(this);
    this.renderApartments = this.renderApartments.bind(this);
  }

  /**
   * Initialize the page
   */
  init() {
    this.render();
    this.setupEventListeners();
    
    // Observe apartments
    Store.observe('apartments', this.renderApartments);
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Scrape apartment form
    this.scrapeFormEl = this.container.querySelector('#scrape-apartment-form');
    if (this.scrapeFormEl) {
      this.scrapeFormEl.addEventListener('submit', this.handleScrapeApartment);
    }
    
    this.scrapeStatusEl = this.container.querySelector('#scrape-status');
  }

  /**
   * Handle scrape apartment form submission
   * @param {Event} e The submit event
   */
  async handleScrapeApartment(e) {
    e.preventDefault();
    
    if (this.isLoading) return;
    
    const urlInput = document.getElementById('modal-apartment-url');
    const url = urlInput?.value.trim();
    
    if (!url) {
      Helpers.showToast('Please enter a URL', 'error');
      return;
    }
    
    // Get custom title if provided
    const titleInput = document.getElementById('modal-apartment-title');
    const customTitle = titleInput?.value.trim() || '';
    
    this.isLoading = true;
    
    // Update UI
    if (this.scrapeStatusEl) {
      this.scrapeStatusEl.innerHTML = `
        <div class="flex items-center text-info">
          <span class="loading loading-spinner loading-sm mr-2"></span>
          <span>Processing URL...</span>
        </div>
      `;
    }
    
    try {
      // Call the API endpoint with the custom title if available
      const response = await API.scrapeApartment(url, customTitle);
      
      if (response.success) {
        // Add the apartment
        Store.addApartment({
          id: response.metadata.id,
          metadata: response.metadata,
          createdAt: new Date().toISOString()
        });
        
        // Close the modal
        document.getElementById('add-url-modal').checked = false;
        
        // Reset form
        urlInput.value = '';
        if (titleInput) titleInput.value = '';
        
        // Clear status
        if (this.scrapeStatusEl) {
          this.scrapeStatusEl.innerHTML = '';
        }
        
        // Show success toast
        Helpers.showToast('Apartment added successfully', 'success');
      } else {
        throw new Error(response.error || 'Failed to add apartment');
      }
    } catch (error) {
      console.error('Error adding apartment:', error);
      
      // Update status
      if (this.scrapeStatusEl) {
        const errorMessage = error.response?.data?.error || error.message || 'Failed to add apartment';
        
        this.scrapeStatusEl.innerHTML = `
          <div class="flex items-center text-error">
            <i class="ri-error-warning-line mr-2"></i>
            <span>${errorMessage}</span>
          </div>
        `;
      }
      
      // Show error toast
      const toastMessage = error.response?.data?.error || error.message || 'Failed to add apartment';
      Helpers.showToast(toastMessage, 'error');
    } finally {
      this.isLoading = false;
    }
  }

  // Add new method to fetch title only for preview
  async fetchTitlePreview(url) {
    try {
      // Check if URL is empty
      if (!url) return;
      
      // Show a loading state for the title field
      const titleInput = document.getElementById('modal-apartment-title');
      if (titleInput) {
        titleInput.placeholder = "Fetching title...";
      }
      
      // Call API to get title only
      const response = await API.scrapeApartment(url);
      
      // If successful, populate the title field
      if (response.success && response.metadata.title && titleInput) {
        titleInput.value = response.metadata.title;
        titleInput.placeholder = "Enter a custom title for this listing";
      }
    } catch (error) {
      console.warn("Could not fetch title preview:", error);
      // Silent fail - keep the default empty title input
    }
  }

  /**
   * Render apartments list
   */
  renderApartments() {
    if (!this.apartmentsListEl) return;
    
    // Clear apartments list
    this.apartmentsListEl.innerHTML = '';
    
    const apartments = Store.state.apartments;
    
    if (apartments.length === 0) {
      this.apartmentsListEl.innerHTML = `
        <div class="text-center py-8">
          <div class="mb-2 text-gray-500"><i class="ri-home-line text-3xl"></i></div>
          <p class="text-gray-500">No apartments saved</p>
          <p class="text-sm text-gray-400 mt-1">Add apartments from Immobilienscout24 to get started</p>
        </div>
      `;
      return;
    }
    
    // Sort apartments by creation date (newest first)
    const sortedApartments = [...apartments].sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    
    // Create and append apartment cards
    sortedApartments.forEach(apartment => {
      const apartmentCard = new ApartmentCard(apartment);
      this.apartmentsListEl.appendChild(apartmentCard.render());
    });
  }

  /**
   * Render the page
   */
  render() {
    this.container.innerHTML = `
      <div class="p-4">
        <h1 class="text-2xl font-bold mb-6">Apartments</h1>
        
        <div class="card bg-base-100 shadow-md">
          <div class="card-body">
            <h3 class="card-title">
              <i class="ri-home-heart-line text-primary mr-2"></i>
              Saved Apartments
            </h3>
            
            <div id="apartments-list" class="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <!-- Apartments will be rendered here -->
              <div class="text-center py-8 col-span-full">
                <span class="loading loading-spinner loading-md"></span>
                <p class="mt-2 text-sm text-gray-500">Loading apartments...</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Floating Action Button -->
        <button id="add-apartment-fab" class="btn btn-primary btn-circle btn-lg fixed bottom-24 right-4 shadow-lg hover:scale-110 transition-transform duration-200 z-50">
          <i class="ri-add-line text-2xl"></i>
        </button>
        
        <!-- Add URL Modal -->
        <input type="checkbox" id="add-url-modal" class="modal-toggle" />
        <div class="modal modal-bottom sm:modal-middle" role="dialog">
          <div class="modal-box">
            <h3 class="font-bold text-xl mb-5">Add Apartment URL</h3>
            <form id="add-url-form" class="space-y-4 apartment-url-form">
              <div class="form-control">
                <label class="label"><span class="label-text">Apartment Listing URL</span></label>
                <input type="url" id="modal-apartment-url" class="input input-bordered" 
                       placeholder="https://www.example.com/apartment/..." required />
                <p class="text-xs text-base-content/60 mt-1">
                  Paste the URL of the apartment listing you want to save
                </p>
              </div>
              
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Custom Title (Optional)</span>
                </label>
                <input type="text" id="modal-apartment-title" class="input input-bordered" 
                       placeholder="Enter a custom title for this listing" />
                <p class="text-xs text-base-content/60 mt-1">
                  Leave blank to use the page title
                </p>
              </div>
              
              <div id="scrape-status" class="mt-3 min-h-6"></div>
              <div class="modal-action mt-6">
                <label for="add-url-modal" class="btn btn-ghost">Cancel</label>
                <button type="submit" class="btn btn-primary">Add to List</button>
              </div>
            </form>
          </div>
          <label class="modal-backdrop" for="add-url-modal">Close</label>
        </div>
      </div>
    `;
    
    // Store references to elements
    this.apartmentsListEl = this.container.querySelector('#apartments-list');
    this.scrapeStatusEl = this.container.querySelector('#scrape-status');
    
    // Add event listener to FAB
    const addApartmentFab = this.container.querySelector('#add-apartment-fab');
    if (addApartmentFab) {
      addApartmentFab.addEventListener('click', () => {
        document.getElementById('add-url-modal').checked = true;
        // Clear form
        const urlInput = document.getElementById('modal-apartment-url');
        if (urlInput) urlInput.value = '';
        // Clear status
        if (this.scrapeStatusEl) this.scrapeStatusEl.innerHTML = '';
      });
    }
    
    // Add event listener to URL modal form
    const addUrlForm = this.container.querySelector('#add-url-form');
    if (addUrlForm) {
      addUrlForm.addEventListener('submit', this.handleScrapeApartment.bind(this));
    }
    
    // Add event listener to URL input for title preview
    const urlInput = document.getElementById('modal-apartment-url');
    if (urlInput) {
      // Remove debounced input event that fetches title preview
      // Don't auto-fill title, let user enter it manually
      /*
      let debounceTimer;
      urlInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        const url = e.target.value.trim();
        
        // Wait for user to finish typing
        if (url.length > 10 && url.includes('.')) {
          debounceTimer = setTimeout(() => {
            this.fetchTitlePreview(url);
          }, 1000);
        }
      });
      */
    }
    
    // Initial render
    this.renderApartments();
  }
}

export default ApartmentsPage; 