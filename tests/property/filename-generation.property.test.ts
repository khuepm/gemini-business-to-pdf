/**
 * Property-based tests for TitleExtractor.generateFilename
 * Feature: gemini-business-to-pdf
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { TitleExtractor } from '../../src/content/title-extractor';

describe('TitleExtractor.generateFilename - Property Tests', () => {
  let extractor: TitleExtractor;

  beforeEach(() => {
    extractor = new TitleExtractor();
  });

  /**
   * Feature: gemini-business-to-pdf, Property 11: Filename generation và sanitization
   * **Validates: Requirements 4.2, 4.4, 4.5**
   * 
   * Property: Với bất kỳ title string nào (bao gồm cả các ký tự không hợp lệ),
   * hàm generateFilename phải:
   * - Sử dụng title làm base filename nếu title tồn tại
   * - Loại bỏ tất cả ký tự không hợp lệ (/, \, :, *, ?, ", <, >, |)
   * - Giới hạn độ dài ở 100 ký tự
   * - Trả về filename hợp lệ với extension .pdf
   */
  it('Property 11: should generate valid filename for any input string', () => {
    fc.assert(
      fc.property(
        // Generate random strings including invalid characters, very long strings, etc.
        fc.oneof(
          fc.string({ minLength: 0, maxLength: 200 }), // Regular strings
          fc.string({ minLength: 100, maxLength: 500 }), // Very long strings
          fc.constant(''), // Empty string
          fc.constant('   '), // Whitespace only
          fc.constant('file/with\\invalid:chars*?<>|"'), // All invalid chars
          fc.constant('///\\\\\\:::***???<<<>>>|||"""'), // Multiple invalid chars
          fc.constant('Valid Title'), // Normal valid title
          fc.constant('Title with spaces and-dashes'), // Spaces and dashes
          fc.constant('中文标题'), // Unicode characters
          fc.constant('Título con acentos'), // Accented characters
          fc.constant('Title with émojis 🚀🎉'), // Emojis
          fc.constant('Title\nwith\nnewlines'), // Newlines
          fc.constant('Title\twith\ttabs'), // Tabs
          fc.constant('a'.repeat(200)), // Very long without spaces
          fc.constant('word '.repeat(50)), // Very long with spaces
          fc.constant('_'.repeat(150)), // Many underscores
          fc.constant('///'), // Only invalid chars
          fc.constant('file/path/to/document'), // Path-like string
          fc.constant('C:\\Users\\Documents\\file.txt'), // Windows path
          fc.constant('file:name?query=value'), // URL-like string
          fc.constant('file*with*asterisks'), // Asterisks
          fc.constant('file"with"quotes'), // Quotes
          fc.constant('file<with>brackets'), // Brackets
          fc.constant('file|with|pipes') // Pipes
        ),
        (inputTitle) => {
          // Execute: Generate filename
          const filename = extractor.generateFilename(inputTitle);
          
          // Verify 1: Filename is always truthy (never null/undefined/empty)
          expect(filename).toBeTruthy();
          expect(typeof filename).toBe('string');
          expect(filename.length).toBeGreaterThan(0);
          
          // Verify 2: Filename always ends with .pdf
          expect(filename.endsWith('.pdf')).toBe(true);
          
          // Verify 3: Filename (including .pdf) is not too long (max 104 chars: 100 + '.pdf')
          expect(filename.length).toBeLessThanOrEqual(104);
          
          // Verify 4: Filename contains no invalid characters
          // Invalid chars: / \ : * ? " < > |
          const invalidCharsRegex = /[\/\\:*?"<>|]/;
          expect(filename).not.toMatch(invalidCharsRegex);
          
          // Verify 5: If input has non-whitespace content, it should be used (after sanitization)
          const trimmedInput = inputTitle?.trim();
          if (trimmedInput && trimmedInput.length > 0) {
            // Check if the input has any valid characters (not just invalid chars)
            const hasValidChars = /[^\/\\:*?"<>|\s]/.test(trimmedInput);
            
            if (hasValidChars) {
              // The filename should not be a fallback (should not start with 'gemini-chat-')
              // unless all characters were invalid
              const sanitizedInput = trimmedInput.replace(/[\/\\:*?"<>|]/g, '_').replace(/[\s_]+/g, '_').replace(/^_+|_+$/g, '');
              
              if (sanitizedInput.length > 0) {
                // Should use the sanitized input, not fallback
                expect(filename).not.toMatch(/^gemini-chat-\d{8}-\d{6}\.pdf$/);
              }
            }
          }
          
          // Verify 6: If input is null, empty, or only whitespace, should use fallback format
          if (!trimmedInput || trimmedInput.length === 0) {
            // Should match fallback format: gemini-chat-YYYYMMDD-HHMMSS.pdf
            expect(filename).toMatch(/^gemini-chat-\d{8}-\d{6}\.pdf$/);
          }
          
          // Verify 7: Filename should not have leading/trailing underscores (except before .pdf)
          const filenameWithoutExt = filename.slice(0, -4); // Remove .pdf
          expect(filenameWithoutExt).not.toMatch(/^_/);
          expect(filenameWithoutExt).not.toMatch(/_$/);
          
          // Verify 8: Filename should not have multiple consecutive underscores
          expect(filenameWithoutExt).not.toMatch(/__+/);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: gemini-business-to-pdf, Property 11: Filename generation với null input
   * **Validates: Requirements 4.2, 4.3**
   * 
   * Property: Với null input, hàm generateFilename phải tạo fallback filename
   * theo format "gemini-chat-[timestamp].pdf"
   */
  it('Property 11: should generate fallback filename for null input', () => {
    fc.assert(
      fc.property(
        fc.constant(null),
        (inputTitle) => {
          // Execute: Generate filename with null
          const filename = extractor.generateFilename(inputTitle);
          
          // Verify: Should match fallback format
          expect(filename).toMatch(/^gemini-chat-\d{8}-\d{6}\.pdf$/);
          
          // Verify: Should have correct structure
          expect(filename).toBeTruthy();
          expect(filename.endsWith('.pdf')).toBe(true);
          
          // Verify: Timestamp should be valid
          const match = filename.match(/^gemini-chat-(\d{8})-(\d{6})\.pdf$/);
          expect(match).toBeTruthy();
          
          if (match) {
            const dateStr = match[1]; // YYYYMMDD
            const timeStr = match[2]; // HHMMSS
            
            // Verify date format
            expect(dateStr.length).toBe(8);
            const year = parseInt(dateStr.substring(0, 4));
            const month = parseInt(dateStr.substring(4, 6));
            const day = parseInt(dateStr.substring(6, 8));
            
            expect(year).toBeGreaterThanOrEqual(2020);
            expect(year).toBeLessThanOrEqual(2100);
            expect(month).toBeGreaterThanOrEqual(1);
            expect(month).toBeLessThanOrEqual(12);
            expect(day).toBeGreaterThanOrEqual(1);
            expect(day).toBeLessThanOrEqual(31);
            
            // Verify time format
            expect(timeStr.length).toBe(6);
            const hours = parseInt(timeStr.substring(0, 2));
            const minutes = parseInt(timeStr.substring(2, 4));
            const seconds = parseInt(timeStr.substring(4, 6));
            
            expect(hours).toBeGreaterThanOrEqual(0);
            expect(hours).toBeLessThanOrEqual(23);
            expect(minutes).toBeGreaterThanOrEqual(0);
            expect(minutes).toBeLessThanOrEqual(59);
            expect(seconds).toBeGreaterThanOrEqual(0);
            expect(seconds).toBeLessThanOrEqual(59);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: gemini-business-to-pdf, Property 11: Filename sanitization removes all invalid chars
   * **Validates: Requirements 4.4**
   * 
   * Property: Với bất kỳ string nào chứa invalid characters,
   * hàm generateFilename phải loại bỏ tất cả invalid chars
   */
  it('Property 11: should remove all invalid characters from filename', () => {
    fc.assert(
      fc.property(
        // Generate strings with guaranteed invalid characters
        fc.tuple(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          fc.array(fc.constantFrom('/', '\\', ':', '*', '?', '"', '<', '>', '|'), { minLength: 1, maxLength: 10 })
        ).map(([base, invalidChars]) => {
          // Insert invalid chars at random positions
          let result = base;
          invalidChars.forEach(char => {
            const pos = Math.floor(Math.random() * (result.length + 1));
            result = result.slice(0, pos) + char + result.slice(pos);
          });
          return result;
        }),
        (inputTitle) => {
          // Execute: Generate filename
          const filename = extractor.generateFilename(inputTitle);
          
          // Verify: No invalid characters in result
          const invalidCharsRegex = /[\/\\:*?"<>|]/;
          expect(filename).not.toMatch(invalidCharsRegex);
          
          // Verify: Filename is still valid
          expect(filename).toBeTruthy();
          expect(filename.endsWith('.pdf')).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: gemini-business-to-pdf, Property 11: Filename length constraint
   * **Validates: Requirements 4.5**
   * 
   * Property: Với bất kỳ string nào (dù rất dài), hàm generateFilename
   * phải giới hạn độ dài filename ở 100 ký tự (không tính .pdf)
   */
  it('Property 11: should limit filename length to 100 characters (excluding .pdf)', () => {
    fc.assert(
      fc.property(
        // Generate very long strings
        fc.oneof(
          fc.string({ minLength: 100, maxLength: 500 }),
          fc.constant('a'.repeat(200)),
          fc.constant('word '.repeat(100)),
          fc.constant('very_long_filename_'.repeat(20)),
          fc.constant('中'.repeat(150)) // Unicode chars
        ),
        (inputTitle) => {
          // Execute: Generate filename
          const filename = extractor.generateFilename(inputTitle);
          
          // Verify: Total length (including .pdf) should not exceed 104
          expect(filename.length).toBeLessThanOrEqual(104);
          
          // Verify: Filename without .pdf should not exceed 100
          const filenameWithoutExt = filename.slice(0, -4);
          expect(filenameWithoutExt.length).toBeLessThanOrEqual(100);
          
          // Verify: Still ends with .pdf
          expect(filename.endsWith('.pdf')).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: gemini-business-to-pdf, Property 11: Idempotency of sanitization
   * **Validates: Requirements 4.4**
   * 
   * Property: Applying generateFilename twice should produce the same result
   * (when using the same timestamp - we test the sanitization part)
   */
  it('Property 11: should produce consistent sanitization', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        (inputTitle) => {
          // Execute: Generate filename twice
          const filename1 = extractor.generateFilename(inputTitle);
          const filename2 = extractor.generateFilename(inputTitle);
          
          // If both are not fallback filenames (which include timestamp),
          // they should be identical
          const isFallback1 = filename1.match(/^gemini-chat-\d{8}-\d{6}\.pdf$/);
          const isFallback2 = filename2.match(/^gemini-chat-\d{8}-\d{6}\.pdf$/);
          
          if (!isFallback1 && !isFallback2) {
            // Both should be identical (same sanitization)
            expect(filename1).toBe(filename2);
          } else {
            // Both should be fallback format (might differ by timestamp if slow)
            expect(isFallback1).toBeTruthy();
            expect(isFallback2).toBeTruthy();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: gemini-business-to-pdf, Property 11: Whitespace handling
   * **Validates: Requirements 4.4**
   * 
   * Property: Multiple spaces and whitespace should be collapsed to single underscore
   */
  it('Property 11: should collapse multiple spaces to single underscore', () => {
    fc.assert(
      fc.property(
        // Generate strings with multiple spaces
        fc.tuple(
          fc.array(fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0), { minLength: 2, maxLength: 5 }),
          fc.integer({ min: 1, max: 5 })
        ).map(([words, spaceCount]) => {
          return words.join(' '.repeat(spaceCount));
        }),
        (inputTitle) => {
          // Execute: Generate filename
          const filename = extractor.generateFilename(inputTitle);
          
          // Verify: No multiple consecutive underscores
          const filenameWithoutExt = filename.slice(0, -4);
          expect(filenameWithoutExt).not.toMatch(/__+/);
          
          // Verify: No multiple consecutive spaces
          expect(filenameWithoutExt).not.toMatch(/\s\s+/);
          
          // Verify: Valid filename
          expect(filename.endsWith('.pdf')).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: gemini-business-to-pdf, Property 11: Edge case - only invalid characters
   * **Validates: Requirements 4.2, 4.3, 4.4**
   * 
   * Property: When input contains only invalid characters,
   * should generate fallback filename
   */
  it('Property 11: should generate fallback when input is only invalid characters', () => {
    fc.assert(
      fc.property(
        // Generate strings with only invalid characters
        fc.array(
          fc.constantFrom('/', '\\', ':', '*', '?', '"', '<', '>', '|', ' ', '\t', '\n'),
          { minLength: 1, maxLength: 20 }
        ).map(chars => chars.join('')),
        (inputTitle) => {
          // Execute: Generate filename
          const filename = extractor.generateFilename(inputTitle);
          
          // Verify: Should be fallback format (since no valid chars remain)
          expect(filename).toMatch(/^gemini-chat-\d{8}-\d{6}\.pdf$/);
          
          // Verify: Valid filename
          expect(filename).toBeTruthy();
          expect(filename.endsWith('.pdf')).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});
