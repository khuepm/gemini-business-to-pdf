/**
 * Unit tests for ExportController
 * 
 * Tests the main controller that orchestrates the PDF export flow
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ExportController } from '../../src/content/export-controller';
import { UIInjector } from '../../src/content/ui-injector';
import { MessageExpander, ExpandResult } from '../../src/content/message-expander';
import { ContentExtractor, ChatContent } from '../../src/content/content-extractor';
import { TitleExtractor } from '../../src/content/title-extractor';
import { PDFGenerator } from '../../src/content/pdf-generator';
import { Logger } from '../../src/utils/logger';

// Mock all dependencies
vi.mock('../../src/content/ui-injector');
vi.mock('../../src/content/message-expander');
vi.mock('../../src/content/content-extractor');
vi.mock('../../src/content/title-extractor');
vi.mock('../../src/content/pdf-generator');
vi.mock('../../src/utils/logger');
vi.mock('../../src/utils/error-handler');

describe('ExportController', () => {
  let controller: ExportController;
  let mockButton: HTMLButtonElement;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Create a mock button
    mockButton = document.createElement('button');
    
    // Setup UIInjector mock
    const mockUIInjector = UIInjector as any;
    mockUIInjector.prototype.injectButton = vi.fn();
    mockUIInjector.prototype.getButton = vi.fn(() => mockButton);
    mockUIInjector.prototype.showLoading = vi.fn();
    mockUIInjector.prototype.hideLoading = vi.fn();
    mockUIInjector.prototype.disableButton = vi.fn();
    mockUIInjector.prototype.enableButton = vi.fn();
    mockUIInjector.prototype.showNotification = vi.fn();

    // Setup MessageExpander mock
    const mockMessageExpander = MessageExpander as any;
    const mockExpandResult: ExpandResult = {
      totalFound: 5,
      expanded: 5,
      failed: 0,
      errors: []
    };
    mockMessageExpander.prototype.expandAllMessages = vi.fn().mockResolvedValue(mockExpandResult);

    // Setup ContentExtractor mock
    const mockContentExtractor = ContentExtractor as any;
    const mockChatContent: ChatContent = {
      messages: [
        { sender: 'user', content: '<p>Hello</p>' },
        { sender: 'gemini', content: '<p>Hi there!</p>' }
      ],
      timestamp: new Date()
    };
    mockContentExtractor.prototype.extractChatContent = vi.fn().mockReturnValue(mockChatContent);

    // Setup TitleExtractor mock
    const mockTitleExtractor = TitleExtractor as any;
    mockTitleExtractor.prototype.extractTitle = vi.fn().mockReturnValue('Test Chat');
    mockTitleExtractor.prototype.generateFilename = vi.fn().mockReturnValue('test-chat.pdf');

    // Setup PDFGenerator mock
    const mockPDFGenerator = PDFGenerator as any;
    mockPDFGenerator.prototype.generatePDF = vi.fn().mockResolvedValue(undefined);

    // Create controller instance
    controller = new ExportController();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should initialize all dependencies', () => {
      expect(controller).toBeDefined();
      expect(Logger.info).toHaveBeenCalledWith('ExportController: Initializing dependencies');
      expect(Logger.info).toHaveBeenCalledWith('ExportController: All dependencies initialized');
    });
  });

  describe('initialize', () => {
    it('should inject button and attach event listener', () => {
      // Get the mock instance
      const uiInjectorInstance = (controller as any).uiInjector;

      // Call initialize
      controller.initialize();

      // Verify button was injected
      expect(uiInjectorInstance.injectButton).toHaveBeenCalled();

      // Verify event listener was attached
      expect(Logger.info).toHaveBeenCalledWith('ExportController: Click event listener attached to button');
      expect(Logger.info).toHaveBeenCalledWith('ExportController: Initialization complete');
    });

    it('should handle error if button injection fails', () => {
      const uiInjectorInstance = (controller as any).uiInjector;
      const error = new Error('Injection failed');
      uiInjectorInstance.injectButton.mockImplementation(() => {
        throw error;
      });

      expect(() => controller.initialize()).toThrow('Injection failed');
      expect(Logger.error).toHaveBeenCalledWith('ExportController: Initialization failed', error);
    });

    it('should log error if button is not available', () => {
      const uiInjectorInstance = (controller as any).uiInjector;
      uiInjectorInstance.getButton.mockReturnValue(null);

      controller.initialize();

      expect(Logger.error).toHaveBeenCalledWith('ExportController: Failed to get button for event binding');
    });
  });

  describe('handleExport', () => {
    it('should orchestrate complete export flow successfully', async () => {
      const uiInjectorInstance = (controller as any).uiInjector;
      const messageExpanderInstance = (controller as any).messageExpander;
      const contentExtractorInstance = (controller as any).contentExtractor;
      const titleExtractorInstance = (controller as any).titleExtractor;
      const pdfGeneratorInstance = (controller as any).pdfGenerator;

      await controller.handleExport();

      // Verify the flow
      expect(uiInjectorInstance.showLoading).toHaveBeenCalled();
      expect(uiInjectorInstance.disableButton).toHaveBeenCalled();
      expect(messageExpanderInstance.expandAllMessages).toHaveBeenCalled();
      expect(contentExtractorInstance.extractChatContent).toHaveBeenCalled();
      expect(titleExtractorInstance.extractTitle).toHaveBeenCalled();
      expect(titleExtractorInstance.generateFilename).toHaveBeenCalledWith('Test Chat');
      expect(pdfGeneratorInstance.generatePDF).toHaveBeenCalled();
      expect(uiInjectorInstance.showNotification).toHaveBeenCalledWith(
        'Đã xuất PDF thành công!',
        'success'
      );
      expect(uiInjectorInstance.hideLoading).toHaveBeenCalled();
      expect(uiInjectorInstance.enableButton).toHaveBeenCalled();
    });

    it('should log warning when some messages fail to expand', async () => {
      const messageExpanderInstance = (controller as any).messageExpander;
      const mockExpandResult: ExpandResult = {
        totalFound: 5,
        expanded: 3,
        failed: 2,
        errors: ['Error 1', 'Error 2']
      };
      messageExpanderInstance.expandAllMessages.mockResolvedValue(mockExpandResult);

      await controller.handleExport();

      expect(Logger.warn).toHaveBeenCalledWith('Không thể mở rộng 2 messages');
    });

    it('should handle errors and show error notification', async () => {
      const messageExpanderInstance = (controller as any).messageExpander;
      const uiInjectorInstance = (controller as any).uiInjector;
      const error = new Error('Expansion failed');
      messageExpanderInstance.expandAllMessages.mockRejectedValue(error);

      await controller.handleExport();

      expect(Logger.error).toHaveBeenCalledWith('Lỗi: Expansion failed');
      expect(uiInjectorInstance.showNotification).toHaveBeenCalledWith(
        'Không thể xuất PDF: Expansion failed',
        'error'
      );
    });

    it('should always cleanup (hide loading and enable button) even on error', async () => {
      const messageExpanderInstance = (controller as any).messageExpander;
      const uiInjectorInstance = (controller as any).uiInjector;
      messageExpanderInstance.expandAllMessages.mockRejectedValue(new Error('Test error'));

      await controller.handleExport();

      expect(uiInjectorInstance.hideLoading).toHaveBeenCalled();
      expect(uiInjectorInstance.enableButton).toHaveBeenCalled();
    });

    it('should prevent multiple simultaneous exports', async () => {
      const messageExpanderInstance = (controller as any).messageExpander;
      
      // Make expandAllMessages take some time
      messageExpanderInstance.expandAllMessages.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      // Start first export
      const promise1 = controller.handleExport();
      
      // Try to start second export immediately
      const promise2 = controller.handleExport();

      await Promise.all([promise1, promise2]);

      // expandAllMessages should only be called once
      expect(messageExpanderInstance.expandAllMessages).toHaveBeenCalledTimes(1);
      expect(Logger.warn).toHaveBeenCalledWith('ExportController: Export already in progress, ignoring click');
    });
  });

  describe('handleError', () => {
    it('should log error and show notification', () => {
      const uiInjectorInstance = (controller as any).uiInjector;
      const error = new Error('Test error');

      controller.handleError(error);

      expect(Logger.error).toHaveBeenCalledWith('Lỗi: Test error');
      expect(uiInjectorInstance.showNotification).toHaveBeenCalledWith(
        'Không thể xuất PDF: Test error',
        'error'
      );
    });
  });

  describe('log', () => {
    it('should log info messages', () => {
      controller.log('Test info', 'info');
      expect(Logger.info).toHaveBeenCalledWith('Test info');
    });

    it('should log warning messages', () => {
      controller.log('Test warning', 'warn');
      expect(Logger.warn).toHaveBeenCalledWith('Test warning');
    });

    it('should log error messages', () => {
      controller.log('Test error', 'error');
      expect(Logger.error).toHaveBeenCalledWith('Test error');
    });
  });

  describe('integration - button click triggers export', () => {
    it('should trigger handleExport when button is clicked', async () => {
      // Initialize the controller
      controller.initialize();

      // Spy on handleExport
      const handleExportSpy = vi.spyOn(controller, 'handleExport');

      // Simulate button click
      mockButton.click();

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(handleExportSpy).toHaveBeenCalled();
    });
  });
});
