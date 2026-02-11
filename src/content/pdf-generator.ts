/**
 * PDFGenerator - Handles PDF generation from chat content
 * 
 * This module is responsible for:
 * - Converting HTML content to PDF using html2pdf.js
 * - Applying styling to ensure readable and professional PDFs
 * - Triggering PDF downloads with appropriate filenames
 */

import html2pdf from 'html2pdf.js';
import { ChatContent } from './content-extractor';

/**
 * Configuration options for PDF generation
 */
export interface PDFOptions {
  /** Page format (A4 or Letter) */
  format: 'A4' | 'Letter';
  
  /** Page margins */
  margin: {
    top: string;    // e.g., '20mm'
    right: string;
    bottom: string;
    left: string;
  };
  
  /** Typography settings */
  fontSize: string;      // e.g., '12pt'
  fontFamily: string;    // e.g., 'Arial, sans-serif'
  lineHeight: number;    // e.g., 1.5
  
  /** Message background colors */
  userMessageBg: string;    // e.g., '#e3f2fd'
  geminiMessageBg: string;  // e.g., '#f5f5f5'
}

/**
 * Default PDF generation options
 * Based on design document specifications for optimal readability
 */
const DEFAULT_PDF_OPTIONS: PDFOptions = {
  format: 'A4',
  margin: {
    top: '20mm',
    right: '20mm',
    bottom: '20mm',
    left: '20mm'
  },
  fontSize: '12pt',
  fontFamily: 'Arial, Helvetica, sans-serif',
  lineHeight: 1.5,
  userMessageBg: '#e3f2fd',
  geminiMessageBg: '#f5f5f5'
};

/**
 * PDFGenerator class
 * 
 * Handles the conversion of chat content to PDF format
 * Validates: Requirements 5.1
 */
export class PDFGenerator {
  private options: PDFOptions;
  private objectUrls: Set<string> = new Set();

  /**
   * Creates a new PDFGenerator instance
   * @param options - Custom PDF options (merged with defaults)
   */
  constructor(options: Partial<PDFOptions> = {}) {
    // Merge custom options with defaults
    this.options = {
      ...DEFAULT_PDF_OPTIONS,
      ...options,
      margin: {
        ...DEFAULT_PDF_OPTIONS.margin,
        ...(options.margin || {})
      }
    };
  }

  /**
   * Gets the current PDF options
   * @returns Current PDFOptions configuration
   */
  getOptions(): PDFOptions {
    return { ...this.options };
  }

  /**
   * Updates PDF options
   * @param options - Partial options to update
   */
  setOptions(options: Partial<PDFOptions>): void {
    this.options = {
      ...this.options,
      ...options,
      margin: {
        ...this.options.margin,
        ...(options.margin || {})
      }
    };
  }

  /**
   * Apply styles to chat content for PDF generation
   * Creates a styled HTML document with:
   * - PDF_STYLES template for consistent formatting
   * - Header with chat title and export date
   * - Styled message containers with different backgrounds for user vs gemini
   *
   * Validates: Requirements 5.2, 5.4, 5.5
   *
   * @param content - ChatContent object containing messages
   * @param title - Optional chat title for the header
   * @returns Styled HTML string ready for PDF conversion
   */
  applyStyles(content: ChatContent, title?: string): string {
    const exportDate = new Date().toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const chatTitle = title || 'Gemini Chat';

    console.log(`[PDFGenerator] Applying styles to ${content.messages.length} messages`);

    // Build messages HTML
    const messagesHtml = content.messages.map((message, index) => {
      const senderClass = message.sender === 'user' ? 'user' : 'gemini';
      const senderLabel = message.sender === 'user' ? 'Bạn' : 'Gemini';

      console.log(`[PDFGenerator] Message ${index + 1}: sender=${message.sender}, contentLength=${message.content.length}`);
      
      if (!message.content.trim()) {
        console.warn(`[PDFGenerator] Warning: Message ${index + 1} has empty content!`);
      }

      // Clean the content: remove data-markdown-start-index attributes that might cause issues
      const cleanContent = message.content
        .replace(/data-markdown-start-index="\d+"/g, '')
        .replace(/<span>\s*<\/span>/g, '') // Remove empty spans
        .trim();

      return `
        <div class="message ${senderClass}">
          <div class="message-header">${senderLabel}</div>
          <div class="message-content">${cleanContent}</div>
        </div>
      `;
    }).join('\n');

    console.log(`[PDFGenerator] Generated HTML for ${content.messages.length} messages, total length: ${messagesHtml.length}`);

    // PDF_STYLES template from design document
    const PDF_STYLES = `
      <style>
        body {
          font-family: ${this.options.fontFamily};
          font-size: ${this.options.fontSize};
          line-height: ${this.options.lineHeight};
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }

        .message {
          margin-bottom: 20px;
          padding: 15px;
          border-radius: 8px;
          page-break-inside: avoid;
        }

        .message.user {
          background-color: ${this.options.userMessageBg};
          margin-left: 40px;
        }

        .message.gemini {
          background-color: ${this.options.geminiMessageBg};
          margin-right: 40px;
        }

        .message-header {
          font-weight: bold;
          margin-bottom: 8px;
          font-size: 11pt;
          color: #666;
        }

        .message-content {
          color: #333;
          word-wrap: break-word;
        }

        .message-content p {
          margin: 8px 0;
        }

        .message-content code {
          background-color: #f0f0f0;
          padding: 2px 6px;
          border-radius: 3px;
          font-family: 'Courier New', monospace;
          font-size: 11pt;
        }

        .message-content pre {
          background-color: #f8f8f8;
          padding: 12px;
          border-radius: 4px;
          border-left: 3px solid #1a73e8;
          overflow-x: auto;
          page-break-inside: avoid;
        }

        .message-content pre code {
          background: none;
          padding: 0;
        }

        .message-content table {
          border-collapse: collapse;
          width: 100%;
          margin: 10px 0;
          page-break-inside: avoid;
        }

        .message-content th,
        .message-content td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }

        .message-content th {
          background-color: #f0f0f0;
          font-weight: bold;
        }

        .message-content ul,
        .message-content ol {
          margin: 10px 0;
          padding-left: 30px;
        }

        .message-content li {
          margin: 5px 0;
        }

        .message-content a {
          color: #1a73e8;
          text-decoration: none;
        }

        .message-content a:hover {
          text-decoration: underline;
        }

        h1, h2, h3, h4, h5, h6 {
          margin-top: 20px;
          margin-bottom: 10px;
          page-break-after: avoid;
        }

        .pdf-header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #1a73e8;
        }

        .pdf-header h1 {
          margin: 0;
          color: #1a73e8;
        }

        .pdf-header .export-date {
          color: #666;
          font-size: 10pt;
          margin-top: 5px;
        }
      </style>
    `;

    // Construct complete HTML document
    const styledHtml = `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${chatTitle}</title>
        ${PDF_STYLES}
      </head>
      <body>
        <div class="pdf-header">
          <h1>${chatTitle}</h1>
          <div class="export-date">Xuất ngày: ${exportDate}</div>
        </div>
        ${messagesHtml}
      </body>
      </html>
    `;

    console.log(`[PDFGenerator] Final HTML length: ${styledHtml.length}`);
    return styledHtml;
  }

