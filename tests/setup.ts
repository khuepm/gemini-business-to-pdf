// Vitest setup file
import { afterEach, vi } from 'vitest';

// Mock html2pdf globally to avoid CSS parsing errors in tests
vi.mock('html2pdf.js', () => {
  return {
    default: () => ({
      set: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      outputPdf: vi.fn().mockResolvedValue(new Blob(['mock pdf'], { type: 'application/pdf' })),
      save: vi.fn().mockResolvedValue(undefined),
      toPdf: vi.fn().mockReturnThis(),
      get: vi.fn().mockReturnThis(),
    })
  };
});

// Mock URL.revokeObjectURL for jsdom environment
if (typeof URL.revokeObjectURL === 'undefined') {
  URL.revokeObjectURL = vi.fn();
}

// Mock window.scrollTo for jsdom environment (jsdom provides a stub that throws)
if (typeof window !== 'undefined') {
  window.scrollTo = vi.fn();
}

// Cleanup after each test
afterEach(() => {
  // Clear DOM if it exists
  if (typeof document !== 'undefined') {
    document.body.innerHTML = '';
  }
});
