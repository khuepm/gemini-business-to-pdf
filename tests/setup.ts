// Vitest setup file
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/dom';

// Cleanup after each test
afterEach(() => {
  cleanup();
  document.body.innerHTML = '';
});
