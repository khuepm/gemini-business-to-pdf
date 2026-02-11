/**
 * Property-based tests for Storage Isolation
 * Feature: gemini-business-to-pdf
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { ExportController } from '../../src/content/export-controller';
import { ExpandResult } from '../../src/content/message-expander';
import { ChatContent } from '../../src/content/content-extractor';

// Mock all dependencies
vi.mock('../../src/content/ui-injector');
vi.mock('../../src/content/message-expander');
vi.mock('../../src/content/content-extractor');
vi.mock('../../src/content/title-extractor');
vi.mock('../../src/content/pdf-generator');
vi.mock('../../src/utils/logger');
vi.mock('../../src/utils/error-handler');

describe('Storage Isolation - Property Tests', () => {
  let controller: ExportController;
  let mockUIInjector: any;
  let mockMessageExpander: any;
  let mockContentExtractor: any;
  let mockTitleExtractor: any;
  let mockPDFGenerator: any;
  
  // Storage monitoring
  let storageOperations: Array<{ type: string; key?: string; value?: any }>;
  let originalLocalStorageSetItem: typeof Storage.prototype.setItem;
  let originalLocalStorageGetItem: typeof Storage.prototype.getItem;
  let indexedDBOpenCalls: Array<{ name: string; version?: number }>;
  let originalIndexedDBOpen: any;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Initialize storage operation tracking
    storageOperations = [];
    indexedDBOpenCalls = [];

    // Mock localStorage
    originalLocalStorageSetItem = Storage.prototype.setItem;
    originalLocalStorageGetItem = Storage.prototype.getItem;
    
    Storage.prototype.setItem = function(key: string, value: string) {
      storageOperations.push({
        type: 'localStorage.setItem',
        key,
        value
      });
      // Don't actually store
    };

    Storage.prototype.getItem = function(key: string) {
      storageOperations.push({
        type: 'localStorage.getItem',
        key
      });
      return null;
    };

    // Mock sessionStorage (shares prototype with localStorage, but track separately)
    sessionStorage.setItem = function(key: string, value: string) {
      storageOperations.push({
        type: 'sessionStorage.setItem',
        key,
        value
      });
      // Don't actually store
    };

    sessionStorage.getItem = function(key: string) {
      storageOperations.push({
        type: 'sessionStorage.getItem',
        key
      });
      return null;
    };

    // Mock IndexedDB if it exists
    if (typeof indexedDB !== 'undefined') {
      originalIndexedDBOpen = indexedDB.open;
      indexedDB.open = function(name: string, version?: number) {
        indexedDBOpenCalls.push({ name, version });
        // Return a mock IDBOpenDBRequest that never succeeds
        const mockRequest = {
          onsuccess: null,
          onerror: null,
          onupgradeneeded: null,
          result: null,
          error: new Error('IndexedDB blocked in test'),
          readyState: 'done',
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn()
        } as any;
        
        // Trigger error asynchronously
        setTimeout(() => {
          if (mockRequest.onerror) {
            mockRequest.onerror({ target: mockRequest } as any);
          }
        }, 0);
        
        return mockRequest;
      };
    } else {
      // Create a mock indexedDB if it doesn't exist
      (global as any).indexedDB = {
        open: function(name: string, version?: number) {
          indexedDBOpenCalls.push({ name, version });
          const mockRequest = {
            onsuccess: null,
            onerror: null,
            onupgradeneeded: null,
            result: null,
            error: new Error('IndexedDB blocked in test'),
            readyState: 'done',
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn()
          } as any;
          
          setTimeout(() => {
            if (mockRequest.onerror) {
              mockRequest.onerror({ target: mockRequest } as any);
            }
          }, 0);
          
          return mockRequest;
        }
      };
    }

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
    Storage.prototype.setItem = originalLocalStorageSetItem;
    Storage.prototype.getItem = originalLocalStorageGetItem;
    
    // Restore IndexedDB if it was mocked
    if (originalIndexedDBOpen && typeof indexedDB !== 'undefined') {
      indexedDB.open = originalIndexedDBOpen;
    }
    
    vi.restoreAllMocks();
  });

  /**
   * Feature: gemini-business-to-pdf, Property 20: No data persistence
   * **Validates: Requirements 8.4**
   * 
   * Property: Với bất kỳ export operation nào, sau khi hoàn tất, 
   * không có dữ liệu chat nào được lưu trong localStorage, 
   * sessionStorage, hoặc IndexedDB.
   */
  it('Property 20: should not store any data in localStorage during export', async () => {
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
          // Reset storage tracking for this iteration
          storageOperations = [];
          indexedDBOpenCalls = [];
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

          // Verify: No localStorage operations
          const localStorageWrites = storageOperations.filter(
            op => op.type === 'localStorage.setItem'
          );
          expect(localStorageWrites).toHaveLength(0);

          // Verify: Export completed successfully
          expect(mockMessageExpander.expandAllMessages).toHaveBeenCalled();
          expect(mockContentExtractor.extractChatContent).toHaveBeenCalled();
          expect(mockPDFGenerator.generatePDF).toHaveBeenCalled();
        }
      ),
      { numRuns: 100, timeout: 5000 }
    );
  }, 10000);

  /**
   * Feature: gemini-business-to-pdf, Property 20: No data persistence
   * **Validates: Requirements 8.4**
   * 
   * Property: Với bất kỳ export operation nào, sau khi hoàn tất, 
   * không có dữ liệu chat nào được lưu trong sessionStorage.
   */
  it('Property 20: should not store any data in sessionStorage during export', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random number of messages (1-50)
        fc.integer({ min: 1, max: 50 }),
        // Generate random message content
        fc.array(
          fc.record({
            sender: fc.constantFrom('user', 'gemini'),
            content: fc.string({ minLength: 10, maxLength: 150 })
          }),
          { minLength: 1, maxLength: 50 }
        ),
        async (messageCount, messages) => {
          // Reset storage tracking
          storageOperations = [];
          indexedDBOpenCalls = [];
          vi.clearAllMocks();

          // Setup mocks
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

          // Execute: Run export
          await controller.handleExport();

          // Verify: No sessionStorage operations
          const sessionStorageWrites = storageOperations.filter(
            op => op.type === 'sessionStorage.setItem'
          );
          expect(sessionStorageWrites).toHaveLength(0);

          // Verify: Export completed
          expect(mockPDFGenerator.generatePDF).toHaveBeenCalled();
        }
      ),
      { numRuns: 100, timeout: 5000 }
    );
  }, 10000);

  /**
   * Feature: gemini-business-to-pdf, Property 20: No data persistence
   * **Validates: Requirements 8.4**
   * 
   * Property: Với bất kỳ export operation nào, sau khi hoàn tất, 
   * không có dữ liệu chat nào được lưu trong IndexedDB.
   */
  it('Property 20: should not store any data in IndexedDB during export', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random number of messages
        fc.integer({ min: 1, max: 50 }),
        // Generate random content
        fc.array(
          fc.record({
            sender: fc.constantFrom('user', 'gemini'),
            content: fc.string({ minLength: 10, maxLength: 150 })
          }),
          { minLength: 1, maxLength: 50 }
        ),
        async (messageCount, messages) => {
          // Reset tracking
          storageOperations = [];
          indexedDBOpenCalls = [];
          vi.clearAllMocks();

          // Setup mocks
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

          mockMessageExpander.expandAllMessages = vi.fn()
            .mockResolvedValue(mockExpandResult);
          mockContentExtractor.extractChatContent = vi.fn()
            .mockReturnValue(mockChatContent);
          mockTitleExtractor.extractTitle = vi.fn()
            .mockReturnValue('Test');
          mockTitleExtractor.generateFilename = vi.fn()
            .mockReturnValue('test.pdf');
          mockPDFGenerator.generatePDF = vi.fn()
            .mockResolvedValue(undefined);

          // Execute: Run export
          await controller.handleExport();

          // Verify: No IndexedDB operations
          expect(indexedDBOpenCalls).toHaveLength(0);

          // Verify: Export completed
          expect(mockPDFGenerator.generatePDF).toHaveBeenCalled();
        }
      ),
      { numRuns: 100, timeout: 5000 }
    );
  }, 10000);

  /**
   * Feature: gemini-business-to-pdf, Property 20: No data persistence (Error case)
   * **Validates: Requirements 8.4**
   * 
   * Property: Ngay cả khi có lỗi xảy ra trong quá trình export, 
   * extension vẫn không được lưu bất kỳ dữ liệu nào vào storage.
   */
  it('Property 20: should not store data even when errors occur', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random error source
        fc.constantFrom('expand', 'extract', 'title', 'pdf'),
        // Generate random error message
        fc.string({ minLength: 5, maxLength: 100 }),
        // Generate random message count
        fc.integer({ min: 1, max: 50 }),
        async (errorSource, errorMessage, messageCount) => {
          // Reset tracking
          storageOperations = [];
          indexedDBOpenCalls = [];
          vi.clearAllMocks();

          // Setup mocks - one will fail
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

          const error = new Error(errorMessage);

          switch (errorSource) {
            case 'expand':
              mockMessageExpander.expandAllMessages = vi.fn()
                .mockRejectedValue(error);
              break;
            case 'extract':
              mockMessageExpander.expandAllMessages = vi.fn()
                .mockResolvedValue(mockExpandResult);
              mockContentExtractor.extractChatContent = vi.fn()
                .mockImplementation(() => { throw error; });
              break;
            case 'title':
              mockMessageExpander.expandAllMessages = vi.fn()
                .mockResolvedValue(mockExpandResult);
              mockContentExtractor.extractChatContent = vi.fn()
                .mockReturnValue(mockChatContent);
              mockTitleExtractor.extractTitle = vi.fn()
                .mockImplementation(() => { throw error; });
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

          // Verify: No storage operations despite error
          const allStorageWrites = storageOperations.filter(
            op => op.type.includes('setItem')
          );
          expect(allStorageWrites).toHaveLength(0);
          expect(indexedDBOpenCalls).toHaveLength(0);

          // Verify: Error was handled
          const errorNotification = mockUIInjector.showNotification.mock.calls.find(
            (call: any) => call[1] === 'error'
          );
          expect(errorNotification).toBeDefined();
        }
      ),
      { numRuns: 100, timeout: 5000 }
    );
  }, 10000);

  /**
   * Feature: gemini-business-to-pdf, Property 20: No data persistence (Comprehensive)
   * **Validates: Requirements 8.4**
   * 
   * Property: Kiểm tra toàn diện rằng không có bất kỳ storage operation nào 
   * (read hoặc write) được thực hiện trong suốt quá trình export.
   */
  it('Property 20: should not perform any storage operations during export', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random operation parameters
        fc.integer({ min: 1, max: 30 }),
        fc.boolean(), // success or failure
        async (messageCount, shouldSucceed) => {
          // Reset tracking
          storageOperations = [];
          indexedDBOpenCalls = [];
          vi.clearAllMocks();

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
          }

          // Execute: Run export
          await controller.handleExport();

          // Verify: No storage operations at all (read or write)
          expect(storageOperations).toHaveLength(0);
          expect(indexedDBOpenCalls).toHaveLength(0);

          // Verify: No localStorage operations
          const localStorageOps = storageOperations.filter(
            op => op.type.startsWith('localStorage')
          );
          expect(localStorageOps).toHaveLength(0);

          // Verify: No sessionStorage operations
          const sessionStorageOps = storageOperations.filter(
            op => op.type.startsWith('sessionStorage')
          );
          expect(sessionStorageOps).toHaveLength(0);

          // Verify: No IndexedDB operations
          expect(indexedDBOpenCalls).toHaveLength(0);
        }
      ),
      { numRuns: 100, timeout: 5000 }
    );
  }, 10000);
});
