// Vitest setup file
import { afterEach } from 'vitest';

// Cleanup after each test
afterEach(() => {
  // Clear DOM if it exists
  if (typeof document !== 'undefined') {
    document.body.innerHTML = '';
  }
});
