/**
 * Note Card Component
 */

import Helpers from '../utils/helpers.js';
import Store from '../utils/store.js';

class NoteCard {
  /**
   * Create a new NoteCard
   * @param {Object} note The note data
   */
  constructor(note) {
    this.note = note;
    this.element = null;
  }

  /**
   * Delete this note
   * @param {Event} e The click event
   */
  deleteNote(e) {
    e.stopPropagation();
    
    if (confirm('Are you sure you want to delete this note?')) {
      Store.deleteNote(this.note.id);
    }
  }

  /**
   * Open the edit note modal
   */
  openEditModal() {
    // Get the modal
    const modal = document.getElementById('edit-note-modal');
    if (modal) {
      // Set the current note
      Store.state.currentNote = this.note;
      
      // Populate form fields
      document.getElementById('edit-note-title').value = this.note.title || '';
      document.getElementById('edit-note-content').value = this.note.content || '';
      
      // Set note author (only Paul or Darya)
      const authorButtons = document.querySelectorAll('.edit-note-author-btn');
      authorButtons.forEach(btn => {
        btn.classList.remove('btn-active');
        if (btn.getAttribute('data-author') === this.note.author) {
          btn.classList.add('btn-active');
        }
      });
      
      // Show the modal
      modal.checked = true;
    }
  }

  /**
   * Format the content with line breaks
   * @param {string} content The content to format
   * @returns {string} Formatted HTML content
   */
  formatContent(content) {
    if (!content) return '';
    
    // Escape HTML and replace line breaks with <br> tags
    return Helpers.escapeHtml(content)
      .replace(/\n/g, '<br>')
      .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
      .replace(/_(.*?)_/g, '<em>$1</em>');
  }

  /**
   * Render the note card
   * @returns {HTMLElement} The rendered note card
   */
  render() {
    // Create the note card element
    this.element = document.createElement('div');
    
    // Set classes based on the author with solid background colors
    const authorColors = {
      paul: 'bg-blue-100 border-blue-300',
      darya: 'bg-pink-100 border-pink-300'
    };
    
    // Ensure author is one of our valid values (paul or darya)
    const author = this.note.author && ['paul', 'darya'].includes(this.note.author) 
      ? this.note.author 
      : 'paul'; // Default to 'paul' if author is invalid or missing
    
    const cardColor = authorColors[author];
    
    // Add animation class based on author (only paul or darya)
    const animationClass = `pulse-${author} animate-pulse-subtle`;
    
    // Set attributes and classes
    this.element.className = `card border-2 ${cardColor} ${animationClass} cursor-pointer transition-all shadow hover:shadow-md animate-fade-in`;
    this.element.setAttribute('data-note-id', this.note.id);
    this.element.setAttribute('data-author', author);
    
    // Add event listener for edit modal
    this.element.addEventListener('click', () => this.openEditModal());
    
    // Format date
    const formattedDate = new Date(this.note.updatedAt || this.note.createdAt).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    
    // Set the inner HTML
    this.element.innerHTML = `
      <div class="card-body">
        <div class="flex justify-between items-start">
          <h3 class="card-title text-lg">${Helpers.escapeHtml(this.note.title)}</h3>
          <button class="btn btn-ghost btn-sm delete-note-btn">
            <i class="ri-delete-bin-line text-error"></i>
          </button>
        </div>
        
        <div class="my-2 note-content">
          ${this.formatContent(this.note.content)}
        </div>
        
        <div class="flex justify-between items-center mt-2 pt-2 border-t border-base-300">
          <div class="flex items-center gap-2">
            ${Helpers.getAssigneeAvatar(author)} 
            <span class="text-sm opacity-70">
              ${author === 'paul' ? 'Paul' : 'Darya'} 
            </span>
          </div>
          <div class="text-sm opacity-50">${formattedDate}</div>
        </div>
      </div>
    `;
    
    // Add event listeners
    const deleteBtn = this.element.querySelector('.delete-note-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', (e) => this.deleteNote(e));
    }
    
    return this.element;
  }
}

export default NoteCard; 