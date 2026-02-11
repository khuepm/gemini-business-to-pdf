/**
 * Property-based tests for large conversation handling
 * Feature: gemini-business-to-pdf
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { ExportController } from '../../src/content/export-controller';
import { MessageExpander } from '../../src/content/message-expander';
import { ContentExtractor } from '../../src/content/content-extractor';
import { TitleExtractor } from '../../src/content/title-extractor';

describe('Large Conversations - Property Tests', () => {
  let testContainer: HTMLDivElement;

  beforeEach(() => {
    // Create a dedicated test container
    testContainer = document.createElement('div');
    testContainer.id = 'test-container';
    document.body.appendChild(testContainer);
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
   * Feature: gemini-business-to-pdf, Property 18: Xử lý large conversations
   * **Validates: Requirements 7.4**
   * 
   * Property: Với bất kỳ chat conversation nào có hơn 100 messages, 
   * extension phải xử lý thành công mà không gây timeout hoặc crash.
   * 
   * Test này kiểm tra toàn bộ flow từ message expansion đến content extraction
   * với số lượng messages lớn (100-500).
   */
  it('Property 18: should handle large conversations (100-500 messages) without timeout', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random number of messages between 100 and 500
        fc.integer({ min: 100, max: 500 }),
        // Generate random ratio of user vs gemini messages
        fc.double({ min: 0.3, max: 0.7 }),
        // Generate random percentage of collapsed messages
        fc.double({ min: 0.2, max: 0.8 }),
        async (totalMessages, userRatio, collapsedRatio) => {
          // Clear test container
          testContainer.innerHTML = '';
          
          // Setup: Create chat container with large number of messages
          const chatContainer = document.createElement('div');
          chatContainer.className = 'chat-container';
          
          const userMessageCount = Math.floor(totalMessages * userRatio);
          const geminiMessageCount = totalMessages - userMessageCount;
          const collapsedCount = Math.floor(totalMessages * collapsedRatio);
          
          const messages: HTMLElement[] = [];
          let collapsedCreated = 0;
          
          // Create user messages
          for (let i = 0; i < userMessageCount; i++) {
            const message = document.createElement('div');
            message.className = 'message user-message';
            
            // Some messages are collapsed
            const shouldBeCollapsed = collapsedCreated < collapsedCount && Math.random() < collapsedRatio;
            if (shouldBeCollapsed) {
              message.classList.add('collapsed');
              message.setAttribute('data-collapsed', 'true');
              collapsedCreated++;
              
              // Add click handler for expansion
              message.addEventListener('click', () => {
                message.classList.remove('collapsed');
                message.removeAttribute('data-collapsed');
              });
            }
            
            // Add realistic content with various formatting
            const contentVariations = [
              `<p>User message ${i}: This is a test message with <strong>bold text</strong>.</p>`,
              `<p>Question ${i}: Can you help me with <em>this problem</em>?</p>`,
              `<div><p>Message ${i}</p><ul><li>Point 1</li><li>Point 2</li></ul></div>`,
              `<p>Code example ${i}: <code>const x = ${i};</code></p>`
            ];
            message.innerHTML = contentVariations[i % contentVariations.length];
            
            chatContainer.appendChild(message);
            messages.push(message);
          }
          
          // Create gemini messages
          for (let i = 0; i < geminiMessageCount; i++) {
            const message = document.createElement('div');
            message.className = 'message gemini-message';
            
            // Add realistic content with various formatting
            const contentVariations = [
              `<p>Response ${i}: Here's the answer with <strong>important details</strong>.</p>`,
              `<div><p>Explanation ${i}:</p><ol><li>First step</li><li>Second step</li></ol></div>`,
              `<pre><code>function example${i}() {\n  return ${i};\n}</code></pre>`,
              `<p>Analysis ${i}: <em>Consider this approach</em> for better results.</p>`,
              `<table><tr><th>Item</th><th>Value</th></tr><tr><td>Data ${i}</td><td>${i * 10}</td></tr></table>`
            ];
            message.innerHTML = contentVariations[i % contentVariations.length];
            
            chatContainer.appendChild(message);
            messages.push(message);
          }
          
          testContainer.appendChild(chatContainer);
          
          // Add title element
          const titleElement = document.createElement('h1');
          titleElement.className = 'chat-title';
          titleElement.textContent = `Large Conversation Test - ${totalMessages} messages`;
          testContainer.appendChild(titleElement);
          
          // Track start time to verify no timeout
          const startTime = Date.now();
          
          // Execute: Process large conversation through the full pipeline
          
          // Step 1: Expand all collapsed messages
          const expander = new MessageExpander();
          const expandResult = await expander.expandAllMessages();
          
          // Verify expansion completed
          expect(expandResult.totalFound).toBeGreaterThanOrEqual(0);
          expect(expandResult.expanded + expandResult.failed).toBe(expandResult.totalFound);
          
          // Step 2: Extract all content
          const extractor = new ContentExtractor();
          const chatContent = extractor.extractChatContent();
          
          // Verify all messages were extracted
          expect(chatContent.messages.length).toBe(totalMessages);
          expect(chatContent.metadata?.totalMessages).toBe(totalMessages);
          
          // Verify message distribution
          const extractedUserCount = chatContent.messages.filter(m => m.sender === 'user').length;
          const extractedGeminiCount = chatContent.messages.filter(m => m.sender === 'gemini').length;
          expect(extractedUserCount).toBe(userMessageCount);
          expect(extractedGeminiCount).toBe(geminiMessageCount);
          
          // Step 3: Extract title
          const titleExtractor = new TitleExtractor();
          const title = titleExtractor.extractTitle();
          expect(title).toBeTruthy();
          expect(title).toContain(`${totalMessages} messages`);
          
          // Step 4: Generate filename
          const filename = titleExtractor.generateFilename(title);
          expect(filename).toBeTruthy();
          expect(filename.endsWith('.pdf')).toBe(true);
          
          // Verify processing time is reasonable (should complete within 30 seconds)
          const processingTime = Date.now() - startTime;
          expect(processingTime).toBeLessThan(30000);
          
          // Verify no memory issues by checking all messages are still accessible
          expect(messages.length).toBe(totalMessages);
          messages.forEach(msg => {
            expect(msg.textContent || msg.innerHTML).toBeTruthy();
          });
          
          // Cleanup
          testContainer.innerHTML = '';
        }
      ),
      { numRuns: 10, timeout: 60000 } // 10 runs with 60 second timeout per run
    );
  }, 120000); // 2 minute test timeout
});
