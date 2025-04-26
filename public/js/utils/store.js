/**
 * Store for managing application state
 */

import API from './api.js';
import Helpers from './helpers.js';

const Store = {
  // Application state
  state: {
    tasks: [],
    notes: [],
    apartments: [],
    assignees: ['paul', 'darya'],
    categories: {
      docs: 'Docs & Notices',
      apartment: 'Apartment Search',
      services: 'Services & Utilities',
      moving: 'Moving & Transport',
      finances: 'Finances & Budget',
      paperwork: 'Paperwork',
      other: 'Other'
    },
    filters: {
      status: 'all' // Only keep status filter
      // assignee: 'all',
      // category: 'all',
    },
    currentTask: null,
    currentNoteAuthor: 'paul',
    activeTab: 'tasks-tab',
    isMobileView: window.innerWidth < 768,
    isDragging: false,
    touchStartX: 0,
    touchStartY: 0
  },

  // Observers for state changes
  observers: {
    tasks: new Set(),
    notes: new Set(),
    apartments: new Set(),
    filters: new Set(),
    activeTab: new Set()
  },

  /**
   * Get a filtered list of tasks based on status only
   * @returns {Array} Filtered tasks
   */
  getFilteredTasks() {
    return this.state.tasks.filter(task => {
      // Filter by status
      if (this.state.filters.status !== 'all' && task.status !== this.state.filters.status) {
        return false;
      }
      
      // Remove assignee filter
      // if (this.state.filters.assignee !== 'all' && task.assignee !== this.state.filters.assignee) {
      //   return false;
      // }
      
      // Remove category filter
      // if (this.state.filters.category !== 'all' && task.category !== this.state.filters.category) {
      //   return false;
      // }
      
      return true;
    });
  },

  /**
   * Calculate the progress of tasks
   * @returns {number} Progress percentage (0-100)
   */
  getProgress() {
    if (this.state.tasks.length === 0) return 0;
    
    const completed = this.state.tasks.filter(task => task.status === 'completed').length;
    return Math.round((completed / this.state.tasks.length) * 100);
  },

  /**
   * Initialize the store
   */
  async init() {
    try {
      // Load data from the server
      const data = await API.fetchData();
      
      // Update state and ensure valid note authors
      this.state.tasks = data.tasks || [];
      this.state.notes = (data.notes || []).map(note => ({
        ...note,
        author: this.state.assignees.includes(note.author) ? note.author : 'paul' // Default invalid authors to 'paul'
      }));
      this.state.apartments = data.apartments || [];
      
      // Initialize sample data if needed
      if (this.state.tasks.length === 0 && this.state.notes.length === 0) {
        this.initSampleData();
      }
      
      // Notify observers
      this.notifyObservers('tasks');
      this.notifyObservers('notes');
      this.notifyObservers('apartments');
    } catch (error) {
      console.error('Failed to initialize store:', error);
      Helpers.showToast('Failed to load data. Using local data.', 'error');
      
      // Try to load from localStorage as a fallback
      this.loadFromLocalStorage();
    }
  },

  /**
   * Save the current state to the server
   */
  async save() {
    try {
      // Save to localStorage as a backup
      this.saveToLocalStorage();
      
      // Save to the server
      await API.saveData({
        tasks: this.state.tasks,
        notes: this.state.notes,
        apartments: this.state.apartments
      });
      
      console.log('Data saved successfully');
    } catch (error) {
      console.error('Failed to save data:', error);
      Helpers.showToast('Failed to save data to the server. Data saved locally.', 'warning');
    }
  },

  /**
   * Save the current state to localStorage
   */
  saveToLocalStorage() {
    try {
      localStorage.setItem('relocation-app-data', JSON.stringify({
        tasks: this.state.tasks,
        notes: this.state.notes,
        apartments: this.state.apartments
      }));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  },

  /**
   * Load the state from localStorage
   */
  loadFromLocalStorage() {
    try {
      const data = JSON.parse(localStorage.getItem('relocation-app-data') || '{}');
      
      // Update state and ensure valid note authors
      this.state.tasks = data.tasks || [];
      this.state.notes = (data.notes || []).map(note => ({
        ...note,
        author: this.state.assignees.includes(note.author) ? note.author : 'paul' // Default invalid authors to 'paul'
      }));
      this.state.apartments = data.apartments || [];
      
      // Initialize sample data if needed
      if (this.state.tasks.length === 0 && this.state.notes.length === 0) {
        this.initSampleData();
      }
      
      // Notify observers
      this.notifyObservers('tasks');
      this.notifyObservers('notes');
      this.notifyObservers('apartments');
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
    }
  },

  /**
   * Initialize sample data
   */
  initSampleData() {
    // Sample tasks (ensure assignees are valid)
    this.state.tasks = [
      {
        id: 'task1',
        title: 'Gather Berlin tenancy, Anmeldung, insurance and pet passport papers',
        description: 'Collect all important documents and make copies. Store digital versions in cloud storage.',
        category: 'docs',
        date: '2025-04-26',
        assignee: 'paul', // Changed from 'both'
        priority: 'medium',
        createdAt: '2025-04-14T10:00:00.000Z',
        status: 'todo'
      },
      {
        id: 'task2',
        title: 'Find and book Darya\'s temporary Frankfurt apartment',
        description: 'Look for a pet-friendly furnished apartment for 1-2 months starting June 1st.',
        category: 'apartment',
        date: '2025-04-28',
        assignee: 'darya',
        priority: true,
        createdAt: '2025-04-14T10:05:00.000Z',
        status: 'todo'
      },
      {
        id: 'task3',
        title: 'Send notice to Berlin landlord',
        description: 'Target handover date: July 31st. Check contract for notice period requirements.',
        category: 'apartment',
        date: '2025-05-03',
        assignee: 'paul',
        priority: true,
        createdAt: '2025-04-14T10:10:00.000Z',
        status: 'todo'
      }
    ];
    
    // Sample notes (authors are already valid)
    this.state.notes = [
      {
        id: 'note1',
        title: 'Relocation Budget Notes',
        content: 'Darya\'s company offers €7,000 for relocation expenses. We need to keep all receipts for:\n- Moving company costs\n- Temporary housing\n- Travel to Frankfurt\n- Initial setup costs for new apartment',
        author: 'paul',
        createdAt: '2025-04-14T11:00:00.000Z',
        updatedAt: '2025-04-14T11:00:00.000Z'
      },
      {
        id: 'note2',
        title: 'Frankfurt Apartment Requirements',
        content: 'For our permanent apartment in Frankfurt, we need:\n- At least 70m²\n- Pet-friendly\n- Max 30 min commute to Kia office\n- Balcony or garden access\n- Storage for bikes\n- Close to public transportation',
        author: 'darya',
        createdAt: '2025-04-14T11:05:00.000Z',
        updatedAt: '2025-04-14T11:05:00.000Z'
      }
    ];
  },

  /**
   * Register a component as an observer for a specific state property
   * @param {string} property The state property to observe
   * @param {function} callback The callback to call when the property changes
   */
  observe(property, callback) {
    if (!this.observers[property]) {
      this.observers[property] = new Set();
    }
    
    this.observers[property].add(callback);
    
    // Call the callback immediately
    callback();
    
    // Return an unsubscribe function
    return () => {
      this.observers[property].delete(callback);
    };
  },

  /**
   * Notify all observers of a state property change
   * @param {string} property The state property that changed
   */
  notifyObservers(property) {
    if (!this.observers[property]) return;
    
    for (const callback of this.observers[property]) {
      callback();
    }
  },

  /**
   * Update a filter (now only status) and notify observers
   * @param {string} filter The filter name (should always be 'status')
   * @param {string} value The filter value
   */
  updateFilter(filter, value) {
    // Only update the status filter
    if (filter === 'status') {
      this.state.filters.status = value;
      this.notifyObservers('filters');
      this.notifyObservers('tasks'); // Tasks might need to be refiltered
    } else {
      console.warn(`Attempted to update unsupported filter: ${filter}`);
    }
  },

  /**
   * Update the active tab and notify observers
   * @param {string} tabId The ID of the active tab
   */
  updateActiveTab(tabId) {
    this.state.activeTab = tabId;
    this.notifyObservers('activeTab');
  },

  /**
   * Add a new task
   * @param {Object} task The task to add
   */
  addTask(task) {
    // Generate an ID if the task doesn't have one
    if (!task.id) {
      task.id = Helpers.generateId();
    }
    
    // Set default values if not provided
    task.createdAt = task.createdAt || new Date().toISOString();
    task.status = task.status || 'todo';
    // Ensure assignee is valid or default to Paul
    task.assignee = this.state.assignees.includes(task.assignee) ? task.assignee : 'paul';
    
    // Add the task
    this.state.tasks.push(task);
    
    // Save and notify observers
    this.save();
    this.notifyObservers('tasks');
  },

  /**
   * Update a task
   * @param {Object} updatedTask The updated task
   */
  updateTask(updatedTask) {
    // Find the task
    const index = this.state.tasks.findIndex(task => task.id === updatedTask.id);
    
    if (index !== -1) {
      // Ensure assignee is valid or default to Paul
      if (updatedTask.assignee && !this.state.assignees.includes(updatedTask.assignee)) {
        updatedTask.assignee = 'paul'; 
      }
      
      // Update the task
      this.state.tasks[index] = {
        ...this.state.tasks[index],
        ...updatedTask
      };
      
      // Save and notify observers
      this.save();
      this.notifyObservers('tasks');
    }
  },

  /**
   * Delete a task
   * @param {string} taskId The ID of the task to delete
   */
  deleteTask(taskId) {
    // Filter out the task
    this.state.tasks = this.state.tasks.filter(task => task.id !== taskId);
    
    // Save and notify observers
    this.save();
    this.notifyObservers('tasks');
  },

  /**
   * Add a new note
   * @param {Object} note The note to add
   */
  addNote(note) {
    // Generate an ID if the note doesn't have one
    if (!note.id) {
      note.id = Helpers.generateId();
    }
    
    // Ensure author is valid or default to Paul
    note.author = this.state.assignees.includes(note.author) ? note.author : 'paul';
    
    // Set default values if not provided
    note.createdAt = note.createdAt || new Date().toISOString();
    note.updatedAt = note.updatedAt || note.createdAt;
    
    // Add the note
    this.state.notes.push(note);
    
    // Save and notify observers
    this.save();
    this.notifyObservers('notes');
  },

  /**
   * Update a note
   * @param {Object} updatedNote The updated note
   */
  updateNote(updatedNote) {
    // Find the note
    const index = this.state.notes.findIndex(note => note.id === updatedNote.id);
    
    if (index !== -1) {
      // Ensure author is valid or default to Paul
      if (updatedNote.author && !this.state.assignees.includes(updatedNote.author)) {
        updatedNote.author = 'paul';
      }
      
      // Update the updatedAt timestamp
      updatedNote.updatedAt = new Date().toISOString();
      
      // Update the note
      this.state.notes[index] = {
        ...this.state.notes[index],
        ...updatedNote
      };
      
      // Save and notify observers
      this.save();
      this.notifyObservers('notes');
    }
  },

  /**
   * Delete a note
   * @param {string} noteId The ID of the note to delete
   */
  deleteNote(noteId) {
    // Filter out the note
    this.state.notes = this.state.notes.filter(note => note.id !== noteId);
    
    // Save and notify observers
    this.save();
    this.notifyObservers('notes');
  },

  /**
   * Add a new apartment
   * @param {Object} apartment The apartment to add
   */
  addApartment(apartment) {
    // Generate an ID if the apartment doesn't have one
    if (!apartment.id) {
      apartment.id = Helpers.generateId();
    }
    
    // Set default values if not provided
    apartment.createdAt = apartment.createdAt || new Date().toISOString();
    
    // Initialize favorite and applied status if not set
    if (apartment.metadata) {
      apartment.metadata.isFavorite = apartment.metadata.isFavorite || false;
      apartment.metadata.isApplied = apartment.metadata.isApplied || false;
    }
    
    // Add the apartment
    this.state.apartments.push(apartment);
    
    // Save and notify observers
    this.save();
    this.notifyObservers('apartments');
  },

  /**
   * Update an apartment
   * @param {Object} updatedApartment The updated apartment data
   */
  updateApartment(updatedApartment) {
    // Find the apartment
    const index = this.state.apartments.findIndex(apartment => apartment.id === updatedApartment.id);
    
    if (index !== -1) {
      // Update the apartment
      this.state.apartments[index] = {
        ...this.state.apartments[index],
        ...updatedApartment
      };
      
      // Save and notify observers
      this.save();
      this.notifyObservers('apartments');
    }
  },

  /**
   * Toggle favorite status of an apartment
   * @param {string} apartmentId The ID of the apartment
   */
  toggleApartmentFavorite(apartmentId) {
    const apartment = this.state.apartments.find(apt => apt.id === apartmentId);
    
    if (apartment && apartment.metadata) {
      // Toggle the favorite status
      apartment.metadata.isFavorite = !apartment.metadata.isFavorite;
      
      // Save and notify observers
      this.save();
      this.notifyObservers('apartments');
    }
  },

  /**
   * Toggle applied status of an apartment
   * @param {string} apartmentId The ID of the apartment
   */
  toggleApartmentApplied(apartmentId) {
    const apartment = this.state.apartments.find(apt => apt.id === apartmentId);
    
    if (apartment && apartment.metadata) {
      // Toggle the applied status
      apartment.metadata.isApplied = !apartment.metadata.isApplied;
      
      // Save and notify observers
      this.save();
      this.notifyObservers('apartments');
    }
  },

  /**
   * Delete an apartment
   * @param {string} apartmentId The ID of the apartment to delete
   */
  deleteApartment(apartmentId) {
    // Filter out the apartment
    this.state.apartments = this.state.apartments.filter(apartment => apartment.id !== apartmentId);
    
    // Save and notify observers
    this.save();
    this.notifyObservers('apartments');
  }
};

export default Store; 