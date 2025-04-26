const { TextEncoder, TextDecoder } = require('util');
const { JSDOM } = require('jsdom');

// Create a basic DOM environment
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true,
  runScripts: 'dangerously',
  resources: 'usable',
});

// Set up global variables
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.HTMLElement = dom.window.HTMLElement;
global.Element = dom.window.Element;
global.Event = dom.window.Event;
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Load testing library
require('@testing-library/jest-dom');

// Mock window.matchMedia
window.matchMedia = (query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => {},
});

// Mock IntersectionObserver
class MockIntersectionObserver {
  constructor() {
    this.observe = () => {};
    this.unobserve = () => {};
    this.disconnect = () => {};
  }
}

window.IntersectionObserver = MockIntersectionObserver;

// Mock ResizeObserver
class MockResizeObserver {
  constructor() {
    this.observe = () => {};
    this.unobserve = () => {};
    this.disconnect = () => {};
  }
}

window.ResizeObserver = MockResizeObserver;

// Add custom matchers
expect.extend({
  toBeInTheDocument(received) {
    const pass = received !== null && received !== undefined;
    if (pass) {
      return {
        message: () => `expected ${received} not to be in the document`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be in the document`,
        pass: false,
      };
    }
  },
});

// Helper function to wait for element
global.waitForElement = async (selector, container = document) => {
  return new Promise((resolve) => {
    const element = container.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }

    const observer = new MutationObserver(() => {
      const element = container.querySelector(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });

    observer.observe(container, {
      childList: true,
      subtree: true,
    });
  });
}; 