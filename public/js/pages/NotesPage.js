/**
 * Notes Page Component
 */

import Store from '../utils/store.js';
import NoteCard from '../components/NoteCard.js';
import Helpers from '../utils/helpers.js';

class NotesPage {
  /**
   * Create a new NotesPage
   * @param {HTMLElement} container The container element
   */
  constructor(container) {
    this.container = container;
    this.notesListEl = null;
    this.addNoteForm = null;
    this.addNoteModal = null;
    this.editNoteModal = null;
    this.fab = null; // Add FAB reference

    // Bind methods
    this.handleAddNote = this.handleAddNote.bind(this);
    this.handleSaveNote = this.handleSaveNote.bind(this);
    this.handleDeleteNote = this.handleDeleteNote.bind(this);
    this.renderNotes = this.renderNotes.bind(this);
    this.setupEventListeners = this.setupEventListeners.bind(this);
  }

  /**
   * Initialize the component
   */
  init() {
    this.render();
    Store.observe('notes', this.renderNotes);
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Add Note Modal Form
    this.addNoteForm = document.getElementById('add-note-form-modal');
    if (this.addNoteForm) {
      this.addNoteForm.addEventListener('submit', this.handleAddNote);
    }

    // Edit Note Modal Form
    const editNoteForm = document.getElementById('edit-note-form');
    if (editNoteForm) {
      // We only need to handle save/delete, form is submitted via buttons
    }
    
    // FAB listener to open the add note modal
    this.fab = this.container.querySelector('#add-note-fab');
    this.addNoteModal = document.getElementById('add-note-modal');
    if (this.fab && this.addNoteModal) {
      this.fab.addEventListener('click', () => {
        // Set default author for new notes (can be changed in modal)
        Store.state.currentNoteAuthor = 'paul'; 
        document.querySelectorAll('.new-note-author-btn').forEach(btn => {
            btn.classList.toggle('btn-active', btn.getAttribute('data-author') === 'paul');
        });
        document.getElementById('new-note-title-modal').value = '';
        document.getElementById('new-note-content-modal').value = '';
        this.addNoteModal.checked = true;
      });
    }

    // Add Note Author Buttons
    const addAuthorButtons = document.querySelectorAll('.new-note-author-btn');
    addAuthorButtons.forEach(button => {
      button.addEventListener('click', () => {
        const author = button.getAttribute('data-author');
        Store.state.currentNoteAuthor = author;
        addAuthorButtons.forEach(btn => btn.classList.remove('btn-active'));
        button.classList.add('btn-active');
      });
    });

    // Edit Note Author Buttons
    const editAuthorButtons = document.querySelectorAll('.edit-note-author-btn');
    editAuthorButtons.forEach(button => {
      button.addEventListener('click', () => {
        editAuthorButtons.forEach(btn => btn.classList.remove('btn-active'));
        button.classList.add('btn-active');
      });
    });

    // Edit Note Modal Buttons
    const saveNoteBtn = document.getElementById('save-note-button');
    if (saveNoteBtn) {
      saveNoteBtn.addEventListener('click', this.handleSaveNote);
    }
    
    const deleteNoteBtn = document.getElementById('delete-note-button');
    if (deleteNoteBtn) {
      deleteNoteBtn.addEventListener('click', this.handleDeleteNote);
    }
  }

  /**
   * Handle add note form submission
   * @param {Event} e The submit event
   */
  handleAddNote(e) {
    e.preventDefault();
    
    const title = document.getElementById('new-note-title-modal').value.trim();
    const content = document.getElementById('new-note-content-modal').value.trim();
    
    if (!title && !content) {
      Helpers.showToast('Please enter a title or content for the note', 'warning');
      return;
    }
    
    const note = {
      title: title || 'Untitled Note', // Default title if empty
      content,
      author: Store.state.currentNoteAuthor || 'paul' // Use stored author, default to paul
    };
    
    Store.addNote(note);
    
    // Close the modal
    if (this.addNoteModal) {
      this.addNoteModal.checked = false;
    }
    
    // Show success toast
    Helpers.showToast('Note added successfully', 'success');
  }

  /**
   * Handle save note button click in edit modal
   */
  handleSaveNote() {
    const currentNote = Store.state.currentNote;
    if (!currentNote) return;
    
    const title = document.getElementById('edit-note-title').value.trim();
    const content = document.getElementById('edit-note-content').value.trim();
    const author = document.querySelector('.edit-note-author-btn.btn-active').getAttribute('data-author') || 'paul';
    
    if (!title && !content) {
      Helpers.showToast('Please enter a title or content for the note', 'warning');
      return;
    }
    
    const updatedNote = {
      ...currentNote,
      title: title || 'Untitled Note',
      content,
      author
    };
    
    Store.updateNote(updatedNote);
    
    // Close modal
    this.editNoteModal = document.getElementById('edit-note-modal');
    if (this.editNoteModal) {
      this.editNoteModal.checked = false;
    }

    Helpers.showToast('Note updated successfully', 'success');
  }

