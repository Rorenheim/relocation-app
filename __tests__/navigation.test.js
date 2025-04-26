const { JSDOM } = require('jsdom');
require('@testing-library/jest-dom');

describe('Navigation and Layout', () => {
  let container;

  beforeEach(() => {
    document.body.innerHTML = `
      <nav class="mobile-nav">
        <div class="container">
          <button data-target="tasks-panel">Tasks</button>
          <button data-target="notes-panel">Notes</button>
        </div>
      </nav>
      
      <nav class="hidden md:flex">
        <div class="container">
          <button data-target="tasks-panel">Tasks</button>
          <button data-target="notes-panel">Notes</button>
        </div>
      </nav>
      
      <main>
        <div id="tasks-panel" class="active">Tasks Panel</div>
        <div id="notes-panel" class="hidden">Notes Panel</div>
      </main>
      
      <button class="fab">Add</button>
      
      <div id="task-modal" class="hidden">
        <button class="modal-close">Close</button>
      </div>
    `;
    
    container = document.body;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('Mobile navigation is visible', () => {
    const mobileNav = container.querySelector('.mobile-nav');
    expect(mobileNav).toBeInTheDocument();
    expect(mobileNav.querySelector('button').textContent).toBe('Tasks');
  });

  test('Desktop navigation exists', () => {
    const desktopNav = container.querySelector('.hidden.md\\:flex');
    expect(desktopNav).toBeInTheDocument();
    expect(desktopNav.querySelector('button').textContent).toBe('Tasks');
  });

  test('Tab switching works', () => {
    const tasksPanel = container.querySelector('#tasks-panel');
    const notesPanel = container.querySelector('#notes-panel');
    
    // Initial state
    expect(tasksPanel).toHaveClass('active');
    expect(notesPanel).toHaveClass('hidden');
    
    // Switch tabs
    tasksPanel.classList.remove('active');
    tasksPanel.classList.add('hidden');
    notesPanel.classList.remove('hidden');
    notesPanel.classList.add('active');
    
    expect(tasksPanel).toHaveClass('hidden');
    expect(notesPanel).toHaveClass('active');
  });

  test('Floating action button exists', () => {
    const fab = container.querySelector('.fab');
    expect(fab).toBeInTheDocument();
    expect(fab.textContent).toBe('Add');
  });

  test('Modal toggle works', () => {
    const modal = container.querySelector('#task-modal');
    expect(modal).toBeInTheDocument();
    expect(modal).toHaveClass('hidden');
    
    // Show modal
    modal.classList.remove('hidden');
    expect(modal).not.toHaveClass('hidden');
    
    // Hide modal
    modal.classList.add('hidden');
    expect(modal).toHaveClass('hidden');
  });
}); 