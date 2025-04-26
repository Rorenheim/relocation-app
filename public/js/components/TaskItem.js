/**
 * Task Item Component
 */

import Helpers from '../utils/helpers.js';
import Store from '../utils/store.js';

class TaskItem {
  /**
   * Create a new TaskItem
   * @param {Object} task The task data
   */
  constructor(task) {
    this.task = task;
    this.element = null;
  }

  /**
   * Toggle task completion
   * @param {Event} e The click event
   */
  toggleCompleted(e) {
    // No need to stop propagation since card click doesn't open modal anymore
    
    // Toggle completion
    const newStatus = this.task.status === 'completed' ? 'todo' : 'completed';
    Store.updateTask({
      ...this.task,
      status: newStatus
    });
  }

  /**
   * Delete this task
   * @param {Event} e The click event
   */
  deleteTask(e) {
    // Prevent event bubbling
    e.stopPropagation();

    // Ask for confirmation
    if (confirm('Are you sure you want to delete this task?')) {
      Store.deleteTask(this.task.id);
    }
  }

  /**
   * Open the edit task modal
   * @param {Event} e The click event (optional)
   */
  openEditModal(e) {
    // Stop propagation if event is provided
    if (e) {
      e.stopPropagation();
    }
    
    // Set the current task in the store
    Store.state.currentTask = this.task;
    
    // Get the modal
    const modal = document.getElementById('edit-task-modal');
    if (modal) {
      // Populate form fields
      document.getElementById('edit-task-title').value = this.task.title || '';
      document.getElementById('edit-task-description').value = this.task.description || '';
      document.getElementById('edit-task-assignee').value = this.task.assignee || '';
      document.getElementById('edit-task-category').value = this.task.category || '';
      document.getElementById('edit-task-date').value = this.task.date || '';
      
      // Set status radio button
      const statusRadio = document.querySelector(`input[name="edit-task-status"][value="${this.task.status}"]`);
      if (statusRadio) {
        statusRadio.checked = true;
      }
      
      // Show the modal
      modal.checked = true;
    }
  }

  /**
   * Render the task item
   * @returns {HTMLElement} The rendered task item
   */
  render() {
    // Create the task item element
    this.element = document.createElement('div');
    
    // Ensure we have a valid category for styling
    const validCategories = ['docs', 'apartment', 'services', 'moving', 'finances', 'paperwork', 'other'];
    const category = this.task.category && validCategories.includes(this.task.category) 
      ? this.task.category 
      : 'other';
    
    // Use direct color mapping with explicit class names
    const categoryColorMap = {
      'docs': 'bg-green-100 border-green-300',
      'apartment': 'bg-yellow-100 border-yellow-300',
      'services': 'bg-purple-100 border-purple-300',
      'moving': 'bg-blue-100 border-blue-300',
      'finances': 'bg-red-100 border-red-300',
      'paperwork': 'bg-indigo-100 border-indigo-300',
      'other': 'bg-gray-100 border-gray-300'
    };
    
    const categoryColor = categoryColorMap[category];
    
    // Add animation class based on task status and category
    let animationClass = '';
    if (this.task.status === 'todo') {
      // Only apply the pulse animation to todo items
      animationClass = `pulse-${category} animate-pulse-subtle`;
    }
    
    // Add fallback border and background classes in case category doesn't exist
    const statusClass = this.task.status === 'completed' ? 'opacity-70' : 'hover:scale-[1.01]';
    
    // Use direct card styling without relying on background opacity that might be overridden
    this.element.className = `card card-compact ${categoryColor} ${animationClass} border-2 shadow hover:shadow-md transition-all duration-200 cursor-default ${statusClass} animate-fade-in`;
    
    // Set attributes and classes
    this.element.setAttribute('data-task-id', this.task.id);
    this.element.setAttribute('data-status', this.task.status);
    this.element.setAttribute('data-assignee', this.task.assignee || '');
    this.element.setAttribute('data-category', category);
    
    // No longer adding click event to the entire card
    
    // Get category color from Helpers or directly use DaisyUI badge classes
    const categoryBadgeHtml = category ? Helpers.getCategoryBadge(category) : '';
    
    // Set the inner HTML using DaisyUI classes
    this.element.innerHTML = `
      <div class="card-body py-3 px-4 gap-2.5">
        <div class="flex items-start gap-3.5">
          <div class="flex-shrink-0 mt-1">
            <input type="checkbox" class="checkbox checkbox-primary checkbox-sm" 
                  ${this.task.status === 'completed' ? 'checked' : ''}>
          </div>
          <div class="flex-1 min-w-0"> 
            <div class="flex justify-between items-center gap-3">
              <h3 class="text-base font-medium line-clamp-2 ${this.task.status === 'completed' ? 'line-through text-base-content/60' : 'text-base-content'}">${Helpers.escapeHtml(this.task.title)}</h3>
              <div class="flex-none flex items-center space-x-0.5 ml-1">
                <button class="btn btn-ghost btn-xs btn-square edit-task-btn hover:bg-base-300" data-tip="Edit Task">
                  <i class="ri-edit-line text-lg"></i>
                </button>
                <button class="btn btn-ghost btn-xs btn-square delete-task-btn hover:bg-error hover:text-error-content" data-tip="Delete Task">
                  <i class="ri-delete-bin-line text-lg"></i>
                </button>
              </div>
            </div>
            
            <div class="mt-2 flex flex-wrap items-center gap-2">
              ${this.task.assignee ? Helpers.getAssigneeAvatar(this.task.assignee) : ''}
              ${categoryBadgeHtml} 
              ${this.task.date ? `<span class="badge badge-sm badge-outline">${Helpers.formatRelativeDate(this.task.date)}</span>` : ''}
            </div>
            
            ${this.task.description ? `
              <p class="mt-2.5 text-sm text-base-content/80 break-words line-clamp-3">
                ${Helpers.escapeHtml(this.task.description)}
              </p>
            ` : ''}
          </div>
        </div>
      </div>
    `;
    
    // Add event listeners
    const checkbox = this.element.querySelector('input[type="checkbox"]');
    if (checkbox) {
      checkbox.addEventListener('change', (e) => this.toggleCompleted(e));
    }
    
    const deleteBtn = this.element.querySelector('.delete-task-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', (e) => this.deleteTask(e));
    }
    
    const editBtn = this.element.querySelector('.edit-task-btn');
    if (editBtn) {
      editBtn.addEventListener('click', (e) => this.openEditModal(e));
    }
    
    return this.element;
  }
}

export default TaskItem; 