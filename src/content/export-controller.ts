/**
 * ExportController - Main controller for orchestrating PDF export
 * 
 * Responsibilities:
 * - Initialize all dependencies (UIInjector, MessageExpander, ContentExtractor, TitleExtractor, PDFGenerator)
 * - Setup extension when page loads
 * - Orchestrate the complete export flow
 * - Handle errors and logging
 */

import { UIInjector } from './ui-injector';
import { MessageExpander } from './message-expander';
import { ContentExtractor, ChatContent } from './content-extractor';
import { TitleExtractor } from './title-extractor';
import { PDFGenerator } from './pdf-generator';
import { Logger } from '../utils/logger';
import { ErrorHandler } from '../utils/error-handler';

/**
 * ExportController interface
 */
export interface IExportController {
  /**
   * Initialize the extension
   * Sets up UI and event listeners
   */
  initialize(): void;

  /**
   * Handle the export action
   * Orchestrates the complete export flow
   */
  handleExport(): Promise<void>;

  /**
   * Handle errors during export
   * @param error - The error that occurred
   */
  handleError(error: Error): void;

  /**
   * Log a message
   * @param message - Message to log
   * @param level - Log level
   */
  log(message: string, level: 'info' | 'warn' | 'error'): void;
}

/**
 * ExportController class implementation
 * 
 * Main controller that orchestrates all components to export chat to PDF
 * Validates: Requirements 1.1
 */
export class ExportController implements IExportController {
  // Dependencies
  private uiInjector: UIInjector;
  private messageExpander: MessageExpander;
  private contentExtractor: ContentExtractor;
  private titleExtractor: TitleExtractor;
  private pdfGenerator: PDFGenerator;

  // State
  private isExporting: boolean = false;

  /**
   * Create a new ExportController instance
   * Initializes all dependencies
   * 
   * Validates: Requirements 1.1
   */
  constructor() {
    Logger.info('ExportController: Initializing dependencies');

    // Initialize all dependencies
    this.uiInjector = new UIInjector();
    this.messageExpander = new MessageExpander();
    this.contentExtractor = new ContentExtractor();
    this.titleExtractor = new TitleExtractor();
    this.pdfGenerator = new PDFGenerator();

    Logger.info('ExportController: All dependencies initialized');
  }

  /**
   * Initialize the extension
   * Sets up UI by injecting the export button and attaching event listeners
   * 
   * Validates: Requirements 1.1
   */
  initialize(): void {
    try {
      Logger.info('ExportController: Starting initialization');

      // Inject the export button into the page
      this.uiInjector.injectButton();

      // Get the button and attach click event listener
      const button = this.uiInjector.getButton();
      if (button) {
        button.addEventListener('click', () => {
          this.handleExport();
        });
        Logger.info('ExportController: Click event listener attached to button');
      } else {
        Logger.error('ExportController: Failed to get button for event binding');
      }

      Logger.info('ExportController: Initialization complete');
    } catch (error) {
      Logger.error('ExportController: Initialization failed', error);
      throw error;
    }
  }

  /**
   * Handle the export action
   * Orchestrates the complete export flow:
   * 1. Show loading and disable button
   * 2. Expand all messages
   * 3. Extract content
   * 4. Get title and generate filename
   * 5. Generate and download PDF
   * 6. Show success notification
   * 7. Cleanup memory
   * 
   * Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 4.1, 4.2, 5.1, 5.6, 5.7, 6.1, 6.2, 6.5, 7.5
   */
  async handleExport(): Promise<void> {
    // Prevent multiple simultaneous exports
    if (this.isExporting) {
      Logger.warn('ExportController: Export already in progress, ignoring click');
      return;
    }

    this.isExporting = true;
    let content: ChatContent | null = null;

    try {
      // Step 1: Show loading and disable button
      this.log('Bắt đầu export PDF', 'info');
      this.uiInjector.showLoading();
      this.uiInjector.disableButton();

      // Step 2: Expand all messages
      this.log('Đang mở rộng messages...', 'info');
      const expandResult = await this.messageExpander.expandAllMessages();
      this.log(
        `Đã mở rộng ${expandResult.expanded}/${expandResult.totalFound} messages`,
        'info'
      );

      if (expandResult.failed > 0) {
        this.log(
          `Không thể mở rộng ${expandResult.failed} messages`,
          'warn'
        );
      }

      // Step 3: Extract content
      this.log('Đang trích xuất nội dung...', 'info');
      content = this.contentExtractor.extractChatContent();
      this.log(`Đã trích xuất ${content.messages.length} messages`, 'info');

      // Step 4: Get title and generate filename
      this.log('Đang tạo filename...', 'info');
      const title = this.titleExtractor.extractTitle();
      const filename = this.titleExtractor.generateFilename(title);
      this.log(`Filename: ${filename}`, 'info');

      // Step 5: Generate PDF
      this.log('Đang tạo PDF...', 'info');
      await this.pdfGenerator.generatePDF(content, filename);
      this.log('PDF đã được tạo và tải xuống', 'info');

      // Step 6: Show success notification
      this.uiInjector.showNotification('Đã xuất PDF thành công!', 'success');

    } catch (error) {
      // Handle any errors that occur during export
      this.handleError(error as Error);
    } finally {
      // Step 7: Cleanup - hide loading, enable button, and free memory
      this.uiInjector.hideLoading();
      this.uiInjector.enableButton();
      
      // Clear references to free memory
      content = null;
      
      // Cleanup PDF generator resources (revoke object URLs)
      this.pdfGenerator.cleanup();
      
      // Cleanup message expander resources (disconnect observers)
      this.messageExpander.cleanup();
      
      this.isExporting = false;
      
      this.log('Đã giải phóng bộ nhớ', 'info');
    }
  }

  /**
   * Handle errors during export
   * Logs the error and displays an error notification to the user
   * 
   * @param error - The error that occurred
   * 
   * Validates: Requirements 6.4
   */
  handleError(error: Error): void {
    this.log(`Lỗi: ${error.message}`, 'error');
    ErrorHandler.handle(error, 'Export PDF');
    this.uiInjector.showNotification(
      `Không thể xuất PDF: ${error.message}`,
      'error'
    );
  }

  /**
   * Log a message with the specified level
   * 
   * @param message - Message to log
   * @param level - Log level (info, warn, or error)
   * 
   * Validates: Requirements 6.6
   */
  log(message: string, level: 'info' | 'warn' | 'error'): void {
    switch (level) {
      case 'info':
        Logger.info(message);
        break;
      case 'warn':
        Logger.warn(message);
        break;
      case 'error':
        Logger.error(message);
        break;
    }
  }
}
