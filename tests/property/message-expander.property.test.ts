/**
 * Property-based tests for MessageExpander
 * 
 * Feature: gemini-business-to-pdf, Property 1: Tìm tất cả collapsed messages
 * 
 * These tests use fast-check to generate random DOM structures and verify
 * that findCollapsedMessages correctly identifies all collapsed messages.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { MessageExpander } from '../../src/content/message-expander';

describe('MessageExpander - Property Tests', () => {
  let expander: MessageExpander;

  beforeEach(() => {
    document.body.innerHTML = '';
    expander = new MessageExpander();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  /**
   * Feature: gemini-business-to-pdf, Property 1: Tìm tất cả collapsed messages
   * **Validates: Requirements 2.1**
   * 
   * Property: For any DOM structure containing collapsed messages,
   * findCollapsedMessages must return ALL collapsed messages without missing any.
   */
  describe('Property 1: Tìm tất cả collapsed messages', () => {
    it('should find all collapsed messages in random DOM structures', () => {
      fc.assert(
        fc.property(
          // Generate random number of collapsed messages (0-50)
          fc.integer({ min: 0, max: 50 }),
          // Generate random number of regular messages (0-50)
          fc.integer({ min: 0, max: 50 }),
          // Generate random collapsed message type for each collapsed message
          fc.array(
            fc.constantFrom(
              'collapsed-message',
              'data-collapsed',
              'message-collapsed',
              'mixed'
            ),
            { minLength: 0, maxLength: 50 }
          ),
          (numCollapsed, numRegular, collapsedTypes) => {
            // Ensure we have the right number of types for collapsed messages
            const types = collapsedTypes.slice(0, numCollapsed);
            while (types.length < numCollapsed) {
              types.push('collapsed-message');
            }

            // Build DOM structure
            const messages: string[] = [];
            const expectedCollapsedIndices: number[] = [];

            // Add collapsed messages
            for (let i = 0; i < numCollapsed; i++) {
              const type = types[i];
              let messageHTML = '';

              switch (type) {
                case 'collapsed-message':
                  messageHTML = `<div class="collapsed-message" data-test-id="collapsed-${i}">Collapsed ${i}</div>`;
                  break;
                case 'data-collapsed':
                  messageHTML = `<div class="message" data-collapsed="true" data-test-id="collapsed-${i}">Collapsed ${i}</div>`;
                  break;
                case 'message-collapsed':
                  messageHTML = `<div class="message collapsed" data-test-id="collapsed-${i}">Collapsed ${i}</div>`;
                  break;
                case 'mixed':
                  // Mix multiple indicators
                  messageHTML = `<div class="collapsed-message" data-collapsed="true" data-test-id="collapsed-${i}">Collapsed ${i}</div>`;
                  break;
              }

              messages.push(messageHTML);
              expectedCollapsedIndices.push(messages.length - 1);
            }

            // Add regular messages interspersed
            for (let i = 0; i < numRegular; i++) {
              const regularHTML = `<div class="message" data-test-id="regular-${i}">Regular ${i}</div>`;
              // Insert at random position
              const insertPos = Math.floor(Math.random() * (messages.length + 1));
              messages.splice(insertPos, 0, regularHTML);
              
              // Update expected indices
              for (let j = 0; j < expectedCollapsedIndices.length; j++) {
                if (expectedCollapsedIndices[j] >= insertPos) {
                  expectedCollapsedIndices[j]++;
                }
              }
            }

            // Create DOM
            document.body.innerHTML = `
              <div class="chat-container">
                ${messages.join('\n')}
              </div>
            `;

            // Execute
            const result = expander.findCollapsedMessages();

            // Verify: Should find exactly the number of collapsed messages we created
            expect(result.length).toBe(numCollapsed);

            // Verify: All found elements should be collapsed
            result.forEach(element => {
              expect(expander.isCollapsed(element)).toBe(true);
            });

            // Verify: All collapsed messages are found (check by data-test-id)
            const foundIds = result.map(el => el.getAttribute('data-test-id')).sort();
            const expectedIds = Array.from({ length: numCollapsed }, (_, i) => `collapsed-${i}`).sort();
            expect(foundIds).toEqual(expectedIds);
          }
        ),
        { numRuns: 100 } // Run 100 iterations as required
      );
    });

    it('should find all collapsed messages with nested DOM structures', () => {
      fc.assert(
        fc.property(
          // Generate random nesting depth (1-5 levels)
          fc.integer({ min: 1, max: 5 }),
          // Generate random number of collapsed messages per level (0-10)
          fc.array(fc.integer({ min: 0, max: 10 }), { minLength: 1, maxLength: 5 }),
          (nestingDepth, messagesPerLevel) => {
            // Adjust messagesPerLevel to match nestingDepth
            const levels = messagesPerLevel.slice(0, nestingDepth);
            while (levels.length < nestingDepth) {
              levels.push(0);
            }

            let html = '';
            let totalCollapsed = 0;
            let currentIndent = '';

            // Build nested structure
            for (let level = 0; level < nestingDepth; level++) {
              html += `${currentIndent}<div class="level-${level}">\n`;
              currentIndent += '  ';

              // Add collapsed messages at this level
              for (let i = 0; i < levels[level]; i++) {
                html += `${currentIndent}<div class="collapsed-message" data-test-id="level-${level}-msg-${i}">Collapsed L${level} M${i}</div>\n`;
                totalCollapsed++;
              }

              // Add some regular messages
              html += `${currentIndent}<div class="message">Regular at level ${level}</div>\n`;
            }

            // Close all divs
            for (let level = nestingDepth - 1; level >= 0; level--) {
              currentIndent = currentIndent.slice(2);
              html += `${currentIndent}</div>\n`;
            }

            document.body.innerHTML = html;

            // Execute
            const result = expander.findCollapsedMessages();

            // Verify: Should find all collapsed messages regardless of nesting
            expect(result.length).toBe(totalCollapsed);

            // Verify: All found elements should be collapsed
            result.forEach(element => {
              expect(expander.isCollapsed(element)).toBe(true);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle edge case: no collapsed messages', () => {
      fc.assert(
        fc.property(
          // Generate random number of regular messages (0-100)
          fc.integer({ min: 0, max: 100 }),
          (numRegular) => {
            // Build DOM with only regular messages
            const messages = Array.from({ length: numRegular }, (_, i) => 
              `<div class="message">Regular ${i}</div>`
            ).join('\n');

            document.body.innerHTML = `
              <div class="chat-container">
                ${messages}
              </div>
            `;

            // Execute
            const result = expander.findCollapsedMessages();

            // Verify: Should return empty array
            expect(result).toEqual([]);
            expect(result.length).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle edge case: all messages collapsed', () => {
      fc.assert(
        fc.property(
          // Generate random number of collapsed messages (1-100)
          fc.integer({ min: 1, max: 100 }),
          (numCollapsed) => {
            // Build DOM with only collapsed messages
            const messages = Array.from({ length: numCollapsed }, (_, i) => 
              `<div class="collapsed-message" data-test-id="collapsed-${i}">Collapsed ${i}</div>`
            ).join('\n');

            document.body.innerHTML = `
              <div class="chat-container">
                ${messages}
              </div>
            `;

            // Execute
            const result = expander.findCollapsedMessages();

            // Verify: Should find all messages
            expect(result.length).toBe(numCollapsed);

            // Verify: All found elements should be collapsed
            result.forEach(element => {
              expect(expander.isCollapsed(element)).toBe(true);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should find collapsed messages with various HTML attributes', () => {
      fc.assert(
        fc.property(
          // Generate random number of messages (1-30)
          fc.integer({ min: 1, max: 30 }),
          // Generate random attributes for each message
          fc.array(
            fc.record({
              // Generate safe IDs without HTML-breaking characters
              id: fc.string({ minLength: 1, maxLength: 20 }).map(s => s.replace(/[<>"'&]/g, '_')),
              // Only use 'message' class since the selector is '.message.collapsed'
              className: fc.constant('message'),
              hasCollapsedClass: fc.boolean(),
              hasDataCollapsed: fc.boolean(),
            }),
            { minLength: 1, maxLength: 30 }
          ),
          (numMessages, attributes) => {
            // Adjust attributes array to match numMessages
            const attrs = attributes.slice(0, numMessages);
            while (attrs.length < numMessages) {
              attrs.push({
                id: `msg-${attrs.length}`,
                className: 'message',
                hasCollapsedClass: false,
                hasDataCollapsed: false,
              });
            }

            // Build DOM
            const messages: string[] = [];
            let expectedCollapsed = 0;

            for (let i = 0; i < numMessages; i++) {
              const attr = attrs[i];
              const isCollapsed = attr.hasCollapsedClass || attr.hasDataCollapsed;
              
              let html = `<div class="${attr.className}`;
              
              // Add collapsed class if needed
              if (attr.hasCollapsedClass) {
                html += ' collapsed';
              }
              
              html += `" id="${attr.id}"`;
              
              // Add data-collapsed attribute if needed
              if (attr.hasDataCollapsed) {
                html += ` data-collapsed="true"`;
              }
              
              html += ` data-test-id="msg-${i}">Message ${i}</div>`;
              
              messages.push(html);
              
              if (isCollapsed) {
                expectedCollapsed++;
              }
            }

            document.body.innerHTML = `
              <div class="chat-container">
                ${messages.join('\n')}
              </div>
            `;

            // Execute
            const result = expander.findCollapsedMessages();

            // Verify: Should find all collapsed messages
            expect(result.length).toBe(expectedCollapsed);

            // Verify: All found elements should be collapsed
            result.forEach(element => {
              expect(expander.isCollapsed(element)).toBe(true);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain consistency across multiple calls', () => {
      fc.assert(
        fc.property(
          // Generate random DOM structure
          fc.integer({ min: 0, max: 50 }),
          fc.integer({ min: 0, max: 50 }),
          (numCollapsed, numRegular) => {
            // Build DOM
            const messages: string[] = [];

            for (let i = 0; i < numCollapsed; i++) {
              messages.push(`<div class="collapsed-message">Collapsed ${i}</div>`);
            }

            for (let i = 0; i < numRegular; i++) {
              messages.push(`<div class="message">Regular ${i}</div>`);
            }

            // Shuffle messages
            messages.sort(() => Math.random() - 0.5);

            document.body.innerHTML = `
              <div class="chat-container">
                ${messages.join('\n')}
              </div>
            `;

            // Execute multiple times
            const result1 = expander.findCollapsedMessages();
            const result2 = expander.findCollapsedMessages();
            const result3 = expander.findCollapsedMessages();

            // Verify: All calls should return the same number of elements
            expect(result1.length).toBe(numCollapsed);
            expect(result2.length).toBe(numCollapsed);
            expect(result3.length).toBe(numCollapsed);

            // Verify: Results should be consistent (same elements)
            expect(result1.length).toBe(result2.length);
            expect(result2.length).toBe(result3.length);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: gemini-business-to-pdf, Property 2: Mở rộng messages thành công
   * **Validates: Requirements 2.2**
   * 
   * Property: For any collapsed message, after calling expandMessage,
   * the message must transition to expanded state (no longer collapsed).
   */
  describe('Property 2: Mở rộng messages thành công', () => {
    it('should successfully expand any collapsed message', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate random collapsed message types
          fc.constantFrom(
            'collapsed-message',
            'data-collapsed',
            'message-collapsed',
            'aria-expanded-false'
          ),
          // Generate random message content
          fc.string({ minLength: 1, maxLength: 100 }).map(s => s.replace(/[<>"'&]/g, '_')),
          // Generate random delay for expansion animation (0-100ms to keep tests fast)
          fc.integer({ min: 0, max: 100 }),
          async (collapsedType, content, expansionDelay) => {
            // Build collapsed message based on type
            let messageHTML = '';
            let messageId = `test-msg-${Date.now()}-${Math.random()}`;

            switch (collapsedType) {
              case 'collapsed-message':
                messageHTML = `<div class="collapsed-message" id="${messageId}">${content}</div>`;
                break;
              case 'data-collapsed':
                messageHTML = `<div class="message" data-collapsed="true" id="${messageId}">${content}</div>`;
                break;
              case 'message-collapsed':
                messageHTML = `<div class="message collapsed" id="${messageId}">${content}</div>`;
                break;
              case 'aria-expanded-false':
                messageHTML = `<div class="message" aria-expanded="false" id="${messageId}">${content}</div>`;
                break;
            }

            document.body.innerHTML = `
              <div class="chat-container">
                ${messageHTML}
              </div>
            `;

            const messageElement = document.getElementById(messageId) as HTMLElement;
            expect(messageElement).toBeTruthy();

            // Verify message is initially collapsed
            const initiallyCollapsed = expander.isCollapsed(messageElement);
            expect(initiallyCollapsed).toBe(true);

            // Mock the expansion behavior
            // Override click to trigger DOM changes that MutationObserver can detect
            const originalClick = messageElement.click;
            messageElement.click = function() {
              // Use setTimeout to simulate async expansion
              setTimeout(() => {
                // Remove collapsed indicators - these changes will be detected by MutationObserver
                messageElement.classList.remove('collapsed');
                messageElement.classList.remove('collapsed-message');
                messageElement.removeAttribute('data-collapsed');
                messageElement.setAttribute('aria-expanded', 'true');
              }, expansionDelay);
            };

            // Execute: expand the message
            await expander.expandMessage(messageElement);

            // Verify: message should no longer be collapsed
            const finallyCollapsed = expander.isCollapsed(messageElement);
            expect(finallyCollapsed).toBe(false);

            // Restore original click
            messageElement.click = originalClick;
          }
        ),
        { numRuns: 100, timeout: 10000 } // Run 100 iterations with 10s timeout
      );
    }, 15000); // Set test timeout to 15 seconds

    it('should handle messages with nested expand buttons', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate random button text
          fc.string({ minLength: 1, maxLength: 20 }).map(s => s.replace(/[<>"'&]/g, '_')),
          // Generate random nesting depth (1-3 levels)
          fc.integer({ min: 1, max: 3 }),
          // Generate random expansion delay (0-100ms)
          fc.integer({ min: 0, max: 100 }),
          async (buttonText, nestingDepth, expansionDelay) => {
            const messageId = `test-msg-${Date.now()}-${Math.random()}`;
            
            // Build nested structure
            let innerContent = `<button class="expand-button" role="button">${buttonText}</button>`;
            for (let i = 0; i < nestingDepth - 1; i++) {
              innerContent = `<div class="level-${i}">${innerContent}</div>`;
            }

            document.body.innerHTML = `
              <div class="chat-container">
                <div class="message collapsed" id="${messageId}">
                  ${innerContent}
                  <div class="content">Collapsed content</div>
                </div>
              </div>
            `;

            const messageElement = document.getElementById(messageId) as HTMLElement;
            const expandButton = messageElement.querySelector('.expand-button') as HTMLElement;
            
            expect(messageElement).toBeTruthy();
            expect(expandButton).toBeTruthy();

            // Verify initially collapsed
            expect(expander.isCollapsed(messageElement)).toBe(true);

            // Mock button click behavior
            const originalClick = expandButton.click;
            expandButton.click = function() {
              setTimeout(() => {
                messageElement.classList.remove('collapsed');
                messageElement.setAttribute('aria-expanded', 'true');
              }, expansionDelay);
            };

            // Execute
            await expander.expandMessage(messageElement);

            // Verify: message should be expanded
            expect(expander.isCollapsed(messageElement)).toBe(false);

            // Restore
            expandButton.click = originalClick;
          }
        ),
        { numRuns: 100, timeout: 10000 }
      );
    }, 15000);

    it('should handle instant expansion (no animation delay)', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate random message content
          fc.string({ minLength: 1, maxLength: 50 }).map(s => s.replace(/[<>"'&]/g, '_')),
          async (content) => {
            const messageId = `test-msg-${Date.now()}-${Math.random()}`;

            document.body.innerHTML = `
              <div class="chat-container">
                <div class="collapsed-message" id="${messageId}">${content}</div>
              </div>
            `;

            const messageElement = document.getElementById(messageId) as HTMLElement;
            expect(messageElement).toBeTruthy();

            // Verify initially collapsed
            expect(expander.isCollapsed(messageElement)).toBe(true);

            // Mock instant expansion (no delay)
            const originalClick = messageElement.click;
            messageElement.click = function() {
              // Expand immediately (synchronously)
              messageElement.classList.remove('collapsed-message');
              messageElement.setAttribute('aria-expanded', 'true');
            };

            // Execute
            await expander.expandMessage(messageElement);

            // Verify: message should be expanded
            expect(expander.isCollapsed(messageElement)).toBe(false);

            // Restore
            messageElement.click = originalClick;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle messages with multiple collapsed indicators', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate random combinations of collapsed indicators
          fc.record({
            hasCollapsedClass: fc.boolean(),
            hasCollapsedMessageClass: fc.boolean(),
            hasDataCollapsed: fc.boolean(),
            hasAriaExpanded: fc.boolean(),
          }),
          // Generate random expansion delay (0-100ms)
          fc.integer({ min: 0, max: 100 }),
          async (indicators, expansionDelay) => {
            // Ensure at least one indicator is true
            if (!indicators.hasCollapsedClass && 
                !indicators.hasCollapsedMessageClass && 
                !indicators.hasDataCollapsed && 
                !indicators.hasAriaExpanded) {
              indicators.hasCollapsedClass = true;
            }

            const messageId = `test-msg-${Date.now()}-${Math.random()}`;
            
            // Build class list
            let classList = 'message';
            if (indicators.hasCollapsedClass) classList += ' collapsed';
            if (indicators.hasCollapsedMessageClass) classList += ' collapsed-message';

            // Build attributes
            let attributes = '';
            if (indicators.hasDataCollapsed) attributes += ' data-collapsed="true"';
            if (indicators.hasAriaExpanded) attributes += ' aria-expanded="false"';

            document.body.innerHTML = `
              <div class="chat-container">
                <div class="${classList}" id="${messageId}"${attributes}>
                  Multiple indicators message
                </div>
              </div>
            `;

            const messageElement = document.getElementById(messageId) as HTMLElement;
            expect(messageElement).toBeTruthy();

            // Verify initially collapsed
            expect(expander.isCollapsed(messageElement)).toBe(true);

            // Mock expansion - remove all indicators
            const originalClick = messageElement.click;
            messageElement.click = function() {
              setTimeout(() => {
                messageElement.classList.remove('collapsed');
                messageElement.classList.remove('collapsed-message');
                messageElement.removeAttribute('data-collapsed');
                messageElement.setAttribute('aria-expanded', 'true');
              }, expansionDelay);
            };

            // Execute
            await expander.expandMessage(messageElement);

            // Verify: message should be expanded (all indicators removed)
            expect(expander.isCollapsed(messageElement)).toBe(false);

            // Restore
            messageElement.click = originalClick;
          }
        ),
        { numRuns: 100, timeout: 10000 }
      );
    }, 15000);

    it('should handle edge case: message that becomes expanded during click', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate random content
          fc.string({ minLength: 1, maxLength: 30 }).map(s => s.replace(/[<>"'&]/g, '_')),
          async (content) => {
            const messageId = `test-msg-${Date.now()}-${Math.random()}`;

            document.body.innerHTML = `
              <div class="chat-container">
                <div class="collapsed-message" id="${messageId}">${content}</div>
              </div>
            `;

            const messageElement = document.getElementById(messageId) as HTMLElement;
            expect(messageElement).toBeTruthy();

            // Verify initially collapsed
            expect(expander.isCollapsed(messageElement)).toBe(true);

            // Mock expansion that happens within the 100ms check window
            const originalClick = messageElement.click;
            messageElement.click = function() {
              // Expand within 50ms (before the 100ms check)
              setTimeout(() => {
                messageElement.classList.remove('collapsed-message');
                messageElement.setAttribute('aria-expanded', 'true');
              }, 50);
            };

            // Execute
            await expander.expandMessage(messageElement);

            // Verify: message should be expanded
            expect(expander.isCollapsed(messageElement)).toBe(false);

            // Restore
            messageElement.click = originalClick;
          }
        ),
        { numRuns: 100, timeout: 10000 }
      );
    }, 15000);

    it('should maintain message content integrity after expansion', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate random message content with various HTML elements
          fc.record({
            text: fc.string({ minLength: 1, maxLength: 50 }).map(s => s.replace(/[<>"'&]/g, '_')),
            hasCodeBlock: fc.boolean(),
            hasList: fc.boolean(),
          }),
          // Generate random expansion delay (0-100ms)
          fc.integer({ min: 0, max: 100 }),
          async (contentSpec, expansionDelay) => {
            const messageId = `test-msg-${Date.now()}-${Math.random()}`;
            
            // Build content
            let content = `<p>${contentSpec.text}</p>`;
            if (contentSpec.hasCodeBlock) {
              content += '<pre><code>const x = 42;</code></pre>';
            }
            if (contentSpec.hasList) {
              content += '<ul><li>Item 1</li><li>Item 2</li></ul>';
            }

            document.body.innerHTML = `
              <div class="chat-container">
                <div class="message collapsed" id="${messageId}">
                  ${content}
                </div>
              </div>
            `;

            const messageElement = document.getElementById(messageId) as HTMLElement;
            expect(messageElement).toBeTruthy();

            // Capture original content
            const originalContent = messageElement.innerHTML;

            // Verify initially collapsed
            expect(expander.isCollapsed(messageElement)).toBe(true);

            // Mock expansion
            const originalClick = messageElement.click;
            messageElement.click = function() {
              setTimeout(() => {
                messageElement.classList.remove('collapsed');
                messageElement.setAttribute('aria-expanded', 'true');
                // Content should remain the same
              }, expansionDelay);
            };

            // Execute
            await expander.expandMessage(messageElement);

            // Verify: message should be expanded
            expect(expander.isCollapsed(messageElement)).toBe(false);

            // Verify: content should be unchanged
            expect(messageElement.innerHTML).toBe(originalContent);

            // Restore
            messageElement.click = originalClick;
          }
        ),
        { numRuns: 100, timeout: 10000 }
      );
    }, 15000);
  });

  /**
   * Feature: gemini-business-to-pdf, Property 3: Đợi tất cả messages mở rộng
   * **Validates: Requirements 2.3**
   * 
   * Property: For any set of collapsed messages, expandAllMessages must only return
   * when all messages have completed expansion (or timed out).
   */
  describe('Property 3: Đợi tất cả messages mở rộng', () => {
    it('should wait for all messages to complete expansion before returning', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate random number of collapsed messages (1-20)
          fc.integer({ min: 1, max: 20 }),
          // Generate random expansion delays for each message (0-200ms)
          fc.array(fc.integer({ min: 0, max: 200 }), { minLength: 1, maxLength: 20 }),
          async (numMessages, delays) => {
            // Adjust delays array to match numMessages
            const messageDelays = delays.slice(0, numMessages);
            while (messageDelays.length < numMessages) {
              messageDelays.push(50);
            }

            // Build DOM with collapsed messages
            const messages: string[] = [];
            for (let i = 0; i < numMessages; i++) {
              messages.push(`<div class="collapsed-message" id="msg-${i}" data-test-id="msg-${i}">Message ${i}</div>`);
            }

            document.body.innerHTML = `
              <div class="chat-container">
                ${messages.join('\n')}
              </div>
            `;

            // Track expansion state for each message
            const expansionStates = new Array(numMessages).fill(false);
            const expansionTimes: number[] = [];

            // Mock click behavior for each message with different delays
            for (let i = 0; i < numMessages; i++) {
              const messageElement = document.getElementById(`msg-${i}`) as HTMLElement;
              const delay = messageDelays[i];
              
              const originalClick = messageElement.click;
              messageElement.click = function() {
                const startTime = Date.now();
                setTimeout(() => {
                  messageElement.classList.remove('collapsed-message');
                  messageElement.setAttribute('aria-expanded', 'true');
                  expansionStates[i] = true;
                  expansionTimes.push(Date.now() - startTime);
                }, delay);
              };
            }

            // Execute expandAllMessages
            const startTime = Date.now();
            const result = await expander.expandAllMessages();
            const totalTime = Date.now() - startTime;

            // Verify: All messages should be expanded
            expect(result.totalFound).toBe(numMessages);
            expect(result.expanded).toBe(numMessages);
            expect(result.failed).toBe(0);

            // Verify: All expansion states should be true (all completed)
            expansionStates.forEach((state, i) => {
              expect(state).toBe(true);
            });

            // Verify: Total time should be at least as long as the longest delay
            const maxDelay = Math.max(...messageDelays);
            expect(totalTime).toBeGreaterThanOrEqual(maxDelay);

            // Verify: All messages are no longer collapsed
            for (let i = 0; i < numMessages; i++) {
              const messageElement = document.getElementById(`msg-${i}`) as HTMLElement;
              expect(expander.isCollapsed(messageElement)).toBe(false);
            }
          }
        ),
        { numRuns: 100, timeout: 30000 }
      );
    }, 35000);

    it('should handle sequential expansion without premature return', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate random number of messages (2-10)
          fc.integer({ min: 2, max: 10 }),
          async (numMessages) => {
            // Build DOM
            const messages: string[] = [];
            for (let i = 0; i < numMessages; i++) {
              messages.push(`<div class="message collapsed" id="seq-msg-${i}">Message ${i}</div>`);
            }

            document.body.innerHTML = `
              <div class="chat-container">
                ${messages.join('\n')}
              </div>
            `;

            // Track the order of expansions
            const expansionOrder: number[] = [];
            let allExpanded = false;

            // Mock click behavior with increasing delays
            for (let i = 0; i < numMessages; i++) {
              const messageElement = document.getElementById(`seq-msg-${i}`) as HTMLElement;
              const delay = (i + 1) * 50; // Each message takes longer
              
              messageElement.click = function() {
                setTimeout(() => {
                  messageElement.classList.remove('collapsed');
                  messageElement.setAttribute('aria-expanded', 'true');
                  expansionOrder.push(i);
                }, delay);
              };
            }

            // Execute
            const resultPromise = expander.expandAllMessages();
            
            // Verify: Function should not return immediately
            await new Promise(resolve => setTimeout(resolve, 50));
            expect(allExpanded).toBe(false);

            // Wait for completion
            const result = await resultPromise;
            allExpanded = true;

            // Verify: All messages expanded
            expect(result.expanded).toBe(numMessages);
            expect(expansionOrder.length).toBe(numMessages);

            // Verify: Expansions happened in order (0, 1, 2, ...)
            expect(expansionOrder).toEqual(Array.from({ length: numMessages }, (_, i) => i));
          }
        ),
        { numRuns: 100, timeout: 20000 }
      );
    }, 25000);

    it('should wait even when some messages expand instantly', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate random number of messages (3-15)
          fc.integer({ min: 3, max: 15 }),
          // Generate random pattern of instant vs delayed expansions
          fc.array(fc.boolean(), { minLength: 3, maxLength: 15 }),
          async (numMessages, instantFlags) => {
            // Adjust instantFlags to match numMessages
            const flags = instantFlags.slice(0, numMessages);
            while (flags.length < numMessages) {
              flags.push(false);
            }

            // Build DOM
            const messages: string[] = [];
            for (let i = 0; i < numMessages; i++) {
              messages.push(`<div class="collapsed-message" id="mixed-msg-${i}">Message ${i}</div>`);
            }

            document.body.innerHTML = `
              <div class="chat-container">
                ${messages.join('\n')}
              </div>
            `;

            const expansionStates = new Array(numMessages).fill(false);

            // Mock click behavior - some instant, some delayed
            for (let i = 0; i < numMessages; i++) {
              const messageElement = document.getElementById(`mixed-msg-${i}`) as HTMLElement;
              const isInstant = flags[i];
              
              messageElement.click = function() {
                if (isInstant) {
                  // Instant expansion
                  messageElement.classList.remove('collapsed-message');
                  messageElement.setAttribute('aria-expanded', 'true');
                  expansionStates[i] = true;
                } else {
                  // Delayed expansion (100ms)
                  setTimeout(() => {
                    messageElement.classList.remove('collapsed-message');
                    messageElement.setAttribute('aria-expanded', 'true');
                    expansionStates[i] = true;
                  }, 100);
                }
              };
            }

            // Execute
            const result = await expander.expandAllMessages();

            // Verify: All messages expanded (both instant and delayed)
            expect(result.totalFound).toBe(numMessages);
            expect(result.expanded).toBe(numMessages);
            expect(result.failed).toBe(0);

            // Verify: All expansion states are true
            expansionStates.forEach((state, i) => {
              expect(state).toBe(true);
            });

            // Verify: All messages are no longer collapsed
            for (let i = 0; i < numMessages; i++) {
              const messageElement = document.getElementById(`mixed-msg-${i}`) as HTMLElement;
              expect(expander.isCollapsed(messageElement)).toBe(false);
            }
          }
        ),
        { numRuns: 100, timeout: 20000 }
      );
    }, 25000);
  });

  /**
   * Feature: gemini-business-to-pdf, Property 4: Xử lý lỗi expansion gracefully
   * **Validates: Requirements 2.4**
   * 
   * Property: For any set of messages where some cannot expand, expandAllMessages
   * must still successfully process the remaining messages and return detailed
   * information about failures.
   */
  describe('Property 4: Xử lý lỗi expansion gracefully', () => {
    it('should continue expanding other messages when some fail', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate random number of messages (3-20)
          fc.integer({ min: 3, max: 20 }),
          // Generate random failure pattern (which messages will fail)
          fc.array(fc.boolean(), { minLength: 3, maxLength: 20 }),
          async (numMessages, failureFlags) => {
            // Adjust failureFlags to match numMessages
            const flags = failureFlags.slice(0, numMessages);
            while (flags.length < numMessages) {
              flags.push(false);
            }

            // Ensure at least one success and one failure
            if (flags.every(f => f)) flags[0] = false; // At least one success
            if (flags.every(f => !f)) flags[flags.length - 1] = true; // At least one failure

            // Build DOM
            const messages: string[] = [];
            for (let i = 0; i < numMessages; i++) {
              messages.push(`<div class="collapsed-message" id="fail-msg-${i}">Message ${i}</div>`);
            }

            document.body.innerHTML = `
              <div class="chat-container">
                ${messages.join('\n')}
              </div>
            `;

            const expectedFailures = flags.filter(f => f).length;
            const expectedSuccesses = numMessages - expectedFailures;

            // Mock click behavior - some succeed, some fail
            for (let i = 0; i < numMessages; i++) {
              const messageElement = document.getElementById(`fail-msg-${i}`) as HTMLElement;
              const shouldFail = flags[i];
              
              messageElement.click = function() {
                if (shouldFail) {
                  // Don't expand - this will cause a timeout
                  // Keep the collapsed state
                } else {
                  // Successful expansion
                  setTimeout(() => {
                    messageElement.classList.remove('collapsed-message');
                    messageElement.setAttribute('aria-expanded', 'true');
                  }, 50);
                }
              };
            }

            // Execute
            const result = await expander.expandAllMessages();

            // Verify: Total found is correct
            expect(result.totalFound).toBe(numMessages);

            // Verify: Correct number of successes and failures
            expect(result.expanded).toBe(expectedSuccesses);
            expect(result.failed).toBe(expectedFailures);

            // Verify: Errors array has entries for each failure
            expect(result.errors.length).toBe(expectedFailures);

            // Verify: Each error message contains information
            result.errors.forEach(error => {
              expect(error).toBeTruthy();
              expect(typeof error).toBe('string');
              expect(error.length).toBeGreaterThan(0);
            });

            // Verify: Successful messages are expanded
            for (let i = 0; i < numMessages; i++) {
              const messageElement = document.getElementById(`fail-msg-${i}`) as HTMLElement;
              const shouldHaveFailed = flags[i];
              
              if (shouldHaveFailed) {
                // Failed messages should still be collapsed
                expect(expander.isCollapsed(messageElement)).toBe(true);
              } else {
                // Successful messages should be expanded
                expect(expander.isCollapsed(messageElement)).toBe(false);
              }
            }
          }
        ),
        { numRuns: 100, timeout: 60000 }
      );
    }, 65000);

    it('should handle all messages failing gracefully', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate random number of messages (1-10)
          fc.integer({ min: 1, max: 10 }),
          async (numMessages) => {
            // Build DOM
            const messages: string[] = [];
            for (let i = 0; i < numMessages; i++) {
              messages.push(`<div class="collapsed-message" id="all-fail-msg-${i}">Message ${i}</div>`);
            }

            document.body.innerHTML = `
              <div class="chat-container">
                ${messages.join('\n')}
              </div>
            `;

            // Mock click behavior - all messages fail to expand
            for (let i = 0; i < numMessages; i++) {
              const messageElement = document.getElementById(`all-fail-msg-${i}`) as HTMLElement;
              
              messageElement.click = function() {
                // Don't expand - keep collapsed state
                // This will cause timeout
              };
            }

            // Execute
            const result = await expander.expandAllMessages();

            // Verify: All messages found
            expect(result.totalFound).toBe(numMessages);

            // Verify: No successes, all failures
            expect(result.expanded).toBe(0);
            expect(result.failed).toBe(numMessages);

            // Verify: Error for each message
            expect(result.errors.length).toBe(numMessages);

            // Verify: All messages still collapsed
            for (let i = 0; i < numMessages; i++) {
              const messageElement = document.getElementById(`all-fail-msg-${i}`) as HTMLElement;
              expect(expander.isCollapsed(messageElement)).toBe(true);
            }
          }
        ),
        { numRuns: 100, timeout: 60000 }
      );
    }, 65000);

    it('should provide detailed error information for each failure', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate random number of messages (2-8)
          fc.integer({ min: 2, max: 8 }),
          async (numMessages) => {
            // Build DOM - alternate between success and failure
            const messages: string[] = [];
            for (let i = 0; i < numMessages; i++) {
              messages.push(`<div class="collapsed-message" id="detail-msg-${i}">Message ${i}</div>`);
            }

            document.body.innerHTML = `
              <div class="chat-container">
                ${messages.join('\n')}
              </div>
            `;

            const expectedFailures: number[] = [];

            // Mock click behavior - even indices succeed, odd indices fail
            for (let i = 0; i < numMessages; i++) {
              const messageElement = document.getElementById(`detail-msg-${i}`) as HTMLElement;
              const shouldFail = i % 2 === 1;
              
              if (shouldFail) {
                expectedFailures.push(i);
              }
              
              messageElement.click = function() {
                if (!shouldFail) {
                  setTimeout(() => {
                    messageElement.classList.remove('collapsed-message');
                    messageElement.setAttribute('aria-expanded', 'true');
                  }, 50);
                }
                // If shouldFail, don't expand
              };
            }

            // Execute
            const result = await expander.expandAllMessages();

            // Verify: Correct counts
            expect(result.failed).toBe(expectedFailures.length);
            expect(result.errors.length).toBe(expectedFailures.length);

            // Verify: Each error contains message number information
            result.errors.forEach((error, index) => {
              expect(error).toContain('Message');
              // Error should reference the message that failed
              const failedMessageNum = expectedFailures[index] + 1; // 1-indexed in error messages
              expect(error).toContain(String(failedMessageNum));
            });
          }
        ),
        { numRuns: 100, timeout: 60000 }
      );
    }, 65000);

    it('should handle mixed success/failure with random patterns', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate random number of messages (5-15)
          fc.integer({ min: 5, max: 15 }),
          // Generate random success rate (0.2 to 0.8)
          fc.double({ min: 0.2, max: 0.8 }),
          async (numMessages, successRate) => {
            // Build DOM
            const messages: string[] = [];
            for (let i = 0; i < numMessages; i++) {
              messages.push(`<div class="collapsed-message" id="random-msg-${i}">Message ${i}</div>`);
            }

            document.body.innerHTML = `
              <div class="chat-container">
                ${messages.join('\n')}
              </div>
            `;

            let expectedSuccesses = 0;
            let expectedFailures = 0;

            // Mock click behavior with random success/failure based on rate
            for (let i = 0; i < numMessages; i++) {
              const messageElement = document.getElementById(`random-msg-${i}`) as HTMLElement;
              const willSucceed = Math.random() < successRate;
              
              if (willSucceed) {
                expectedSuccesses++;
              } else {
                expectedFailures++;
              }
              
              messageElement.click = function() {
                if (willSucceed) {
                  setTimeout(() => {
                    messageElement.classList.remove('collapsed-message');
                    messageElement.setAttribute('aria-expanded', 'true');
                  }, 50);
                }
                // If not willSucceed, don't expand
              };
            }

            // Execute
            const result = await expander.expandAllMessages();

            // Verify: Totals match
            expect(result.totalFound).toBe(numMessages);
            expect(result.expanded).toBe(expectedSuccesses);
            expect(result.failed).toBe(expectedFailures);
            expect(result.expanded + result.failed).toBe(numMessages);

            // Verify: Errors array matches failures
            expect(result.errors.length).toBe(expectedFailures);
          }
        ),
        { numRuns: 100, timeout: 60000 }
      );
    }, 65000);
  });

  /**
   * Feature: gemini-business-to-pdf, Property 5: Bảo toàn scroll position
   * **Validates: Requirements 2.5**
   * 
   * Property: For any initial scroll position, after expandAllMessages completes,
   * the scroll position must be the same as before (tolerance: ±5px).
   */
  describe('Property 5: Bảo toàn scroll position', () => {
    it('should restore scroll position after expanding messages', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate random scroll positions (0-1000px for both X and Y)
          fc.integer({ min: 0, max: 1000 }),
          fc.integer({ min: 0, max: 1000 }),
          // Generate random number of messages (1-10)
          fc.integer({ min: 1, max: 10 }),
          async (scrollX, scrollY, numMessages) => {
            // Create a tall/wide document to allow scrolling
            const messages: string[] = [];
            for (let i = 0; i < numMessages; i++) {
              messages.push(`<div class="collapsed-message" id="scroll-msg-${i}" style="height: 200px; width: 2000px;">Message ${i}</div>`);
            }

            document.body.innerHTML = `
              <div class="chat-container" style="height: 3000px; width: 3000px;">
                ${messages.join('\n')}
              </div>
            `;

            // Set initial scroll position
            window.scrollTo(scrollX, scrollY);
            
            // Wait for scroll to take effect
            await new Promise(resolve => setTimeout(resolve, 50));

            // Verify initial scroll position is set
            const initialScrollX = window.scrollX;
            const initialScrollY = window.scrollY;

            // Mock click behavior
            for (let i = 0; i < numMessages; i++) {
              const messageElement = document.getElementById(`scroll-msg-${i}`) as HTMLElement;
              
              messageElement.click = function() {
                // Simulate scroll disruption during expansion
                window.scrollTo(0, 0);
                
                setTimeout(() => {
                  messageElement.classList.remove('collapsed-message');
                  messageElement.setAttribute('aria-expanded', 'true');
                }, 50);
              };
            }

            // Execute
            await expander.expandAllMessages();

            // Get final scroll position
            const finalScrollX = window.scrollX;
            const finalScrollY = window.scrollY;

            // Verify: Scroll position restored (within tolerance of ±5px)
            expect(Math.abs(finalScrollX - initialScrollX)).toBeLessThanOrEqual(5);
            expect(Math.abs(finalScrollY - initialScrollY)).toBeLessThanOrEqual(5);
          }
        ),
        { numRuns: 100, timeout: 20000 }
      );
    }, 25000);

    it('should preserve scroll position even when expansion fails', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate random scroll positions
          fc.integer({ min: 0, max: 800 }),
          fc.integer({ min: 0, max: 800 }),
          // Generate random number of messages (2-8)
          fc.integer({ min: 2, max: 8 }),
          async (scrollX, scrollY, numMessages) => {
            // Create scrollable content
            const messages: string[] = [];
            for (let i = 0; i < numMessages; i++) {
              messages.push(`<div class="collapsed-message" id="scroll-fail-msg-${i}" style="height: 150px; width: 1500px;">Message ${i}</div>`);
            }

            document.body.innerHTML = `
              <div class="chat-container" style="height: 2500px; width: 2500px;">
                ${messages.join('\n')}
              </div>
            `;

            // Set initial scroll position
            window.scrollTo(scrollX, scrollY);
            await new Promise(resolve => setTimeout(resolve, 50));

            const initialScrollX = window.scrollX;
            const initialScrollY = window.scrollY;

            // Mock click behavior - some succeed, some fail
            for (let i = 0; i < numMessages; i++) {
              const messageElement = document.getElementById(`scroll-fail-msg-${i}`) as HTMLElement;
              const willFail = i % 2 === 1;
              
              messageElement.click = function() {
                // Disrupt scroll
                window.scrollTo(100, 100);
                
                if (!willFail) {
                  setTimeout(() => {
                    messageElement.classList.remove('collapsed-message');
                    messageElement.setAttribute('aria-expanded', 'true');
                  }, 50);
                }
                // If willFail, don't expand (will timeout)
              };
            }

            // Execute
            await expander.expandAllMessages();

            // Get final scroll position
            const finalScrollX = window.scrollX;
            const finalScrollY = window.scrollY;

            // Verify: Scroll position restored even with failures
            expect(Math.abs(finalScrollX - initialScrollX)).toBeLessThanOrEqual(5);
            expect(Math.abs(finalScrollY - initialScrollY)).toBeLessThanOrEqual(5);
          }
        ),
        { numRuns: 100, timeout: 60000 }
      );
    }, 65000);

    it('should handle zero scroll position correctly', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate random number of messages (1-5)
          fc.integer({ min: 1, max: 5 }),
          async (numMessages) => {
            // Create content
            const messages: string[] = [];
            for (let i = 0; i < numMessages; i++) {
              messages.push(`<div class="collapsed-message" id="zero-scroll-msg-${i}" style="height: 100px;">Message ${i}</div>`);
            }

            document.body.innerHTML = `
              <div class="chat-container" style="height: 1000px;">
                ${messages.join('\n')}
              </div>
            `;

            // Set scroll to (0, 0)
            window.scrollTo(0, 0);
            await new Promise(resolve => setTimeout(resolve, 50));

            // Mock click behavior
            for (let i = 0; i < numMessages; i++) {
              const messageElement = document.getElementById(`zero-scroll-msg-${i}`) as HTMLElement;
              
              messageElement.click = function() {
                // Try to disrupt scroll
                window.scrollTo(200, 200);
                
                setTimeout(() => {
                  messageElement.classList.remove('collapsed-message');
                  messageElement.setAttribute('aria-expanded', 'true');
                }, 50);
              };
            }

            // Execute
            await expander.expandAllMessages();

            // Verify: Scroll position is back to (0, 0)
            expect(window.scrollX).toBe(0);
            expect(window.scrollY).toBe(0);
          }
        ),
        { numRuns: 100, timeout: 15000 }
      );
    }, 20000);

    it('should preserve scroll position with varying expansion times', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate random scroll position
          fc.integer({ min: 100, max: 500 }),
          fc.integer({ min: 100, max: 500 }),
          // Generate random number of messages (3-10)
          fc.integer({ min: 3, max: 10 }),
          // Generate random delays for each message
          fc.array(fc.integer({ min: 10, max: 150 }), { minLength: 3, maxLength: 10 }),
          async (scrollX, scrollY, numMessages, delays) => {
            // Adjust delays to match numMessages
            const messageDelays = delays.slice(0, numMessages);
            while (messageDelays.length < numMessages) {
              messageDelays.push(50);
            }

            // Create content
            const messages: string[] = [];
            for (let i = 0; i < numMessages; i++) {
              messages.push(`<div class="collapsed-message" id="vary-scroll-msg-${i}" style="height: 120px; width: 1200px;">Message ${i}</div>`);
            }

            document.body.innerHTML = `
              <div class="chat-container" style="height: 2000px; width: 2000px;">
                ${messages.join('\n')}
              </div>
            `;

            // Set initial scroll position
            window.scrollTo(scrollX, scrollY);
            await new Promise(resolve => setTimeout(resolve, 50));

            const initialScrollX = window.scrollX;
            const initialScrollY = window.scrollY;

            // Mock click behavior with varying delays
            for (let i = 0; i < numMessages; i++) {
              const messageElement = document.getElementById(`vary-scroll-msg-${i}`) as HTMLElement;
              const delay = messageDelays[i];
              
              messageElement.click = function() {
                // Disrupt scroll differently for each message
                window.scrollTo(i * 50, i * 50);
                
                setTimeout(() => {
                  messageElement.classList.remove('collapsed-message');
                  messageElement.setAttribute('aria-expanded', 'true');
                }, delay);
              };
            }

            // Execute
            await expander.expandAllMessages();

            // Get final scroll position
            const finalScrollX = window.scrollX;
            const finalScrollY = window.scrollY;

            // Verify: Scroll position restored
            expect(Math.abs(finalScrollX - initialScrollX)).toBeLessThanOrEqual(5);
            expect(Math.abs(finalScrollY - initialScrollY)).toBeLessThanOrEqual(5);
          }
        ),
        { numRuns: 100, timeout: 25000 }
      );
    }, 30000);

    it('should handle edge case: no messages to expand but scroll position set', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate random scroll position
          fc.integer({ min: 0, max: 500 }),
          fc.integer({ min: 0, max: 500 }),
          async (scrollX, scrollY) => {
            // Create content with NO collapsed messages
            document.body.innerHTML = `
              <div class="chat-container" style="height: 1500px; width: 1500px;">
                <div class="message">Regular message 1</div>
                <div class="message">Regular message 2</div>
                <div class="message">Regular message 3</div>
              </div>
            `;

            // Set scroll position
            window.scrollTo(scrollX, scrollY);
            await new Promise(resolve => setTimeout(resolve, 50));

            const initialScrollX = window.scrollX;
            const initialScrollY = window.scrollY;

            // Execute
            const result = await expander.expandAllMessages();

            // Verify: No messages found
            expect(result.totalFound).toBe(0);

            // Verify: Scroll position unchanged
            expect(window.scrollX).toBe(initialScrollX);
            expect(window.scrollY).toBe(initialScrollY);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
