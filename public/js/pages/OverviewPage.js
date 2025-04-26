/**
 * Overview Page Component
 */

import Store from '../utils/store.js';
import Helpers from '../utils/helpers.js';

class OverviewPage {
  /**
   * Create a new OverviewPage
   * @param {HTMLElement} container The container element
   */
  constructor(container) {
    this.container = container;
    this.progressBarEl = null;
    this.progressTextEl = null;
    this.assigneeChartEl = null;
    this.quoteEl = null;
    
    // Bind methods
    this.renderOverview = this.renderOverview.bind(this);
    this.renderAssigneeChart = this.renderAssigneeChart.bind(this);
    this.renderQuote = this.renderQuote.bind(this);
  }

  /**
   * Initialize the page
   */
  init() {
    this.render();
    
    // Observe tasks
    Store.observe('tasks', this.renderOverview);
    
    // Set up random quote refreshing
    this.refreshQuote();
    setInterval(() => this.refreshQuote(), 60000); // Refresh quote every minute
  }

  /**
   * Refresh the motivational quote
   */
  refreshQuote() {
    if (this.quoteEl) {
      this.renderQuote();
    }
  }

  /**
   * Render the overview components
   */
  renderOverview() {
    this.renderProgress();
    this.renderAssigneeChart();
    this.renderSummary();
  }

  /**
   * Render the progress bar
   */
  renderProgress() {
    if (!this.progressBarEl || !this.progressTextEl) return;
    
    const progress = Store.getProgress();
    
    // Update progress bar
    this.progressBarEl.style.width = `${progress}%`;
    
    // Update progress text
    this.progressTextEl.textContent = `${progress}%`;
  }

  /**
   * Render the assignee chart
   */
  renderAssigneeChart() {
    if (!this.assigneeChartEl) return;
    
    // Clear chart
    this.assigneeChartEl.innerHTML = '';
    
    // Count tasks by assignee and status
    const counts = {
      paul: { todo: 0, completed: 0 },
      darya: { todo: 0, completed: 0 },
      both: { todo: 0, completed: 0 }
    };
    
    Store.state.tasks.forEach(task => {
      const assignee = task.assignee || 'unassigned';
      if (assignee === 'unassigned') return; // Skip unassigned tasks in the chart
      
      const status = task.status || 'todo';
      
      if (counts[assignee]) {
        counts[assignee][status]++;
      }
    });
    
    // Calculate totals
    const totals = {
      paul: counts.paul.todo + counts.paul.completed,
      darya: counts.darya.todo + counts.darya.completed,
      both: counts.both.todo + counts.both.completed
    };
    
    // Create chart
    const chartEl = document.createElement('div');
    chartEl.className = 'space-y-5';
    
    // Only include assignees with tasks
    ['paul', 'darya', 'both'].filter(assignee => totals[assignee] > 0).forEach(assignee => {
      const totalTasks = totals[assignee];
      const completedTasks = counts[assignee].completed;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      
      const assigneeNames = {
        paul: 'Paul',
        darya: 'Darya',
        both: 'Both'
      };
      
      chartEl.innerHTML += `
        <div class="rounded-lg bg-base-100 p-4">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <div class="avatar">
                ${Helpers.getAssigneeAvatar(assignee)}
              </div>
              <div class="text-sm font-medium">${assigneeNames[assignee]}</div>
            </div>
            <div class="text-2xl font-bold">${progress}%</div>
          </div>
          <div class="text-xs text-gray-500 mb-2">${completedTasks} completed, ${counts[assignee].todo} remaining</div>
          <div class="w-full bg-gray-200 rounded-full h-2.5">
            <div class="bg-primary h-2.5 rounded-full" style="width: ${progress}%"></div>
          </div>
        </div>
      `;
    });
    
    this.assigneeChartEl.appendChild(chartEl);
  }

