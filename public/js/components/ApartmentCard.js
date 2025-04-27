/**
 * Apartment Card Component
 */

import Helpers from '../utils/helpers.js';
import Store from '../utils/store.js';

class ApartmentCard {
  /**
   * Create a new ApartmentCard
   * @param {Object} apartment The apartment data
   */
  constructor(apartment) {
    this.apartment = apartment;
    this.element = null;
  }

  /**
   * Delete this apartment
   * @param {Event} e The click event
   */
  deleteApartment(e) {
    e.stopPropagation();
    
    if (confirm('Are you sure you want to delete this apartment?')) {
      Store.deleteApartment(this.apartment.id);
    }
  }

  /**
   * Toggle favorite status
   * @param {Event} e The click event
   */
  toggleFavorite(e) {
    e.stopPropagation();
    Store.toggleApartmentFavorite(this.apartment.id);
  }

  /**
   * Toggle applied status
   * @param {Event} e The click event
   */
  toggleApplied(e) {
    e.stopPropagation();
    Store.toggleApartmentApplied(this.apartment.id);
  }

  /**
   * Open the apartment in a new tab
   * @param {Event} e The click event
   */
  openLink(e) {
    window.open(this.apartment.metadata?.originalUrl || '', '_blank');
  }

  /**
   * Render the apartment card
   * @returns {HTMLElement} The rendered apartment card
   */
  render() {
    // Create the apartment card element
    this.element = document.createElement('div');
    
    // Set attributes and classes
    this.element.className = 'card bg-base-100 shadow-md hover:shadow-lg transition-all cursor-pointer';
    this.element.setAttribute('data-apartment-id', this.apartment.id);
    
    // Get the apartment metadata
    const metadata = this.apartment.metadata || {};
    
    // Get favorite and applied status
    const isFavorite = metadata.isFavorite || false;
    const isApplied = metadata.isApplied || false;
    
    // Format date
    const formattedDate = new Date(this.apartment.createdAt).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    
    // Extract domain from URL for display
    let domain = '';
    try {
      const url = new URL(metadata.originalUrl || '');
      domain = url.hostname.replace('www.', '');
    } catch (e) {
      domain = 'unknown';
    }
    
    // Set the inner HTML - remove explicit favorite/applied text
    this.element.innerHTML = `
      <div class="card-body p-4">
        <div class="flex justify-between items-start">
          <h3 class="card-title text-base">
            ${Helpers.escapeHtml(metadata.title || 'Apartment Listing')}
          </h3>
          <div class="flex gap-1">
            <button class="btn btn-ghost btn-sm p-1 h-auto min-h-0 favorite-btn tooltip" data-tip="${isFavorite ? 'Remove favorite' : 'Add to favorites'}">
              <i class="ri-heart-${isFavorite ? 'fill text-error' : 'line'}"></i>
            </button>
            <button class="btn btn-ghost btn-sm p-1 h-auto min-h-0 applied-btn tooltip" data-tip="${isApplied ? 'Mark as not applied' : 'Mark as applied'}">
              <i class="ri-file-paper-2-${isApplied ? 'fill text-success' : 'line'}"></i>
            </button>
          </div>
        </div>
        
        <div class="text-sm text-base-content/70 flex items-center gap-1 mt-1">
          <i class="ri-global-line"></i>
          <span>${Helpers.escapeHtml(domain)}</span>
        </div>
        
        <div class="card-actions justify-between mt-3 pt-3 border-t border-base-200">
          <div class="text-xs text-gray-500">${formattedDate}</div>
          <div class="flex gap-2">
            <button class="btn btn-ghost btn-sm delete-apartment-btn tooltip" data-tip="Delete">
              <i class="ri-delete-bin-line text-error"></i>
            </button>
            <button class="btn btn-primary btn-sm open-link-btn">
              <i class="ri-external-link-line mr-1"></i> Visit
            </button>
          </div>
        </div>
      </div>
    `;
    
    // Add event listeners
    const deleteBtn = this.element.querySelector('.delete-apartment-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', (e) => this.deleteApartment(e));
    }
    
    const favoriteBtn = this.element.querySelector('.favorite-btn');
    if (favoriteBtn) {
      favoriteBtn.addEventListener('click', (e) => this.toggleFavorite(e));
    }
    
    const appliedBtn = this.element.querySelector('.applied-btn');
    if (appliedBtn) {
      appliedBtn.addEventListener('click', (e) => this.toggleApplied(e));
    }
    
    // Make the card content clickable to open the link, but exclude the buttons
    this.element.addEventListener('click', (e) => {
      // Only open if not clicking on any button
      if (!e.target.closest('.delete-apartment-btn') && 
          !e.target.closest('.favorite-btn') && 
          !e.target.closest('.applied-btn')) {
        this.openLink(e);
      }
    });
    
    return this.element;
  }
}

export default ApartmentCard; 