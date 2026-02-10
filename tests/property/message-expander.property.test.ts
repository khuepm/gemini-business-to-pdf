/**
 * Property-based tests for MessageExpander
 * Feature: gemini-business-to-pdf
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { MessageExpander } from '../../src/content/message-expander';

describe('MessageExpander - Property Tests', () => {
  let expander: MessageExpander;
  let testContainer: HTMLDivElement;

  beforeEach(() => {
    // Create a dedicated test container
    testContainer = document.createElement('div');
    testContainer.id = 'test-container';
    document.body.appendChild(testContainer);
    
    expander = new MessageExpander();
  });

  afterEach(() => {
    // Remove the test container and all its children
    if (testContainer && testContainer.parentNode) {
      testContainer.parentNode.removeChild(testContainer);
    }
    // Clear entire body as backup
    document.body.innerHTML = '';
  });

  /**
   * Feature: gemini-business-to-pdf, Property 1: Tìm tất cả collapsed messages
   * **Validates: Requirements 2.1**
   * 
   * Property: Với bất kỳ DOM state nào chứa chat container, 
   * hàm findCollapsedMessages phải trả về tất cả các message elements 
   * có trạng thái collapsed, không bỏ sót message nào.
   */
  it('Property 1: should find all collapsed messages in any DOM structure', () => {
    fc.assert(
      fc.property(
        // Generate random number of collapsed messages (0-20)
        fc.integer({ min: 0, max: 20 }),
        // Generate random number of expanded messages (0-20)
        fc.integer({ min: 0, max: 20 }),
        // Generate random collapsed indicator type
        fc.constantFrom('class', 'attribute', 'both'),
        (collapsedCount, expandedCount, indicatorType) => {
          // Setup: Create DOM with varying numbers of collapsed and expanded messages
          const container = document.createElement('div');
          container.className = 'chat-container';
          
          const collapsedElements: HTMLElement[] = [];
          
          // Create collapsed messages
          for (let i = 0; i < collapsedCount; i++) {
            const message = document.createElement('div');
            message.className = 'message';
            
            // Apply collapsed indicator based on type
            if (indicatorType === 'class' || indicatorType === 'both') {
              message.classList.add('collapsed');
            }
            if (indicatorType === 'attribute' || indicatorType === 'both') {
              message.setAttribute('data-collapsed', 'true');
            }
            
            message.textContent = `Collapsed message ${i}`;
            container.appendChild(message);
            collapsedElements.push(message);
          }
          
          // Create expanded messages (should not be found)
          for (let i = 0; i < expandedCount; i++) {
            const message = document.createElement('div');
            message.className = 'message expanded';
            message.textContent = `Expanded message ${i}`;
            container.appendChild(message);
          }
          
          testContainer.appendChild(container);
          
          // Execute: Find collapsed messages
          const found = expander.findCollapsedMessages();
          
          // Verify: All collapsed messages are found, no more, no less
          expect(found.length).toBe(collapsedCount);
          
          // Verify: Each found element is actually collapsed
          found.forEach(element => {
            expect(
              element.classList.contains('collapsed') ||
              element.getAttribute('data-collapsed') === 'true'
            ).toBe(true);
          });
          
          // Verify: All collapsed elements we created are in the found list
          collapsedElements.forEach(collapsedElement => {
            expect(found).toContain(collapsedElement);
          });
          
          // Cleanup for next iteration
          testContainer.innerHTML = '';
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: gemini-business-to-pdf, Property 2: Mở rộng messages thành công
   * **Validates: Requirements 2.2**
   * 
   * Property: Với bất kỳ collapsed message nào, sau khi gọi expandMessage, 
   * message đó phải chuyển sang trạng thái expanded (không còn collapsed).
   */
  it('Property 2: should successfully expand any collapsed message', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random collapsed indicator type
        fc.constantFrom('class', 'attribute', 'both'),
        async (indicatorType) => {
          // Setup: Create a collapsed message
          const message = document.createElement('div');
          message.className = 'message';
          
          if (indicatorType === 'class' || indicatorType === 'both') {
            message.classList.add('collapsed');
          }
          if (indicatorType === 'attribute' || indicatorType === 'both') {
            message.setAttribute('data-collapsed', 'true');
          }
          
          message.textContent = 'Test collapsed message';
          document.body.appendChild(message);
          
          // Simulate click behavior: remove collapsed state when clicked
          message.addEventListener('click', () => {
            message.classList.remove('collapsed');
            message.removeAttribute('data-collapsed');
          });
          
          // Verify message is initially collapsed
          expect(expander.isCollapsed(message)).toBe(true);
          
          // Execute: Expand the message
          await expander.expandMessage(message);
          
          // Verify: Message is no longer collapsed
          expect(expander.isCollapsed(message)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: gemini-business-to-pdf, Property 3: Đợi tất cả messages mở rộng
   * **Validates: Requirements 2.3**
   * 
   * Property: Với bất kỳ tập hợp collapsed messages nào, 
   * hàm expandAllMessages chỉ được return khi tất cả messages 
   * đã hoàn tất việc mở rộng (hoặc timeout).
   */
  it('Property 3: should wait for all messages to expand before returning', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random number of messages (1-5 for reasonable test time)
        fc.integer({ min: 1, max: 5 }),
        async (messageCount) => {
          // Setup: Create multiple collapsed messages
          const messages: HTMLElement[] = [];
          
          for (let i = 0; i < messageCount; i++) {
            const message = document.createElement('div');
            message.className = 'message collapsed';
            message.setAttribute('data-collapsed', 'true');
            message.textContent = `Message ${i}`;
            
            // Simulate async expansion with random delay
            message.addEventListener('click', () => {
              setTimeout(() => {
                message.classList.remove('collapsed');
                message.removeAttribute('data-collapsed');
              }, Math.random() * 50); // Reduced delay 0-50ms
            });
            
            document.body.appendChild(message);
            messages.push(message);
          }
          
          // Execute: Expand all messages
          const result = await expander.expandAllMessages();
          
          // Verify: All messages are expanded after function returns
          messages.forEach(message => {
            expect(expander.isCollapsed(message)).toBe(false);
          });
          
          // Verify: Result reflects all messages were processed
          expect(result.totalFound).toBe(messageCount);
          expect(result.expanded + result.failed).toBe(messageCount);
        }
      ),
      { numRuns: 30, timeout: 15000 } // Reduced runs and increased timeout
    );
  }, 20000); // Increased test timeout

  /**
   * Feature: gemini-business-to-pdf, Property 4: Xử lý lỗi expansion gracefully
   * **Validates: Requirements 2.4**
   * 
   * Property: Với bất kỳ tập hợp messages nào trong đó có một số messages 
   * không thể expand, hàm expandAllMessages vẫn phải xử lý thành công 
   * các messages còn lại và trả về thông tin chi tiết về failures.
   */
  it('Property 4: should handle expansion errors gracefully', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random number of successful and failing messages (reduced for speed)
        fc.integer({ min: 1, max: 2 }),
        fc.integer({ min: 1, max: 2 }),
        async (successCount, failCount) => {
          // Clear test container before this iteration
          testContainer.innerHTML = '';
          
          // Setup: Create messages that will succeed and fail
          const allMessages: HTMLElement[] = [];
          
          // Create messages that will expand successfully
          for (let i = 0; i < successCount; i++) {
            const message = document.createElement('div');
            message.className = 'message collapsed';
            message.addEventListener('click', () => {
              // Immediate expansion
              message.classList.remove('collapsed');
            });
            testContainer.appendChild(message);
            allMessages.push(message);
          }
          
          // Create messages that will fail (no click handler, will timeout)
          for (let i = 0; i < failCount; i++) {
            const message = document.createElement('div');
            message.className = 'message collapsed';
            // No click handler - will timeout
            testContainer.appendChild(message);
            allMessages.push(message);
          }
          
          // Execute: Expand all messages
          const result = await expander.expandAllMessages();
          
          // Verify: Total found matches all messages
          expect(result.totalFound).toBe(successCount + failCount);
          
          // Verify: Some succeeded and some failed
          expect(result.expanded).toBeGreaterThan(0);
          expect(result.failed).toBeGreaterThan(0);
          
          // Verify: Expanded + failed = total
          expect(result.expanded + result.failed).toBe(successCount + failCount);
          
          // Verify: Errors array has entries for failed messages
          expect(result.errors.length).toBe(failCount);
          
          // Cleanup for next iteration
          testContainer.innerHTML = '';
        }
      ),
      { numRuns: 10, timeout: 30000 } // Reduced runs and increased timeout
    );
  }, 35000); // Increased test timeout

  /**
   * Feature: gemini-business-to-pdf, Property 5: Bảo toàn scroll position
   * **Validates: Requirements 2.5**
   * 
   * Property: Với bất kỳ scroll position ban đầu nào, 
   * sau khi expandAllMessages hoàn tất, scroll position phải 
   * giống như ban đầu (tolerance: ±5px).
   */
  it('Property 5: should preserve scroll position after expanding all messages', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random scroll positions
        fc.integer({ min: 0, max: 1000 }),
        fc.integer({ min: 0, max: 1000 }),
        // Generate random number of messages
        fc.integer({ min: 1, max: 5 }),
        async (scrollX, scrollY, messageCount) => {
          // Setup: Create tall content to enable scrolling
          const tallDiv = document.createElement('div');
          tallDiv.style.height = '3000px';
          tallDiv.style.width = '3000px';
          document.body.appendChild(tallDiv);
          
          // Create collapsed messages
          for (let i = 0; i < messageCount; i++) {
            const message = document.createElement('div');
            message.className = 'message collapsed';
            message.addEventListener('click', () => {
              message.classList.remove('collapsed');
            });
            document.body.appendChild(message);
          }
          
          // Set initial scroll position
          window.scrollTo(scrollX, scrollY);
          
          // Wait for scroll to settle
          await new Promise(resolve => setTimeout(resolve, 50));
          
          const initialScrollX = window.scrollX;
          const initialScrollY = window.scrollY;
          
          // Execute: Expand all messages
          await expander.expandAllMessages();
          
          // Verify: Scroll position is preserved (within tolerance)
          const finalScrollX = window.scrollX;
          const finalScrollY = window.scrollY;
          
          expect(Math.abs(finalScrollX - initialScrollX)).toBeLessThanOrEqual(5);
          expect(Math.abs(finalScrollY - initialScrollY)).toBeLessThanOrEqual(5);
        }
      ),
      { numRuns: 50 }
    );
  });
});
