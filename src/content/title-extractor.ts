/**
 * TitleExtractor - Trích xuất tiêu đề chat và tạo filename cho PDF
 * 
 * Trách nhiệm:
 * - Tìm và trích xuất tiêu đề chat từ DOM (bao gồm Shadow DOM)
 * - Sanitize tên file để loại bỏ ký tự không hợp lệ
 * - Tạo tên file fallback nếu không có title
 * - Giới hạn độ dài tên file
 */

import { getChatTitleElement } from '../utils/shadow-dom-utils';

/**
 * Interface cho TitleExtractor
 */
export interface ITitleExtractor {
  /**
   * Trích xuất chat title từ DOM
   * @returns Title string hoặc null nếu không tìm thấy
   */
  extractTitle(): string | null;

  /**
   * Tạo filename từ title
   * @param title - Title string hoặc null
   * @returns Filename hợp lệ với extension .pdf
   */
  generateFilename(title: string | null): string;

  /**
   * Sanitize filename để loại bỏ ký tự không hợp lệ
   * @param filename - Filename cần sanitize
   * @returns Filename đã được sanitize
   */
  sanitizeFilename(filename: string): string;

  /**
   * Truncate filename nếu quá dài
   * @param filename - Filename cần truncate
   * @param maxLength - Độ dài tối đa (default: 100)
   * @returns Filename đã được truncate
   */
  truncateFilename(filename: string, maxLength: number): string;
}

/**
 * DOM selectors cho title extraction - Gemini Business specific
 */
const SELECTORS = {
  // Selector cho chat title - tìm trong các vị trí có thể
  chatTitle: 'h1, h2, .title, [role="heading"]',
};

/**
 * TitleExtractor class implementation
 */
export class TitleExtractor implements ITitleExtractor {
  /**
   * Trích xuất chat title từ DOM (bao gồm Shadow DOM)
   * Tìm title element bằng selector và lấy textContent
   * 
   * @returns Title string hoặc null nếu không tìm thấy
   * @validates Requirements 4.1
   */
  extractTitle(): string | null {
    try {
      // First try Shadow DOM utility
      const shadowTitle = getChatTitleElement();
      if (shadowTitle) {
        const title = (shadowTitle.textContent || shadowTitle.innerHTML || '').trim();
        if (title) return title;
      }

      // Fallback: Thử tìm title element bằng selector trong regular DOM
      const titleElement = document.querySelector(SELECTORS.chatTitle);
      
      if (!titleElement) {
        return null;
      }

      // Lấy textContent hoặc innerText
      const title = (titleElement.textContent || titleElement.innerHTML || '').trim();
      
      // Return null nếu title rỗng
      return title || null;
    } catch (error) {
      console.error('[TitleExtractor] Error extracting title:', error);
      return null;
    }
  }

  /**
   * Sanitize filename để loại bỏ ký tự không hợp lệ
   * Replace các ký tự không hợp lệ: / \ : * ? " < > |
   * 
   * @param filename - Filename cần sanitize
   * @returns Filename đã được sanitize
   * @validates Requirements 4.4
   */
  sanitizeFilename(filename: string): string {
    // Replace invalid characters với underscore
    let sanitized = filename.replace(/[\/\\:*?"<>|]/g, '_');
    
    // Trim whitespace
    sanitized = sanitized.trim();
    
    // Remove multiple consecutive spaces/underscores
    sanitized = sanitized.replace(/[\s_]+/g, '_');
    
    // Remove leading/trailing underscores
    sanitized = sanitized.replace(/^_+|_+$/g, '');
    
    return sanitized;
  }

  /**
   * Truncate filename nếu quá dài
   * Cố gắng cắt ở word boundary nếu có thể
   * 
   * @param filename - Filename cần truncate
   * @param maxLength - Độ dài tối đa (default: 100)
   * @returns Filename đã được truncate
   * @validates Requirements 4.5
   */
  truncateFilename(filename: string, maxLength: number = 100): string {
    if (filename.length <= maxLength) {
      return filename;
    }

    // Truncate ở maxLength
    let truncated = filename.substring(0, maxLength);
    
    // Cố gắng cắt ở word boundary (space hoặc underscore)
    const lastSpace = Math.max(
      truncated.lastIndexOf(' '),
      truncated.lastIndexOf('_')
    );
    
    if (lastSpace > maxLength * 0.7) {
      // Chỉ cắt ở word boundary nếu không mất quá nhiều text (>30%)
      truncated = truncated.substring(0, lastSpace);
    }
    
    // Remove trailing spaces/underscores
    truncated = truncated.replace(/[\s_]+$/, '');
    
    return truncated;
  }

  /**
   * Tạo filename từ title
   * Nếu title tồn tại: sanitize và truncate title
   * Nếu title null/empty: tạo fallback "gemini-chat-[timestamp]"
   * Luôn thêm extension ".pdf"
   * 
   * @param title - Title string hoặc null
   * @returns Filename hợp lệ với extension .pdf
   * @validates Requirements 4.2, 4.3, 4.4, 4.5
   */
  generateFilename(title: string | null): string {
    let filename: string;

    if (title && title.trim()) {
      // Sử dụng title làm base filename
      filename = this.sanitizeFilename(title);
      filename = this.truncateFilename(filename, 100);
      
      // Nếu sau khi sanitize filename rỗng, tạo fallback
      if (!filename) {
        const timestamp = this.formatTimestamp(new Date());
        filename = `gemini-chat-${timestamp}`;
      }
    } else {
      // Tạo fallback filename với timestamp
      const timestamp = this.formatTimestamp(new Date());
      filename = `gemini-chat-${timestamp}`;
    }

    // Luôn thêm extension .pdf
    return `${filename}.pdf`;
  }

  /**
   * Format timestamp cho fallback filename
   * Format: YYYYMMDD-HHMMSS
   * 
   * @param date - Date object
   * @returns Formatted timestamp string
   * @private
   */
  private formatTimestamp(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}${month}${day}-${hours}${minutes}${seconds}`;
  }
}