  /**
   * Generate PDF from chat content and trigger download
   *
   * This method orchestrates the full PDF generation flow:
   * 1. Convert ChatContent to styled HTML using applyStyles
   * 2. Call html2pdf with configured options
   * 3. Generate PDF blob
   * 4. Call downloadPDF to trigger browser download
   *
   * Validates: Requirements 5.1, 5.3, 5.6
   *
   * @param content - ChatContent object containing messages to export
   * @param filename - Desired filename for the PDF (should include .pdf extension)
   * @returns Promise that resolves when PDF generation and download are complete
   * @throws Error if PDF generation fails
   */
  async generatePDF(content: ChatContent, filename: string): Promise<void> {
    try {
      // Step 1: Convert ChatContent to styled HTML
      const styledHtml = this.applyStyles(content, filename.replace('.pdf', ''));

      // Step 2: Configure html2pdf options
      const html2pdfOptions = {
        margin: [
          parseFloat(this.options.margin.top),
          parseFloat(this.options.margin.right),
          parseFloat(this.options.margin.bottom),
          parseFloat(this.options.margin.left)
        ],
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true
        },
        jsPDF: {
          unit: 'mm',
          format: this.options.format.toLowerCase() as 'a4' | 'letter',
          orientation: 'portrait'
        }
      };

      // Step 3: Generate PDF blob using html2pdf
      const pdfBlob = await html2pdf()
        .set(html2pdfOptions)
        .from(styledHtml)
        .outputPdf('blob');

      // Convert string to Blob if needed
      const blob = typeof pdfBlob === 'string'
        ? new Blob([pdfBlob], { type: 'application/pdf' })
        : pdfBlob;

      // Step 4: Trigger download
      this.downloadPDF(blob, filename);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to generate PDF: ${errorMessage}`);
    }
  }

  /**
   * Trigger browser download of PDF blob
   *
   * Creates a temporary download link and triggers it to download the PDF file.
   * Cleans up resources after download is initiated.
   *
   * Validates: Requirements 5.6, 7.5
   *
   * @param pdfBlob - PDF data as a Blob object
   * @param filename - Filename for the downloaded PDF
   */
  downloadPDF(pdfBlob: Blob, filename: string): void {
    // Create object URL from blob
    const url = URL.createObjectURL(pdfBlob);

    // Track the URL for cleanup
    this.objectUrls.add(url);

    try {
      // Create temporary anchor element
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';

      // Add to DOM, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } finally {
      // Cleanup: revoke object URL to free memory
      // Use setTimeout to ensure download has started
      setTimeout(() => {
        URL.revokeObjectURL(url);
        this.objectUrls.delete(url);
      }, 100);
    }
  }

  /**
   * Clean up all resources used by the PDF generator
   * Revokes all object URLs that haven't been cleaned up yet
   *
   * Validates: Requirements 7.5
   */
  cleanup(): void {
    // Revoke all tracked object URLs
    this.objectUrls.forEach(url => {
      URL.revokeObjectURL(url);
    });

    // Clear the set
    this.objectUrls.clear();
  }
}

