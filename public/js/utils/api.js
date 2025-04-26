/**
 * API utilities for the relocation planner app
 */

const API = {
  // Base endpoints
  endpoints: {
    data: '/api/data',
    scrape: '/api/scrape-apartment',
    backup: '/api/backup',
    restore: '/api/restore'
  },

  /**
   * Fetch all app data from the server
   * @returns {Promise<Object>} The app data (tasks, notes, apartments)
   */
  async fetchData() {
    try {
      const response = await fetch(this.endpoints.data);
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  },

  /**
   * Save all app data to the server
   * @param {Object} data The app data to save
   * @returns {Promise<Object>} The response from the server
   */
  async saveData(data) {
    try {
      const response = await fetch(this.endpoints.data, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save data: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error saving data:', error);
      throw error;
    }
  },

  /**
   * Scrape an apartment listing from a URL
   * @param {string} url The URL to scrape
   * @param {string} [title] Optional custom title
   * @returns {Promise<Object>} The scraped apartment data
   */
  async scrapeApartment(url, title = '') {
    try {
      const response = await fetch(this.endpoints.scrape, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url, title })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to scrape apartment: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error scraping apartment:', error);
      throw error;
    }
  },

  /**
   * Download a backup of all app data
   */
  downloadBackup() {
    window.location.href = this.endpoints.backup;
  },

  /**
   * Restore app data from a backup
   * @param {Object} backupData The backup data to restore
   * @returns {Promise<Object>} The response from the server
   */
  async restoreFromBackup(backupData) {
    try {
      const response = await fetch(this.endpoints.restore, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(backupData)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to restore from backup: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error restoring from backup:', error);
      throw error;
    }
  }
};

export default API; 