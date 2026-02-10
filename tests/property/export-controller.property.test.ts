/**
 * Property-based tests for ExportController
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

describe('ExportController - Property Tests', () => {
  let controller: ExportController;
  let mockUIInjector: any;
  let mockMessageExpander: any;
  let mockContentExtractor: any;
  let mockTitleExtractor: any;
  let mockPDFGenerator: any;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

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
    vi.restoreAllMocks();
  });

  /**
   * Feature: gemini-business-to-pdf, Property 14: Button disabled trong khi processing
   * **Validates: Requirements 6.2**
   * 
   * Property: Với bất kỳ export operation nào đang chạy, 
   * Export Button phải ở trạng thái disabled cho đến khi 
   * operation hoàn tất (success hoặc error).
   */
  it('Property 14: should keep button disabled during entire export operation', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random operation duration (10-200ms)
        fc.integer({ min: 10, max: 200 }),
        // Generate random number of messages
        fc.integer({ min: 1, max: 50 }),
        // Generate random success/failure
        fc.boolean(),
        async (operationDuration, messageCount, shouldSucceed) => {
          // Reset mocks for this iteration
          vi.clearAllMocks();

          // Track when operations complete
          let expandCompleted = false;
          let extractCompleted = false;
          let pdfCompleted = false;

          // Setup expandAllMessages to take some time
          const mockExpandResult: ExpandResult = {
            totalFound: messageCount,
            expanded: messageCount,
            failed: 0,
            errors: []
          };

          mockMessageExpander.expandAllMessages = vi.fn().mockImplementation(
            () => new Promise(resolve => {
              setTimeout(() => {
                expandCompleted = true;
                resolve(mockExpandResult);
              }, operationDuration / 4);
            })
          );

          // Setup content extraction
          const mockMessages = Array.from({ length: messageCount }, (_, i) => ({
            sender: i % 2 === 0 ? 'user' : 'gemini',
            content: `<p>Message ${i}</p>`
          }));
          const mockChatContent: ChatContent = {
            messages: mockMessages as any,
            timestamp: new Date()
          };

          mockContentExtractor.extractChatContent = vi.fn().mockImplementation(() => {
            extractCompleted = true;
            return mockChatContent;
          });

          mockTitleExtractor.extractTitle = vi.fn().mockReturnValue('Test Chat');
          mockTitleExtractor.generateFilename = vi.fn().mockReturnValue('test-chat.pdf');

          // Setup PDF generation to take some time and possibly fail
          mockPDFGenerator.generatePDF = vi.fn().mockImplementation(
            () => new Promise((resolve, reject) => {
              setTimeout(() => {
                pdfCompleted = true;
                if (shouldSucceed) {
                  resolve(undefined);
                } else {
                  reject(new Error('PDF generation failed'));
                }
              }, operationDuration / 4);
            })
          );

          // Execute: Start export operation
          await controller.handleExport();

          // Verify: All operations completed
          expect(expandCompleted).toBe(true);
          expect(extractCompleted).toBe(true);
          expect(pdfCompleted).toBe(true);

          // Verify: Button was disabled at the start
          expect(mockUIInjector.disableButton).toHaveBeenCalled();

          // Verify: Button was enabled after operation completed (in finally block)
          expect(mockUIInjector.enableButton).toHaveBeenCalled();

          // Verify: disableButton was called before enableButton
          const disableCallOrder = mockUIInjector.disableButton.mock.invocationCallOrder[0];
          const enableCallOrder = mockUIInjector.enableButton.mock.invocationCallOrder[0];
          expect(disableCallOrder).toBeLessThan(enableCallOrder);

          // Verify: Both were called exactly once
          expect(mockUIInjector.disableButton).toHaveBeenCalledTimes(1);
          expect(mockUIInjector.enableButton).toHaveBeenCalledTimes(1);
        }
      ),
      { numRuns: 100, timeout: 10000 }
    );
  }, 15000);

  /**
   * Feature: gemini-business-to-pdf, Property 15: Error handling với message cụ thể
   * **Validates: Requirements 6.4**
   * 
   * Property: Với bất kỳ error nào xảy ra trong quá trình export, 
   * hàm handleError phải hiển thị error notification với message 
   * mô tả cụ thể về lỗi.
   */
  it('Property 15: should display specific error message for any error', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random error messages
        fc.string({ minLength: 5, maxLength: 100 }),
        // Generate random error source (which step fails)
        fc.constantFrom('expand', 'extract', 'title', 'pdf'),
        async (errorMessage, errorSource) => {
          // Reset mocks for this iteration
          vi.clearAllMocks();

          // Setup mocks - one will fail based on errorSource
          const mockExpandResult: ExpandResult = {
            totalFound: 5,
            expanded: 5,
            failed: 0,
            errors: []
          };

          const mockChatContent: ChatContent = {
            messages: [
              { sender: 'user', content: '<p>Test</p>' }
            ],
            timestamp: new Date()
          };

          // Setup which step will fail
          switch (errorSource) {
            case 'expand':
              mockMessageExpander.expandAllMessages = vi.fn()
                .mockRejectedValue(new Error(errorMessage));
              mockContentExtractor.extractChatContent = vi.fn().mockReturnValue(mockChatContent);
              mockTitleExtractor.extractTitle = vi.fn().mockReturnValue('Test');
              mockTitleExtractor.generateFilename = vi.fn().mockReturnValue('test.pdf');
              mockPDFGenerator.generatePDF = vi.fn().mockResolvedValue(undefined);
              break;

            case 'extract':
              mockMessageExpander.expandAllMessages = vi.fn().mockResolvedValue(mockExpandResult);
              mockContentExtractor.extractChatContent = vi.fn()
                .mockImplementation(() => { throw new Error(errorMessage); });
              mockTitleExtractor.extractTitle = vi.fn().mockReturnValue('Test');
              mockTitleExtractor.generateFilename = vi.fn().mockReturnValue('test.pdf');
              mockPDFGenerator.generatePDF = vi.fn().mockResolvedValue(undefined);
              break;

            case 'title':
              mockMessageExpander.expandAllMessages = vi.fn().mockResolvedValue(mockExpandResult);
              mockContentExtractor.extractChatContent = vi.fn().mockReturnValue(mockChatContent);
              mockTitleExtractor.extractTitle = vi.fn()
                .mockImplementation(() => { throw new Error(errorMessage); });
              mockTitleExtractor.generateFilename = vi.fn().mockReturnValue('test.pdf');
              mockPDFGenerator.generatePDF = vi.fn().mockResolvedValue(undefined);
              break;

            case 'pdf':
              mockMessageExpander.expandAllMessages = vi.fn().mockResolvedValue(mockExpandResult);
              mockContentExtractor.extractChatContent = vi.fn().mockReturnValue(mockChatContent);
              mockTitleExtractor.extractTitle = vi.fn().mockReturnValue('Test');
              mockTitleExtractor.generateFilename = vi.fn().mockReturnValue('test.pdf');
              mockPDFGenerator.generatePDF = vi.fn()
                .mockRejectedValue(new Error(errorMessage));
              break;
          }

          // Execute: Run export which will fail
          await controller.handleExport();

          // Verify: Error notification was shown
          expect(mockUIInjector.showNotification).toHaveBeenCalled();

          // Verify: Notification contains the specific error message
          const notificationCalls = mockUIInjector.showNotification.mock.calls;
          const errorNotification = notificationCalls.find(
            call => call[1] === 'error'
          );

          expect(errorNotification).toBeDefined();
          expect(errorNotification![0]).toContain(errorMessage);

          // Verify: Error notification format includes context
          expect(errorNotification![0]).toMatch(/Không thể xuất PDF:/);
        }
      ),
      { numRuns: 100, timeout: 5000 }
    );
  }, 10000);

  /**
   * Feature: gemini-business-to-pdf, Property 16: Button re-enabled sau completion
   * **Validates: Requirements 6.5**
   * 
   * Property: Với bất kỳ export operation nào (thành công hoặc thất bại), 
   * sau khi operation hoàn tất, Export Button phải được enable lại.
   */
  it('Property 16: should re-enable button after any operation completion', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random success/failure scenarios
        fc.boolean(),
        // Generate random error source if failure
        fc.constantFrom('expand', 'extract', 'title', 'pdf'),
        // Generate random operation characteristics
        fc.integer({ min: 1, max: 20 }), // message count
        async (shouldSucceed, errorSource, messageCount) => {
          // Reset mocks for this iteration
          vi.clearAllMocks();

          // Setup mocks
          const mockExpandResult: ExpandResult = {
            totalFound: messageCount,
            expanded: messageCount,
            failed: 0,
            errors: []
          };

          const mockMessages = Array.from({ length: messageCount }, (_, i) => ({
            sender: i % 2 === 0 ? 'user' : 'gemini',
            content: `<p>Message ${i}</p>`
          }));

          const mockChatContent: ChatContent = {
            messages: mockMessages as any,
            timestamp: new Date()
          };

          if (shouldSucceed) {
            // Setup for successful operation
            mockMessageExpander.expandAllMessages = vi.fn().mockResolvedValue(mockExpandResult);
            mockContentExtractor.extractChatContent = vi.fn().mockReturnValue(mockChatContent);
            mockTitleExtractor.extractTitle = vi.fn().mockReturnValue('Test Chat');
            mockTitleExtractor.generateFilename = vi.fn().mockReturnValue('test-chat.pdf');
            mockPDFGenerator.generatePDF = vi.fn().mockResolvedValue(undefined);
          } else {
            // Setup for failure at specific step
            const error = new Error('Operation failed');

            switch (errorSource) {
              case 'expand':
                mockMessageExpander.expandAllMessages = vi.fn().mockRejectedValue(error);
                mockContentExtractor.extractChatContent = vi.fn().mockReturnValue(mockChatContent);
                mockTitleExtractor.extractTitle = vi.fn().mockReturnValue('Test');
                mockTitleExtractor.generateFilename = vi.fn().mockReturnValue('test.pdf');
                mockPDFGenerator.generatePDF = vi.fn().mockResolvedValue(undefined);
                break;

              case 'extract':
                mockMessageExpander.expandAllMessages = vi.fn().mockResolvedValue(mockExpandResult);
                mockContentExtractor.extractChatContent = vi.fn().mockImplementation(() => {
                  throw error;
                });
                mockTitleExtractor.extractTitle = vi.fn().mockReturnValue('Test');
                mockTitleExtractor.generateFilename = vi.fn().mockReturnValue('test.pdf');
                mockPDFGenerator.generatePDF = vi.fn().mockResolvedValue(undefined);
                break;

              case 'title':
                mockMessageExpander.expandAllMessages = vi.fn().mockResolvedValue(mockExpandResult);
                mockContentExtractor.extractChatContent = vi.fn().mockReturnValue(mockChatContent);
                mockTitleExtractor.extractTitle = vi.fn().mockImplementation(() => {
                  throw error;
                });
                mockTitleExtractor.generateFilename = vi.fn().mockReturnValue('test.pdf');
                mockPDFGenerator.generatePDF = vi.fn().mockResolvedValue(undefined);
                break;

              case 'pdf':
                mockMessageExpander.expandAllMessages = vi.fn().mockResolvedValue(mockExpandResult);
                mockContentExtractor.extractChatContent = vi.fn().mockReturnValue(mockChatContent);
                mockTitleExtractor.extractTitle = vi.fn().mockReturnValue('Test');
                mockTitleExtractor.generateFilename = vi.fn().mockReturnValue('test.pdf');
                mockPDFGenerator.generatePDF = vi.fn().mockRejectedValue(error);
                break;
            }
          }

          // Execute: Run export operation
          await controller.handleExport();

          // Verify: Button was disabled at start
          expect(mockUIInjector.disableButton).toHaveBeenCalled();

          // Verify: Button was re-enabled after completion
          expect(mockUIInjector.enableButton).toHaveBeenCalled();

          // Verify: hideLoading was also called (cleanup)
          expect(mockUIInjector.hideLoading).toHaveBeenCalled();

          // Verify: enableButton and hideLoading were called exactly once
          expect(mockUIInjector.enableButton).toHaveBeenCalledTimes(1);
          expect(mockUIInjector.hideLoading).toHaveBeenCalledTimes(1);

          // Verify: Appropriate notification was shown
          if (shouldSucceed) {
            const successNotification = mockUIInjector.showNotification.mock.calls.find(
              call => call[1] === 'success'
            );
            expect(successNotification).toBeDefined();
          } else {
            const errorNotification = mockUIInjector.showNotification.mock.calls.find(
              call => call[1] === 'error'
            );
            expect(errorNotification).toBeDefined();
          }
        }
      ),
      { numRuns: 100, timeout: 5000 }
    );
  }, 10000);
});
