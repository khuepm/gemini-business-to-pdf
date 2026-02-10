/**
 * Unit tests for MessageExpander
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MessageExpander, ExpandResult } from '../../src/content/message-expander';

describe('MessageExpander - Unit Tests', () => {
  let expander: MessageExpander;

  beforeEach(() => {
    expander = new MessageExpander();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('findCollapsedMessages', () => {
    it('should return empty array when no collapsed messages exist', () => {
      // Setup: Create chat with no collapsed messages
      const container = document.createElement('div');
      container.className = 'chat-container';
      
      const message1 = document.createElement('div');
      message1.className = 'message expanded';
      message1.textContent = 'Expanded message 1';
      
      const message2 = document.createElement('div');
      message2.className = 'message';
      message2.textContent = 'Regular message 2';
      
      container.appendChild(message1);
      container.appendChild(message2);
      document.body.appendChild(container);

      // Execute
      const result = expander.findCollapsedMessages();

      // Verify
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });

    it('should find single collapsed message', () => {
      // Setup: Create one collapsed message
      const message = document.createElement('div');
      message.className = 'message collapsed';
      message.textContent = 'Collapsed message';
      document.body.appendChild(message);

      // Execute
      const result = expander.findCollapsedMessages();

      // Verify
      expect(result.length).toBe(1);
      expect(result[0]).toBe(message);
    });

    it('should find multiple collapsed messages', () => {
      // Setup: Create multiple collapsed messages
      const message1 = document.createElement('div');
      message1.className = 'message collapsed';
      message1.textContent = 'Collapsed 1';
      
      const message2 = document.createElement('div');
      message2.className = 'message expanded';
      message2.textContent = 'Expanded';
      
      const message3 = document.createElement('div');
      message3.className = 'message collapsed';
      message3.textContent = 'Collapsed 2';
      
      document.body.appendChild(message1);
      document.body.appendChild(message2);
      document.body.appendChild(message3);

      // Execute
      const result = expander.findCollapsedMessages();

      // Verify
      expect(result.length).toBe(2);
      expect(result).toContain(message1);
      expect(result).toContain(message3);
    });

    it('should find messages with data-collapsed attribute', () => {
      // Setup: Create message with attribute
      const message = document.createElement('div');
      message.className = 'message';
      message.setAttribute('data-collapsed', 'true');
      message.textContent = 'Collapsed via attribute';
      document.body.appendChild(message);

      // Execute
      const result = expander.findCollapsedMessages();

      // Verify
      expect(result.length).toBe(1);
      expect(result[0]).toBe(message);
    });
  });

  describe('isCollapsed', () => {
    it('should return true for message with collapsed class', () => {
      const message = document.createElement('div');
      message.className = 'message collapsed';
      
      expect(expander.isCollapsed(message)).toBe(true);
    });

    it('should return true for message with data-collapsed attribute', () => {
      const message = document.createElement('div');
      message.setAttribute('data-collapsed', 'true');
      
      expect(expander.isCollapsed(message)).toBe(true);
    });

    it('should return false for expanded message', () => {
      const message = document.createElement('div');
      message.className = 'message expanded';
      
      expect(expander.isCollapsed(message)).toBe(false);
    });
  });

  describe('expandMessage', () => {
    it('should expand a collapsed message', async () => {
      // Setup: Create collapsed message that responds to click
      const message = document.createElement('div');
      message.className = 'message collapsed';
      message.textContent = 'Test message';
      document.body.appendChild(message);

      // Simulate expansion on click
      message.addEventListener('click', () => {
        message.classList.remove('collapsed');
      });

      // Verify initially collapsed
      expect(expander.isCollapsed(message)).toBe(true);

      // Execute
      await expander.expandMessage(message);

      // Verify expanded
      expect(expander.isCollapsed(message)).toBe(false);
    });

    it('should resolve immediately if message is already expanded', async () => {
      // Setup: Create already expanded message
      const message = document.createElement('div');
      message.className = 'message expanded';
      document.body.appendChild(message);

      // Execute (should not throw or timeout)
      await expander.expandMessage(message);

      // Verify still expanded
      expect(expander.isCollapsed(message)).toBe(false);
    });

    it('should timeout if message does not expand', async () => {
      // Setup: Create message that doesn't respond to click
      const message = document.createElement('div');
      message.className = 'message collapsed';
      document.body.appendChild(message);
      // No click handler - will timeout

      // Execute and expect rejection
      await expect(expander.expandMessage(message)).rejects.toThrow('Message expansion timeout');
    }, 3000); // Increase test timeout to accommodate 2s expansion timeout
  });

  describe('expandAllMessages', () => {
    it('should return zero counts when no collapsed messages exist', async () => {
      // Setup: Empty chat
      const container = document.createElement('div');
      container.className = 'chat-container';
      document.body.appendChild(container);

      // Execute
      const result = await expander.expandAllMessages();

      // Verify
      expect(result.totalFound).toBe(0);
      expect(result.expanded).toBe(0);
      expect(result.failed).toBe(0);
      expect(result.errors).toEqual([]);
    });

    it('should expand single collapsed message', async () => {
      // Setup: One collapsed message
      const message = document.createElement('div');
      message.className = 'message collapsed';
      message.addEventListener('click', () => {
        message.classList.remove('collapsed');
      });
      document.body.appendChild(message);

      // Execute
      const result = await expander.expandAllMessages();

      // Verify
      expect(result.totalFound).toBe(1);
      expect(result.expanded).toBe(1);
      expect(result.failed).toBe(0);
      expect(expander.isCollapsed(message)).toBe(false);
    });

    it('should expand multiple collapsed messages', async () => {
      // Setup: Multiple collapsed messages
      const messages: HTMLElement[] = [];
      for (let i = 0; i < 3; i++) {
        const message = document.createElement('div');
        message.className = 'message collapsed';
        message.addEventListener('click', () => {
          message.classList.remove('collapsed');
        });
        document.body.appendChild(message);
        messages.push(message);
      }

      // Execute
      const result = await expander.expandAllMessages();

      // Verify
      expect(result.totalFound).toBe(3);
      expect(result.expanded).toBe(3);
      expect(result.failed).toBe(0);
      
      // All messages should be expanded
      messages.forEach(msg => {
        expect(expander.isCollapsed(msg)).toBe(false);
      });
    });

    it('should handle errors gracefully and continue with other messages', async () => {
      // Setup: Mix of working and failing messages
      const workingMessage = document.createElement('div');
      workingMessage.className = 'message collapsed';
      workingMessage.addEventListener('click', () => {
        workingMessage.classList.remove('collapsed');
      });
      
      const failingMessage = document.createElement('div');
      failingMessage.className = 'message collapsed';
      // No click handler - will timeout
      
      document.body.appendChild(workingMessage);
      document.body.appendChild(failingMessage);

      // Execute
      const result = await expander.expandAllMessages();

      // Verify
      expect(result.totalFound).toBe(2);
      expect(result.expanded).toBe(1);
      expect(result.failed).toBe(1);
      expect(result.errors.length).toBe(1);
      expect(result.errors[0]).toContain('timeout');
      
      // Working message should be expanded
      expect(expander.isCollapsed(workingMessage)).toBe(false);
    }, 5000); // Increase timeout for this test

    it('should preserve scroll position', async () => {
      // Setup: Create tall content
      const tallDiv = document.createElement('div');
      tallDiv.style.height = '3000px';
      document.body.appendChild(tallDiv);
      
      const message = document.createElement('div');
      message.className = 'message collapsed';
      message.addEventListener('click', () => {
        message.classList.remove('collapsed');
      });
      document.body.appendChild(message);

      // Mock scrollTo to track calls
      const scrollToSpy = vi.fn();
      const originalScrollTo = window.scrollTo;
      window.scrollTo = scrollToSpy;

      // Set initial scroll position
      Object.defineProperty(window, 'scrollX', { value: 100, writable: true });
      Object.defineProperty(window, 'scrollY', { value: 200, writable: true });

      // Execute
      await expander.expandAllMessages();

      // Verify scrollTo was called to restore position
      expect(scrollToSpy).toHaveBeenCalledWith(100, 200);

      // Cleanup
      window.scrollTo = originalScrollTo;
    });
  });
});
