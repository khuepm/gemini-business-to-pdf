// Vitest setup file
import { afterEach, beforeEach } from 'vitest';

// Mock window.scrollTo for jsdom (not implemented by default)
beforeEach(() => {
  // Store scroll position in window object
  let scrollX = 0;
  let scrollY = 0;

  Object.defineProperty(window, 'scrollX', {
    get: () => scrollX,
    configurable: true,
  });

  Object.defineProperty(window, 'scrollY', {
    get: () => scrollY,
    configurable: true,
  });

  window.scrollTo = function(x: number | ScrollToOptions, y?: number) {
    if (typeof x === 'object') {
      scrollX = x.left || 0;
      scrollY = x.top || 0;
    } else {
      scrollX = x;
      scrollY = y || 0;
    }
  };
});

// Cleanup after each test
afterEach(() => {
  // Clear DOM if it exists
  if (typeof document !== 'undefined') {
    document.body.innerHTML = '';
  }
});
