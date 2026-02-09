/**
 * Unit tests for UIInjector
 * 
 * Tests button injection, UI state management, and notifications
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { UIInjector } from '../../src/content/ui-injector';

describe('UIInjector', () => {
  let injector: UIInjector;

  beforeEach(() => {
    // Clear DOM before each test
    document.body.innerHTML = '';
    injector = new UIInjector();
  });

  afterEach(() => {
    // Clean up DOM after each test
    document.body.innerHTML = '';
  });

  describe('injectButton', () => {
    it('should create and inject button into body when header container not found', () => {
      // Execute
      injector.injectButton();

      // Assert
      const button = document.querySelector('.gemini-pdf-export-button');
      expect(button).toBeTruthy();
      expect(button?.tagName).toBe('BUTTON');
    });

    it('should inject button into header container when it exists', () => {
      // Setup: create header container
      const header = document.createElement('div');
      header.className = 'header-actions';
      document.body.appendChild(header);

      // Execute
      injector.injectButton();

      // Assert
      const button = header.querySelector('.gemini-pdf-export-button');
      expect(button).toBeTruthy();
      expect(button?.parentElement).toBe(header);
    });

    it('should add tooltip to button', () => {
      // Execute
      injector.injectButton();

      // Assert
      const button = document.querySelector('.gemini-pdf-export-button') as HTMLButtonElement;
      expect(button?.getAttribute('title')).toBe('Xuất cuộc trò chuyện thành PDF');
    });

    it('should add icon to button', () => {
      // Execute
      injector.injectButton();

      // Assert
      const button = document.querySelector('.gemini-pdf-export-button');
      const icon = button?.querySelector('.icon');
      expect(icon).toBeTruthy();
      expect(icon?.tagName).toBe('svg');
    });

    it('should add text to button', () => {
      // Execute
      injector.injectButton();

      // Assert
      const button = document.querySelector('.gemini-pdf-export-button');
      const text = button?.querySelector('span');
      expect(text?.textContent).toBe('Xuất PDF');
    });

    it('should throw error if injection fails', () => {
      // Mock createElement to throw error
      const originalCreateElement = document.createElement;
      document.createElement = vi.fn(() => {
        throw new Error('Mock error');
      });

      // Execute & Assert
      expect(() => injector.injectButton()).toThrow('Mock error');

      // Cleanup
      document.createElement = originalCreateElement;
    });
  });

  describe('showLoading', () => {
    beforeEach(() => {
      injector.injectButton();
    });

    it('should replace icon with spinner', () => {
      // Execute
      injector.showLoading();

      // Assert
      const button = injector.getButton();
      const spinner = button?.querySelector('.spinner');
      const icon = button?.querySelector('.icon');
      
      expect(spinner).toBeTruthy();
      expect(icon).toBeFalsy();
    });

    it('should change button text to "Đang xuất..."', () => {
      // Execute
      injector.showLoading();

      // Assert
      const button = injector.getButton();
      const text = button?.querySelector('span');
      expect(text?.textContent).toBe('Đang xuất...');
    });

    it('should disable button', () => {
      // Execute
      injector.showLoading();

      // Assert
      const button = injector.getButton();
      expect(button?.disabled).toBe(true);
    });

    it('should handle case when button not initialized', () => {
      // Create new injector without injecting button
      const newInjector = new UIInjector();

      // Execute - should not throw
      expect(() => newInjector.showLoading()).not.toThrow();
    });
  });

  describe('hideLoading', () => {
    beforeEach(() => {
      injector.injectButton();
      injector.showLoading();
    });

    it('should replace spinner with icon', () => {
      // Execute
      injector.hideLoading();

      // Assert
      const button = injector.getButton();
      const icon = button?.querySelector('.icon');
      const spinner = button?.querySelector('.spinner');
      
      expect(icon).toBeTruthy();
      expect(spinner).toBeFalsy();
    });

    it('should restore button text to "Xuất PDF"', () => {
      // Execute
      injector.hideLoading();

      // Assert
      const button = injector.getButton();
      const text = button?.querySelector('span');
      expect(text?.textContent).toBe('Xuất PDF');
    });

    it('should handle case when button not initialized', () => {
      // Create new injector without injecting button
      const newInjector = new UIInjector();

      // Execute - should not throw
      expect(() => newInjector.hideLoading()).not.toThrow();
    });
  });

  describe('disableButton', () => {
    beforeEach(() => {
      injector.injectButton();
    });

    it('should disable the button', () => {
      // Execute
      injector.disableButton();

      // Assert
      const button = injector.getButton();
      expect(button?.disabled).toBe(true);
    });

    it('should handle case when button not initialized', () => {
      // Create new injector without injecting button
      const newInjector = new UIInjector();

      // Execute - should not throw
      expect(() => newInjector.disableButton()).not.toThrow();
    });
  });

  describe('enableButton', () => {
    beforeEach(() => {
      injector.injectButton();
      injector.disableButton();
    });

    it('should enable the button', () => {
      // Execute
      injector.enableButton();

      // Assert
      const button = injector.getButton();
      expect(button?.disabled).toBe(false);
    });

    it('should handle case when button not initialized', () => {
      // Create new injector without injecting button
      const newInjector = new UIInjector();

      // Execute - should not throw
      expect(() => newInjector.enableButton()).not.toThrow();
    });
  });

  describe('showNotification', () => {
    it('should create success notification', () => {
      // Execute
      injector.showNotification('Test success message', 'success');

      // Assert
      const notification = document.querySelector('.gemini-pdf-notification.success');
      expect(notification).toBeTruthy();
      expect(notification?.textContent).toBe('Test success message');
    });

    it('should create error notification', () => {
      // Execute
      injector.showNotification('Test error message', 'error');

      // Assert
      const notification = document.querySelector('.gemini-pdf-notification.error');
      expect(notification).toBeTruthy();
      expect(notification?.textContent).toBe('Test error message');
    });

    it('should auto-dismiss notification after 5 seconds', async () => {
      // Use fake timers
      vi.useFakeTimers();

      // Execute
      injector.showNotification('Test message', 'success');

      // Assert notification exists
      let notification = document.querySelector('.gemini-pdf-notification');
      expect(notification).toBeTruthy();

      // Fast-forward time by 5 seconds
      vi.advanceTimersByTime(5000);

      // Assert notification is removed
      notification = document.querySelector('.gemini-pdf-notification');
      expect(notification).toBeFalsy();

      // Cleanup
      vi.useRealTimers();
    });

    it('should allow multiple notifications', () => {
      // Execute
      injector.showNotification('Message 1', 'success');
      injector.showNotification('Message 2', 'error');

      // Assert
      const notifications = document.querySelectorAll('.gemini-pdf-notification');
      expect(notifications.length).toBe(2);
    });
  });

  describe('getButton', () => {
    it('should return null when button not injected', () => {
      // Execute
      const button = injector.getButton();

      // Assert
      expect(button).toBeNull();
    });

    it('should return button element after injection', () => {
      // Setup
      injector.injectButton();

      // Execute
      const button = injector.getButton();

      // Assert
      expect(button).toBeTruthy();
      expect(button?.className).toBe('gemini-pdf-export-button');
    });
  });

  describe('Edge cases', () => {
    it('should handle button injection when DOM is not ready', () => {
      // This test verifies graceful handling
      // In real scenario, content script runs at document_idle
      expect(() => injector.injectButton()).not.toThrow();
    });

    it('should handle rapid state changes', () => {
      // Setup
      injector.injectButton();

      // Execute rapid state changes
      injector.showLoading();
      injector.hideLoading();
      injector.disableButton();
      injector.enableButton();
      injector.showLoading();

      // Assert final state
      const button = injector.getButton();
      expect(button?.disabled).toBe(true);
      expect(button?.querySelector('.spinner')).toBeTruthy();
    });
  });
});
