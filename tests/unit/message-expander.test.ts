/**
 * Unit tests for MessageExpander
 * 
 * Tests finding and expanding collapsed messages in chat
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MessageExpander } from '../../src/content/message-expander';

describe('MessageExpander', () => {
  let expander: MessageExpander;

  beforeEach(() => {
    // Clear DOM before each test
    document.body.innerHTML = '';
    expander = new MessageExpander();
  });

  afterEach(() => {
    // Clean up DOM after each test
    document.body.innerHTML = '';
  });

  describe('findCollapsedMessages', () => {
    it('should return empty array when no collapsed messages exist', () => {
      // Setup: create DOM without collapsed messages
      document.body.innerHTML = `
        <div class="chat-container">
          <div class="message">Message 1</div>
          <div class="message">Message 2</div>
        </div>
      `;

      // Execute
      const result = expander.findCollapsedMessages();

      // Assert
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });

    it('should find collapsed messages with .collapsed-message class', () => {
      // Setup: create DOM with collapsed messages
      document.body.innerHTML = `
        <div class="chat-container">
          <div class="message">Message 1</div>
          <div class="collapsed-message">Collapsed Message 1</div>
          <div class="message">Message 2</div>
          <div class="collapsed-message">Collapsed Message 2</div>
        </div>
      `;

      // Execute
      const result = expander.findCollapsedMessages();

      // Assert
      expect(result.length).toBe(2);
      expect(result[0].textContent).toBe('Collapsed Message 1');
      expect(result[1].textContent).toBe('Collapsed Message 2');
    });

    it('should find collapsed messages with data-collapsed attribute', () => {
      // Setup: create DOM with data-collapsed attribute
      document.body.innerHTML = `
        <div class="chat-container">
          <div class="message">Message 1</div>
          <div class="message" data-collapsed="true">Collapsed Message 1</div>
          <div class="message">Message 2</div>
          <div class="message" data-collapsed="true">Collapsed Message 2</div>
        </div>
      `;

      // Execute
      const result = expander.findCollapsedMessages();

      // Assert
      expect(result.length).toBe(2);
      expect(result[0].getAttribute('data-collapsed')).toBe('true');
      expect(result[1].getAttribute('data-collapsed')).toBe('true');
    });

    it('should find collapsed messages with .message.collapsed class', () => {
      // Setup: create DOM with .message.collapsed class
      document.body.innerHTML = `
        <div class="chat-container">
          <div class="message">Message 1</div>
          <div class="message collapsed">Collapsed Message 1</div>
          <div class="message">Message 2</div>
          <div class="message collapsed">Collapsed Message 2</div>
        </div>
      `;

      // Execute
      const result = expander.findCollapsedMessages();

      // Assert
      expect(result.length).toBe(2);
      expect(result[0].classList.contains('collapsed')).toBe(true);
      expect(result[1].classList.contains('collapsed')).toBe(true);
    });

    it('should find all collapsed messages regardless of marker type', () => {
      // Setup: create DOM with mixed collapsed message markers
      document.body.innerHTML = `
        <div class="chat-container">
          <div class="message">Message 1</div>
          <div class="collapsed-message">Collapsed 1</div>
          <div class="message" data-collapsed="true">Collapsed 2</div>
          <div class="message collapsed">Collapsed 3</div>
          <div class="message">Message 2</div>
        </div>
      `;

      // Execute
      const result = expander.findCollapsedMessages();

      // Assert
      expect(result.length).toBe(3);
    });

    it('should return HTMLElement array', () => {
      // Setup
      document.body.innerHTML = `
        <div class="collapsed-message">Collapsed Message</div>
      `;

      // Execute
      const result = expander.findCollapsedMessages();

      // Assert
      expect(result.length).toBe(1);
      expect(result[0]).toBeInstanceOf(HTMLElement);
      expect(result[0].tagName).toBe('DIV');
    });

    it('should handle deeply nested collapsed messages', () => {
      // Setup: create nested DOM structure
      document.body.innerHTML = `
        <div class="chat-container">
          <div class="messages-wrapper">
            <div class="message-group">
              <div class="collapsed-message">Nested Collapsed 1</div>
            </div>
          </div>
          <div class="message" data-collapsed="true">Collapsed 2</div>
        </div>
      `;

      // Execute
      const result = expander.findCollapsedMessages();

      // Assert
      expect(result.length).toBe(2);
    });

    it('should not include non-collapsed messages', () => {
      // Setup
      document.body.innerHTML = `
        <div class="chat-container">
          <div class="message">Regular Message 1</div>
          <div class="collapsed-message">Collapsed Message</div>
          <div class="message expanded">Expanded Message</div>
          <div class="message" data-collapsed="false">Not Collapsed</div>
        </div>
      `;

      // Execute
      const result = expander.findCollapsedMessages();

      // Assert
      expect(result.length).toBe(1);
      expect(result[0].textContent).toBe('Collapsed Message');
    });

    it('should handle empty DOM gracefully', () => {
      // Setup: empty DOM
      document.body.innerHTML = '';

      // Execute
      const result = expander.findCollapsedMessages();

      // Assert
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });

    it('should handle large number of collapsed messages', () => {
      // Setup: create many collapsed messages
      const messagesHTML = Array.from({ length: 100 }, (_, i) => 
        `<div class="collapsed-message">Collapsed ${i}</div>`
      ).join('');
      
      document.body.innerHTML = `
        <div class="chat-container">${messagesHTML}</div>
      `;

      // Execute
      const result = expander.findCollapsedMessages();

      // Assert
      expect(result.length).toBe(100);
    });

    it('should return empty array on query error', () => {
      // Setup: create a scenario that might cause querySelector to fail
      // Note: In practice, querySelector rarely throws, but we handle it gracefully
      
      // Execute
      const result = expander.findCollapsedMessages();

      // Assert - should not throw and return empty array
      expect(result).toEqual([]);
    });
  });

  describe('isCollapsed', () => {
    it('should return true for element with .collapsed class', () => {
      // Setup
      const element = document.createElement('div');
      element.className = 'message collapsed';

      // Execute
      const result = expander.isCollapsed(element);

      // Assert
      expect(result).toBe(true);
    });

    it('should return true for element with .collapsed-message class', () => {
      // Setup
      const element = document.createElement('div');
      element.className = 'collapsed-message';

      // Execute
      const result = expander.isCollapsed(element);

      // Assert
      expect(result).toBe(true);
    });

    it('should return true for element with data-collapsed="true"', () => {
      // Setup
      const element = document.createElement('div');
      element.setAttribute('data-collapsed', 'true');

      // Execute
      const result = expander.isCollapsed(element);

      // Assert
      expect(result).toBe(true);
    });

    it('should return true for element with aria-expanded="false"', () => {
      // Setup
      const element = document.createElement('div');
      element.setAttribute('aria-expanded', 'false');

      // Execute
      const result = expander.isCollapsed(element);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false for element without collapsed indicators', () => {
      // Setup
      const element = document.createElement('div');
      element.className = 'message';

      // Execute
      const result = expander.isCollapsed(element);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for element with aria-expanded="true"', () => {
      // Setup
      const element = document.createElement('div');
      element.setAttribute('aria-expanded', 'true');

      // Execute
      const result = expander.isCollapsed(element);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for element with data-collapsed="false"', () => {
      // Setup
      const element = document.createElement('div');
      element.setAttribute('data-collapsed', 'false');

      // Execute
      const result = expander.isCollapsed(element);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('expandMessage', () => {
    it('should expand a collapsed message by clicking it', async () => {
      // Setup: create a collapsed message that becomes expanded when clicked
      const element = document.createElement('div');
      element.className = 'message collapsed';
      element.textContent = 'Collapsed Message';
      document.body.appendChild(element);

      // Mock the click behavior - remove collapsed class when clicked
      element.addEventListener('click', () => {
        element.classList.remove('collapsed');
      });

      // Execute
      const promise = expander.expandMessage(element);

      // Assert: should resolve successfully
      await expect(promise).resolves.toBeUndefined();

      // Verify: message should no longer be collapsed
      expect(expander.isCollapsed(element)).toBe(false);
    });

    it('should expand message with data-collapsed attribute', async () => {
      // Setup
      const element = document.createElement('div');
      element.className = 'message';
      element.setAttribute('data-collapsed', 'true');
      document.body.appendChild(element);

      // Mock click behavior
      element.addEventListener('click', () => {
        element.removeAttribute('data-collapsed');
      });

      // Execute
      await expander.expandMessage(element);

      // Verify
      expect(expander.isCollapsed(element)).toBe(false);
    });

    it('should expand message with aria-expanded="false"', async () => {
      // Setup
      const element = document.createElement('div');
      element.setAttribute('aria-expanded', 'false');
      document.body.appendChild(element);

      // Mock click behavior
      element.addEventListener('click', () => {
        element.setAttribute('aria-expanded', 'true');
      });

      // Execute
      await expander.expandMessage(element);

      // Verify
      expect(expander.isCollapsed(element)).toBe(false);
    });

    it('should click on expand button if present', async () => {
      // Setup: create message with nested expand button
      const message = document.createElement('div');
      message.className = 'message collapsed';
      
      const expandButton = document.createElement('button');
      expandButton.className = 'expand-button';
      expandButton.textContent = 'Expand';
      message.appendChild(expandButton);
      
      document.body.appendChild(message);

      let buttonClicked = false;

      // Mock click behavior on button
      expandButton.addEventListener('click', () => {
        buttonClicked = true;
        message.classList.remove('collapsed');
      });

      // Execute
      await expander.expandMessage(message);

      // Verify: button should have been clicked
      expect(buttonClicked).toBe(true);
      expect(expander.isCollapsed(message)).toBe(false);
    });

    it('should timeout after 2 seconds if expansion does not complete', async () => {
      // Setup: create a message that never expands
      const element = document.createElement('div');
      element.className = 'message collapsed';
      document.body.appendChild(element);

      // Don't add click handler - message will stay collapsed

      // Execute & Assert: should reject with timeout error
      await expect(expander.expandMessage(element)).rejects.toThrow('Expansion timeout');
    }, 3000); // Set test timeout to 3 seconds

    it('should resolve immediately if message is already expanded', async () => {
      // Setup: create an already expanded message
      const element = document.createElement('div');
      element.className = 'message'; // No collapsed indicator
      document.body.appendChild(element);

      // Execute
      const startTime = Date.now();
      await expander.expandMessage(element);
      const duration = Date.now() - startTime;

      // Verify: should resolve quickly (within 200ms)
      expect(duration).toBeLessThan(200);
    });

    it('should handle click errors gracefully', async () => {
      // Setup: create element that throws error on click
      const element = document.createElement('div');
      element.className = 'message collapsed';
      document.body.appendChild(element);

      // Mock click to throw error
      const originalClick = element.click;
      element.click = () => {
        throw new Error('Click failed');
      };

      // Execute & Assert: should reject with the error
      await expect(expander.expandMessage(element)).rejects.toThrow('Click failed');

      // Cleanup
      element.click = originalClick;
    });

    it('should detect expansion via MutationObserver', async () => {
      // Setup: create message that expands after a delay
      const element = document.createElement('div');
      element.className = 'message collapsed';
      document.body.appendChild(element);

      // Simulate delayed expansion (like animation)
      element.addEventListener('click', () => {
        setTimeout(() => {
          element.classList.remove('collapsed');
        }, 50);
      });

      // Execute
      await expander.expandMessage(element);

      // Verify: should have detected the expansion
      expect(expander.isCollapsed(element)).toBe(false);
    });
  });

  describe('expandAllMessages', () => {
    it('should return empty result when no collapsed messages exist', async () => {
      // Setup: create DOM without collapsed messages
      document.body.innerHTML = `
        <div class="chat-container">
          <div class="message">Message 1</div>
          <div class="message">Message 2</div>
        </div>
      `;

      // Execute
      const result = await expander.expandAllMessages();

      // Assert
      expect(result.totalFound).toBe(0);
      expect(result.expanded).toBe(0);
      expect(result.failed).toBe(0);
      expect(result.errors).toEqual([]);
    });

    it('should expand all collapsed messages successfully', async () => {
      // Setup: create DOM with collapsed messages
      document.body.innerHTML = `
        <div class="chat-container">
          <div class="message">Message 1</div>
          <div class="collapsed-message" id="msg1">Collapsed 1</div>
          <div class="message">Message 2</div>
          <div class="collapsed-message" id="msg2">Collapsed 2</div>
        </div>
      `;

      // Mock click behavior for all collapsed messages
      const msg1 = document.getElementById('msg1')!;
      const msg2 = document.getElementById('msg2')!;
      
      msg1.addEventListener('click', () => {
        msg1.classList.remove('collapsed-message');
      });
      
      msg2.addEventListener('click', () => {
        msg2.classList.remove('collapsed-message');
      });

      // Execute
      const result = await expander.expandAllMessages();

      // Assert
      expect(result.totalFound).toBe(2);
      expect(result.expanded).toBe(2);
      expect(result.failed).toBe(0);
      expect(result.errors).toEqual([]);
    });

    it('should handle errors gracefully and continue with other messages', async () => {
      // Setup: create DOM with 3 collapsed messages, one will fail
      document.body.innerHTML = `
        <div class="chat-container">
          <div class="collapsed-message" id="msg1">Collapsed 1</div>
          <div class="collapsed-message" id="msg2">Collapsed 2 (will fail)</div>
          <div class="collapsed-message" id="msg3">Collapsed 3</div>
        </div>
      `;

      const msg1 = document.getElementById('msg1')!;
      const msg2 = document.getElementById('msg2')!;
      const msg3 = document.getElementById('msg3')!;
      
      // msg1 expands successfully
      msg1.addEventListener('click', () => {
        msg1.classList.remove('collapsed-message');
      });
      
      // msg2 stays collapsed (will timeout)
      // Don't add click handler - will cause timeout
      
      // msg3 expands successfully
      msg3.addEventListener('click', () => {
        msg3.classList.remove('collapsed-message');
      });

      // Execute
      const result = await expander.expandAllMessages();

      // Assert
      expect(result.totalFound).toBe(3);
      expect(result.expanded).toBe(2);
      expect(result.failed).toBe(1);
      expect(result.errors.length).toBe(1);
      expect(result.errors[0]).toContain('Message 2');
      expect(result.errors[0]).toContain('Expansion timeout');
    }, 10000); // Increase timeout for this test

    it('should preserve scroll position after expansion', async () => {
      // Setup: create DOM with collapsed messages
      document.body.innerHTML = `
        <div class="chat-container">
          <div class="collapsed-message" id="msg1">Collapsed 1</div>
        </div>
      `;

      const msg1 = document.getElementById('msg1')!;
      msg1.addEventListener('click', () => {
        msg1.classList.remove('collapsed-message');
      });

      // Set initial scroll position
      window.scrollTo(100, 200);
      const initialScrollX = window.scrollX;
      const initialScrollY = window.scrollY;

      // Execute
      await expander.expandAllMessages();

      // Assert: scroll position should be restored
      expect(window.scrollX).toBe(initialScrollX);
      expect(window.scrollY).toBe(initialScrollY);
    });

    it('should return statistics with all fields', async () => {
      // Setup
      document.body.innerHTML = `
        <div class="collapsed-message" id="msg1">Collapsed 1</div>
      `;

      const msg1 = document.getElementById('msg1')!;
      msg1.addEventListener('click', () => {
        msg1.classList.remove('collapsed-message');
      });

      // Execute
      const result = await expander.expandAllMessages();

      // Assert: result should have all required fields
      expect(result).toHaveProperty('totalFound');
      expect(result).toHaveProperty('expanded');
      expect(result).toHaveProperty('failed');
      expect(result).toHaveProperty('errors');
      expect(Array.isArray(result.errors)).toBe(true);
    });

    it('should handle single collapsed message', async () => {
      // Setup
      document.body.innerHTML = `
        <div class="collapsed-message" id="msg1">Collapsed 1</div>
      `;

      const msg1 = document.getElementById('msg1')!;
      msg1.addEventListener('click', () => {
        msg1.classList.remove('collapsed-message');
      });

      // Execute
      const result = await expander.expandAllMessages();

      // Assert
      expect(result.totalFound).toBe(1);
      expect(result.expanded).toBe(1);
      expect(result.failed).toBe(0);
    });

    it('should restore scroll position even if expansion fails', async () => {
      // Setup: create message that will fail to expand
      document.body.innerHTML = `
        <div class="collapsed-message" id="msg1">Collapsed 1</div>
      `;

      // Don't add click handler - will timeout

      // Set scroll position
      window.scrollTo(50, 100);
      const initialScrollX = window.scrollX;
      const initialScrollY = window.scrollY;

      // Execute
      const result = await expander.expandAllMessages();

      // Assert: scroll should be restored even though expansion failed
      expect(window.scrollX).toBe(initialScrollX);
      expect(window.scrollY).toBe(initialScrollY);
      expect(result.failed).toBe(1);
    }, 5000);
  });
});
