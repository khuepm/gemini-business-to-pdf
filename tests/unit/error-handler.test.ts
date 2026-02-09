import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  ErrorHandler,
  DOMError,
  ExpansionError,
  PDFError,
  BaseError,
  UINotifier
} from '../../src/utils/error-handler';
import { Logger } from '../../src/utils/logger';

describe('ErrorHandler', () => {
  let consoleErrorSpy: any;
  let consoleWarnSpy: any;
  let mockNotifier: UINotifier;

  beforeEach(() => {
    // Spy on console methods
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    // Create mock notifier
    mockNotifier = {
      showNotification: vi.fn()
    };

    // Set the mock notifier
    ErrorHandler.setUINotifier(mockNotifier);
  });

  afterEach(() => {
    // Restore console methods
    vi.restoreAllMocks();
  });

  describe('Custom Error Classes', () => {
    describe('BaseError', () => {
      it('should create error with correct name and message', () => {
        const error = new BaseError('Test error');
        expect(error.name).toBe('BaseError');
        expect(error.message).toBe('Test error');
        expect(error).toBeInstanceOf(Error);
      });

      it('should have stack trace', () => {
        const error = new BaseError('Test error');
        expect(error.stack).toBeDefined();
      });
    });

    describe('DOMError', () => {
      it('should create DOMError with message', () => {
        const error = new DOMError('Element not found');
        expect(error.name).toBe('DOMError');
        expect(error.message).toBe('Element not found');
        expect(error).toBeInstanceOf(BaseError);
        expect(error).toBeInstanceOf(Error);
      });

      it('should store element information', () => {
        const error = new DOMError('Element not found', '.chat-container');
        expect(error.element).toBe('.chat-container');
      });

      it('should work without element parameter', () => {
        const error = new DOMError('Element not found');
        expect(error.element).toBeUndefined();
      });
    });

    describe('ExpansionError', () => {
      it('should create ExpansionError with message', () => {
        const error = new ExpansionError('Failed to expand messages');
        expect(error.name).toBe('ExpansionError');
        expect(error.message).toBe('Failed to expand messages');
        expect(error).toBeInstanceOf(BaseError);
        expect(error).toBeInstanceOf(Error);
      });

      it('should store failed count', () => {
        const error = new ExpansionError('Failed to expand messages', 5);
        expect(error.failedCount).toBe(5);
      });

      it('should default failed count to 0', () => {
        const error = new ExpansionError('Failed to expand messages');
        expect(error.failedCount).toBe(0);
      });
    });

    describe('PDFError', () => {
      it('should create PDFError with message', () => {
        const error = new PDFError('Failed to generate PDF');
        expect(error.name).toBe('PDFError');
        expect(error.message).toBe('Failed to generate PDF');
        expect(error).toBeInstanceOf(BaseError);
        expect(error).toBeInstanceOf(Error);
      });

      it('should store cause error', () => {
        const cause = new Error('Out of memory');
        const error = new PDFError('Failed to generate PDF', cause);
        expect(error.cause).toBe(cause);
      });

      it('should work without cause parameter', () => {
        const error = new PDFError('Failed to generate PDF');
        expect(error.cause).toBeUndefined();
      });
    });
  });

  describe('ErrorHandler.handle', () => {
    it('should handle DOMError', () => {
      const error = new DOMError('Element not found', '.chat-container');
      ErrorHandler.handle(error, 'Test context');

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(mockNotifier.showNotification).toHaveBeenCalledWith(
        expect.stringContaining('Không thể tìm thấy phần tử'),
        'error'
      );
    });

    it('should handle ExpansionError', () => {
      const error = new ExpansionError('Failed to expand', 3);
      ErrorHandler.handle(error, 'Test context');

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(mockNotifier.showNotification).toHaveBeenCalledWith(
        expect.stringContaining('Không thể mở rộng 3 tin nhắn'),
        'error'
      );
    });

    it('should handle PDFError', () => {
      const error = new PDFError('Failed to generate PDF');
      ErrorHandler.handle(error, 'Test context');

      expect(consoleErrorSpy).toHaveBeenCalledTimes(2); // Once for handle, once for handlePDFError
      expect(mockNotifier.showNotification).toHaveBeenCalledWith(
        expect.stringContaining('Không thể tạo file PDF'),
        'error'
      );
    });

    it('should handle generic Error', () => {
      const error = new Error('Unknown error');
      ErrorHandler.handle(error, 'Test context');

      expect(consoleErrorSpy).toHaveBeenCalledTimes(2); // Once for handle, once for handleGenericError
      expect(mockNotifier.showNotification).toHaveBeenCalledWith(
        expect.stringContaining('Đã xảy ra lỗi: Unknown error'),
        'error'
      );
    });

    it('should log context information', () => {
      const error = new Error('Test error');
      ErrorHandler.handle(error, 'Export PDF');

      const errorCall = consoleErrorSpy.mock.calls[0][0];
      expect(errorCall).toContain('Export PDF');
    });
  });

  describe('ErrorHandler.handleDOMError', () => {
    it('should log warning with element information', () => {
      const error = new DOMError('Element not found', '.chat-container');
      ErrorHandler.handleDOMError(error, 'UI Injection');

      expect(consoleWarnSpy).toHaveBeenCalled();
      const warnCall = consoleWarnSpy.mock.calls[0];
      expect(warnCall[0]).toContain('DOM Error');
      expect(warnCall[0]).toContain('UI Injection');
      expect(warnCall[1]).toEqual({ element: '.chat-container' });
    });

    it('should show user-friendly notification', () => {
      const error = new DOMError('Element not found');
      ErrorHandler.handleDOMError(error, 'Test context');

      expect(mockNotifier.showNotification).toHaveBeenCalledWith(
        'Không thể tìm thấy phần tử cần thiết trên trang. Vui lòng đảm bảo bạn đang ở trang chat Gemini Business.',
        'error'
      );
    });

    it('should work without UI notifier', () => {
      ErrorHandler.setUINotifier(undefined as any);
      const error = new DOMError('Element not found');
      
      expect(() => {
        ErrorHandler.handleDOMError(error, 'Test context');
      }).not.toThrow();
    });
  });

  describe('ErrorHandler.handleExpansionError', () => {
    it('should log warning with failed count', () => {
      const error = new ExpansionError('Failed to expand', 5);
      ErrorHandler.handleExpansionError(error, 'Message Expansion');

      expect(consoleWarnSpy).toHaveBeenCalled();
      const warnCall = consoleWarnSpy.mock.calls[0];
      expect(warnCall[0]).toContain('Expansion Error');
      expect(warnCall[0]).toContain('Message Expansion');
      expect(warnCall[1]).toEqual({ failedCount: 5 });
    });

    it('should show notification with failed count when count > 0', () => {
      const error = new ExpansionError('Failed to expand', 3);
      ErrorHandler.handleExpansionError(error, 'Test context');

      expect(mockNotifier.showNotification).toHaveBeenCalledWith(
        'Không thể mở rộng 3 tin nhắn. PDF có thể thiếu một số nội dung.',
        'error'
      );
    });

    it('should show generic notification when failed count is 0', () => {
      const error = new ExpansionError('Failed to expand', 0);
      ErrorHandler.handleExpansionError(error, 'Test context');

      expect(mockNotifier.showNotification).toHaveBeenCalledWith(
        'Không thể mở rộng tin nhắn. Vui lòng thử lại.',
        'error'
      );
    });

    it('should work without UI notifier', () => {
      ErrorHandler.setUINotifier(undefined as any);
      const error = new ExpansionError('Failed to expand', 3);
      
      expect(() => {
        ErrorHandler.handleExpansionError(error, 'Test context');
      }).not.toThrow();
    });
  });

  describe('ErrorHandler.handlePDFError', () => {
    it('should log error with cause information', () => {
      const cause = new Error('Out of memory');
      const error = new PDFError('Failed to generate PDF', cause);
      ErrorHandler.handlePDFError(error, 'PDF Generation');

      expect(consoleErrorSpy).toHaveBeenCalled();
      const errorCall = consoleErrorSpy.mock.calls[0];
      expect(errorCall[0]).toContain('PDF Error');
      expect(errorCall[0]).toContain('PDF Generation');
      expect(errorCall[1]).toEqual({ cause: 'Out of memory' });
    });

    it('should handle error without cause', () => {
      const error = new PDFError('Failed to generate PDF');
      ErrorHandler.handlePDFError(error, 'PDF Generation');

      expect(consoleErrorSpy).toHaveBeenCalled();
      const errorCall = consoleErrorSpy.mock.calls[0];
      expect(errorCall[1]).toEqual({ cause: undefined });
    });

    it('should show user-friendly notification', () => {
      const error = new PDFError('Failed to generate PDF');
      ErrorHandler.handlePDFError(error, 'Test context');

      expect(mockNotifier.showNotification).toHaveBeenCalledWith(
        'Không thể tạo file PDF. Vui lòng thử lại hoặc liên hệ hỗ trợ.',
        'error'
      );
    });

    it('should work without UI notifier', () => {
      ErrorHandler.setUINotifier(undefined as any);
      const error = new PDFError('Failed to generate PDF');
      
      expect(() => {
        ErrorHandler.handlePDFError(error, 'Test context');
      }).not.toThrow();
    });
  });

  describe('ErrorHandler.handleGenericError', () => {
    it('should log error with stack trace', () => {
      const error = new Error('Unknown error');
      ErrorHandler.handleGenericError(error, 'Generic Context');

      expect(consoleErrorSpy).toHaveBeenCalled();
      const errorCall = consoleErrorSpy.mock.calls[0];
      expect(errorCall[0]).toContain('Generic Error');
      expect(errorCall[0]).toContain('Generic Context');
      expect(errorCall[1]).toHaveProperty('stack');
    });

    it('should show error message to user', () => {
      const error = new Error('Something went wrong');
      ErrorHandler.handleGenericError(error, 'Test context');

      expect(mockNotifier.showNotification).toHaveBeenCalledWith(
        'Đã xảy ra lỗi: Something went wrong',
        'error'
      );
    });

    it('should work without UI notifier', () => {
      ErrorHandler.setUINotifier(undefined as any);
      const error = new Error('Test error');
      
      expect(() => {
        ErrorHandler.handleGenericError(error, 'Test context');
      }).not.toThrow();
    });
  });

  describe('ErrorHandler.setUINotifier', () => {
    it('should set UI notifier', () => {
      const newNotifier: UINotifier = {
        showNotification: vi.fn()
      };
      
      ErrorHandler.setUINotifier(newNotifier);
      
      const error = new Error('Test');
      ErrorHandler.handle(error, 'Test');
      
      expect(newNotifier.showNotification).toHaveBeenCalled();
    });

    it('should replace existing notifier', () => {
      const firstNotifier: UINotifier = {
        showNotification: vi.fn()
      };
      const secondNotifier: UINotifier = {
        showNotification: vi.fn()
      };
      
      ErrorHandler.setUINotifier(firstNotifier);
      ErrorHandler.setUINotifier(secondNotifier);
      
      const error = new Error('Test');
      ErrorHandler.handle(error, 'Test');
      
      expect(firstNotifier.showNotification).not.toHaveBeenCalled();
      expect(secondNotifier.showNotification).toHaveBeenCalled();
    });
  });

  describe('Integration with Logger', () => {
    it('should use Logger for DOMError', () => {
      const loggerWarnSpy = vi.spyOn(Logger, 'warn');
      const error = new DOMError('Element not found', '.test');
      
      ErrorHandler.handleDOMError(error, 'Test');
      
      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('DOM Error'),
        expect.any(Object)
      );
      
      loggerWarnSpy.mockRestore();
    });

    it('should use Logger for ExpansionError', () => {
      const loggerWarnSpy = vi.spyOn(Logger, 'warn');
      const error = new ExpansionError('Failed', 2);
      
      ErrorHandler.handleExpansionError(error, 'Test');
      
      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Expansion Error'),
        expect.any(Object)
      );
      
      loggerWarnSpy.mockRestore();
    });

    it('should use Logger for PDFError', () => {
      const loggerErrorSpy = vi.spyOn(Logger, 'error');
      const error = new PDFError('Failed');
      
      ErrorHandler.handlePDFError(error, 'Test');
      
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('PDF Error'),
        expect.any(Object)
      );
      
      loggerErrorSpy.mockRestore();
    });

    it('should use Logger for generic errors', () => {
      const loggerErrorSpy = vi.spyOn(Logger, 'error');
      const error = new Error('Generic');
      
      ErrorHandler.handleGenericError(error, 'Test');
      
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Generic Error'),
        expect.any(Object)
      );
      
      loggerErrorSpy.mockRestore();
    });
  });

  describe('Edge Cases', () => {
    it('should handle error with empty message', () => {
      const error = new Error('');
      expect(() => {
        ErrorHandler.handle(error, 'Test');
      }).not.toThrow();
    });

    it('should handle error with special characters in message', () => {
      const error = new Error('Error: <>&"\'');
      ErrorHandler.handle(error, 'Test');
      
      expect(mockNotifier.showNotification).toHaveBeenCalledWith(
        expect.stringContaining('Error: <>&"\''),
        'error'
      );
    });

    it('should handle error with very long message', () => {
      const longMessage = 'A'.repeat(1000);
      const error = new Error(longMessage);
      
      expect(() => {
        ErrorHandler.handle(error, 'Test');
      }).not.toThrow();
    });

    it('should handle error with empty context', () => {
      const error = new Error('Test error');
      
      expect(() => {
        ErrorHandler.handle(error, '');
      }).not.toThrow();
    });

    it('should handle ExpansionError with negative failed count', () => {
      const error = new ExpansionError('Failed', -1);
      ErrorHandler.handleExpansionError(error, 'Test');
      
      // Should show generic message for non-positive counts
      expect(mockNotifier.showNotification).toHaveBeenCalledWith(
        'Không thể mở rộng tin nhắn. Vui lòng thử lại.',
        'error'
      );
    });

    it('should handle PDFError with null cause', () => {
      const error = new PDFError('Failed', null as any);
      
      expect(() => {
        ErrorHandler.handlePDFError(error, 'Test');
      }).not.toThrow();
    });
  });
});
