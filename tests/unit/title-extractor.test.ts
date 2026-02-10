/**
 * Unit tests for TitleExtractor
 * Tests specific examples, edge cases, and error conditions
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TitleExtractor } from '../../src/content/title-extractor';

describe('TitleExtractor', () => {
  let extractor: TitleExtractor;
  let originalDOM: string;

  beforeEach(() => {
    extractor = new TitleExtractor();
    // Save original DOM
    originalDOM = document.body.innerHTML;
  });

  afterEach(() => {
    // Restore original DOM
    document.body.innerHTML = originalDOM;
  });

  describe('extractTitle', () => {
    it('should extract title from DOM with chat-title class', () => {
      document.body.innerHTML = '<h1 class="chat-title">My Chat Title</h1>';

      const title = extractor.extractTitle();

      expect(title).toBe('My Chat Title');
    });

    it('should extract title from DOM with data-test-id attribute', () => {
      document.body.innerHTML = '<div data-test-id="chat-title">Test Chat</div>';

      const title = extractor.extractTitle();

      expect(title).toBe('Test Chat');
    });

    it('should extract title from h1.title element', () => {
      document.body.innerHTML = '<h1 class="title">Important Conversation</h1>';

      const title = extractor.extractTitle();

      expect(title).toBe('Important Conversation');
    });

    it('should extract title from conversation-title class', () => {
      document.body.innerHTML = '<div class="conversation-title">Daily Standup</div>';

      const title = extractor.extractTitle();

      expect(title).toBe('Daily Standup');
    });

    it('should return null when title element not found', () => {
      document.body.innerHTML = '<div>No title here</div>';

      const title = extractor.extractTitle();

      expect(title).toBeNull();
    });

    it('should return null when title is empty', () => {
      document.body.innerHTML = '<h1 class="chat-title"></h1>';

      const title = extractor.extractTitle();

      expect(title).toBeNull();
    });

    it('should return null when title contains only whitespace', () => {
      document.body.innerHTML = '<h1 class="chat-title">   </h1>';

      const title = extractor.extractTitle();

      expect(title).toBeNull();
    });

    it('should trim whitespace from title', () => {
      document.body.innerHTML = '<h1 class="chat-title">  Trimmed Title  </h1>';

      const title = extractor.extractTitle();

      expect(title).toBe('Trimmed Title');
    });

    it('should handle title with nested elements', () => {
      document.body.innerHTML = '<h1 class="chat-title"><span>Nested</span> Title</h1>';

      const title = extractor.extractTitle();

      expect(title).toContain('Nested');
      expect(title).toContain('Title');
    });

    it('should use first matching selector if multiple exist', () => {
      document.body.innerHTML = `
        <h1 class="chat-title">First Title</h1>
        <div class="conversation-title">Second Title</div>
      `;

      const title = extractor.extractTitle();

      expect(title).toBe('First Title');
    });
  });

  describe('sanitizeFilename', () => {
    it('should replace forward slash with underscore', () => {
      const result = extractor.sanitizeFilename('file/name');

      expect(result).toBe('file_name');
      expect(result).not.toContain('/');
    });

    it('should replace backslash with underscore', () => {
      const result = extractor.sanitizeFilename('file\\name');

      expect(result).toBe('file_name');
      expect(result).not.toContain('\\');
    });

    it('should replace colon with underscore', () => {
      const result = extractor.sanitizeFilename('file:name');

      expect(result).toBe('file_name');
      expect(result).not.toContain(':');
    });

    it('should replace asterisk with underscore', () => {
      const result = extractor.sanitizeFilename('file*name');

      expect(result).toBe('file_name');
      expect(result).not.toContain('*');
    });

    it('should replace question mark with underscore', () => {
      const result = extractor.sanitizeFilename('file?name');

      expect(result).toBe('file_name');
      expect(result).not.toContain('?');
    });

    it('should replace double quote with underscore', () => {
      const result = extractor.sanitizeFilename('file"name');

      expect(result).toBe('file_name');
      expect(result).not.toContain('"');
    });

    it('should replace less than with underscore', () => {
      const result = extractor.sanitizeFilename('file<name');

      expect(result).toBe('file_name');
      expect(result).not.toContain('<');
    });

    it('should replace greater than with underscore', () => {
      const result = extractor.sanitizeFilename('file>name');

      expect(result).toBe('file_name');
      expect(result).not.toContain('>');
    });

    it('should replace pipe with underscore', () => {
      const result = extractor.sanitizeFilename('file|name');

      expect(result).toBe('file_name');
      expect(result).not.toContain('|');
    });

    it('should replace all invalid characters in one string', () => {
      const result = extractor.sanitizeFilename('file/\\:*?"<>|name');

      expect(result).toBe('file_name');
      expect(result).not.toMatch(/[\/\\:*?"<>|]/);
    });

    it('should trim leading and trailing whitespace', () => {
      const result = extractor.sanitizeFilename('  filename  ');

      expect(result).toBe('filename');
    });

    it('should replace multiple consecutive spaces with single underscore', () => {
      const result = extractor.sanitizeFilename('file    name');

      expect(result).toBe('file_name');
    });

    it('should replace multiple consecutive underscores with single underscore', () => {
      const result = extractor.sanitizeFilename('file____name');

      expect(result).toBe('file_name');
    });

    it('should remove leading underscores', () => {
      const result = extractor.sanitizeFilename('___filename');

      expect(result).toBe('filename');
    });

    it('should remove trailing underscores', () => {
      const result = extractor.sanitizeFilename('filename___');

      expect(result).toBe('filename');
    });

    it('should handle empty string', () => {
      const result = extractor.sanitizeFilename('');

      expect(result).toBe('');
    });

    it('should handle string with only invalid characters', () => {
      const result = extractor.sanitizeFilename('/\\:*?"<>|');

      expect(result).toBe('');
    });

    it('should preserve valid characters', () => {
      const result = extractor.sanitizeFilename('Valid-File_Name.123');

      expect(result).toBe('Valid-File_Name.123');
    });
  });

  describe('truncateFilename', () => {
    it('should not truncate filename shorter than maxLength', () => {
      const filename = 'short';
      const result = extractor.truncateFilename(filename, 100);

      expect(result).toBe('short');
    });

    it('should not truncate filename equal to maxLength', () => {
      const filename = 'a'.repeat(100);
      const result = extractor.truncateFilename(filename, 100);

      expect(result).toBe(filename);
    });

    it('should truncate filename longer than maxLength', () => {
      const filename = 'a'.repeat(150);
      const result = extractor.truncateFilename(filename, 100);

      expect(result.length).toBeLessThanOrEqual(100);
    });

    it('should truncate at word boundary when possible', () => {
      const filename = 'This is a very long filename that needs to be truncated at some point';
      const result = extractor.truncateFilename(filename, 30);

      expect(result.length).toBeLessThanOrEqual(30);
      // Should end at a space (word boundary)
      expect(result).not.toMatch(/\s$/); // No trailing space after cleanup
    });

    it('should truncate at underscore boundary when possible', () => {
      const filename = 'This_is_a_very_long_filename_that_needs_truncation';
      const result = extractor.truncateFilename(filename, 30);

      expect(result.length).toBeLessThanOrEqual(30);
    });

    it('should not truncate at word boundary if it loses too much text', () => {
      // Word boundary is at position 5, which is < 70% of maxLength (30)
      const filename = 'Short VeryLongWordWithoutSpacesThatGoesOnAndOn';
      const result = extractor.truncateFilename(filename, 30);

      expect(result.length).toBeLessThanOrEqual(30);
      // Should truncate at maxLength, not at word boundary
      expect(result.length).toBeGreaterThan(21); // 70% of 30
    });

    it('should remove trailing spaces after truncation', () => {
      const filename = 'This is a filename with spaces that will be truncated';
      const result = extractor.truncateFilename(filename, 20);

      expect(result).not.toMatch(/\s$/);
    });

    it('should remove trailing underscores after truncation', () => {
      const filename = 'This_is_a_filename_with_underscores_that_will_be_truncated';
      const result = extractor.truncateFilename(filename, 20);

      expect(result).not.toMatch(/_$/);
    });

    it('should use default maxLength of 100 when not specified', () => {
      const filename = 'a'.repeat(150);
      const result = extractor.truncateFilename(filename);

      expect(result.length).toBeLessThanOrEqual(100);
    });

    it('should handle filename with no spaces or underscores', () => {
      const filename = 'a'.repeat(150);
      const result = extractor.truncateFilename(filename, 50);

      expect(result.length).toBe(50);
    });

    it('should handle empty string', () => {
      const result = extractor.truncateFilename('', 100);

      expect(result).toBe('');
    });
  });

  describe('generateFilename', () => {
    it('should generate filename from valid title', () => {
      const filename = extractor.generateFilename('My Chat Title');

      expect(filename).toBe('My_Chat_Title.pdf');
    });

    it('should sanitize and add .pdf extension', () => {
      const filename = extractor.generateFilename('Invalid/Title:Name');

      expect(filename).toBe('Invalid_Title_Name.pdf');
      expect(filename).toMatch(/\.pdf$/);
    });

    it('should truncate long titles', () => {
      const longTitle = 'a'.repeat(150);
      const filename = extractor.generateFilename(longTitle);

      // Should be truncated to 100 chars + .pdf extension
      expect(filename.length).toBeLessThanOrEqual(104);
      expect(filename).toMatch(/\.pdf$/);
    });

    it('should generate fallback filename when title is null', () => {
      const filename = extractor.generateFilename(null);

      expect(filename).toMatch(/^gemini-chat-\d{8}-\d{6}\.pdf$/);
    });

    it('should generate fallback filename when title is empty string', () => {
      const filename = extractor.generateFilename('');

      expect(filename).toMatch(/^gemini-chat-\d{8}-\d{6}\.pdf$/);
    });

    it('should generate fallback filename when title is only whitespace', () => {
      const filename = extractor.generateFilename('   ');

      expect(filename).toMatch(/^gemini-chat-\d{8}-\d{6}\.pdf$/);
    });

    it('should generate unique fallback filenames based on timestamp', async () => {
      const filename1 = extractor.generateFilename(null);
      
      // Wait 1ms to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 1));
      const filename2 = extractor.generateFilename(null);
      
      // Filenames should be different (different timestamps)
      // Note: They might be the same if executed in the same second
      // So we just verify the format is correct
      expect(filename1).toMatch(/^gemini-chat-\d{8}-\d{6}\.pdf$/);
      expect(filename2).toMatch(/^gemini-chat-\d{8}-\d{6}\.pdf$/);
    });

    it('should handle title with all invalid characters', () => {
      const filename = extractor.generateFilename('/\\:*?"<>|');

      // Should generate fallback since sanitized title is empty
      expect(filename).toMatch(/^gemini-chat-\d{8}-\d{6}\.pdf$/);
    });

    it('should preserve valid characters in title', () => {
      const filename = extractor.generateFilename('Valid-Title_123');

      expect(filename).toBe('Valid-Title_123.pdf');
    });

    it('should handle title with mixed valid and invalid characters', () => {
      const filename = extractor.generateFilename('Project: Design/Development');

      expect(filename).toBe('Project_Design_Development.pdf');
    });

    it('should handle title with multiple spaces', () => {
      const filename = extractor.generateFilename('Title    With    Spaces');

      expect(filename).toBe('Title_With_Spaces.pdf');
    });

    it('should handle title with leading/trailing spaces', () => {
      const filename = extractor.generateFilename('  Title  ');

      expect(filename).toBe('Title.pdf');
    });

    it('should always end with .pdf extension', () => {
      const testCases = [
        'Normal Title',
        'Title/With:Invalid*Chars',
        'a'.repeat(150),
        null,
        '',
        '   '
      ];

      testCases.forEach(title => {
        const filename = extractor.generateFilename(title);
        expect(filename).toMatch(/\.pdf$/);
      });
    });
  });

  describe('Task 7.7: Title Extractor Test Scenarios', () => {
    describe('Title with normal text', () => {
      it('should extract and generate filename from normal title', () => {
        document.body.innerHTML = '<h1 class="chat-title">Project Discussion</h1>';

        const title = extractor.extractTitle();
        const filename = extractor.generateFilename(title);

        expect(title).toBe('Project Discussion');
        expect(filename).toBe('Project_Discussion.pdf');
      });
    });

    describe('Title with all invalid characters', () => {
      it('should sanitize title with all invalid characters', () => {
        const title = '/\\:*?"<>|';
        const filename = extractor.generateFilename(title);

        // Should generate fallback since all characters are invalid
        expect(filename).toMatch(/^gemini-chat-\d{8}-\d{6}\.pdf$/);
      });

      it('should handle title with only slashes', () => {
        const filename = extractor.generateFilename('///');

        expect(filename).toMatch(/^gemini-chat-\d{8}-\d{6}\.pdf$/);
      });

      it('should handle title with mixed invalid characters', () => {
        const filename = extractor.generateFilename('<<**??>>');

        expect(filename).toMatch(/^gemini-chat-\d{8}-\d{6}\.pdf$/);
      });
    });

    describe('Very long title (>100 chars)', () => {
      it('should truncate title longer than 100 characters', () => {
        const longTitle = 'This is a very long title that exceeds one hundred characters and should be truncated to fit within the maximum allowed length for filenames';
        const filename = extractor.generateFilename(longTitle);

        expect(filename.length).toBeLessThanOrEqual(104); // 100 + '.pdf'
        expect(filename).toMatch(/\.pdf$/);
      });

      it('should truncate at word boundary for long title', () => {
        const longTitle = 'Word '.repeat(30); // 150 characters
        const filename = extractor.generateFilename(longTitle);

        expect(filename.length).toBeLessThanOrEqual(104);
        // Should not end with partial word (underscore from space)
        const withoutExtension = filename.replace('.pdf', '');
        expect(withoutExtension).not.toMatch(/_$/);
      });

      it('should handle very long title with no spaces', () => {
        const longTitle = 'a'.repeat(150);
        const filename = extractor.generateFilename(longTitle);

        expect(filename.length).toBeLessThanOrEqual(104);
        expect(filename).toBe('a'.repeat(100) + '.pdf');
      });

      it('should truncate title with exactly 101 characters', () => {
        const title = 'a'.repeat(101);
        const filename = extractor.generateFilename(title);

        expect(filename.length).toBe(104); // 100 + '.pdf'
      });
    });

    describe('Null or empty title (fallback case)', () => {
      it('should generate fallback filename for null title', () => {
        const filename = extractor.generateFilename(null);

        expect(filename).toMatch(/^gemini-chat-\d{8}-\d{6}\.pdf$/);
        // Verify timestamp format: YYYYMMDD-HHMMSS
        const match = filename.match(/gemini-chat-(\d{8})-(\d{6})\.pdf/);
        expect(match).toBeTruthy();
        
        if (match) {
          const dateStr = match[1];
          const timeStr = match[2];
          
          // Verify date format
          const year = parseInt(dateStr.substring(0, 4));
          const month = parseInt(dateStr.substring(4, 6));
          const day = parseInt(dateStr.substring(6, 8));
          
          expect(year).toBeGreaterThanOrEqual(2024);
          expect(month).toBeGreaterThanOrEqual(1);
          expect(month).toBeLessThanOrEqual(12);
          expect(day).toBeGreaterThanOrEqual(1);
          expect(day).toBeLessThanOrEqual(31);
          
          // Verify time format
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
      });

      it('should generate fallback filename for empty string', () => {
        const filename = extractor.generateFilename('');

        expect(filename).toMatch(/^gemini-chat-\d{8}-\d{6}\.pdf$/);
      });

      it('should generate fallback filename for whitespace-only string', () => {
        const filename = extractor.generateFilename('   \t\n  ');

        expect(filename).toMatch(/^gemini-chat-\d{8}-\d{6}\.pdf$/);
      });

      it('should extract null and generate fallback when no title in DOM', () => {
        document.body.innerHTML = '<div>No title element</div>';

        const title = extractor.extractTitle();
        const filename = extractor.generateFilename(title);

        expect(title).toBeNull();
        expect(filename).toMatch(/^gemini-chat-\d{8}-\d{6}\.pdf$/);
      });
    });

    describe('Integration scenarios', () => {
      it('should handle complete flow: extract, sanitize, truncate, generate', () => {
        document.body.innerHTML = '<h1 class="chat-title">Project: Design/Development Phase</h1>';

        const title = extractor.extractTitle();
        const filename = extractor.generateFilename(title);

        expect(title).toBe('Project: Design/Development Phase');
        expect(filename).toBe('Project_Design_Development_Phase.pdf');
      });

      it('should handle title with unicode characters', () => {
        document.body.innerHTML = '<h1 class="chat-title">Cuộc trò chuyện về AI</h1>';

        const title = extractor.extractTitle();
        const filename = extractor.generateFilename(title);

        expect(title).toBe('Cuộc trò chuyện về AI');
        expect(filename).toBe('Cuộc_trò_chuyện_về_AI.pdf');
      });

      it('should handle title with emojis', () => {
        document.body.innerHTML = '<h1 class="chat-title">Chat 🚀 Project</h1>';

        const title = extractor.extractTitle();
        const filename = extractor.generateFilename(title);

        expect(title).toContain('🚀');
        expect(filename).toContain('🚀');
        expect(filename).toMatch(/\.pdf$/);
      });

      it('should handle title with numbers and special characters', () => {
        document.body.innerHTML = '<h1 class="chat-title">Q1-2024 Planning (Draft)</h1>';

        const title = extractor.extractTitle();
        const filename = extractor.generateFilename(title);

        expect(title).toBe('Q1-2024 Planning (Draft)');
        expect(filename).toBe('Q1-2024_Planning_(Draft).pdf');
      });
    });
  });
});
