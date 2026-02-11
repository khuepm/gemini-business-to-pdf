/**
 * Integration tests for complete export flow
 * Feature: gemini-business-to-pdf
 * 
 * Tests the end-to-end flow from button click to PDF download
 * Validates: Requirements 2.1, 2.2, 2.3, 3.1, 4.1, 5.1, 5.6, 6.1, 6.2, 6.5
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ExportController } from '../../src/content/export-controller';

// Mock html2pdf library
vi.mock('html2pdf.js', () => ({
  default: vi.fn(() => ({
    set: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    save: vi.fn().mockResolvedValue(undefined),
    outputPdf: vi.fn().mockResolvedValue(new Blob(['mock pdf'], { type: 'application/pdf' }))
  }))
}));

describe('Export Flow - Integration Tests', () => {
  let controller: ExportController;
  let mockChatContainer: HTMLElement;
  let mockButton: HTMLButtonElement;
  let html2pdf: any;

  /**
   * Setup a mock Gemini Business DOM structure
   */
  function setupMockGeminiDOM() {
    // Clear document body
    document.body.innerHTML = '';

    // Create header container for button injection
    const header = document.createElement('div');
    header.className = 'header-actions';
    document.body.appendChild(header);

    // Create chat title
    const titleElement = document.createElement('h1');
    titleElement.className = 'chat-title';
    titleElement.textContent = 'Test Conversation';
    document.body.appendChild(titleElement);

    // Create chat container
    mockChatContainer = document.createElement('div');
    mockChatContainer.className = 'chat-container';
    document.body.appendChild(mockChatContainer);

    return { header, titleElement, chatContainer: mockChatContainer };
  }

  /**
   * Add messages to the chat container
   */
  function addMessages(count: number, options: { collapsed?: boolean } = {}) {
    const messages: HTMLElement[] = [];

    for (let i = 0; i < count; i++) {
      const message = document.createElement('div');
      message.className = i % 2 === 0 ? 'user-message message' : 'gemini-message message';
      
      const content = document.createElement('div');
      content.className = 'message-content';
      content.innerHTML = `<p>Message ${i + 1}</p>`;
      message.appendChild(content);

      // Add collapsed state if requested
      if (options.collapsed && i % 2 === 0) {
        message.classList.add('collapsed');
        message.setAttribute('data-collapsed', 'true');
        
        // Add expand button
        const expandBtn = document.createElement('button');
        expandBtn.className = 'expand-button';
        expandBtn.textContent = 'Show more';
        expandBtn.onclick = () => {
          message.classList.remove('collapsed');
          message.removeAttribute('data-collapsed');
          expandBtn.remove();
        };
        message.appendChild(expandBtn);
      }

      mockChatContainer.appendChild(message);
      messages.push(message);
    }

    return messages;
  }

  beforeEach(async () => {
    // Reset all mocks
    vi.clearAllMocks();

    // Mock URL.createObjectURL and revokeObjectURL (not available in jsdom)
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();

    // Get the mocked html2pdf
    const html2pdfModule = await import('html2pdf.js');
    html2pdf = html2pdfModule.default;

    // Setup mock DOM
    setupMockGeminiDOM();

    // Create controller instance
    controller = new ExportController();
  });

  afterEach(() => {
    // Cleanup
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  describe('End-to-End Export Flow', () => {
    it('should complete full export flow from button click to PDF download', async () => {
      // Setup: Add messages to chat
      addMessages(5);

      // Initialize controller (injects button)
      controller.initialize();

      // Get the injected button
      mockButton = document.querySelector('.gemini-pdf-export-button') as HTMLButtonElement;
      expect(mockButton).toBeTruthy();

      // Verify button is initially enabled
      expect(mockButton.disabled).toBe(false);

      // Execute: Trigger export
      const exportPromise = controller.handleExport();

      // Wait a tiny bit for the export to start
      await new Promise(resolve => setTimeout(resolve, 5));

      // Verify: Button is disabled during export
      expect(mockButton.disabled).toBe(true);

      // Wait for export to complete
      await exportPromise;

      // Verify: Button is re-enabled after export
      expect(mockButton.disabled).toBe(false);

      // Verify: html2pdf was called
      expect(html2pdf).toHaveBeenCalled();

      // Verify: Success notification is shown
      const notification = document.querySelector('.gemini-pdf-notification.success');
      expect(notification).toBeTruthy();
      expect(notification?.textContent).toContain('Đã xuất PDF thành công!');
    });

    it('should expand collapsed messages before extracting content', async () => {
      // Setup: Add messages with some collapsed
      const messages = addMessages(6, { collapsed: true });

      // Count collapsed messages
      const collapsedMessages = messages.filter(m => m.classList.contains('collapsed'));
      expect(collapsedMessages.length).toBeGreaterThan(0);

      // Initialize
      controller.initialize();
      mockButton = document.querySelector('.gemini-pdf-export-button') as HTMLButtonElement;
      
      // Execute: Trigger export
      await controller.handleExport();

      // Verify: All messages are expanded
      const stillCollapsed = Array.from(mockChatContainer.querySelectorAll('.message'))
        .filter(m => m.classList.contains('collapsed'));
      expect(stillCollapsed.length).toBe(0);

      // Verify: PDF generation was called
      expect(html2pdf).toHaveBeenCalled();
    });

    it('should extract all messages in correct order', async () => {
      // Setup: Add messages
      const messageCount = 10;
      addMessages(messageCount);

      // Initialize
      controller.initialize();
      mockButton = document.querySelector('.gemini-pdf-export-button') as HTMLButtonElement;
      
      // Execute: Trigger export
      await controller.handleExport();

      // Verify: html2pdf was called with content
      expect(html2pdf).toHaveBeenCalled();
      
      // Get the HTML content passed to html2pdf
      const html2pdfInstance = html2pdf.mock.results[0].value;
      expect(html2pdfInstance.from).toHaveBeenCalled();
      
      const htmlContent = html2pdfInstance.from.mock.calls[0][0];
      expect(htmlContent).toBeTruthy();
      
      // Verify: Content contains all messages
      for (let i = 1; i <= messageCount; i++) {
        expect(htmlContent).toContain(`Message ${i}`);
      }
    });

    it('should use chat title for filename', async () => {
      // Setup: Chat with title
      addMessages(3);

      // Initialize and trigger export
      controller.initialize();
      mockButton = document.querySelector('.gemini-pdf-export-button') as HTMLButtonElement;
      await controller.handleExport();

      // Verify: html2pdf was called
      expect(html2pdf).toHaveBeenCalled();
      
      // Verify: filename is based on chat title
      const html2pdfInstance = html2pdf.mock.results[0].value;
      expect(html2pdfInstance.set).toHaveBeenCalled();
      
      const options = html2pdfInstance.set.mock.calls[0][0];
      const filename = options.filename;
      expect(filename).toContain('Test_Conversation');
      expect(filename).toMatch(/\.pdf$/);
    });

    it('should execute all steps in correct order', async () => {
      // Setup
      addMessages(5, { collapsed: true });

      // Track execution order
      const executionOrder: string[] = [];

      // Spy on key methods to track order
      const originalExpandAll = controller['messageExpander'].expandAllMessages;
      const originalExtract = controller['contentExtractor'].extractChatContent;
      const originalGeneratePDF = controller['pdfGenerator'].generatePDF;

      controller['messageExpander'].expandAllMessages = vi.fn(async function(...args) {
        executionOrder.push('expand');
        return originalExpandAll.apply(this, args);
      });

      controller['contentExtractor'].extractChatContent = vi.fn(function(...args) {
        executionOrder.push('extract');
        return originalExtract.apply(this, args);
      });

      controller['pdfGenerator'].generatePDF = vi.fn(async function(...args) {
        executionOrder.push('generatePDF');
        return originalGeneratePDF.apply(this, args);
      });

      // Initialize and trigger export
      controller.initialize();
      mockButton = document.querySelector('.gemini-pdf-export-button') as HTMLButtonElement;
      await controller.handleExport();

      // Verify: Steps executed in correct order
      expect(executionOrder).toEqual(['expand', 'extract', 'generatePDF']);
    });

    it('should preserve message formatting in PDF', async () => {
      // Setup: Add messages with various formatting
      const formattedMessage = document.createElement('div');
      formattedMessage.className = 'user-message message';
      formattedMessage.innerHTML = `
        <div class="message-content">
          <p>This is <strong>bold</strong> and <em>italic</em> text.</p>
          <pre><code>const x = 42;</code></pre>
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
          </ul>
          <table>
            <tr><th>Header</th></tr>
            <tr><td>Data</td></tr>
          </table>
        </div>
      `;
      mockChatContainer.appendChild(formattedMessage);

      // Initialize and trigger export
      controller.initialize();
      mockButton = document.querySelector('.gemini-pdf-export-button') as HTMLButtonElement;
      await controller.handleExport();

      // Verify: html2pdf was called with formatted content
      const html2pdfInstance = html2pdf.mock.results[0].value;
      const htmlContent = html2pdfInstance.from.mock.calls[0][0];

      // Verify: Formatting is preserved
      expect(htmlContent).toContain('<strong>bold</strong>');
      expect(htmlContent).toContain('<em>italic</em>');
      expect(htmlContent).toContain('<code>const x = 42;</code>');
      expect(htmlContent).toContain('<ul>');
      expect(htmlContent).toContain('<li>Item 1</li>');
      expect(htmlContent).toContain('<table>');
      expect(htmlContent).toContain('<th>Header</th>');
    });
  });

  describe('Error Scenarios', () => {
    it('should handle error when chat container is not found', async () => {
      // Setup: Remove chat container
      mockChatContainer.remove();

      // Initialize and trigger export
      controller.initialize();
      mockButton = document.querySelector('.gemini-pdf-export-button') as HTMLButtonElement;
      await controller.handleExport();

      // Verify: Button is re-enabled even after error
      expect(mockButton.disabled).toBe(false);

      // Verify: Error notification is shown
      const notification = document.querySelector('.gemini-pdf-notification.error');
      expect(notification).toBeTruthy();
      expect(notification?.textContent).toContain('Không thể xuất PDF');
    });

    it('should handle error when PDF generation fails', async () => {
      // Setup: Make html2pdf fail
      html2pdf.mockImplementationOnce(() => ({
        set: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        save: vi.fn().mockRejectedValue(new Error('PDF generation failed')),
        outputPdf: vi.fn().mockRejectedValue(new Error('PDF generation failed'))
      }));

      // Add messages
      addMessages(3);

      // Initialize and trigger export
      controller.initialize();
      mockButton = document.querySelector('.gemini-pdf-export-button') as HTMLButtonElement;
      await controller.handleExport();

      // Verify: Button is re-enabled after error
      expect(mockButton.disabled).toBe(false);

      // Verify: Error notification is shown
      const notification = document.querySelector('.gemini-pdf-notification.error');
      expect(notification).toBeTruthy();
      expect(notification?.textContent).toContain('Không thể xuất PDF');
    });

    it('should handle error when message expansion fails', async () => {
      // Setup: Add messages with problematic collapsed state
      const messages = addMessages(5, { collapsed: true });
      
      // Make one message fail to expand by removing the expand button
      const problematicMessage = messages[0];
      const expandBtn = problematicMessage.querySelector('.expand-button');
      if (expandBtn) {
        expandBtn.remove();
      }

      // Initialize and trigger export
      controller.initialize();
      mockButton = document.querySelector('.gemini-pdf-export-button') as HTMLButtonElement;
      await controller.handleExport();

      // Verify: Export continues and completes
      expect(html2pdf).toHaveBeenCalled();

      // Verify: Button is re-enabled
      expect(mockButton.disabled).toBe(false);
    });

    it('should handle error when title extraction fails', async () => {
      // Setup: Remove title element
      const titleElement = document.querySelector('.chat-title');
      titleElement?.remove();

      // Add messages
      addMessages(3);

      // Initialize and trigger export
      controller.initialize();
      mockButton = document.querySelector('.gemini-pdf-export-button') as HTMLButtonElement;
      await controller.handleExport();

      // Verify: Export completes with fallback filename
      expect(html2pdf).toHaveBeenCalled();
      
      const html2pdfInstance = html2pdf.mock.results[0].value;
      expect(html2pdfInstance.set).toHaveBeenCalled();
      
      // Get the options passed to set()
      const options = html2pdfInstance.set.mock.calls[0][0];
      const filename = options.filename;
      
      // Should use fallback filename format
      expect(filename).toMatch(/gemini-chat-\d{8}-\d{6}\.pdf/);
    });

    it('should prevent multiple simultaneous exports', async () => {
      // Setup
      addMessages(5);

      // Make export take longer by making html2pdf slow
      const slowHtml2pdf = vi.fn(() => ({
        set: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        save: vi.fn().mockImplementation(() => 
          new Promise(resolve => setTimeout(resolve, 200))
        ),
        outputPdf: vi.fn().mockResolvedValue(new Blob(['mock pdf'], { type: 'application/pdf' }))
      }));
      
      // Replace the mock temporarily
      const originalMock = html2pdf;
      (await import('html2pdf.js')).default = slowHtml2pdf;

      // Initialize
      controller.initialize();
      mockButton = document.querySelector('.gemini-pdf-export-button') as HTMLButtonElement;

      // Execute: Start two exports simultaneously (don't await the first one)
      const promise1 = controller.handleExport();
      const promise2 = controller.handleExport();

      // Wait for both to complete
      await Promise.all([promise1, promise2]);

      // Verify: html2pdf was only called once (second call was prevented)
      expect(slowHtml2pdf).toHaveBeenCalledTimes(1);
      
      // Restore original mock
      (await import('html2pdf.js')).default = originalMock;
    });
  });

  describe('UI State Management', () => {
    it('should show loading indicator during export', async () => {
      // Setup
      addMessages(3);

      // Initialize
      controller.initialize();
      mockButton = document.querySelector('.gemini-pdf-export-button') as HTMLButtonElement;

      // Execute: Start export (don't await yet)
      const exportPromise = controller.handleExport();

      // The button text should change immediately (synchronously)
      // No need to wait since showLoading() is called synchronously at the start of handleExport
      const buttonText = mockButton.textContent;
      expect(buttonText).toContain('Đang xuất');

      // Wait for export to complete
      await exportPromise;

      // Verify: Button text returns to normal
      const buttonTextAfter = mockButton.textContent;
      expect(buttonTextAfter).toContain('Xuất PDF');
    });

    it('should disable button during export and re-enable after', async () => {
      // Setup
      addMessages(3);

      // Initialize
      controller.initialize();
      mockButton = document.querySelector('.gemini-pdf-export-button') as HTMLButtonElement;

      // Verify: Initially enabled
      expect(mockButton.disabled).toBe(false);

      // Execute: Start export (don't await yet)
      const exportPromise = controller.handleExport();

      // The button should be disabled immediately (synchronously)
      // No need to wait since disableButton() is called synchronously at the start of handleExport
      expect(mockButton.disabled).toBe(true);

      // Wait for export to complete
      await exportPromise;

      // Verify: Re-enabled after export
      expect(mockButton.disabled).toBe(false);
    });

    it('should show success notification after successful export', async () => {
      // Setup
      addMessages(3);

      // Initialize and trigger export
      controller.initialize();
      mockButton = document.querySelector('.gemini-pdf-export-button') as HTMLButtonElement;
      await controller.handleExport();

      // Verify: Success notification is shown
      const notification = document.querySelector('.gemini-pdf-notification.success');
      expect(notification).toBeTruthy();
      expect(notification?.textContent).toContain('Đã xuất PDF thành công!');
    });

    it('should show error notification after failed export', async () => {
      // Setup: Make PDF generation fail
      html2pdf.mockImplementationOnce(() => ({
        set: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        save: vi.fn().mockRejectedValue(new Error('Test error')),
        outputPdf: vi.fn().mockRejectedValue(new Error('Test error'))
      }));

      addMessages(3);

      // Initialize and trigger export
      controller.initialize();
      mockButton = document.querySelector('.gemini-pdf-export-button') as HTMLButtonElement;
      await controller.handleExport();

      // Verify: Error notification is shown
      const notification = document.querySelector('.gemini-pdf-notification.error');
      expect(notification).toBeTruthy();
      expect(notification?.textContent).toContain('Không thể xuất PDF');
      expect(notification?.textContent).toContain('Test error');
    });
  });

  describe('Content Extraction', () => {
    it('should extract empty chat gracefully', async () => {
      // Setup: No messages in chat
      // (chat container exists but is empty)

      // Initialize and trigger export
      controller.initialize();
      mockButton = document.querySelector('.gemini-pdf-export-button') as HTMLButtonElement;
      await controller.handleExport();

      // Verify: Export completes without error
      expect(html2pdf).toHaveBeenCalled();

      // Verify: Button is re-enabled
      expect(mockButton.disabled).toBe(false);
    });

    it('should distinguish between user and gemini messages', async () => {
      // Setup: Add mixed messages
      addMessages(6);

      // Initialize and trigger export
      controller.initialize();
      mockButton = document.querySelector('.gemini-pdf-export-button') as HTMLButtonElement;
      await controller.handleExport();

      // Verify: html2pdf was called with content
      const html2pdfInstance = html2pdf.mock.results[0].value;
      const htmlContent = html2pdfInstance.from.mock.calls[0][0];

      // Verify: Content distinguishes between user and gemini messages
      // The PDF uses "message user" and "message gemini" classes
      expect(htmlContent).toContain('message user');
      expect(htmlContent).toContain('message gemini');
    });

    it('should handle large conversations (>100 messages)', async () => {
      // Setup: Add many messages
      addMessages(150);

      // Initialize and trigger export
      controller.initialize();
      mockButton = document.querySelector('.gemini-pdf-export-button') as HTMLButtonElement;
      await controller.handleExport();

      // Verify: Export completes successfully
      expect(html2pdf).toHaveBeenCalled();

      // Verify: All messages are included
      const html2pdfInstance = html2pdf.mock.results[0].value;
      const htmlContent = html2pdfInstance.from.mock.calls[0][0];
      
      // Check for first and last message
      expect(htmlContent).toContain('Message 1');
      expect(htmlContent).toContain('Message 150');
    }, 10000); // Increase timeout for this test
  });
});
