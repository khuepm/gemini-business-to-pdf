/**
 * Logger utility for Gemini Business to PDF extension
 * Provides structured logging with timestamps and prefix
 */

export enum LogLevel {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

export class Logger {
  private static prefix = '[Gemini PDF Export]';
  
  /**
   * Log a message with specified level
   * @param message - The message to log
   * @param level - The log level (INFO, WARN, ERROR)
   * @param data - Optional additional data to log
   */
  static log(message: string, level: LogLevel = LogLevel.INFO, data?: any): void {
    const timestamp = new Date().toISOString();
    const logMessage = `${this.prefix} [${timestamp}] ${message}`;
    
    switch (level) {
      case LogLevel.INFO:
        console.log(logMessage, data !== undefined ? data : '');
        break;
      case LogLevel.WARN:
        console.warn(logMessage, data !== undefined ? data : '');
        break;
      case LogLevel.ERROR:
        console.error(logMessage, data !== undefined ? data : '');
        break;
    }
  }
  
  /**
   * Log an info message
   * @param message - The message to log
   * @param data - Optional additional data to log
   */
  static info(message: string, data?: any): void {
    this.log(message, LogLevel.INFO, data);
  }
  
  /**
   * Log a warning message
   * @param message - The message to log
   * @param data - Optional additional data to log
   */
  static warn(message: string, data?: any): void {
    this.log(message, LogLevel.WARN, data);
  }
  
  /**
   * Log an error message
   * @param message - The message to log
   * @param data - Optional additional data to log
   */
  static error(message: string, data?: any): void {
    this.log(message, LogLevel.ERROR, data);
  }
}