  /**
   * Handle delete note button click in edit modal
   */
  handleDeleteNote() {
    const currentNote = Store.state.currentNote;
    if (!currentNote) return;
    
    if (confirm('Are you sure you want to permanently delete this note?')) {
      Store.deleteNote(currentNote.id);

      // Close modal
      this.editNoteModal = document.getElementById('edit-note-modal');
      if (this.editNoteModal) {
        this.editNoteModal.checked = false;
      }
      
      Helpers.showToast('Note deleted', 'success');
    }
  }

  /**
   * Render notes list
   */
  renderNotes() {
    if (!this.notesListEl) return;
    
    // Clear notes list
    this.notesListEl.innerHTML = '';
    
    const notes = Store.state.notes;
    
    if (notes.length === 0) {
      this.notesListEl.innerHTML = `
        <div class="text-center py-12">
          <div class="mb-4 text-accent text-6xl opacity-50"><i class="ri-file-text-line"></i></div>
          <p class="text-xl font-semibold text-base-content/70">No notes yet!</p>
          <p class="text-base-content/50 mt-1">Use the button below to add your first note.</p>
        </div>
      `;
      return;
    }
    
    // Sort notes by updated date (newest first)
    const sortedNotes = [...notes].sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt);
      const dateB = new Date(b.updatedAt || b.createdAt);
      return dateB - dateA;
    });
    
    // Create and append note cards
    sortedNotes.forEach(note => {
      const noteCard = new NoteCard(note);
      this.notesListEl.appendChild(noteCard.render());
    });
  }

  /**
   * Render the page content
   */
  render() {
    this.container.innerHTML = `
      <div class="p-4 md:p-6 space-y-6 pb-24">
        <h1 class="text-3xl font-bold">Notes</h1>
        
        <div id="notes-list" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <!-- Notes will be rendered here -->
          <div class="text-center py-8 col-span-full">
            <span class="loading loading-spinner loading-lg text-primary"></span>
            <p class="mt-2 text-sm text-base-content/60">Loading notes...</p>
          </div>
        </div>

        <!-- Floating Action Button -->
        <button id="add-note-fab" class="btn btn-primary btn-circle btn-lg fixed bottom-24 right-4 shadow-lg hover:scale-110 transition-transform duration-200 z-50">
          <i class="ri-add-line text-2xl"></i>
        </button>

        <!-- Add Note Modal -->
        <input type="checkbox" id="add-note-modal" class="modal-toggle" />
        <div class="modal modal-bottom sm:modal-middle" role="dialog">
          <div class="modal-box">
            <h3 class="font-bold text-xl mb-5">Add New Note</h3>
            <form id="add-note-form-modal" class="space-y-4">
              <div class="form-control">
                <label class="label"><span class="label-text">Author</span></label>
                <div class="btn-group">
                  <button type="button" class="btn new-note-author-btn btn-active" data-author="paul">Paul</button>
                  <button type="button" class="btn new-note-author-btn" data-author="darya">Darya</button>
                </div>
              </div>
              <div class="form-control">
                <label class="label"><span class="label-text">Title</span></label>
                <input type="text" id="new-note-title-modal" class="input input-bordered" placeholder="Note title (optional)" />
              </div>
              <div class="form-control">
                <label class="label"><span class="label-text">Content</span></label>
                <textarea id="new-note-content-modal" class="textarea textarea-bordered" rows="5" placeholder="Write your note here..."></textarea>
              </div>
              <div class="modal-action mt-6">
                <label for="add-note-modal" class="btn btn-ghost">Cancel</label>
                <button type="submit" class="btn btn-primary">Add Note</button>
              </div>
            </form>
          </div>
          <label class="modal-backdrop" for="add-note-modal">Close</label>
        </div>

        <!-- Edit Note Modal -->
        <input type="checkbox" id="edit-note-modal" class="modal-toggle" />
        <div class="modal modal-bottom sm:modal-middle" role="dialog">
          <div class="modal-box">
            <h3 class="font-bold text-xl mb-5">Edit Note</h3>
            <form id="edit-note-form" class="space-y-4">
               <div class="form-control">
                <label class="label"><span class="label-text">Author</span></label>
                <div class="btn-group">
                  <button type="button" class="btn edit-note-author-btn" data-author="paul">Paul</button>
                  <button type="button" class="btn edit-note-author-btn" data-author="darya">Darya</button>
                </div>
              </div>
              <div class="form-control">
                <label class="label"><span class="label-text">Title</span></label>
                <input type="text" id="edit-note-title" class="input input-bordered" />
              </div>
              <div class="form-control">
                <label class="label"><span class="label-text">Content</span></label>
                <textarea id="edit-note-content" class="textarea textarea-bordered" rows="5"></textarea>
              </div>
            </form>
            <div class="modal-action mt-6">
              <button id="delete-note-button" class="btn btn-error btn-outline">
                 <i class="ri-delete-bin-line"></i> Delete
              </button>
              <div class="flex-1"></div>
              <label for="edit-note-modal" class="btn btn-ghost">Cancel</label>
              <button id="save-note-button" class="btn btn-accent">Save Changes</button>
            </div>
          </div>
          <label class="modal-backdrop" for="edit-note-modal">Close</label>
        </div>
      </div>
    `;
    
    // Store reference to the notes list element
    this.notesListEl = this.container.querySelector('#notes-list');
    
    // Set up event listeners after rendering
    this.setupEventListeners();
  }
}

export default NotesPage; 