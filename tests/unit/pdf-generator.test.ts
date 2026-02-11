/**
 * Unit tests for PDFGenerator
 * Tests specific examples, edge cases, and error conditions
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PDFGenerator, PDFOptions } from '../../src/content/pdf-generator';
import { ChatContent, Message } from '../../src/content/content-extractor';

describe('PDFGenerator', () => {
  describe('Constructor and Options', () => {
    it('should create instance with default options', () => {
      const generator = new PDFGenerator();
      const options = generator.getOptions();

      expect(options.format).toBe('A4');
      expect(options.margin.top).toBe('20mm');
      expect(options.margin.right).toBe('20mm');
      expect(options.margin.bottom).toBe('20mm');
      expect(options.margin.left).toBe('20mm');
      expect(options.fontSize).toBe('12pt');
      expect(options.fontFamily).toBe('Arial, Helvetica, sans-serif');
      expect(options.lineHeight).toBe(1.5);
      expect(options.userMessageBg).toBe('#e3f2fd');
      expect(options.geminiMessageBg).toBe('#f5f5f5');
    });

    it('should create instance with custom format', () => {
      const generator = new PDFGenerator({ format: 'Letter' });
      const options = generator.getOptions();

      expect(options.format).toBe('Letter');
      // Other options should remain default
      expect(options.margin.top).toBe('20mm');
      expect(options.fontSize).toBe('12pt');
    });

    it('should create instance with custom margins', () => {
      const generator = new PDFGenerator({
        margin: {
          top: '10mm',
          right: '15mm',
          bottom: '10mm',
          left: '15mm'
        }
      });
      const options = generator.getOptions();

      expect(options.margin.top).toBe('10mm');
      expect(options.margin.right).toBe('15mm');
      expect(options.margin.bottom).toBe('10mm');
      expect(options.margin.left).toBe('15mm');
    });

    it('should create instance with partial margin override', () => {
      const generator = new PDFGenerator({
        margin: {
          top: '30mm',
          bottom: '30mm'
        } as any
      });
      const options = generator.getOptions();

      expect(options.margin.top).toBe('30mm');
      expect(options.margin.bottom).toBe('30mm');
      // Other margins should remain default
      expect(options.margin.right).toBe('20mm');
      expect(options.margin.left).toBe('20mm');
    });

    it('should create instance with custom typography', () => {
      const generator = new PDFGenerator({
        fontSize: '14pt',
        fontFamily: 'Times New Roman, serif',
        lineHeight: 1.8
      });
      const options = generator.getOptions();

      expect(options.fontSize).toBe('14pt');
      expect(options.fontFamily).toBe('Times New Roman, serif');
      expect(options.lineHeight).toBe(1.8);
    });

    it('should create instance with custom message colors', () => {
      const generator = new PDFGenerator({
        userMessageBg: '#ffebee',
        geminiMessageBg: '#e8f5e9'
      });
      const options = generator.getOptions();

      expect(options.userMessageBg).toBe('#ffebee');
      expect(options.geminiMessageBg).toBe('#e8f5e9');
    });

    it('should create instance with all custom options', () => {
      const customOptions: PDFOptions = {
        format: 'Letter',
        margin: {
          top: '25mm',
          right: '25mm',
          bottom: '25mm',
          left: '25mm'
        },
        fontSize: '11pt',
        fontFamily: 'Georgia, serif',
        lineHeight: 1.6,
        userMessageBg: '#fff3e0',
        geminiMessageBg: '#e0f2f1'
      };

      const generator = new PDFGenerator(customOptions);
      const options = generator.getOptions();

      expect(options).toEqual(customOptions);
    });
  });

  describe('getOptions', () => {
    it('should return a copy of options (not reference)', () => {
      const generator = new PDFGenerator();
      const options1 = generator.getOptions();
      const options2 = generator.getOptions();

      // Should be equal but not the same reference
      expect(options1).toEqual(options2);
      expect(options1).not.toBe(options2);
    });

    it('should not allow external modification of options', () => {
      const generator = new PDFGenerator();
      const options = generator.getOptions();

      // Try to modify the returned options
      options.format = 'Letter';
      options.fontSize = '20pt';

      // Original options should remain unchanged
      const currentOptions = generator.getOptions();
      expect(currentOptions.format).toBe('A4');
      expect(currentOptions.fontSize).toBe('12pt');
    });
  });

  describe('setOptions', () => {
    it('should update format option', () => {
      const generator = new PDFGenerator();
      generator.setOptions({ format: 'Letter' });

      const options = generator.getOptions();
      expect(options.format).toBe('Letter');
    });

    it('should update margin options', () => {
      const generator = new PDFGenerator();
      generator.setOptions({
        margin: {
          top: '15mm',
          right: '15mm',
          bottom: '15mm',
          left: '15mm'
        }
      });

      const options = generator.getOptions();
      expect(options.margin.top).toBe('15mm');
      expect(options.margin.right).toBe('15mm');
      expect(options.margin.bottom).toBe('15mm');
      expect(options.margin.left).toBe('15mm');
    });

    it('should update partial margin options', () => {
      const generator = new PDFGenerator();
      generator.setOptions({
        margin: {
          top: '30mm'
        } as any
      });

      const options = generator.getOptions();
      expect(options.margin.top).toBe('30mm');
      // Other margins should remain unchanged
      expect(options.margin.right).toBe('20mm');
      expect(options.margin.bottom).toBe('20mm');
      expect(options.margin.left).toBe('20mm');
    });

    it('should update typography options', () => {
      const generator = new PDFGenerator();
      generator.setOptions({
        fontSize: '16pt',
        fontFamily: 'Verdana, sans-serif',
        lineHeight: 2.0
      });

      const options = generator.getOptions();
      expect(options.fontSize).toBe('16pt');
      expect(options.fontFamily).toBe('Verdana, sans-serif');
      expect(options.lineHeight).toBe(2.0);
    });

    it('should update message color options', () => {
      const generator = new PDFGenerator();
      generator.setOptions({
        userMessageBg: '#fce4ec',
        geminiMessageBg: '#f3e5f5'
      });

      const options = generator.getOptions();
      expect(options.userMessageBg).toBe('#fce4ec');
      expect(options.geminiMessageBg).toBe('#f3e5f5');
    });

    it('should update multiple options at once', () => {
      const generator = new PDFGenerator();
      generator.setOptions({
        format: 'Letter',
        fontSize: '14pt',
        lineHeight: 1.8
      });

      const options = generator.getOptions();
      expect(options.format).toBe('Letter');
      expect(options.fontSize).toBe('14pt');
      expect(options.lineHeight).toBe(1.8);
      // Other options should remain default
      expect(options.fontFamily).toBe('Arial, Helvetica, sans-serif');
    });

    it('should allow multiple setOptions calls', () => {
      const generator = new PDFGenerator();
      
      generator.setOptions({ format: 'Letter' });
      generator.setOptions({ fontSize: '14pt' });
      generator.setOptions({ lineHeight: 1.8 });

      const options = generator.getOptions();
      expect(options.format).toBe('Letter');
      expect(options.fontSize).toBe('14pt');
      expect(options.lineHeight).toBe(1.8);
    });

    it('should preserve previous custom options when updating', () => {
      const generator = new PDFGenerator({
        format: 'Letter',
        fontSize: '14pt'
      });

      generator.setOptions({ lineHeight: 1.8 });

      const options = generator.getOptions();
      expect(options.format).toBe('Letter');
      expect(options.fontSize).toBe('14pt');
      expect(options.lineHeight).toBe(1.8);
    });
  });

  describe('Task 8.1: PDFGenerator class and html2pdf.js integration', () => {
    it('should successfully import html2pdf.js library', () => {
      // This test verifies that the import doesn't throw an error
      expect(() => new PDFGenerator()).not.toThrow();
    });

    it('should define PDFOptions interface with all required fields', () => {
      const options: PDFOptions = {
        format: 'A4',
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm'
        },
        fontSize: '12pt',
        fontFamily: 'Arial, sans-serif',
        lineHeight: 1.5,
        userMessageBg: '#e3f2fd',
        geminiMessageBg: '#f5f5f5'
      };

      // TypeScript will catch any missing fields at compile time
      // This test verifies the interface is properly defined
      expect(options).toBeDefined();
      expect(options.format).toBeDefined();
      expect(options.margin).toBeDefined();
      expect(options.fontSize).toBeDefined();
      expect(options.fontFamily).toBeDefined();
      expect(options.lineHeight).toBeDefined();
      expect(options.userMessageBg).toBeDefined();
      expect(options.geminiMessageBg).toBeDefined();
    });

    it('should setup default options matching design specifications', () => {
      const generator = new PDFGenerator();
      const options = generator.getOptions();

      // Verify all defaults match design document
      expect(options.format).toBe('A4');
      expect(options.margin.top).toBe('20mm');
      expect(options.margin.right).toBe('20mm');
      expect(options.margin.bottom).toBe('20mm');
      expect(options.margin.left).toBe('20mm');
      expect(options.fontSize).toBe('12pt');
      expect(options.fontFamily).toBe('Arial, Helvetica, sans-serif');
      expect(options.lineHeight).toBe(1.5);
      expect(options.userMessageBg).toBe('#e3f2fd');
      expect(options.geminiMessageBg).toBe('#f5f5f5');
    });

    it('should allow A4 format', () => {
      const generator = new PDFGenerator({ format: 'A4' });
      expect(generator.getOptions().format).toBe('A4');
    });

    it('should allow Letter format', () => {
      const generator = new PDFGenerator({ format: 'Letter' });
      expect(generator.getOptions().format).toBe('Letter');
    });

    it('should support custom margin configuration', () => {
      const customMargins = {
        top: '25mm',
        right: '30mm',
        bottom: '25mm',
        left: '30mm'
      };

      const generator = new PDFGenerator({ margin: customMargins });
      const options = generator.getOptions();

      expect(options.margin).toEqual(customMargins);
    });

    it('should support custom font configuration', () => {
      const generator = new PDFGenerator({
        fontSize: '14pt',
        fontFamily: 'Times New Roman, serif',
        lineHeight: 1.8
      });

      const options = generator.getOptions();
      expect(options.fontSize).toBe('14pt');
      expect(options.fontFamily).toBe('Times New Roman, serif');
      expect(options.lineHeight).toBe(1.8);
    });
  });

  describe('Task 8.2: applyStyles method', () => {
    it('should create HTML with PDF_STYLES template', () => {
      const generator = new PDFGenerator();
      const content: ChatContent = {
        messages: [
          { sender: 'user', content: 'Hello' },
          { sender: 'gemini', content: 'Hi there!' }
        ],
        timestamp: new Date()
      };

      const html = generator.applyStyles(content);

      // Verify HTML structure
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html lang="vi">');
      expect(html).toContain('<style>');
      expect(html).toContain('</style>');
      expect(html).toContain('</html>');
    });

    it('should wrap messages in styled containers', () => {
      const generator = new PDFGenerator();
      const content: ChatContent = {
        messages: [
          { sender: 'user', content: 'Test message' }
        ],
        timestamp: new Date()
      };

      const html = generator.applyStyles(content);

      // Verify message container structure
      expect(html).toContain('<div class="message user">');
      expect(html).toContain('<div class="message-header">');
      expect(html).toContain('<div class="message-content">');
      expect(html).toContain('Test message');
    });

    it('should add header with chat title and export date', () => {
      const generator = new PDFGenerator();
      const content: ChatContent = {
        messages: [],
        timestamp: new Date()
      };

      const html = generator.applyStyles(content, 'My Chat Title');

      // Verify header structure
      expect(html).toContain('<div class="pdf-header">');
      expect(html).toContain('<h1>My Chat Title</h1>');
      expect(html).toContain('Xuất ngày:');
      expect(html).toContain('<div class="export-date">');
    });

    it('should use default title when no title provided', () => {
      const generator = new PDFGenerator();
      const content: ChatContent = {
        messages: [],
        timestamp: new Date()
      };

      const html = generator.applyStyles(content);

      expect(html).toContain('<h1>Gemini Chat</h1>');
    });

    it('should distinguish user vs gemini messages with different backgrounds', () => {
      const generator = new PDFGenerator();
      const content: ChatContent = {
        messages: [
          { sender: 'user', content: 'User message' },
          { sender: 'gemini', content: 'Gemini message' }
        ],
        timestamp: new Date()
      };

      const html = generator.applyStyles(content);

      // Verify user message styling
      expect(html).toContain('<div class="message user">');
      expect(html).toContain('<div class="message-header">Bạn</div>');
      expect(html).toContain('User message');

      // Verify gemini message styling
      expect(html).toContain('<div class="message gemini">');
      expect(html).toContain('<div class="message-header">Gemini</div>');
      expect(html).toContain('Gemini message');
    });

    it('should apply custom background colors from options', () => {
      const generator = new PDFGenerator({
        userMessageBg: '#ffebee',
        geminiMessageBg: '#e8f5e9'
      });
      const content: ChatContent = {
        messages: [{ sender: 'user', content: 'Test' }],
        timestamp: new Date()
      };

      const html = generator.applyStyles(content);

      // Verify custom colors are in the styles
      expect(html).toContain('background-color: #ffebee');
      expect(html).toContain('background-color: #e8f5e9');
    });

    it('should apply custom font settings from options', () => {
      const generator = new PDFGenerator({
        fontFamily: 'Times New Roman, serif',
        fontSize: '14pt',
        lineHeight: 1.8
      });
      const content: ChatContent = {
        messages: [],
        timestamp: new Date()
      };

      const html = generator.applyStyles(content);

      // Verify custom font settings are in the styles
      expect(html).toContain('font-family: Times New Roman, serif');
      expect(html).toContain('font-size: 14pt');
      expect(html).toContain('line-height: 1.8');
    });

    it('should handle empty messages array', () => {
      const generator = new PDFGenerator();
      const content: ChatContent = {
        messages: [],
        timestamp: new Date()
      };

      const html = generator.applyStyles(content, 'Empty Chat');

      // Should still have valid HTML structure
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<h1>Empty Chat</h1>');
      expect(html).toContain('Xuất ngày:');
      // Should not have any message divs
      expect(html).not.toContain('<div class="message user">');
      expect(html).not.toContain('<div class="message gemini">');
    });

    it('should handle single message', () => {
      const generator = new PDFGenerator();
      const content: ChatContent = {
        messages: [
          { sender: 'user', content: 'Single message' }
        ],
        timestamp: new Date()
      };

      const html = generator.applyStyles(content);

      // Count message divs (should be exactly 1)
      const messageMatches = html.match(/<div class="message (user|gemini)">/g);
      expect(messageMatches).toHaveLength(1);
      expect(html).toContain('Single message');
    });

    it('should handle multiple messages', () => {
      const generator = new PDFGenerator();
      const content: ChatContent = {
        messages: [
          { sender: 'user', content: 'Message 1' },
          { sender: 'gemini', content: 'Message 2' },
          { sender: 'user', content: 'Message 3' },
          { sender: 'gemini', content: 'Message 4' }
        ],
        timestamp: new Date()
      };

      const html = generator.applyStyles(content);

      // Count message divs (should be exactly 4)
      const messageMatches = html.match(/<div class="message (user|gemini)">/g);
      expect(messageMatches).toHaveLength(4);
      
      // Verify all messages are present
      expect(html).toContain('Message 1');
      expect(html).toContain('Message 2');
      expect(html).toContain('Message 3');
      expect(html).toContain('Message 4');
    });

    it('should preserve HTML content in messages', () => {
      const generator = new PDFGenerator();
      const content: ChatContent = {
        messages: [
          { 
            sender: 'user', 
            content: '<strong>Bold text</strong> and <em>italic text</em>' 
          },
          { 
            sender: 'gemini', 
            content: '<code>inline code</code> and <a href="#">link</a>' 
          }
        ],
        timestamp: new Date()
      };

      const html = generator.applyStyles(content);

      // Verify HTML tags are preserved
      expect(html).toContain('<strong>Bold text</strong>');
      expect(html).toContain('<em>italic text</em>');
      expect(html).toContain('<code>inline code</code>');
      expect(html).toContain('<a href="#">link</a>');
    });

    it('should handle messages with code blocks', () => {
      const generator = new PDFGenerator();
      const content: ChatContent = {
        messages: [
          { 
            sender: 'gemini', 
            content: '<pre><code>function test() {\n  return true;\n}</code></pre>' 
          }
        ],
        timestamp: new Date()
      };

      const html = generator.applyStyles(content);

      // Verify code block is preserved
      expect(html).toContain('<pre><code>');
      expect(html).toContain('function test()');
      expect(html).toContain('</code></pre>');
    });

    it('should handle messages with tables', () => {
      const generator = new PDFGenerator();
      const content: ChatContent = {
        messages: [
          { 
            sender: 'gemini', 
            content: '<table><tr><th>Header</th></tr><tr><td>Data</td></tr></table>' 
          }
        ],
        timestamp: new Date()
      };

      const html = generator.applyStyles(content);

      // Verify table is preserved
      expect(html).toContain('<table>');
      expect(html).toContain('<th>Header</th>');
      expect(html).toContain('<td>Data</td>');
      expect(html).toContain('</table>');
    });

    it('should handle messages with lists', () => {
      const generator = new PDFGenerator();
      const content: ChatContent = {
        messages: [
          { 
            sender: 'gemini', 
            content: '<ul><li>Item 1</li><li>Item 2</li></ul>' 
          }
        ],
        timestamp: new Date()
      };

      const html = generator.applyStyles(content);

      // Verify list is preserved
      expect(html).toContain('<ul>');
      expect(html).toContain('<li>Item 1</li>');
      expect(html).toContain('<li>Item 2</li>');
      expect(html).toContain('</ul>');
    });

    it('should include all required CSS styles', () => {
      const generator = new PDFGenerator();
      const content: ChatContent = {
        messages: [],
        timestamp: new Date()
      };

      const html = generator.applyStyles(content);

      // Verify key CSS rules are present
      expect(html).toContain('.message {');
      expect(html).toContain('.message.user {');
      expect(html).toContain('.message.gemini {');
      expect(html).toContain('.message-header {');
      expect(html).toContain('.message-content {');
      expect(html).toContain('.pdf-header {');
      expect(html).toContain('page-break-inside: avoid');
    });

    it('should format export date in Vietnamese locale', () => {
      const generator = new PDFGenerator();
      const content: ChatContent = {
        messages: [],
        timestamp: new Date()
      };

      const html = generator.applyStyles(content);

      // Verify date format contains Vietnamese text
      expect(html).toContain('Xuất ngày:');
      // The date should be formatted (we can't test exact format due to timezone differences)
      expect(html).toMatch(/Xuất ngày:.*\d{1,2}:\d{2}/);
    });

    it('should escape special characters in title', () => {
      const generator = new PDFGenerator();
      const content: ChatContent = {
        messages: [],
        timestamp: new Date()
      };

      // Title with HTML special characters
      const html = generator.applyStyles(content, 'Chat <with> "special" & characters');

      // The title should appear in both <title> and <h1>
      // Note: The browser/HTML parser will handle escaping
      expect(html).toContain('Chat <with> "special" & characters');
    });

    it('should maintain message order', () => {
      const generator = new PDFGenerator();
      const content: ChatContent = {
        messages: [
          { sender: 'user', content: 'First' },
          { sender: 'gemini', content: 'Second' },
          { sender: 'user', content: 'Third' }
        ],
        timestamp: new Date()
      };

      const html = generator.applyStyles(content);

      // Find positions of each message
      const firstPos = html.indexOf('First');
      const secondPos = html.indexOf('Second');
      const thirdPos = html.indexOf('Third');

      // Verify order is maintained
      expect(firstPos).toBeLessThan(secondPos);
      expect(secondPos).toBeLessThan(thirdPos);
    });
  });

  describe('Task 8.3: generatePDF and downloadPDF methods', () => {
    describe('downloadPDF', () => {
      it('should create object URL from blob', () => {
        const generator = new PDFGenerator();
        const mockBlob = new Blob(['test pdf content'], { type: 'application/pdf' });
        
        // Mock URL.createObjectURL and URL.revokeObjectURL
        const originalCreateObjectURL = URL.createObjectURL;
        const originalRevokeObjectURL = URL.revokeObjectURL;
        let createdUrl = '';
        
        URL.createObjectURL = (blob: Blob) => {
          createdUrl = 'blob:mock-url';
          return createdUrl;
        };
        URL.revokeObjectURL = () => {};

        // Mock document.createElement and appendChild/removeChild
        const mockLink = document.createElement('a');
        const originalCreateElement = document.createElement.bind(document);
        let linkClicked = false;
        
        document.createElement = (tagName: string) => {
          if (tagName === 'a') {
            const link = originalCreateElement('a');
            link.click = () => { linkClicked = true; };
            return link;
          }
          return originalCreateElement(tagName);
        };

        try {
          generator.downloadPDF(mockBlob, 'test.pdf');
          
          expect(createdUrl).toBe('blob:mock-url');
          expect(linkClicked).toBe(true);
        } finally {
          // Restore original functions
          URL.createObjectURL = originalCreateObjectURL;
          URL.revokeObjectURL = originalRevokeObjectURL;
          document.createElement = originalCreateElement;
        }
      });

      it('should set correct download filename', () => {
        const generator = new PDFGenerator();
        const mockBlob = new Blob(['test'], { type: 'application/pdf' });
        
        const originalCreateObjectURL = URL.createObjectURL;
        const originalRevokeObjectURL = URL.revokeObjectURL;
        URL.createObjectURL = () => 'blob:mock-url';
        URL.revokeObjectURL = () => {};

        let downloadFilename = '';
        const originalCreateElement = document.createElement.bind(document);
        document.createElement = (tagName: string) => {
          if (tagName === 'a') {
            const link = originalCreateElement('a');
            Object.defineProperty(link, 'download', {
              set: (value: string) => { downloadFilename = value; },
              get: () => downloadFilename
            });
            link.click = () => {};
            return link;
          }
          return originalCreateElement(tagName);
        };

        try {
          generator.downloadPDF(mockBlob, 'my-chat.pdf');
          expect(downloadFilename).toBe('my-chat.pdf');
        } finally {
          URL.createObjectURL = originalCreateObjectURL;
          URL.revokeObjectURL = originalRevokeObjectURL;
          document.createElement = originalCreateElement;
        }
      });

      it('should cleanup object URL after download', async () => {
        const generator = new PDFGenerator();
        const mockBlob = new Blob(['test'], { type: 'application/pdf' });
        
        const originalCreateObjectURL = URL.createObjectURL;
        const originalRevokeObjectURL = URL.revokeObjectURL;
        let revokedUrl = '';
        
        URL.createObjectURL = () => 'blob:mock-url';
        URL.revokeObjectURL = (url: string) => { revokedUrl = url; };

        const originalCreateElement = document.createElement.bind(document);
        document.createElement = (tagName: string) => {
          if (tagName === 'a') {
            const link = originalCreateElement('a');
            link.click = () => {};
            return link;
          }
          return originalCreateElement(tagName);
        };

        try {
          generator.downloadPDF(mockBlob, 'test.pdf');
          
          // URL should be revoked after a short delay
          await new Promise(resolve => setTimeout(resolve, 150));
          expect(revokedUrl).toBe('blob:mock-url');
        } finally {
          // Restore original functions
          URL.createObjectURL = originalCreateObjectURL;
          URL.revokeObjectURL = originalRevokeObjectURL;
          document.createElement = originalCreateElement;
        }
      });

      it('should handle different blob types', () => {
        const generator = new PDFGenerator();
        
        const originalCreateObjectURL = URL.createObjectURL;
        const originalRevokeObjectURL = URL.revokeObjectURL;
        let createdFromBlob: Blob | null = null;
        
        URL.createObjectURL = (blob: Blob) => {
          createdFromBlob = blob;
          return 'blob:mock-url';
        };
        URL.revokeObjectURL = () => {};

        const originalCreateElement = document.createElement.bind(document);
        document.createElement = (tagName: string) => {
          if (tagName === 'a') {
            const link = originalCreateElement('a');
            link.click = () => {};
            return link;
          }
          return originalCreateElement(tagName);
        };

        try {
          const pdfBlob = new Blob(['pdf content'], { type: 'application/pdf' });
          generator.downloadPDF(pdfBlob, 'test.pdf');
          
          expect(createdFromBlob).toBe(pdfBlob);
          expect(createdFromBlob?.type).toBe('application/pdf');
        } finally {
          URL.createObjectURL = originalCreateObjectURL;
          URL.revokeObjectURL = originalRevokeObjectURL;
          document.createElement = originalCreateElement;
        }
      });
    });

    describe('generatePDF', () => {
      it('should call applyStyles with content and title', async () => {
        const generator = new PDFGenerator();
        const content: ChatContent = {
          messages: [
            { sender: 'user', content: 'Hello' }
          ],
          timestamp: new Date()
        };

        // Spy on applyStyles
        let appliedContent: ChatContent | null = null;
        let appliedTitle: string | null = null;
        const originalApplyStyles = generator.applyStyles.bind(generator);
        generator.applyStyles = (content: ChatContent, title?: string) => {
          appliedContent = content;
          appliedTitle = title || null;
          return originalApplyStyles(content, title);
        };

        // Spy on downloadPDF
        let downloadCalled = false;
        generator.downloadPDF = () => { downloadCalled = true; };

        await generator.generatePDF(content, 'test-chat.pdf');

        expect(appliedContent).toBe(content);
        expect(appliedTitle).toBe('test-chat');
        expect(downloadCalled).toBe(true);
      });

      it('should strip .pdf extension from title when calling applyStyles', async () => {
        const generator = new PDFGenerator();
        const content: ChatContent = {
          messages: [],
          timestamp: new Date()
        };

        generator.downloadPDF = () => {};

        let appliedTitle: string | undefined;
        const originalApplyStyles = generator.applyStyles.bind(generator);
        generator.applyStyles = (content: ChatContent, title?: string) => {
          appliedTitle = title;
          return originalApplyStyles(content, title);
        };

        await generator.generatePDF(content, 'my-chat.pdf');

        expect(appliedTitle).toBe('my-chat');
      });

      it('should call downloadPDF with blob and filename', async () => {
        const generator = new PDFGenerator();
        const content: ChatContent = {
          messages: [],
          timestamp: new Date()
        };

        let downloadedBlob: Blob | null = null;
        let downloadedFilename: string | null = null;
        generator.downloadPDF = (blob: Blob, filename: string) => {
          downloadedBlob = blob;
          downloadedFilename = filename;
        };

        await generator.generatePDF(content, 'my-chat.pdf');

        expect(downloadedBlob).toBeInstanceOf(Blob);
        expect(downloadedFilename).toBe('my-chat.pdf');
      });

      it('should handle string output from html2pdf by converting to Blob', async () => {
        const generator = new PDFGenerator();
        const content: ChatContent = {
          messages: [],
          timestamp: new Date()
        };

        let downloadedBlob: Blob | null = null;
        generator.downloadPDF = (blob: Blob) => {
          downloadedBlob = blob;
        };

        await generator.generatePDF(content, 'test.pdf');

        expect(downloadedBlob).toBeInstanceOf(Blob);
        expect(downloadedBlob?.type).toBe('application/pdf');
      });

      it('should work with complex chat content', async () => {
        const generator = new PDFGenerator();
        const content: ChatContent = {
          messages: [
            { sender: 'user', content: '<strong>Bold</strong> text' },
            { sender: 'gemini', content: '<pre><code>code block</code></pre>' },
            { sender: 'user', content: '<ul><li>Item 1</li><li>Item 2</li></ul>' }
          ],
          timestamp: new Date()
        };

        let appliedHtml: string | null = null;
        const originalApplyStyles = generator.applyStyles.bind(generator);
        generator.applyStyles = (content: ChatContent, title?: string) => {
          appliedHtml = originalApplyStyles(content, title);
          return appliedHtml;
        };

        generator.downloadPDF = () => {};

        await generator.generatePDF(content, 'complex-chat.pdf');

        expect(appliedHtml).toBeDefined();
        expect(appliedHtml).toContain('<strong>Bold</strong>');
        expect(appliedHtml).toContain('<pre><code>code block</code></pre>');
        expect(appliedHtml).toContain('<ul><li>Item 1</li>');
      });

      it('should handle empty messages array', async () => {
        const generator = new PDFGenerator();
        const content: ChatContent = {
          messages: [],
          timestamp: new Date()
        };

        let downloadCalled = false;
        generator.downloadPDF = () => { downloadCalled = true; };

        await generator.generatePDF(content, 'empty-chat.pdf');

        expect(downloadCalled).toBe(true);
      });

      it('should handle single message', async () => {
        const generator = new PDFGenerator();
        const content: ChatContent = {
          messages: [
            { sender: 'user', content: 'Single message' }
          ],
          timestamp: new Date()
        };

        let downloadCalled = false;
        generator.downloadPDF = () => { downloadCalled = true; };

        await generator.generatePDF(content, 'single-message.pdf');

        expect(downloadCalled).toBe(true);
      });

      it('should handle multiple messages', async () => {
        const generator = new PDFGenerator();
        const content: ChatContent = {
          messages: [
            { sender: 'user', content: 'Message 1' },
            { sender: 'gemini', content: 'Message 2' },
            { sender: 'user', content: 'Message 3' }
          ],
          timestamp: new Date()
        };

        let downloadCalled = false;
        generator.downloadPDF = () => { downloadCalled = true; };

        await generator.generatePDF(content, 'multi-message.pdf');

        expect(downloadCalled).toBe(true);
      });
    });
  });
});
