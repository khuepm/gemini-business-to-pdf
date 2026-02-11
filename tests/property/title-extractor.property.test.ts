/**
 * Property-based tests for TitleExtractor
 * Feature: gemini-business-to-pdf
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { TitleExtractor } from '../../src/content/title-extractor';

describe('TitleExtractor - Property Tests', () => {
  let extractor: TitleExtractor;
  let testContainer: HTMLDivElement;

  beforeEach(() => {
    // Create a dedicated test container
    testContainer = document.createElement('div');
    testContainer.id = 'test-container';
    document.body.appendChild(testContainer);
    
    extractor = new TitleExtractor();
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
   * Feature: gemini-business-to-pdf, Property 10: Trích xuất title thành công
   * **Validates: Requirements 4.1**
   * 
   * Property: Với bất kỳ DOM state nào có chat title element, 
   * hàm extractTitle phải tìm và trả về title text chính xác.
   */
  it('Property 10: should extract title correctly from any DOM state', () => {
    fc.assert(
      fc.property(
        // Generate random title text (including empty, whitespace, unicode, special chars)
        fc.oneof(
          fc.string({ minLength: 1, maxLength: 200 }), // Regular strings
          fc.constant(''), // Empty string
          fc.constant('   '), // Whitespace only
          fc.constant('Title with 中文 characters'), // Unicode
          fc.constant('Title with émojis 🚀'), // Emojis
          fc.constant('Title\nwith\nnewlines'), // Newlines
          fc.constant('Title\twith\ttabs') // Tabs
        ),
        // Generate random selector type to use
        fc.constantFrom('chat-title', 'data-test-id', 'title', 'conversation-title'),
        // Generate random element type
        fc.constantFrom('h1', 'div', 'span', 'p'),
        // Generate whether to add extra whitespace
        fc.boolean(),
        (titleText, selectorType, elementType, addWhitespace) => {
          // Setup: Create DOM with title element
          const titleElement = document.createElement(elementType);
          
          // Apply the appropriate selector
          switch (selectorType) {
            case 'chat-title':
              titleElement.className = 'chat-title';
              break;
            case 'data-test-id':
              titleElement.setAttribute('data-test-id', 'chat-title');
              break;
            case 'title':
              titleElement.className = 'title';
              if (elementType !== 'h1') {
                // Skip this case if not h1, as selector is 'h1.title'
                return;
              }
              break;
            case 'conversation-title':
              titleElement.className = 'conversation-title';
              break;
          }
          
          // Set title text with optional extra whitespace
          const textToSet = addWhitespace ? `  ${titleText}  ` : titleText;
          titleElement.textContent = textToSet;
          
          testContainer.appendChild(titleElement);
          
          // Execute: Extract title
          const extractedTitle = extractor.extractTitle();
          
          // Verify: Title is extracted correctly
          const expectedTitle = titleText.trim();
          
          if (expectedTitle === '') {
            // Empty or whitespace-only titles should return null
            expect(extractedTitle).toBeNull();
          } else {
            // Non-empty titles should be extracted and trimmed
            expect(extractedTitle).toBe(expectedTitle);
          }
          
          // Cleanup for next iteration
          testContainer.innerHTML = '';
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: gemini-business-to-pdf, Property 10: Trích xuất title thành công (No title case)
   * **Validates: Requirements 4.1**
   * 
   * Property: Với bất kỳ DOM state nào không có chat title element,
   * hàm extractTitle phải trả về null.
   */
  it('Property 10: should return null when no title element exists', () => {
    fc.assert(
      fc.property(
        // Generate random number of non-title elements
        fc.integer({ min: 0, max: 10 }),
        // Generate random element types
        fc.array(fc.constantFrom('div', 'span', 'p', 'h2', 'h3'), { maxLength: 10 }),
        (elementCount, elementTypes) => {
          // Setup: Create DOM without title element
          for (let i = 0; i < elementCount && i < elementTypes.length; i++) {
            const element = document.createElement(elementTypes[i]);
            element.className = 'not-a-title';
            element.textContent = `Random content ${i}`;
            testContainer.appendChild(element);
          }
          
          // Execute: Extract title
          const extractedTitle = extractor.extractTitle();
          
          // Verify: Should return null when no title element exists
          expect(extractedTitle).toBeNull();
          
          // Cleanup for next iteration
          testContainer.innerHTML = '';
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: gemini-business-to-pdf, Property 10: Trích xuất title thành công (Nested elements)
   * **Validates: Requirements 4.1**
   * 
   * Property: Với bất kỳ title element nào chứa nested elements với non-whitespace content,
   * hàm extractTitle phải trích xuất toàn bộ text content.
   */
  it('Property 10: should extract title from elements with nested content', () => {
    fc.assert(
      fc.property(
        // Generate random text parts with at least one non-whitespace character (trimmed)
        fc.array(fc.string({ minLength: 1, maxLength: 50 }).map(s => s.trim()).filter(s => s !== ''), { minLength: 1, maxLength: 5 }),
        // Generate random nested element types
        fc.array(fc.constantFrom('span', 'strong', 'em', 'b', 'i'), { minLength: 1, maxLength: 5 }),
        (textParts, nestedTypes) => {
          // Setup: Create title element with nested elements
          const titleElement = document.createElement('h1');
          titleElement.className = 'chat-title';
          
          // Add text parts with nested elements
          textParts.forEach((text, index) => {
            if (index < nestedTypes.length) {
              const nested = document.createElement(nestedTypes[index]);
              nested.textContent = text;
              titleElement.appendChild(nested);
            } else {
              titleElement.appendChild(document.createTextNode(text));
            }
            
            // Add space between parts
            if (index < textParts.length - 1) {
              titleElement.appendChild(document.createTextNode(' '));
            }
          });
          
          testContainer.appendChild(titleElement);
          
          // Execute: Extract title
          const extractedTitle = extractor.extractTitle();
          
          // Verify: Should extract all text content
          expect(extractedTitle).toBeTruthy();
          
          // Verify: All text parts are present in extracted title
          textParts.forEach(text => {
            expect(extractedTitle).toContain(text);
          });
          
          // Cleanup for next iteration
          testContainer.innerHTML = '';
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: gemini-business-to-pdf, Property 10: Trích xuất title thành công (Multiple title elements)
   * **Validates: Requirements 4.1**
   * 
   * Property: Với bất kỳ DOM state nào có multiple title elements,
   * hàm extractTitle phải trả về title từ element đầu tiên match selector.
   */
  it('Property 10: should extract title from first matching element when multiple exist', () => {
    fc.assert(
      fc.property(
        // Generate random number of title elements (2-5)
        fc.integer({ min: 2, max: 5 }),
        // Generate random titles for each element
        fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 2, maxLength: 5 }),
        (titleCount, titles) => {
          // Ensure we have enough titles
          if (titles.length < titleCount) {
            return;
          }
          
          // Setup: Create multiple title elements
          for (let i = 0; i < titleCount; i++) {
            const titleElement = document.createElement('h1');
            titleElement.className = 'chat-title';
            titleElement.textContent = titles[i];
            testContainer.appendChild(titleElement);
          }
          
          // Execute: Extract title
          const extractedTitle = extractor.extractTitle();
          
          // Verify: Should extract title from first element
          expect(extractedTitle).toBe(titles[0].trim());
          
          // Cleanup for next iteration
          testContainer.innerHTML = '';
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: gemini-business-to-pdf, Property 10: Trích xuất title thành công (Error handling)
   * **Validates: Requirements 4.1**
   * 
   * Property: Với bất kỳ error nào xảy ra trong quá trình extraction,
   * hàm extractTitle phải handle gracefully và trả về null.
   */
  it('Property 10: should handle errors gracefully and return null', () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        (shouldThrowError) => {
          if (shouldThrowError) {
            // Setup: Create a scenario that might cause errors
            // For example, a title element with problematic content
            const titleElement = document.createElement('h1');
            titleElement.className = 'chat-title';
            
            // Add a getter that throws an error
            Object.defineProperty(titleElement, 'textContent', {
              get: () => {
                throw new Error('Simulated error');
              }
            });
            
            testContainer.appendChild(titleElement);
            
            // Execute: Extract title (should not throw)
            const extractedTitle = extractor.extractTitle();
            
            // Verify: Should return null on error
            expect(extractedTitle).toBeNull();
          } else {
            // Normal case - should work fine
            const titleElement = document.createElement('h1');
            titleElement.className = 'chat-title';
            titleElement.textContent = 'Normal Title';
            testContainer.appendChild(titleElement);
            
            const extractedTitle = extractor.extractTitle();
            expect(extractedTitle).toBe('Normal Title');
          }
          
          // Cleanup for next iteration
          testContainer.innerHTML = '';
        }
      ),
      { numRuns: 100 }
    );
  });
});
