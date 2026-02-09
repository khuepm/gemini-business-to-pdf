/**
 * Error Handler utility for Gemini Business to PDF extension
 * Provides custom error types and centralized error handling
 */

import { Logger, LogLevel } from './logger';

/**
 * Base class for custom errors
 */
export class BaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Error thrown when DOM elements cannot be found or accessed
 */
export class DOMError extends BaseError {
  constructor(message: string, public element?: string) {
    super(message);
  }
}

/**
 * Error thrown when message expansion fails
 */
export class ExpansionError extends BaseError {
  constructor(message: string, public failedCount: number = 0) {
    super(message);
  }
}

/**
 * Error thrown when PDF generation or download fails
 */
export class PDFError extends BaseError {
  constructor(message: string, public cause?: Error) {
    super(message);
  }
}

/**
 * Interface for UI notification display
 */
export interface UINotifier {
  showNotification(message: string, type: 'success' | 'error'): void;
}

/**
 * Error Handler class for centralized error handling
 */
export class ErrorHandler {
  private static uiNotifier?: UINotifier;

  /**
   * Set the UI notifier for displaying error messages to users
   * @param notifier - Object that implements UINotifier interface
   */
  static setUINotifier(notifier: UINotifier): void {
    this.uiNotifier = notifier;
  }

  /**
   * Handle any error with appropriate logging and user notification
   * @param error - The error to handle
   * @param context - Context string describing where the error occurred
   */
  static handle(error: Error, context: string): void {
    Logger.error(`${context}:`, error);

    // Classify and handle based on error type
    if (error instanceof DOMError) {
      this.handleDOMError(error, context);
    } else if (error instanceof ExpansionError) {
      this.handleExpansionError(error, context);
    } else if (error instanceof PDFError) {
      this.handlePDFError(error, context);
    } else {
      this.handleGenericError(error, context);
    }
  }

  /**
   * Handle DOM-related errors
   * @param error - The DOMError to handle
   * @param context - Context string
   */
  static handleDOMError(error: DOMError, context: string): void {
    const message = 'Không thể tìm thấy phần tử cần thiết trên trang. ' +
                   'Vui lòng đảm bảo bạn đang ở trang chat Gemini Business.';
    
    Logger.warn(`DOM Error in ${context}: ${error.message}`, {
      element: error.element
    });

    if (this.uiNotifier) {
      this.uiNotifier.showNotification(message, 'error');
    }
  }

  /**
   * Handle message expansion errors
   * @param error - The ExpansionError to handle
   * @param context - Context string
   */
  static handleExpansionError(error: ExpansionError, context: string): void {
    const message = error.failedCount > 0
      ? `Không thể mở rộng ${error.failedCount} tin nhắn. PDF có thể thiếu một số nội dung.`
      : 'Không thể mở rộng tin nhắn. Vui lòng thử lại.';
    
    Logger.warn(`Expansion Error in ${context}: ${error.message}`, {
      failedCount: error.failedCount
    });

    if (this.uiNotifier) {
      this.uiNotifier.showNotification(message, 'error');
    }
  }

  /**
   * Handle PDF generation/download errors
   * @param error - The PDFError to handle
   * @param context - Context string
   */
  static handlePDFError(error: PDFError, context: string): void {
    const message = 'Không thể tạo file PDF. Vui lòng thử lại hoặc liên hệ hỗ trợ.';
    
    Logger.error(`PDF Error in ${context}: ${error.message}`, {
      cause: error.cause?.message
    });

    if (this.uiNotifier) {
      this.uiNotifier.showNotification(message, 'error');
    }
  }

  /**
   * Handle generic/unknown errors
   * @param error - The generic Error to handle
   * @param context - Context string
   */
  static handleGenericError(error: Error, context: string): void {
    const message = `Đã xảy ra lỗi: ${error.message}`;
    
    Logger.error(`Generic Error in ${context}: ${error.message}`, {
      stack: error.stack
    });

    if (this.uiNotifier) {
      this.uiNotifier.showNotification(message, 'error');
    }
  }
}
