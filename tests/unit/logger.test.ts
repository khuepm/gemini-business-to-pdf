import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Logger, LogLevel } from '../../src/utils/logger';

describe('Logger', () => {
  let consoleLogSpy: any;
  let consoleWarnSpy: any;
  let consoleErrorSpy: any;

  beforeEach(() => {
    // Spy on console methods
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console methods
    vi.restoreAllMocks();
  });

  describe('log method', () => {
    it('should log info message with timestamp and prefix', () => {
      const message = 'Test info message';
      Logger.log(message, LogLevel.INFO);

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      const loggedMessage = consoleLogSpy.mock.calls[0][0];
      expect(loggedMessage).toContain('[Gemini PDF Export]');
      expect(loggedMessage).toContain(message);
      expect(loggedMessage).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/);
    });

    it('should log warning message with timestamp and prefix', () => {
      const message = 'Test warning message';
      Logger.log(message, LogLevel.WARN);

      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      const loggedMessage = consoleWarnSpy.mock.calls[0][0];
      expect(loggedMessage).toContain('[Gemini PDF Export]');
      expect(loggedMessage).toContain(message);
      expect(loggedMessage).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/);
    });

    it('should log error message with timestamp and prefix', () => {
      const message = 'Test error message';
      Logger.log(message, LogLevel.ERROR);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      const loggedMessage = consoleErrorSpy.mock.calls[0][0];
      expect(loggedMessage).toContain('[Gemini PDF Export]');
      expect(loggedMessage).toContain(message);
      expect(loggedMessage).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/);
    });

    it('should default to INFO level when no level specified', () => {
      const message = 'Default level message';
      Logger.log(message);

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should log additional data when provided', () => {
      const message = 'Message with data';
      const data = { key: 'value', count: 42 };
      Logger.log(message, LogLevel.INFO, data);

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy.mock.calls[0][1]).toEqual(data);
    });

    it('should log empty string when no data provided', () => {
      const message = 'Message without data';
      Logger.log(message, LogLevel.INFO);

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy.mock.calls[0][1]).toBe('');
    });
  });

  describe('info method', () => {
    it('should log info message', () => {
      const message = 'Info message';
      Logger.info(message);

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      const loggedMessage = consoleLogSpy.mock.calls[0][0];
      expect(loggedMessage).toContain('[Gemini PDF Export]');
      expect(loggedMessage).toContain(message);
    });

    it('should log info message with additional data', () => {
      const message = 'Info with data';
      const data = { status: 'success' };
      Logger.info(message, data);

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy.mock.calls[0][1]).toEqual(data);
    });
  });

  describe('warn method', () => {
    it('should log warning message', () => {
      const message = 'Warning message';
      Logger.warn(message);

      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      const loggedMessage = consoleWarnSpy.mock.calls[0][0];
      expect(loggedMessage).toContain('[Gemini PDF Export]');
      expect(loggedMessage).toContain(message);
    });

    it('should log warning message with additional data', () => {
      const message = 'Warning with data';
      const data = { failedCount: 3 };
      Logger.warn(message, data);

      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      expect(consoleWarnSpy.mock.calls[0][1]).toEqual(data);
    });
  });

  describe('error method', () => {
    it('should log error message', () => {
      const message = 'Error message';
      Logger.error(message);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      const loggedMessage = consoleErrorSpy.mock.calls[0][0];
      expect(loggedMessage).toContain('[Gemini PDF Export]');
      expect(loggedMessage).toContain(message);
    });

    it('should log error message with additional data', () => {
      const message = 'Error with data';
      const error = new Error('Something went wrong');
      Logger.error(message, error);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy.mock.calls[0][1]).toEqual(error);
    });
  });

  describe('timestamp format', () => {
    it('should use ISO 8601 format for timestamps', () => {
      Logger.info('Test timestamp');

      const loggedMessage = consoleLogSpy.mock.calls[0][0];
      // ISO 8601 format: YYYY-MM-DDTHH:mm:ss.sssZ
      const isoRegex = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/;
      expect(loggedMessage).toMatch(isoRegex);
    });

    it('should have current timestamp', () => {
      const beforeTime = new Date().getTime();
      Logger.info('Test current time');
      const afterTime = new Date().getTime();

      const loggedMessage = consoleLogSpy.mock.calls[0][0];
      const timestampMatch = loggedMessage.match(/\[(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)\]/);
      
      expect(timestampMatch).not.toBeNull();
      if (timestampMatch) {
        const loggedTime = new Date(timestampMatch[1]).getTime();
        expect(loggedTime).toBeGreaterThanOrEqual(beforeTime);
        expect(loggedTime).toBeLessThanOrEqual(afterTime);
      }
    });
  });

  describe('prefix', () => {
    it('should always include the prefix "[Gemini PDF Export]"', () => {
      Logger.info('Test prefix');
      expect(consoleLogSpy.mock.calls[0][0]).toContain('[Gemini PDF Export]');

      Logger.warn('Test prefix');
      expect(consoleWarnSpy.mock.calls[0][0]).toContain('[Gemini PDF Export]');

      Logger.error('Test prefix');
      expect(consoleErrorSpy.mock.calls[0][0]).toContain('[Gemini PDF Export]');
    });
  });

  describe('edge cases', () => {
    it('should handle empty message', () => {
      Logger.info('');
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy.mock.calls[0][0]).toContain('[Gemini PDF Export]');
    });

    it('should handle message with special characters', () => {
      const message = 'Message with special chars: <>&"\'';
      Logger.info(message);
      expect(consoleLogSpy.mock.calls[0][0]).toContain(message);
    });

    it('should handle message with newlines', () => {
      const message = 'Line 1\nLine 2\nLine 3';
      Logger.info(message);
      expect(consoleLogSpy.mock.calls[0][0]).toContain(message);
    });

    it('should handle null data', () => {
      Logger.info('Message with null', null);
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy.mock.calls[0][1]).toBeNull();
    });

    it('should handle undefined data explicitly', () => {
      Logger.info('Message with undefined', undefined);
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy.mock.calls[0][1]).toBe('');
    });

    it('should handle complex nested data objects', () => {
      const complexData = {
        nested: {
          deep: {
            value: 'test'
          }
        },
        array: [1, 2, 3],
        mixed: { a: [{ b: 'c' }] }
      };
      Logger.info('Complex data', complexData);
      expect(consoleLogSpy.mock.calls[0][1]).toEqual(complexData);
    });
  });
});