  /**
   * Render summary statistics
   */
  renderSummary() {
    const summaryEl = this.container.querySelector('#summary-stats');
    if (!summaryEl) return;
    
    // Count tasks and notes
    const totalTasks = Store.state.tasks.length;
    const completedTasks = Store.state.tasks.filter(task => task.status === 'completed').length;
    const totalNotes = Store.state.notes.length;
    const totalApartments = Store.state.apartments.length;
    
    // Count upcoming tasks
    const now = new Date();
    const upcomingTasks = Store.state.tasks.filter(task => {
      if (!task.date || task.status === 'completed') return false;
      
      const date = new Date(task.date);
      return date >= now && date <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // Next 7 days
    }).length;
    
    summaryEl.innerHTML = `
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="card bg-base-100 shadow-sm hover:shadow-md transition-all p-4">
          <div class="flex flex-col">
            <div class="flex justify-between items-center mb-2">
              <div class="text-sm font-medium text-gray-500">Tasks</div>
              <div class="text-primary"><i class="ri-list-check-2 text-xl"></i></div>
            </div>
            <div class="text-3xl font-bold">${totalTasks}</div>
            <div class="text-xs text-gray-500 mt-1">${completedTasks} completed</div>
          </div>
        </div>
        
        <div class="card bg-base-100 shadow-sm hover:shadow-md transition-all p-4">
          <div class="flex flex-col">
            <div class="flex justify-between items-center mb-2">
              <div class="text-sm font-medium text-gray-500">Upcoming</div>
              <div class="text-secondary"><i class="ri-calendar-event-line text-xl"></i></div>
            </div>
            <div class="text-3xl font-bold">${upcomingTasks}</div>
            <div class="text-xs text-gray-500 mt-1">In the next 7 days</div>
          </div>
        </div>
        
        <div class="card bg-base-100 shadow-sm hover:shadow-md transition-all p-4">
          <div class="flex flex-col">
            <div class="flex justify-between items-center mb-2">
              <div class="text-sm font-medium text-gray-500">Notes</div>
              <div class="text-accent"><i class="ri-sticky-note-line text-xl"></i></div>
            </div>
            <div class="text-3xl font-bold">${totalNotes}</div>
            <div class="text-xs text-gray-500 mt-1">Important information</div>
          </div>
        </div>
        
        <div class="card bg-base-100 shadow-sm hover:shadow-md transition-all p-4">
          <div class="flex flex-col">
            <div class="flex justify-between items-center mb-2">
              <div class="text-sm font-medium text-gray-500">Apartments</div>
              <div class="text-info"><i class="ri-home-heart-line text-xl"></i></div>
            </div>
            <div class="text-3xl font-bold">${totalApartments}</div>
            <div class="text-xs text-gray-500 mt-1">Saved listings</div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render a random motivational quote
   */
  renderQuote() {
    if (!this.quoteEl) return;
    
    const quote = Helpers.getRandomQuote();
    
    this.quoteEl.innerHTML = `
      <div class="flex flex-col items-center text-center p-6">
        <i class="ri-double-quotes-l text-4xl text-primary opacity-30 mb-2"></i>
        <p class="text-xl font-serif italic">${quote.text}</p>
        <p class="mt-2 text-sm opacity-70">— ${quote.author}</p>
      </div>
    `;
  }

  /**
   * Render the page
   */
  render() {
    this.container.innerHTML = `
      <div class="p-4 md:p-6">
        <h1 class="text-2xl font-bold mb-6">Overview</h1>
        
        <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
          <!-- Progress Card - Top row, spanning 12 columns -->
          <div class="card bg-base-100 shadow-md md:col-span-12">
            <div class="card-body">
              <h3 class="card-title flex items-center mb-4">
                <i class="ri-pie-chart-line text-primary mr-2"></i>
                Overall Progress
              </h3>
              
              <div>
                <div class="flex justify-between mb-2">
                  <span class="text-sm font-medium">Relocation Progress</span>
                  <span class="text-sm font-medium" id="progress-text">0%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-4">
                  <div class="bg-primary h-4 rounded-full transition-all duration-500" id="progress-bar" style="width: 0%"></div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Summary Stats - Second row, spans all columns -->
          <div id="summary-stats" class="w-full md:col-span-12">
            <!-- Stats will be rendered here -->
          </div>
          
          <!-- Task Distribution (Full Width) -->
          <div class="card bg-base-100 shadow-md md:col-span-12">
            <div class="card-body">
              <h3 class="card-title flex items-center">
                <i class="ri-user-line text-primary mr-2"></i>
                Task Distribution
              </h3>
              
              <div class="mt-4" id="assignee-chart">
                <!-- Chart will be rendered here -->
                <div class="text-center py-6">
                  <span class="loading loading-spinner loading-md"></span>
                  <p class="mt-2 text-sm text-gray-500">Loading chart...</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Quote Card - Bottom row, spans all columns -->
          <div class="card bg-base-100 shadow-md md:col-span-12">
            <div class="card-body p-0" id="quote-container">
              <!-- Quote will be rendered here -->
              <div class="flex flex-col items-center text-center p-6">
                <i class="ri-double-quotes-l text-4xl text-primary opacity-30 mb-2"></i>
                <p class="text-xl font-serif italic">Loading a bit of motivation...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Store references to elements
    this.progressBarEl = this.container.querySelector('#progress-bar');
    this.progressTextEl = this.container.querySelector('#progress-text');
    this.assigneeChartEl = this.container.querySelector('#assignee-chart');
    this.quoteEl = this.container.querySelector('#quote-container');
    
    // Initial render
    this.renderOverview();
    this.renderQuote();
  }
}

export default OverviewPage; 