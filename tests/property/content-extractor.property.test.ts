/**
 * Property-based tests for ContentExtractor
 * Feature: gemini-business-to-pdf
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { ContentExtractor } from '../../src/content/content-extractor';

describe('ContentExtractor - Property Tests', () => {
  let extractor: ContentExtractor;
  let testContainer: HTMLDivElement;

  beforeEach(() => {
    // Create a dedicated test container
    testContainer = document.createElement('div');
    testContainer.id = 'test-container';
    document.body.appendChild(testContainer);
    
    extractor = new ContentExtractor();
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
   * Feature: gemini-business-to-pdf, Property 7: Bảo toàn HTML structure
   * **Validates: Requirements 3.2**
   * 
   * Property: Với bất kỳ message element nào, HTML structure được extract 
   * phải tương đương với structure gốc (same tags, same nesting, same attributes).
   */
  it('Property 7: should preserve HTML structure for any message', () => {
    fc.assert(
      fc.property(
        // Generate random HTML structures with various tags and nesting
        fc.oneof(
          // Simple text with formatting
          fc.record({
            tag: fc.constantFrom('p', 'div', 'span'),
            content: fc.string({ minLength: 1, maxLength: 50 }).filter(s => !s.includes('<') && !s.includes('>')),
            formatting: fc.constantFrom('strong', 'em', 'u', 'none')
          }),
          // Nested structures
          fc.record({
            outerTag: fc.constantFrom('div', 'section', 'article'),
            innerTag: fc.constantFrom('p', 'span', 'div'),
            content: fc.string({ minLength: 1, maxLength: 50 }).filter(s => !s.includes('<') && !s.includes('>'))
          }),
          // Elements with attributes
          fc.record({
            tag: fc.constantFrom('div', 'span', 'p'),
            content: fc.string({ minLength: 1, maxLength: 50 }).filter(s => !s.includes('<') && !s.includes('>')),
            className: fc.constantFrom('highlight', 'important', 'note', ''),
            // Generate safe IDs without special HTML characters
            id: fc.option(fc.stringMatching(/^[a-zA-Z0-9_-]+$/), { nil: undefined })
          })
        ),
        (htmlSpec) => {
          // Create message element with generated HTML structure
          const messageElement = document.createElement('div');
          messageElement.className = 'message user-message';
          
          let htmlContent = '';
          
          if ('formatting' in htmlSpec) {
            // Simple formatted text
            const innerContent = htmlSpec.formatting !== 'none' 
              ? `<${htmlSpec.formatting}>${htmlSpec.content}</${htmlSpec.formatting}>`
              : htmlSpec.content;
            htmlContent = `<${htmlSpec.tag}>${innerContent}</${htmlSpec.tag}>`;
          } else if ('outerTag' in htmlSpec) {
            // Nested structure
            htmlContent = `<${htmlSpec.outerTag}><${htmlSpec.innerTag}>${htmlSpec.content}</${htmlSpec.innerTag}></${htmlSpec.outerTag}>`;
          } else if ('className' in htmlSpec) {
            // Element with attributes
            const classAttr = htmlSpec.className ? ` class="${htmlSpec.className}"` : '';
            const idAttr = htmlSpec.id ? ` id="${htmlSpec.id}"` : '';
            htmlContent = `<${htmlSpec.tag}${classAttr}${idAttr}>${htmlSpec.content}</${htmlSpec.tag}>`;
          }
          
          messageElement.innerHTML = htmlContent;
          
          // Store original structure for comparison
          const originalHTML = messageElement.innerHTML;
          const originalTagCount = (originalHTML.match(/<[^/][^>]*>/g) || []).length;
          
          // Execute: Extract message
          const message = extractor.extractMessage(messageElement);
          
          // Verify: HTML structure is preserved
          expect(message.content).toBeTruthy();
          
          // Check that the same tags exist in the extracted content
          const extractedTagCount = (message.content.match(/<[^/][^>]*>/g) || []).length;
          expect(extractedTagCount).toBe(originalTagCount);
          
          // Verify specific elements are preserved
          if ('formatting' in htmlSpec && htmlSpec.formatting !== 'none') {
            expect(message.content).toContain(`<${htmlSpec.formatting}>`);
            expect(message.content).toContain(`</${htmlSpec.formatting}>`);
          }
          
          if ('outerTag' in htmlSpec) {
            expect(message.content).toContain(`<${htmlSpec.outerTag}>`);
            expect(message.content).toContain(`<${htmlSpec.innerTag}>`);
          }
          
          if ('className' in htmlSpec && htmlSpec.className) {
            expect(message.content).toContain(`class="${htmlSpec.className}"`);
          }
          
          if ('id' in htmlSpec && htmlSpec.id) {
            expect(message.content).toContain(`id="${htmlSpec.id}"`);
          }
          
          // Cleanup
          testContainer.innerHTML = '';
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: gemini-business-to-pdf, Property 8: Bảo toàn tất cả formatting
   * **Validates: Requirements 3.3, 3.4, 3.5, 3.6**
   * 
   * Property: Với bất kỳ message nào chứa formatting (bold, italic, underline, 
   * links, code blocks, tables, lists), tất cả formatting này phải được giữ nguyên 
   * trong extracted HTML.
   */
  it('Property 8: should preserve all formatting types', () => {
    fc.assert(
      fc.property(
        // Generate random combinations of formatting types
        fc.record({
          hasBold: fc.boolean(),
          hasItalic: fc.boolean(),
          hasUnderline: fc.boolean(),
          hasLink: fc.boolean(),
          hasCode: fc.boolean(),
          hasCodeBlock: fc.boolean(),
          hasTable: fc.boolean(),
          hasList: fc.boolean(),
          text: fc.string({ minLength: 5, maxLength: 30 })
        }),
        (formatting) => {
          // Build HTML with selected formatting types
          const messageElement = document.createElement('div');
          messageElement.className = 'message gemini-message';
          
          let htmlParts: string[] = [];
          
          if (formatting.hasBold) {
            htmlParts.push(`<strong>${formatting.text}</strong>`);
          }
          
          if (formatting.hasItalic) {
            htmlParts.push(`<em>${formatting.text}</em>`);
          }
          
          if (formatting.hasUnderline) {
            htmlParts.push(`<u>${formatting.text}</u>`);
          }
          
          if (formatting.hasLink) {
            htmlParts.push(`<a href="https://example.com">${formatting.text}</a>`);
          }
          
          if (formatting.hasCode) {
            htmlParts.push(`<code>${formatting.text}</code>`);
          }
          
          if (formatting.hasCodeBlock) {
            htmlParts.push(`<pre><code>${formatting.text}</code></pre>`);
          }
          
          if (formatting.hasTable) {
            htmlParts.push(`<table><tr><th>Header</th></tr><tr><td>${formatting.text}</td></tr></table>`);
          }
          
          if (formatting.hasList) {
            const listType = formatting.text.length % 2 === 0 ? 'ul' : 'ol';
            htmlParts.push(`<${listType}><li>${formatting.text}</li></${listType}>`);
          }
          
          // If no formatting selected, add plain text
          if (htmlParts.length === 0) {
            htmlParts.push(`<p>${formatting.text}</p>`);
          }
          
          messageElement.innerHTML = htmlParts.join('\n');
          
          // Execute: Extract message
          const message = extractor.extractMessage(messageElement);
          
          // Verify: All formatting is preserved
          if (formatting.hasBold) {
            expect(message.content).toContain('<strong>');
            expect(message.content).toContain('</strong>');
          }
          
          if (formatting.hasItalic) {
            expect(message.content).toContain('<em>');
            expect(message.content).toContain('</em>');
          }
          
          if (formatting.hasUnderline) {
            expect(message.content).toContain('<u>');
            expect(message.content).toContain('</u>');
          }
          
          if (formatting.hasLink) {
            expect(message.content).toContain('<a href="https://example.com">');
            expect(message.content).toContain('</a>');
          }
          
          if (formatting.hasCode) {
            expect(message.content).toContain('<code>');
            expect(message.content).toContain('</code>');
          }
          
          if (formatting.hasCodeBlock) {
            expect(message.content).toContain('<pre>');
            expect(message.content).toContain('</pre>');
            expect(message.metadata?.hasCodeBlock).toBe(true);
          }
          
          if (formatting.hasTable) {
            expect(message.content).toContain('<table>');
            expect(message.content).toContain('<tr>');
            expect(message.content).toContain('<th>');
            expect(message.content).toContain('<td>');
            expect(message.content).toContain('</table>');
            expect(message.metadata?.hasTable).toBe(true);
          }
          
          if (formatting.hasList) {
            expect(message.content).toMatch(/<(ul|ol)>/);
            expect(message.content).toContain('<li>');
            expect(message.content).toMatch(/<\/(ul|ol)>/);
            expect(message.metadata?.hasList).toBe(true);
          }
          
          // Verify content text is preserved
          // Note: We only check if no formatting was applied (plain text case)
          // When formatting is applied, the text is wrapped in tags so we just verify the tags exist
          if (!formatting.hasBold && !formatting.hasItalic && !formatting.hasUnderline && 
              !formatting.hasLink && !formatting.hasCode && !formatting.hasCodeBlock && 
              !formatting.hasTable && !formatting.hasList) {
            // Plain text case - check the text is in the paragraph
            // HTML special characters will be escaped, so we need to check the text content
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = message.content;
            expect(tempDiv.textContent).toContain(formatting.text);
          }
          
          // Cleanup
          testContainer.innerHTML = '';
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: gemini-business-to-pdf, Property 9: Phân biệt sender chính xác
   * **Validates: Requirements 3.7**
   * 
   * Property: Với bất kỳ message element nào, hàm identifySender phải xác định 
   * đúng sender là 'user' hoặc 'gemini' dựa trên DOM structure/classes.
   */
  it('Property 9: should correctly identify sender for any message', () => {
    fc.assert(
      fc.property(
        // Generate random sender types and identification methods
        fc.record({
          sender: fc.constantFrom('user', 'gemini'),
          identificationMethod: fc.constantFrom('class', 'data-attribute', 'class-pattern'),
          content: fc.string({ minLength: 1, maxLength: 50 })
        }),
        (messageSpec) => {
          // Create message element with specified sender identification
          const messageElement = document.createElement('div');
          messageElement.className = 'message';
          messageElement.textContent = messageSpec.content;
          
          // Apply identification method
          if (messageSpec.identificationMethod === 'class') {
            if (messageSpec.sender === 'user') {
              messageElement.classList.add('user-message');
            } else {
              messageElement.classList.add('gemini-message');
            }
          } else if (messageSpec.identificationMethod === 'data-attribute') {
            if (messageSpec.sender === 'user') {
              messageElement.setAttribute('data-sender', 'user');
            } else {
              // Gemini can be identified by various attribute values
              const geminiValues = ['gemini', 'model', 'assistant'];
              const randomValue = geminiValues[messageSpec.content.length % geminiValues.length];
              messageElement.setAttribute('data-sender', randomValue);
            }
          } else if (messageSpec.identificationMethod === 'class-pattern') {
            if (messageSpec.sender === 'user') {
              // Various class patterns that indicate user
              const userPatterns = ['chat-message-user', 'user-bubble', 'message-from-user'];
              const pattern = userPatterns[messageSpec.content.length % userPatterns.length];
              messageElement.className = pattern;
            } else {
              // Various class patterns that indicate gemini/AI
              const geminiPatterns = ['chat-message-ai', 'model-response', 'assistant-message'];
              const pattern = geminiPatterns[messageSpec.content.length % geminiPatterns.length];
              messageElement.className = pattern;
            }
          }
          
          // Execute: Identify sender
          const identifiedSender = extractor.identifySender(messageElement);
          
          // Verify: Sender is correctly identified
          expect(identifiedSender).toBe(messageSpec.sender);
          
          // Cleanup
          testContainer.innerHTML = '';
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: gemini-business-to-pdf, Property 6: Trích xuất tất cả messages
   * **Validates: Requirements 3.1**
   * 
   * Property: Với bất kỳ chat container nào chứa N messages, 
   * hàm extractChatContent phải trả về đúng N messages, 
   * không bỏ sót message nào.
   */
  it('Property 6: should extract all messages from any chat container', () => {
    fc.assert(
      fc.property(
        // Generate random number of user messages (0-20)
        fc.integer({ min: 0, max: 20 }),
        // Generate random number of gemini messages (0-20)
        fc.integer({ min: 0, max: 20 }),
        // Generate random message content
        fc.array(fc.string({ minLength: 1, maxLength: 100 }), { minLength: 0, maxLength: 40 }),
        (userMessageCount, geminiMessageCount, messageContents) => {
          // Setup: Create chat container with varying numbers of messages
          const chatContainer = document.createElement('div');
          chatContainer.className = 'chat-container';
          
          const totalMessages = userMessageCount + geminiMessageCount;
          const createdMessages: HTMLElement[] = [];
          
          // Create user messages
          for (let i = 0; i < userMessageCount; i++) {
            const message = document.createElement('div');
            message.className = 'message user-message';
            const content = messageContents[i % messageContents.length] || `User message ${i}`;
            message.textContent = content;
            chatContainer.appendChild(message);
            createdMessages.push(message);
          }
          
          // Create gemini messages
          for (let i = 0; i < geminiMessageCount; i++) {
            const message = document.createElement('div');
            message.className = 'message gemini-message';
            const contentIndex = (userMessageCount + i) % messageContents.length;
            const content = messageContents[contentIndex] || `Gemini message ${i}`;
            message.textContent = content;
            chatContainer.appendChild(message);
            createdMessages.push(message);
          }
          
          testContainer.appendChild(chatContainer);
          
          // Execute: Extract chat content
          const result = extractor.extractChatContent();
          
          // Verify: All messages are extracted (no messages lost)
          expect(result.messages.length).toBe(totalMessages);
          
          // Verify: Metadata reflects correct counts
          expect(result.metadata?.totalMessages).toBe(totalMessages);
          expect(result.metadata?.userMessages).toBe(userMessageCount);
          expect(result.metadata?.geminiMessages).toBe(geminiMessageCount);
          
          // Verify: Each message has required properties
          result.messages.forEach(message => {
            expect(message).toHaveProperty('sender');
            expect(message).toHaveProperty('content');
            expect(['user', 'gemini']).toContain(message.sender);
            expect(typeof message.content).toBe('string');
          });
          
          // Verify: User and gemini message counts match
          const extractedUserCount = result.messages.filter(m => m.sender === 'user').length;
          const extractedGeminiCount = result.messages.filter(m => m.sender === 'gemini').length;
          expect(extractedUserCount).toBe(userMessageCount);
          expect(extractedGeminiCount).toBe(geminiMessageCount);
          
          // Cleanup for next iteration
          testContainer.innerHTML = '';
        }
      ),
      { numRuns: 100 }
    );
  });
});
