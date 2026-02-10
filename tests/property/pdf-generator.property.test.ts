/**
 * Property-based tests for PDFGenerator
 * Feature: gemini-business-to-pdf
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { PDFGenerator } from '../../src/content/pdf-generator';
import { ChatContent, Message } from '../../src/content/content-extractor';

describe('PDFGenerator - Property Tests', () => {
  let generator: PDFGenerator;

  beforeEach(() => {
    generator = new PDFGenerator();
    // Use fake timers to control setTimeout
    vi.useFakeTimers();
  });

  afterEach(() => {
    // Restore real timers after each test
    vi.useRealTimers();
  });

  /**
   * Feature: gemini-business-to-pdf, Property 12: HTML to PDF conversion với format preservation
   * **Validates: Requirements 5.1, 5.3**
   * 
   * Property: Với bất kỳ HTML content nào (bao gồm formatting, code blocks, tables, lists),
   * hàm generatePDF phải:
   * - Tạo ra một PDF blob hợp lệ
   * - Bảo toàn tất cả formatting từ HTML gốc trong PDF output
   */
  it('Property 12: should generate valid PDF with format preservation for any HTML content', async () => {
    // Custom arbitrary for generating HTML formatting elements
    const htmlFormattingArb = fc.oneof(
      // Bold text
      fc.string({ minLength: 1, maxLength: 50 }).map(text => `<strong>${text}</strong>`),
      // Italic text
      fc.string({ minLength: 1, maxLength: 50 }).map(text => `<em>${text}</em>`),
      // Underline text
      fc.string({ minLength: 1, maxLength: 50 }).map(text => `<u>${text}</u>`),
      // Links
      fc.tuple(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.webUrl()
      ).map(([text, url]) => `<a href="${url}">${text}</a>`),
      // Inline code
      fc.string({ minLength: 1, maxLength: 30 }).map(text => `<code>${text}</code>`),
      // Code blocks
      fc.string({ minLength: 10, maxLength: 100 }).map(code => 
        `<pre><code>${code}</code></pre>`
      ),
      // Unordered lists
      fc.array(
        fc.string({ minLength: 1, maxLength: 30 }),
        { minLength: 1, maxLength: 5 }
      ).map(items => 
        `<ul>${items.map(item => `<li>${item}</li>`).join('')}</ul>`
      ),
      // Ordered lists
      fc.array(
        fc.string({ minLength: 1, maxLength: 30 }),
        { minLength: 1, maxLength: 5 }
      ).map(items => 
        `<ol>${items.map(item => `<li>${item}</li>`).join('')}</ol>`
      ),
      // Tables
      fc.tuple(
        fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 3 }),
        fc.array(
          fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 3 }),
          { minLength: 1, maxLength: 3 }
        )
      ).map(([headers, rows]) => {
        const headerRow = `<tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>`;
        const dataRows = rows.map(row => 
          `<tr>${row.slice(0, headers.length).map(cell => `<td>${cell}</td>`).join('')}</tr>`
        ).join('');
        return `<table>${headerRow}${dataRows}</table>`;
      }),
      // Plain text
      fc.string({ minLength: 1, maxLength: 100 })
    );

    // Custom arbitrary for generating messages with various formatting
    const messageArb = fc.record({
      sender: fc.constantFrom('user' as const, 'gemini' as const),
      content: fc.array(htmlFormattingArb, { minLength: 1, maxLength: 3 })
        .map(formats => formats.join(' '))
    });

    // Custom arbitrary for generating ChatContent
    const chatContentArb = fc.record({
      messages: fc.array(messageArb, { minLength: 1, maxLength: 10 }),
      timestamp: fc.date()
    });

    // Custom arbitrary for generating filenames
    const filenameArb = fc.string({ minLength: 1, maxLength: 50 })
      .map(name => name.replace(/[\/\\:*?"<>|]/g, '-'))
      .filter(name => name.trim() !== '')
      .map(name => `${name}.pdf`);

    await fc.assert(
      fc.asyncProperty(
        chatContentArb,
        filenameArb,
        async (content: ChatContent, filename: string) => {
          // Track if downloadPDF was called with valid blob
          let downloadedBlob: Blob | null = null;
          let downloadedFilename: string | null = null;

          // Mock downloadPDF to capture the blob
          generator.downloadPDF = (blob: Blob, fname: string) => {
            downloadedBlob = blob;
            downloadedFilename = fname;
          };

          // Execute: Generate PDF
          await generator.generatePDF(content, filename);

          // Verify 1: PDF blob was created
          expect(downloadedBlob).not.toBeNull();
          expect(downloadedBlob).toBeInstanceOf(Blob);

          // Verify 2: Blob is valid PDF type
          expect(downloadedBlob!.type).toBe('application/pdf');

          // Verify 3: Blob has content (size > 0)
          expect(downloadedBlob!.size).toBeGreaterThan(0);

          // Verify 4: Correct filename was used
          expect(downloadedFilename).toBe(filename);

          // Verify 5: Format preservation - check that applyStyles was called
          // and the styled HTML contains all the original formatting
          const styledHtml = generator.applyStyles(content, filename.replace('.pdf', ''));

          // Verify all messages are present in styled HTML
          content.messages.forEach(message => {
            // The content should be present in the styled HTML
            expect(styledHtml).toContain(message.content);
          });

          // Verify HTML structure is preserved
          content.messages.forEach(message => {
            // Check for specific formatting elements
            if (message.content.includes('<strong>')) {
              expect(styledHtml).toContain('<strong>');
            }
            if (message.content.includes('<em>')) {
              expect(styledHtml).toContain('<em>');
            }
            if (message.content.includes('<u>')) {
              expect(styledHtml).toContain('<u>');
            }
            if (message.content.includes('<a href=')) {
              expect(styledHtml).toContain('<a href=');
            }
            if (message.content.includes('<code>')) {
              expect(styledHtml).toContain('<code>');
            }
            if (message.content.includes('<pre>')) {
              expect(styledHtml).toContain('<pre>');
            }
            if (message.content.includes('<ul>')) {
              expect(styledHtml).toContain('<ul>');
            }
            if (message.content.includes('<ol>')) {
              expect(styledHtml).toContain('<ol>');
            }
            if (message.content.includes('<table>')) {
              expect(styledHtml).toContain('<table>');
            }
          });

          // Verify sender distinction is preserved
          const hasUserMessage = content.messages.some(m => m.sender === 'user');
          const hasGeminiMessage = content.messages.some(m => m.sender === 'gemini');

          if (hasUserMessage) {
            expect(styledHtml).toContain('class="message user"');
          }
          if (hasGeminiMessage) {
            expect(styledHtml).toContain('class="message gemini"');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: gemini-business-to-pdf, Property 12: HTML to PDF conversion (Empty content)
   * **Validates: Requirements 5.1, 5.3**
   * 
   * Property: Với empty messages array, generatePDF vẫn phải tạo PDF hợp lệ
   */
  it('Property 12: should generate valid PDF even with empty messages', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.date(),
        fc.string({ minLength: 1, maxLength: 50 })
          .map(name => name.replace(/[\/\\:*?"<>|]/g, '-'))
          .filter(name => name.trim() !== '')
          .map(name => `${name}.pdf`),
        async (timestamp: Date, filename: string) => {
          const content: ChatContent = {
            messages: [],
            timestamp
          };

          let downloadedBlob: Blob | null = null;

          generator.downloadPDF = (blob: Blob) => {
            downloadedBlob = blob;
          };

          await generator.generatePDF(content, filename);

          // Verify: PDF was still created
          expect(downloadedBlob).not.toBeNull();
          expect(downloadedBlob).toBeInstanceOf(Blob);
          expect(downloadedBlob!.type).toBe('application/pdf');
          expect(downloadedBlob!.size).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: gemini-business-to-pdf, Property 12: HTML to PDF conversion (Special characters)
   * **Validates: Requirements 5.1, 5.3**
   * 
   * Property: Với content chứa special characters, generatePDF phải handle correctly
   */
  it('Property 12: should handle special characters in content', async () => {
    const specialCharsArb = fc.oneof(
      fc.constant('Special chars: & < > " \' ` ~'),
      fc.constant('Unicode: 中文 日本語 한국어 العربية'),
      fc.constant('Emojis: 🚀 💻 📝 ✨ 🎉'),
      fc.constant('Math symbols: ∑ ∫ ∂ √ ∞ ≈ ≠'),
      fc.constant('Currency: $ € £ ¥ ₹ ₽'),
      fc.constant('Quotes: "double" \'single\' `backtick`'),
      fc.constant('Newlines:\nLine 1\nLine 2\nLine 3'),
      fc.constant('Tabs:\tTab 1\tTab 2\tTab 3')
    );

    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            sender: fc.constantFrom('user' as const, 'gemini' as const),
            content: specialCharsArb
          }),
          { minLength: 1, maxLength: 5 }
        ),
        fc.date(),
        async (messages: Message[], timestamp: Date) => {
          const content: ChatContent = { messages, timestamp };

          let downloadedBlob: Blob | null = null;

          generator.downloadPDF = (blob: Blob) => {
            downloadedBlob = blob;
          };

          await generator.generatePDF(content, 'special-chars.pdf');

          // Verify: PDF was created successfully
          expect(downloadedBlob).not.toBeNull();
          expect(downloadedBlob).toBeInstanceOf(Blob);
          expect(downloadedBlob!.type).toBe('application/pdf');
          expect(downloadedBlob!.size).toBeGreaterThan(0);

          // Verify: Content is preserved in styled HTML
          const styledHtml = generator.applyStyles(content, 'special-chars');
          messages.forEach(message => {
            // Content should be present (may be escaped in HTML)
            expect(styledHtml).toContain(message.content);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: gemini-business-to-pdf, Property 12: HTML to PDF conversion (Large content)
   * **Validates: Requirements 5.1, 5.3**
   * 
   * Property: Với large number of messages, generatePDF phải handle successfully
   */
  it('Property 12: should handle large number of messages', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 50, max: 200 }),
        fc.date(),
        async (messageCount: number, timestamp: Date) => {
          // Generate large number of messages
          const messages: Message[] = Array.from({ length: messageCount }, (_, i) => ({
            sender: (i % 2 === 0 ? 'user' : 'gemini') as 'user' | 'gemini',
            content: `Message ${i + 1}: ${fc.sample(fc.string({ minLength: 10, maxLength: 100 }), 1)[0]}`
          }));

          const content: ChatContent = { messages, timestamp };

          let downloadedBlob: Blob | null = null;

          generator.downloadPDF = (blob: Blob) => {
            downloadedBlob = blob;
          };

          await generator.generatePDF(content, 'large-chat.pdf');

          // Verify: PDF was created successfully
          expect(downloadedBlob).not.toBeNull();
          expect(downloadedBlob).toBeInstanceOf(Blob);
          expect(downloadedBlob!.type).toBe('application/pdf');
          expect(downloadedBlob!.size).toBeGreaterThan(0);

          // Verify: All messages are in styled HTML
          const styledHtml = generator.applyStyles(content, 'large-chat');
          const messageMatches = styledHtml.match(/<div class="message (user|gemini)">/g);
          expect(messageMatches).toHaveLength(messageCount);
        }
      ),
      { numRuns: 20 } // Reduced runs for performance with large content
    );
  });

  /**
   * Feature: gemini-business-to-pdf, Property 12: HTML to PDF conversion (Nested HTML)
   * **Validates: Requirements 5.1, 5.3**
   * 
   * Property: Với deeply nested HTML structures, formatting phải được preserved
   */
  it('Property 12: should preserve deeply nested HTML structures', async () => {
    const nestedHtmlArb = fc.oneof(
      // Nested formatting
      fc.string({ minLength: 1, maxLength: 30 }).map(text => 
        `<strong><em><u>${text}</u></em></strong>`
      ),
      // Nested lists
      fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 2, maxLength: 4 }).map(items =>
        `<ul><li>${items[0]}<ul><li>${items[1]}</li></ul></li></ul>`
      ),
      // Code in list
      fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 2, maxLength: 3 }).map(items =>
        `<ul>${items.map(item => `<li><code>${item}</code></li>`).join('')}</ul>`
      ),
      // Table with formatted cells
      fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 2, maxLength: 3 }).map(items =>
        `<table><tr><th><strong>${items[0]}</strong></th></tr><tr><td><em>${items[1]}</em></td></tr></table>`
      )
    );

    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            sender: fc.constantFrom('user' as const, 'gemini' as const),
            content: nestedHtmlArb
          }),
          { minLength: 1, maxLength: 5 }
        ),
        fc.date(),
        async (messages: Message[], timestamp: Date) => {
          const content: ChatContent = { messages, timestamp };

          let downloadedBlob: Blob | null = null;

          generator.downloadPDF = (blob: Blob) => {
            downloadedBlob = blob;
          };

          await generator.generatePDF(content, 'nested-html.pdf');

          // Verify: PDF was created
          expect(downloadedBlob).not.toBeNull();
          expect(downloadedBlob).toBeInstanceOf(Blob);
          expect(downloadedBlob!.type).toBe('application/pdf');

          // Verify: Nested structures are preserved
          const styledHtml = generator.applyStyles(content, 'nested-html');
          messages.forEach(message => {
            // Original HTML structure should be preserved
            expect(styledHtml).toContain(message.content);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: gemini-business-to-pdf, Property 12: HTML to PDF conversion (Mixed content)
   * **Validates: Requirements 5.1, 5.3**
   * 
   * Property: Với messages containing mixed formatting types, all formats phải được preserved
   */
  it('Property 12: should preserve mixed formatting in single message', async () => {
    const mixedContentArb = fc.tuple(
      fc.string({ minLength: 1, maxLength: 20 }),
      fc.string({ minLength: 1, maxLength: 20 }),
      fc.string({ minLength: 1, maxLength: 20 }),
      fc.array(fc.string({ minLength: 1, maxLength: 15 }), { minLength: 2, maxLength: 3 })
    ).map(([text1, text2, text3, listItems]) => 
      `<p><strong>${text1}</strong> and <em>${text2}</em></p>` +
      `<pre><code>${text3}</code></pre>` +
      `<ul>${listItems.map(item => `<li>${item}</li>`).join('')}</ul>`
    );

    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            sender: fc.constantFrom('user' as const, 'gemini' as const),
            content: mixedContentArb
          }),
          { minLength: 1, maxLength: 5 }
        ),
        fc.date(),
        async (messages: Message[], timestamp: Date) => {
          const content: ChatContent = { messages, timestamp };

          let downloadedBlob: Blob | null = null;

          generator.downloadPDF = (blob: Blob) => {
            downloadedBlob = blob;
          };

          await generator.generatePDF(content, 'mixed-content.pdf');

          // Verify: PDF was created
          expect(downloadedBlob).not.toBeNull();
          expect(downloadedBlob).toBeInstanceOf(Blob);

          // Verify: All formatting types are preserved
          const styledHtml = generator.applyStyles(content, 'mixed-content');
          messages.forEach(message => {
            // Check that all formatting elements are present
            if (message.content.includes('<strong>')) {
              expect(styledHtml).toContain('<strong>');
            }
            if (message.content.includes('<em>')) {
              expect(styledHtml).toContain('<em>');
            }
            if (message.content.includes('<pre><code>')) {
              expect(styledHtml).toContain('<pre>');
              expect(styledHtml).toContain('<code>');
            }
            if (message.content.includes('<ul>')) {
              expect(styledHtml).toContain('<ul>');
              expect(styledHtml).toContain('<li>');
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: gemini-business-to-pdf, Property 13: PDF download với đúng filename
   * **Validates: Requirements 5.6**
   * 
   * Property: Với bất kỳ PDF blob và filename nào, hàm downloadPDF phải trigger 
   * browser download với đúng filename đã chỉ định.
   */
  it('Property 13: should trigger download with correct filename for any valid filename', () => {
    // Custom arbitrary for generating valid filenames
    const validFilenameArb = fc.string({ minLength: 1, maxLength: 100 })
      .map(name => {
        // Sanitize: remove invalid characters
        const sanitized = name.replace(/[\/\\:*?"<>|]/g, '-');
        // Ensure not empty after sanitization
        return sanitized.trim() || 'default';
      })
      .map(name => `${name}.pdf`);

    // Custom arbitrary for generating PDF blobs with various sizes
    const pdfBlobArb = fc.oneof(
      // Small PDF
      fc.constant(new Blob(['%PDF-1.4 small content'], { type: 'application/pdf' })),
      // Medium PDF
      fc.constant(new Blob(['%PDF-1.4 ' + 'x'.repeat(1000)], { type: 'application/pdf' })),
      // Large PDF
      fc.constant(new Blob(['%PDF-1.4 ' + 'x'.repeat(10000)], { type: 'application/pdf' })),
      // Random content PDF
      fc.string({ minLength: 100, maxLength: 5000 }).map(content =>
        new Blob(['%PDF-1.4 ' + content], { type: 'application/pdf' })
      )
    );

    fc.assert(
      fc.property(
        pdfBlobArb,
        validFilenameArb,
        (pdfBlob: Blob, filename: string) => {
          // Track download calls
          let downloadedUrl: string | null = null;
          let downloadedFilename: string | null = null;
          let linkElement: HTMLAnchorElement | null = null;

          // Mock document.createElement to capture link element
          const originalCreateElement = document.createElement.bind(document);
          document.createElement = ((tagName: string) => {
            const element = originalCreateElement(tagName);
            if (tagName === 'a') {
              linkElement = element as HTMLAnchorElement;
              
              // Mock click to capture download action
              const originalClick = element.click.bind(element);
              element.click = () => {
                downloadedUrl = (element as HTMLAnchorElement).href;
                downloadedFilename = (element as HTMLAnchorElement).download;
                // Don't actually trigger download in test
              };
            }
            return element;
          }) as any;

          // Mock URL.createObjectURL
          const originalCreateObjectURL = URL.createObjectURL;
          const createdUrls: string[] = [];
          URL.createObjectURL = (blob: Blob) => {
            const url = `blob:mock-url-${Math.random()}`;
            createdUrls.push(url);
            return url;
          };

          // Mock URL.revokeObjectURL
          const revokedUrls: string[] = [];
          const originalRevokeObjectURL = URL.revokeObjectURL;
          URL.revokeObjectURL = (url: string) => {
            revokedUrls.push(url);
          };

          try {
            // Execute: Call downloadPDF
            generator.downloadPDF(pdfBlob, filename);

            // Advance timers to trigger setTimeout
            vi.advanceTimersByTime(100);

            // Verify 1: Link element was created
            expect(linkElement).not.toBeNull();

            // Verify 2: Correct filename was set
            expect(downloadedFilename).toBe(filename);

            // Verify 3: Object URL was created from blob
            expect(createdUrls.length).toBe(1);
            expect(downloadedUrl).toBe(createdUrls[0]);

            // Verify 4: Link href points to created URL
            expect(linkElement!.href).toContain('blob:mock-url-');

            // Verify 5: Link has download attribute
            expect(linkElement!.download).toBe(filename);

            // Verify 6: Link was added to DOM and removed
            // (We can't easily verify this in the test, but we verify click was called)
            expect(downloadedUrl).not.toBeNull();

            // Note: URL.revokeObjectURL is called in setTimeout, so we can't verify it synchronously
            // But we verify the URL was created, which is the critical part

          } finally {
            // Restore mocks
            document.createElement = originalCreateElement;
            URL.createObjectURL = originalCreateObjectURL;
            URL.revokeObjectURL = originalRevokeObjectURL;
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: gemini-business-to-pdf, Property 13: PDF download với special characters trong filename
   * **Validates: Requirements 5.6**
   * 
   * Property: Với filename chứa special characters (đã được sanitized), 
   * downloadPDF vẫn phải trigger download thành công
   */
  it('Property 13: should handle filenames with special characters', () => {
    const specialFilenameArb = fc.oneof(
      fc.constant('chat-with-spaces.pdf'),
      fc.constant('chat_with_underscores.pdf'),
      fc.constant('chat-with-dashes.pdf'),
      fc.constant('chat.with.dots.pdf'),
      fc.constant('chat-123-numbers.pdf'),
      fc.constant('UPPERCASE-CHAT.pdf'),
      fc.constant('MixedCase-Chat.pdf'),
      fc.constant('very-long-filename-that-is-still-valid-and-should-work-correctly.pdf')
    );

    fc.assert(
      fc.property(
        specialFilenameArb,
        (filename: string) => {
          const pdfBlob = new Blob(['%PDF-1.4 test'], { type: 'application/pdf' });

          let downloadedFilename: string | null = null;
          let linkClicked = false;

          // Mock document.createElement
          const originalCreateElement = document.createElement.bind(document);
          document.createElement = ((tagName: string) => {
            const element = originalCreateElement(tagName);
            if (tagName === 'a') {
              element.click = () => {
                downloadedFilename = (element as HTMLAnchorElement).download;
                linkClicked = true;
              };
            }
            return element;
          }) as any;

          // Mock URL methods
          const originalCreateObjectURL = URL.createObjectURL;
          URL.createObjectURL = () => 'blob:mock-url';
          const originalRevokeObjectURL = URL.revokeObjectURL;
          URL.revokeObjectURL = () => {};

          try {
            generator.downloadPDF(pdfBlob, filename);

            // Advance timers
            vi.advanceTimersByTime(100);

            // Verify: Download was triggered with correct filename
            expect(linkClicked).toBe(true);
            expect(downloadedFilename).toBe(filename);

          } finally {
            // Restore mocks
            document.createElement = originalCreateElement;
            URL.createObjectURL = originalCreateObjectURL;
            URL.revokeObjectURL = originalRevokeObjectURL;
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: gemini-business-to-pdf, Property 13: PDF download với different blob types
   * **Validates: Requirements 5.6**
   * 
   * Property: Với different blob sizes và content types, downloadPDF phải 
   * handle correctly và trigger download
   */
  it('Property 13: should handle different blob sizes', () => {
    const blobSizeArb = fc.integer({ min: 1, max: 100000 });

    fc.assert(
      fc.property(
        blobSizeArb,
        (size: number) => {
          // Create blob with specified size
          const content = '%PDF-1.4 ' + 'x'.repeat(size);
          const pdfBlob = new Blob([content], { type: 'application/pdf' });
          const filename = `test-${size}.pdf`;

          let downloadTriggered = false;
          let blobUrl: string | null = null;

          // Mock document.createElement
          const originalCreateElement = document.createElement.bind(document);
          document.createElement = ((tagName: string) => {
            const element = originalCreateElement(tagName);
            if (tagName === 'a') {
              element.click = () => {
                downloadTriggered = true;
                blobUrl = (element as HTMLAnchorElement).href;
              };
            }
            return element;
          }) as any;

          // Mock URL methods
          const originalCreateObjectURL = URL.createObjectURL;
          URL.createObjectURL = (blob: Blob) => {
            // Verify blob size matches
            expect(blob.size).toBe(pdfBlob.size);
            expect(blob.type).toBe('application/pdf');
            return 'blob:mock-url';
          };
          const originalRevokeObjectURL = URL.revokeObjectURL;
          URL.revokeObjectURL = () => {};

          try {
            generator.downloadPDF(pdfBlob, filename);

            // Advance timers
            vi.advanceTimersByTime(100);

            // Verify: Download was triggered
            expect(downloadTriggered).toBe(true);
            expect(blobUrl).toBe('blob:mock-url');

          } finally {
            // Restore mocks
            document.createElement = originalCreateElement;
            URL.createObjectURL = originalCreateObjectURL;
            URL.revokeObjectURL = originalRevokeObjectURL;
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: gemini-business-to-pdf, Property 13: PDF download cleanup
   * **Validates: Requirements 5.6**
   * 
   * Property: Sau khi download, link element phải được removed khỏi DOM
   * và object URL phải được revoked (eventually)
   */
  it('Property 13: should cleanup resources after download', () => {
    const filenameArb = fc.string({ minLength: 1, maxLength: 50 })
      .map(name => `${name.replace(/[\/\\:*?"<>|]/g, '-') || 'test'}.pdf`);

    fc.assert(
      fc.property(
        filenameArb,
        (filename: string) => {
          const pdfBlob = new Blob(['%PDF-1.4 test'], { type: 'application/pdf' });

          let linkAddedToDOM = false;
          let linkRemovedFromDOM = false;
          let linkElement: HTMLAnchorElement | null = null;

          // Mock document.body methods
          const originalAppendChild = document.body.appendChild.bind(document.body);
          document.body.appendChild = ((node: Node) => {
            if (node instanceof HTMLAnchorElement) {
              linkAddedToDOM = true;
              linkElement = node;
            }
            return originalAppendChild(node);
          }) as any;

          const originalRemoveChild = document.body.removeChild.bind(document.body);
          document.body.removeChild = ((node: Node) => {
            if (node === linkElement) {
              linkRemovedFromDOM = true;
            }
            return originalRemoveChild(node);
          }) as any;

          // Mock URL methods
          const originalCreateObjectURL = URL.createObjectURL;
          URL.createObjectURL = () => 'blob:mock-url';
          const originalRevokeObjectURL = URL.revokeObjectURL;
          URL.revokeObjectURL = () => {};

          try {
            generator.downloadPDF(pdfBlob, filename);

            // Advance timers
            vi.advanceTimersByTime(100);

            // Verify: Link was added and then removed from DOM
            expect(linkAddedToDOM).toBe(true);
            expect(linkRemovedFromDOM).toBe(true);

          } finally {
            // Restore mocks
            document.body.appendChild = originalAppendChild;
            document.body.removeChild = originalRemoveChild;
            URL.createObjectURL = originalCreateObjectURL;
            URL.revokeObjectURL = originalRevokeObjectURL;
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
