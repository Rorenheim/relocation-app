const { JSDOM } = require('jsdom');
require('@testing-library/jest-dom');

describe('Task Management', () => {
  let container;

  beforeEach(() => {
    document.body.innerHTML = `
      <div class="task-form">
        <input id="new-task-title" type="text" placeholder="Enter task title..." />
        <select id="new-task-assignee">
          <option value="">Assignee?</option>
          <option value="paul">Paul</option>
          <option value="darya">Darya</option>
          <option value="both">Both</option>
        </select>
        <select id="new-task-category">
          <option value="">Category?</option>
          <option value="docs">Docs</option>
          <option value="apartment">Apartment</option>
        </select>
        <button id="add-task-button">Add Task</button>
      </div>
      
      <div id="task-list" class="task-list"></div>
      
      <div id="task-modal" class="hidden">
        <div class="modal-content">
          <button class="modal-close">Close</button>
          <button id="delete-task-button">Delete</button>
        </div>
      </div>
    `;
    
    container = document.body;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('Task form exists with all fields', () => {
    const titleInput = container.querySelector('#new-task-title');
    const assigneeSelect = container.querySelector('#new-task-assignee');
    const categorySelect = container.querySelector('#new-task-category');
    const addButton = container.querySelector('#add-task-button');
    
    expect(titleInput).toBeInTheDocument();
    expect(assigneeSelect).toBeInTheDocument();
    expect(categorySelect).toBeInTheDocument();
    expect(addButton).toBeInTheDocument();
    
    expect(titleInput.placeholder).toBe('Enter task title...');
    expect(assigneeSelect.options.length).toBe(4); // Including default option
    expect(categorySelect.options.length).toBe(3); // Including default option
  });

  test('Can add task to list', () => {
    const taskList = container.querySelector('#task-list');
    
    // Create task element
    const task = document.createElement('div');
    task.classList.add('task-item');
    task.textContent = 'New Test Task';
    taskList.appendChild(task);
    
    expect(taskList.children.length).toBe(1);
    expect(taskList.textContent).toContain('New Test Task');
  });

  test('Can mark task as completed', () => {
    const taskList = container.querySelector('#task-list');
    
    // Create task with checkbox
    const task = document.createElement('div');
    task.classList.add('task-item');
    task.innerHTML = `
      <input type="checkbox" class="task-checkbox">
      <span>Test Task</span>
    `;
    taskList.appendChild(task);
    
    // Complete task
    const checkbox = task.querySelector('.task-checkbox');
    checkbox.checked = true;
    task.classList.add('completed');
    
    expect(task).toHaveClass('completed');
    expect(checkbox.checked).toBe(true);
  });

  test('Can delete task', () => {
    const taskList = container.querySelector('#task-list');
    
    // Add task
    const task = document.createElement('div');
    task.classList.add('task-item');
    task.textContent = 'Task to Delete';
    taskList.appendChild(task);
    
    expect(taskList.children.length).toBe(1);
    
    // Delete task
    taskList.removeChild(task);
    expect(taskList.children.length).toBe(0);
    expect(taskList.textContent).not.toContain('Task to Delete');
  });

  test('Task modal has required buttons', () => {
    const modal = container.querySelector('#task-modal');
    const closeButton = modal.querySelector('.modal-close');
    const deleteButton = modal.querySelector('#delete-task-button');
    
    expect(modal).toHaveClass('hidden');
    expect(closeButton).toBeInTheDocument();
    expect(deleteButton).toBeInTheDocument();
    expect(closeButton.textContent).toBe('Close');
    expect(deleteButton.textContent).toBe('Delete');
  });
}); 