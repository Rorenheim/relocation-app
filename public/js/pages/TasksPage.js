/**
 * Tasks Page Component
 */

import Store from '../utils/store.js';
import TaskItem from '../components/TaskItem.js';
import Helpers from '../utils/helpers.js';

class TasksPage {
  /**
   * Create a new TasksPage
   * @param {HTMLElement} container The container element
   */
  constructor(container) {
    this.container = container;
    this.taskListEl = null;
    this.filterStatusEl = null;
    this.newTaskForm = null;
    this.addTaskModal = null;
    this.addTaskFormInModal = null;
    this.fab = null;

    // Bind methods
    this.handleAddTask = this.handleAddTask.bind(this);
    this.renderTasks = this.renderTasks.bind(this);
    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.handleSaveTask = this.handleSaveTask.bind(this);
    this.handleDeleteTask = this.handleDeleteTask.bind(this);
    this.setupEventListeners = this.setupEventListeners.bind(this);
  }

  /**
   * Initialize the component
   */
  init() {
    this.render();
    Store.observe('tasks', this.renderTasks);
    Store.observe('filters', this.renderTasks); // Re-render tasks on filter change
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Add task form - Now in a modal
    this.addTaskFormInModal = document.getElementById('add-task-form-modal');
    if (this.addTaskFormInModal) {
      this.addTaskFormInModal.addEventListener('submit', this.handleAddTask);
    }
    
    // FAB listener to open the add task modal
    this.fab = this.container.querySelector('#add-task-fab');
    this.addTaskModal = document.getElementById('add-task-modal');
    if (this.fab && this.addTaskModal) {
      this.fab.addEventListener('click', () => {
        this.addTaskModal.checked = true;
      });
    }

    // Filter buttons - Status only
    const filterStatusButtons = this.container.querySelectorAll('#filter-status-group button');
    filterStatusButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Update active class
        filterStatusButtons.forEach(btn => btn.classList.remove('btn-active'));
        button.classList.add('btn-active');
        
        // Update filter
        this.handleFilterChange('status', button.getAttribute('data-value'));
      });
    });
    
    // Task edit modal
    const saveTaskBtn = document.getElementById('save-task-button');
    if (saveTaskBtn) {
      saveTaskBtn.addEventListener('click', this.handleSaveTask);
    }
    
    const deleteTaskBtn = document.getElementById('delete-task-button');
    if (deleteTaskBtn) {
        deleteTaskBtn.addEventListener('click', this.handleDeleteTask);
    }
  }

  /**
   * Handle filter changes
   * @param {string} filter The filter name (only 'status' now)
   * @param {string} value The filter value
   */
  handleFilterChange(filter, value) {
    Store.updateFilter(filter, value);
  }

  /**
   * Handle add task form submission
   * @param {Event} e The submit event
   */
  handleAddTask(e) {
    e.preventDefault();
    
    // Get values from the modal form
    const titleInput = document.getElementById('new-task-title-modal');
    const assigneeInput = document.getElementById('new-task-assignee-modal');
    const categoryInput = document.getElementById('new-task-category-modal');
    const dateInput = document.getElementById('new-task-date-modal');

    const title = titleInput.value.trim();
    if (!title) {
      Helpers.showToast('Please enter a task title', 'error');
      return;
    }
    
    const task = {
      title,
      assignee: assigneeInput.value,
      category: categoryInput.value,
      date: dateInput.value,
      status: 'todo',
      createdAt: new Date().toISOString()
    };
    
    Store.addTask(task);
    
    // Reset modal form
    titleInput.value = '';
    assigneeInput.value = '';
    categoryInput.value = '';
    dateInput.value = '';
    
    // Close the modal
    if (this.addTaskModal) {
      this.addTaskModal.checked = false;
    }

    // Show success toast
    Helpers.showToast('Task added successfully', 'success');
  }

  /**
   * Handle save task button click
   */
  handleSaveTask() {
    const currentTask = Store.state.currentTask;
    if (!currentTask) return;
    
    const title = document.getElementById('edit-task-title').value.trim();
    if (!title) {
      Helpers.showToast('Please enter a task title', 'error');
      return;
    }
    
    const updatedTask = {
      ...currentTask,
      title,
      description: document.getElementById('edit-task-description').value.trim(),
      assignee: document.getElementById('edit-task-assignee').value,
      category: document.getElementById('edit-task-category').value,
      date: document.getElementById('edit-task-date').value,
      status: document.querySelector('input[name="edit-task-status"]:checked')?.value || 'todo'
    };
    
    Store.updateTask(updatedTask);
    
    // Close modal
    const modal = document.getElementById('edit-task-modal');
    if (modal) {
      modal.checked = false;
    }
    
    // Show success toast
    Helpers.showToast('Task updated successfully', 'success');
  }

  /**
   * Handle delete task button click
   */
  handleDeleteTask() {
    const currentTask = Store.state.currentTask;
    if (!currentTask) return;
    
    if (confirm('Are you sure you want to permanently delete this task?')) {
        Store.deleteTask(currentTask.id);
        
        // Close modal
        const modal = document.getElementById('edit-task-modal');
        if (modal) {
          modal.checked = false;
        }

        Helpers.showToast('Task deleted', 'success');
    }
  }

  /**
   * Render tasks list
   */
  renderTasks() {
    if (!this.taskListEl) return;
    
    // Get filtered tasks (Store.getFilteredTasks will handle status filtering)
    const filteredTasks = Store.getFilteredTasks();
    
    // Clear task list
    this.taskListEl.innerHTML = '';
    
    if (filteredTasks.length === 0) {
      this.taskListEl.innerHTML = `
        <div class="text-center py-12">
          <div class="mb-4 text-primary text-6xl opacity-50"><i class="ri-check-double-line"></i></div>
          <p class="text-xl font-semibold text-base-content/70">No tasks match the filter!</p>
          <p class="text-base-content/50 mt-1">Adjust your filter or add new tasks.</p>
        </div>
      `;
      return;
    }
    
    // Sort tasks: by date (if present), then by createdAt
    const sortedTasks = [...filteredTasks].sort((a, b) => {
      // Sort by date (newest date first if available)
      if (a.date && b.date) {
        return new Date(b.date) - new Date(a.date); // Sort descending by date
      } else if (a.date) {
        return -1; // Tasks with dates come before those without
      } else if (b.date) {
        return 1; // Tasks without dates come after those with
      }
      
      // Finally by createdAt (newest first)
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    
    // Create and append task items
    sortedTasks.forEach(task => {
      const taskItem = new TaskItem(task);
      this.taskListEl.appendChild(taskItem.render());
    });
  }

  /**
   * Render the page
   */
  render() {
    // Populate category options dynamically (still needed for modals)
    const categoryOptions = Object.entries(Store.state.categories)
      .map(([value, label]) => `<option value="${value}">${label}</option>`)
      .join('');
      
    // Populate assignee options dynamically (still needed for modals)
    const assigneeOptions = Store.state.assignees
      .map(value => `<option value="${value}">${value.charAt(0).toUpperCase() + value.slice(1)}</option>`)
      .join('');
      
    this.container.innerHTML = `
      <div class="p-4 md:p-6 space-y-6 pb-24">
        <h1 class="text-3xl font-bold">Tasks</h1>
        
        <div class="card bg-base-100 shadow-lg">
          <div class="card-body">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <h2 class="card-title text-xl">
                <i class="ri-list-check text-primary"></i>
                Task List
              </h2>
              
              <!-- Filter Section - Status Only -->
              <div class="w-full md:w-auto flex flex-wrap items-center gap-2">
                
                <!-- Status Filter -->
                <div class="btn-group" id="filter-status-group">
                  <button data-value="all" class="btn btn-sm btn-ghost btn-active">All</button>
                  <button data-value="todo" class="btn btn-sm btn-ghost">To Do</button>
                  <button data-value="completed" class="btn btn-sm btn-ghost">Done</button>
                </div>

                <!-- Assignee Filter Removed -->

                <!-- Category Filter Removed -->
               
              </div>
            </div>
            
            <div id="task-list" class="space-y-4 pb-24">
              <!-- Task items will be rendered here -->
              <div class="text-center py-8">
                <span class="loading loading-spinner loading-lg text-primary"></span>
                <p class="mt-2 text-sm text-base-content/60">Loading tasks...</p>
              </div>
            </div>

            <!-- Add Task Form REMOVED -->
            
          </div>
        </div>
        
        <!-- Floating Action Button -->
        <button id="add-task-fab" class="btn btn-primary btn-circle btn-lg fixed bottom-24 right-4 shadow-lg hover:scale-110 transition-transform duration-200 z-50">
          <i class="ri-add-line text-2xl"></i>
        </button>

        <!-- Add Task Modal -->
        <input type="checkbox" id="add-task-modal" class="modal-toggle" />
        <div class="modal modal-bottom sm:modal-middle" role="dialog">
          <div class="modal-box">
            <h3 class="font-bold text-xl mb-5">Add New Task</h3>
            <form id="add-task-form-modal" class="space-y-4">
               <div class="form-control">
                <label class="label"><span class="label-text">Title</span></label>
                <input type="text" id="new-task-title-modal" class="input input-bordered" placeholder="What needs doing?" required />
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div class="form-control">
                  <label class="label"><span class="label-text">Assignee</span></label>
                  <select id="new-task-assignee-modal" class="select select-bordered w-full">
                    <option value="">Optional</option>
                    ${assigneeOptions}
                  </select>
                </div>
                
                <div class="form-control">
                  <label class="label"><span class="label-text">Category</span></label>
                  <select id="new-task-category-modal" class="select select-bordered w-full">
                    <option value="">Optional</option>
                    ${categoryOptions}
                  </select>
                </div>
              </div>
              
              <div class="form-control">
                <label class="label"><span class="label-text">Due Date</span></label>
                <input type="date" id="new-task-date-modal" class="input input-bordered" />
              </div>
              
              <div class="modal-action mt-6">
                <label for="add-task-modal" class="btn btn-ghost">Cancel</label>
                <button type="submit" class="btn btn-primary">Add Task</button>
              </div>
            </form>
          </div>
          <label class="modal-backdrop" for="add-task-modal">Close</label>
        </div>

        <!-- Task Edit Modal (existing) -->
        <input type="checkbox" id="edit-task-modal" class="modal-toggle" />
        <div class="modal modal-bottom sm:modal-middle" role="dialog">
          <div class="modal-box">
            <h3 class="font-bold text-xl mb-5">Edit Task</h3>
            <form id="edit-task-form" class="space-y-4">
              <div class="form-control">
                <label class="label"><span class="label-text">Title</span></label>
                <input type="text" id="edit-task-title" class="input input-bordered" required />
              </div>
              
              <div class="form-control">
                <label class="label"><span class="label-text">Description</span></label>
                <textarea id="edit-task-description" class="textarea textarea-bordered" rows="3"></textarea>
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div class="form-control">
                  <label class="label"><span class="label-text">Assignee</span></label>
                  <select id="edit-task-assignee" class="select select-bordered w-full">
                    <option value="">None</option>
                    ${assigneeOptions}
                  </select>
                </div>
                
                <div class="form-control">
                  <label class="label"><span class="label-text">Category</span></label>
                  <select id="edit-task-category" class="select select-bordered w-full">
                    <option value="">None</option>
                    ${categoryOptions}
                  </select>
                </div>
              </div>
              
              <div class="form-control">
                <label class="label"><span class="label-text">Due Date</span></label>
                <input type="date" id="edit-task-date" class="input input-bordered" />
              </div>
              
              <div class="form-control">
                <label class="label"><span class="label-text">Status</span></label>
                <div class="flex gap-4">
                  <label class="label cursor-pointer justify-start gap-2">
                    <input type="radio" name="edit-task-status" value="todo" class="radio radio-primary" />
                    <span class="label-text">To Do</span>
                  </label>
                  <label class="label cursor-pointer justify-start gap-2">
                    <input type="radio" name="edit-task-status" value="completed" class="radio radio-primary" />
                    <span class="label-text">Completed</span>
                  </label>
                </div>
              </div>
            </form>
            
            <div class="modal-action mt-6">
              <button id="delete-task-button" class="btn btn-error btn-outline">
                <i class="ri-delete-bin-line"></i> Delete
              </button>
              <div class="flex-1"></div>
              <label for="edit-task-modal" class="btn btn-ghost">Cancel</label>
              <button id="save-task-button" class="btn btn-primary">Save Changes</button>
            </div>
          </div>
          <label class="modal-backdrop" for="edit-task-modal">Close</label>
        </div>
      </div>
    `;
    
    // Store references to elements
    this.taskListEl = this.container.querySelector('#task-list');
    
    // Re-attach event listeners after re-rendering the page structure
    this.setupEventListeners();
  }
}

export default TasksPage; 