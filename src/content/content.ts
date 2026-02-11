/**
 * Content Script Entry Point
 * 
 * This is the main entry point for the Chrome extension content script.
 * It initializes the ExportController when the DOM is ready.
 * 
 * Validates: Requirements 1.1, 7.1
 */

import { ExportController } from './export-controller';
import { Logger } from '../utils/logger';

/**
 * Check if the current URL matches the Gemini Business domain
 * 
 * Validates: Requirements 7.2
 * 
 * @returns true if the URL is on the Gemini Business domain, false otherwise
 */
function isGeminiBusinessDomain(): boolean {
  const currentUrl = window.location.href;
  // Match https://gemini.google.com with optional trailing slash, path, or query
  const geminiBusinessPattern = /^https:\/\/gemini\.google\.com(\/|\?|$)/;
  
  return geminiBusinessPattern.test(currentUrl);
}

/**
 * Initialize the extension when DOM is ready
 * 
 * Validates: Requirements 1.1, 7.1, 7.2
 */
function initializeExtension(): void {
  try {
    // Check if we're on the Gemini Business domain
    if (!isGeminiBusinessDomain()) {
      Logger.info('Content script: Not on Gemini Business domain, skipping initialization');
      return;
    }
    
    Logger.info('Content script: DOM ready, initializing extension');
    
    // Create and initialize the ExportController
    const controller = new ExportController();
    controller.initialize();
    
    Logger.info('Content script: Extension initialized successfully');
  } catch (error) {
    Logger.error('Content script: Failed to initialize extension', error);
  }
}

// Wait for DOM to be ready before initializing
if (document.readyState === 'loading') {
  // DOM is still loading, wait for DOMContentLoaded event
  document.addEventListener('DOMContentLoaded', initializeExtension);
} else {
  // DOM is already ready, initialize immediately
  initializeExtension();
}
