/**
 * Property-based tests for Network Isolation
 * Feature: gemini-business-to-pdf
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { ExportController } from '../../src/content/export-controller';
import { UIInjector } from '../../src/content/ui-injector';
import { MessageExpander, ExpandResult } from '../../src/content/message-expander';
import { ContentExtractor, ChatContent } from '../../src/content/content-extractor';
import { TitleExtractor } from '../../src/content/title-extractor';
import { PDFGenerator } from '../../src/content/pdf-generator';

// Mock all dependencies
vi.mock('../../src/content/ui-injector');
vi.mock('../../src/content/message-expander');
vi.mock('../../src/content/content-extractor');
vi.mock('../../src/content/title-extractor');
vi.mock('../../src/content/pdf-generator');
vi.mock('../../src/utils/logger');
vi.mock('../../src/utils/error-handler');

describe('Network Isolation - Property Tests', () => {
  let controller: ExportController;
  let mockUIInjector: any;
  let mockMessageExpander: any;
  let mockContentExtractor: any;
  let mockTitleExtractor: any;
  let mockPDFGenerator: any;
  
  // Network monitoring
  let networkRequests: Array<{ url: string; method: string }>;
  let originalFetch: typeof fetch;
  let originalXHROpen: typeof XMLHttpRequest.prototype.open;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Initialize network request tracking
    networkRequests = [];

    // Mock fetch API
    originalFetch = global.fetch;
    global.fetch = vi.fn((url: string | URL | Request, options?: RequestInit) => {
      const urlString = typeof url === 'string' ? url : url instanceof URL ? url.toString() : url.url;
      networkRequests.push({
        url: urlString,
        method: options?.method || 'GET'
      });
      return Promise.reject(new Error('Network request blocked in test'));
    }) as any;

    // Mock XMLHttpRequest
    originalXHROpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(
      method: string,
      url: string | URL
    ) {
      const urlString = typeof url === 'string' ? url : url.toString();
      networkRequests.push({
        url: urlString,
        method
      });
      // Don't actually open the connection
      return;
    } as any;

    // Create controller instance
    controller = new ExportController();

    // Get mock instances
    mockUIInjector = (controller as any).uiInjector;
    mockMessageExpander = (controller as any).messageExpander;
    mockContentExtractor = (controller as any).contentExtractor;
    mockTitleExtractor = (controller as any).titleExtractor;
    mockPDFGenerator = (controller as any).pdfGenerator;

    // Setup default mock implementations
    mockUIInjector.showLoading = vi.fn();
    mockUIInjector.hideLoading = vi.fn();
    mockUIInjector.disableButton = vi.fn();
    mockUIInjector.enableButton = vi.fn();
    mockUIInjector.showNotification = vi.fn();

    mockMessageExpander.expandAllMessages = vi.fn();
    mockContentExtractor.extractChatContent = vi.fn();
    mockTitleExtractor.extractTitle = vi.fn();
    mockTitleExtractor.generateFilename = vi.fn();
    mockPDFGenerator.generatePDF = vi.fn();
  });

  afterEach(() => {
    // Restore original implementations
    global.fetch = originalFetch;
    XMLHttpRequest.prototype.open = originalXHROpen;
    
    vi.restoreAllMocks();
  });

  /**
   * Feature: gemini-business-to-pdf, Property 19: No external data transmission
   * **Validates: Requirements 8.2**
   * 
   * Property: Với bất kỳ export operation nào, extension không được tạo 
   * bất kỳ network request nào đến domain bên ngoài 
   * (tất cả xử lý ở client).
   */
  it('Property 19: should not make any external network requests during export', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random number of messages (1-100)
        fc.integer({ min: 1, max: 100 }),
        // Generate random message content
        fc.array(
          fc.record({
            sender: fc.constantFrom('user', 'gemini'),
            content: fc.string({ minLength: 10, maxLength: 200 })
          }),
          { minLength: 1, maxLength: 100 }
        ),
        // Generate random title
        fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: null }),
        // Generate random filename
        fc.string({ minLength: 5, maxLength: 50 }).map(s => `${s}.pdf`),
        async (messageCount, messages, title, filename) => {
          // Reset network tracking for this iteration
          networkRequests = [];
          vi.clearAllMocks();

          // Setup mocks for successful export
          const mockExpandResult: ExpandResult = {
            totalFound: messageCount,
            expanded: messageCount,
            failed: 0,
            errors: []
          };

          const mockChatContent: ChatContent = {
            messages: messages.slice(0, messageCount).map(msg => ({
              sender: msg.sender as 'user' | 'gemini',
              content: `<p>${msg.content}</p>`,
              metadata: {
                hasCodeBlock: false,
                hasTable: false,
                hasList: false
              }
            })),
            timestamp: new Date(),
            metadata: {
              totalMessages: messageCount,
              userMessages: messages.filter(m => m.sender === 'user').length,
              geminiMessages: messages.filter(m => m.sender === 'gemini').length
            }
          };

          // Setup mock implementations
          mockMessageExpander.expandAllMessages = vi.fn()
            .mockResolvedValue(mockExpandResult);
          
          mockContentExtractor.extractChatContent = vi.fn()
            .mockReturnValue(mockChatContent);
          
          mockTitleExtractor.extractTitle = vi.fn()
            .mockReturnValue(title);
          
          mockTitleExtractor.generateFilename = vi.fn()
            .mockReturnValue(filename);
          
          mockPDFGenerator.generatePDF = vi.fn()
            .mockResolvedValue(undefined);

          // Execute: Run export operation
          await controller.handleExport();

          // Verify: No network requests were made
          expect(networkRequests).toHaveLength(0);

          // Verify: Export completed successfully (all steps were called)
          expect(mockMessageExpander.expandAllMessages).toHaveBeenCalled();
          expect(mockContentExtractor.extractChatContent).toHaveBeenCalled();
          expect(mockTitleExtractor.extractTitle).toHaveBeenCalled();
          expect(mockTitleExtractor.generateFilename).toHaveBeenCalled();
          expect(mockPDFGenerator.generatePDF).toHaveBeenCalled();

          // Verify: Success notification was shown (indicating completion)
          const successNotification = mockUIInjector.showNotification.mock.calls.find(
            call => call[1] === 'success'
          );
          expect(successNotification).toBeDefined();
        }
      ),
      { numRuns: 100, timeout: 5000 }
    );
  }, 10000);

  /**
   * Feature: gemini-business-to-pdf, Property 19: No external data transmission (Error case)
   * **Validates: Requirements 8.2**
   * 
   * Property: Ngay cả khi có lỗi xảy ra trong quá trình export, 
   * extension vẫn không được tạo bất kỳ network request nào 
   * đến domain bên ngoài.
   */
  it('Property 19: should not make network requests even when errors occur', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random error source
        fc.constantFrom('expand', 'extract', 'title', 'pdf'),
        // Generate random error message
        fc.string({ minLength: 5, maxLength: 100 }),
        // Generate random message count
        fc.integer({ min: 1, max: 50 }),
        async (errorSource, errorMessage, messageCount) => {
          // Reset network tracking for this iteration
          networkRequests = [];
          vi.clearAllMocks();

          // Setup mocks - one will fail based on errorSource
          const mockExpandResult: ExpandResult = {
            totalFound: messageCount,
            expanded: messageCount,
            failed: 0,
            errors: []
          };

          const mockChatContent: ChatContent = {
            messages: Array.from({ length: messageCount }, (_, i) => ({
              sender: (i % 2 === 0 ? 'user' : 'gemini') as 'user' | 'gemini',
              content: `<p>Message ${i}</p>`,
              metadata: {
                hasCodeBlock: false,
                hasTable: false,
                hasList: false
              }
            })),
            timestamp: new Date(),
            metadata: {
              totalMessages: messageCount,
              userMessages: Math.ceil(messageCount / 2),
              geminiMessages: Math.floor(messageCount / 2)
            }
          };

          // Setup which step will fail
          const error = new Error(errorMessage);

          switch (errorSource) {
            case 'expand':
              mockMessageExpander.expandAllMessages = vi.fn()
                .mockRejectedValue(error);
              mockContentExtractor.extractChatContent = vi.fn()
                .mockReturnValue(mockChatContent);
              mockTitleExtractor.extractTitle = vi.fn()
                .mockReturnValue('Test');
              mockTitleExtractor.generateFilename = vi.fn()
                .mockReturnValue('test.pdf');
              mockPDFGenerator.generatePDF = vi.fn()
                .mockResolvedValue(undefined);
              break;

            case 'extract':
              mockMessageExpander.expandAllMessages = vi.fn()
                .mockResolvedValue(mockExpandResult);
              mockContentExtractor.extractChatContent = vi.fn()
                .mockImplementation(() => { throw error; });
              mockTitleExtractor.extractTitle = vi.fn()
                .mockReturnValue('Test');
              mockTitleExtractor.generateFilename = vi.fn()
                .mockReturnValue('test.pdf');
              mockPDFGenerator.generatePDF = vi.fn()
                .mockResolvedValue(undefined);
              break;

            case 'title':
              mockMessageExpander.expandAllMessages = vi.fn()
                .mockResolvedValue(mockExpandResult);
              mockContentExtractor.extractChatContent = vi.fn()
                .mockReturnValue(mockChatContent);
              mockTitleExtractor.extractTitle = vi.fn()
                .mockImplementation(() => { throw error; });
              mockTitleExtractor.generateFilename = vi.fn()
                .mockReturnValue('test.pdf');
              mockPDFGenerator.generatePDF = vi.fn()
                .mockResolvedValue(undefined);
              break;

            case 'pdf':
              mockMessageExpander.expandAllMessages = vi.fn()
                .mockResolvedValue(mockExpandResult);
              mockContentExtractor.extractChatContent = vi.fn()
                .mockReturnValue(mockChatContent);
              mockTitleExtractor.extractTitle = vi.fn()
                .mockReturnValue('Test');
              mockTitleExtractor.generateFilename = vi.fn()
                .mockReturnValue('test.pdf');
              mockPDFGenerator.generatePDF = vi.fn()
                .mockRejectedValue(error);
              break;
          }

          // Execute: Run export which will fail
          await controller.handleExport();

          // Verify: No network requests were made despite the error
          expect(networkRequests).toHaveLength(0);

          // Verify: Error was handled (error notification shown)
          const errorNotification = mockUIInjector.showNotification.mock.calls.find(
            call => call[1] === 'error'
          );
          expect(errorNotification).toBeDefined();

          // Verify: Button was re-enabled (cleanup happened)
          expect(mockUIInjector.enableButton).toHaveBeenCalled();
          expect(mockUIInjector.hideLoading).toHaveBeenCalled();
        }
      ),
      { numRuns: 100, timeout: 5000 }
    );
  }, 10000);

  /**
   * Feature: gemini-business-to-pdf, Property 19: No external data transmission (Comprehensive)
   * **Validates: Requirements 8.2**
   * 
   * Property: Kiểm tra toàn diện rằng không có request nào được tạo ra 
   * đến các external domains phổ biến (analytics, tracking, APIs, etc.)
   */
  it('Property 19: should not make requests to common external domains', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random operation parameters
        fc.integer({ min: 1, max: 30 }),
        fc.boolean(), // success or failure
        async (messageCount, shouldSucceed) => {
          // Reset network tracking
          networkRequests = [];
          vi.clearAllMocks();

          // List of external domains to check against
          const externalDomains = [
            'google-analytics.com',
            'googletagmanager.com',
            'facebook.com',
            'twitter.com',
            'analytics.google.com',
            'doubleclick.net',
            'api.example.com',
            'cdn.example.com',
            'tracking.example.com'
          ];

          // Setup mocks
          const mockExpandResult: ExpandResult = {
            totalFound: messageCount,
            expanded: messageCount,
            failed: 0,
            errors: []
          };

          const mockChatContent: ChatContent = {
            messages: Array.from({ length: messageCount }, (_, i) => ({
              sender: (i % 2 === 0 ? 'user' : 'gemini') as 'user' | 'gemini',
              content: `<p>Message ${i}</p>`,
              metadata: {
                hasCodeBlock: false,
                hasTable: false,
                hasList: false
              }
            })),
            timestamp: new Date(),
            metadata: {
              totalMessages: messageCount,
              userMessages: Math.ceil(messageCount / 2),
              geminiMessages: Math.floor(messageCount / 2)
            }
          };

          if (shouldSucceed) {
            mockMessageExpander.expandAllMessages = vi.fn()
              .mockResolvedValue(mockExpandResult);
            mockContentExtractor.extractChatContent = vi.fn()
              .mockReturnValue(mockChatContent);
            mockTitleExtractor.extractTitle = vi.fn()
              .mockReturnValue('Test Chat');
            mockTitleExtractor.generateFilename = vi.fn()
              .mockReturnValue('test-chat.pdf');
            mockPDFGenerator.generatePDF = vi.fn()
              .mockResolvedValue(undefined);
          } else {
            mockMessageExpander.expandAllMessages = vi.fn()
              .mockRejectedValue(new Error('Test error'));
            mockContentExtractor.extractChatContent = vi.fn()
              .mockReturnValue(mockChatContent);
            mockTitleExtractor.extractTitle = vi.fn()
              .mockReturnValue('Test');
            mockTitleExtractor.generateFilename = vi.fn()
              .mockReturnValue('test.pdf');
            mockPDFGenerator.generatePDF = vi.fn()
              .mockResolvedValue(undefined);
          }

          // Execute: Run export
          await controller.handleExport();

          // Verify: No network requests at all
          expect(networkRequests).toHaveLength(0);

          // Verify: No requests to any external domains
          const externalRequests = networkRequests.filter(req => 
            externalDomains.some(domain => req.url.includes(domain))
          );
          expect(externalRequests).toHaveLength(0);

          // Verify: No requests with http:// or https:// protocols to external sites
          const httpRequests = networkRequests.filter(req => 
            req.url.startsWith('http://') || req.url.startsWith('https://')
          );
          expect(httpRequests).toHaveLength(0);
        }
      ),
      { numRuns: 100, timeout: 5000 }
    );
  }, 10000);
});
