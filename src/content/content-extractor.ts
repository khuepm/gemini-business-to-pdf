/**
 * ContentExtractor - Handles extracting chat content from Gemini Business DOM
 * 
 * Responsibilities:
 * - Extract all chat messages from the chat container
 * - Preserve HTML structure and styling
 * - Identify message senders (user vs gemini)
 * - Handle special content types (code blocks, tables, lists)
 */

import { Logger } from '../utils/logger';
import { DOMError } from '../utils/error-handler';
import { 
  getChatContainer, 
  getMessageElements, 
  extractUserMessageContent, 
  extractGeminiResponseContent 
} from '../utils/shadow-dom-utils';

/**
 * Represents a single chat message
 */
export interface Message {
  sender: 'user' | 'gemini';
  content: string; // HTML string
  timestamp?: string;
  metadata?: {
    hasCodeBlock: boolean;
    hasTable: boolean;
    hasList: boolean;
  };
}

/**
 * Represents the complete chat content
 */
export interface ChatContent {
  messages: Message[];
  timestamp: Date;
  metadata?: {
    totalMessages: number;
    userMessages: number;
    geminiMessages: number;
  };
}

/**
 * ContentExtractor class for extracting chat content
 */
export class ContentExtractor {
  // Selectors for DOM elements - Gemini Business specific
  private readonly CHAT_CONTAINER_SELECTOR = '.main.chat-mode, .chat-mode-scroller';
  private readonly MESSAGE_ELEMENT_SELECTOR = 'ucs-summary, ucs-text-streamer, ucs-response-markdown, ucs-fast-markdown';
  private readonly USER_MESSAGE_SELECTOR = 'ucs-text-streamer, ucs-fast-markdown';
  private readonly GEMINI_MESSAGE_SELECTOR = 'ucs-summary, ucs-response-markdown';

  constructor() {
    Logger.info('ContentExtractor initialized');
  }

  /**
   * Extract all chat content from the DOM
   * Finds the chat container and extracts all messages
   * 
   * @returns ChatContent object containing all messages and metadata
   * 
   * Requirements: 3.1
   */
  extractChatContent(): ChatContent {
    Logger.info('Starting to extract chat content');

    try {
      // Find the chat container
      const chatContainer = this.findChatContainer();
      if (!chatContainer) {
        throw new DOMError('Chat container not found', this.CHAT_CONTAINER_SELECTOR);
      }

      Logger.info('Chat container found');

      // Find all message elements
      const messageElements = this.findMessageElements(chatContainer);
      Logger.info(`Found ${messageElements.length} message elements`);

      if (messageElements.length === 0) {
        Logger.warn('No messages found in chat container');
      }

      // Extract each message
      const messages: Message[] = [];
      for (const messageElement of messageElements) {
        try {
          const message = this.extractMessage(messageElement);
          messages.push(message);
        } catch (error) {
          Logger.warn('Failed to extract message', error);
          // Continue with other messages (graceful error handling)
        }
      }

      // Calculate metadata
      const userMessages = messages.filter(m => m.sender === 'user').length;
      const geminiMessages = messages.filter(m => m.sender === 'gemini').length;

      const chatContent: ChatContent = {
        messages,
        timestamp: new Date(),
        metadata: {
          totalMessages: messages.length,
          userMessages,
          geminiMessages
        }
      };

      Logger.info(`Chat content extracted: ${messages.length} messages (${userMessages} user, ${geminiMessages} gemini)`);
      return chatContent;

    } catch (error) {
      Logger.error('Error extracting chat content', error);
      throw error;
    }
  }

  /**
   * Find the chat container element in the DOM (including Shadow DOM)
   * 
   * @returns The chat container HTMLElement or null if not found
   */
  private findChatContainer(): HTMLElement | null {
    // First try Shadow DOM path
    const shadowContainer = getChatContainer();
    if (shadowContainer) {
      Logger.info('Chat container found via Shadow DOM');
      return shadowContainer;
    }

    // Fallback: Try regular DOM selectors
    const selectors = this.CHAT_CONTAINER_SELECTOR.split(',').map(s => s.trim());
    
    for (const selector of selectors) {
      const container = document.querySelector<HTMLElement>(selector);
      if (container) {
        Logger.info(`Chat container found with selector: ${selector}`);
        return container;
      }
    }

    Logger.warn('Chat container not found with any selector');
    return null;
  }

  /**
   * Find all message elements within the chat container
   * 
   * @param chatContainer - The chat container element
   * @returns Array of message HTMLElements
   */
  private findMessageElements(chatContainer: HTMLElement): HTMLElement[] {
    // First try using Shadow DOM utility
    const shadowMessages = getMessageElements();
    if (shadowMessages.length > 0) {
      Logger.info(`Found ${shadowMessages.length} messages via Shadow DOM`);
      return shadowMessages;
    }

    // Fallback: Try regular DOM selectors
    const selectors = this.MESSAGE_ELEMENT_SELECTOR.split(',').map(s => s.trim());
    const messageElements: HTMLElement[] = [];

    for (const selector of selectors) {
      const elements = Array.from(chatContainer.querySelectorAll<HTMLElement>(selector));
      if (elements.length > 0) {
        Logger.info(`Found ${elements.length} messages with selector: ${selector}`);
        messageElements.push(...elements);
        break; // Use the first selector that finds messages
      }
    }

    // Remove duplicates if any
    return Array.from(new Set(messageElements));
  }

  /**
   * Extract a single message from a message element
   * Handles Shadow DOM for Gemini Business custom elements
   * 
   * @param messageElement - The message element to extract
   * @returns Message object with sender, content, and metadata
   * 
   * Requirements: 3.2, 3.3, 3.7
   */
  extractMessage(messageElement: HTMLElement): Message {
    Logger.info('Extracting message');

    try {
      // Identify the sender
      const sender = this.identifySender(messageElement);

      // Extract HTML content based on sender type
      let content = '';
      
      if (sender === 'user') {
        // Extract user message content from ucs-fast-markdown
        content = extractUserMessageContent(messageElement);
        Logger.info(`User message content extracted: ${content.substring(0, 100)}...`);
      } else {
        // Extract gemini response content from ucs-summary
        content = extractGeminiResponseContent(messageElement);
        Logger.info(`Gemini message content extracted: ${content.substring(0, 100)}...`);
      }

      // If content is still empty, try fallback methods
      if (!content.trim()) {
        Logger.warn('Content is empty, trying fallback methods');
        if (messageElement.shadowRoot) {
          content = messageElement.shadowRoot.textContent || '';
          Logger.info(`Fallback shadowRoot textContent: ${content.substring(0, 100)}...`);
        } else {
          content = messageElement.textContent || '';
          Logger.info(`Fallback textContent: ${content.substring(0, 100)}...`);
        }
        
        // If still empty, log warning
        if (!content.trim()) {
          Logger.warn('Content is still empty after all fallback attempts');
        }
      }

      // Extract timestamp if available
      const timestamp = this.extractTimestamp(messageElement);

      // Analyze content for metadata
      const metadata = {
        hasCodeBlock: this.hasCodeBlock(content),
        hasTable: this.hasTable(content),
        hasList: this.hasList(content)
      };

      const message: Message = {
        sender,
        content,
        timestamp,
        metadata
      };

      Logger.info(`Message extracted: sender=${sender}, contentLength=${content.length}, hasCode=${metadata.hasCodeBlock}, hasTable=${metadata.hasTable}, hasList=${metadata.hasList}`);
      return message;

    } catch (error) {
      Logger.error('Error extracting message', error);
      throw error;
    }
  }

  /**
   * Identify the sender of a message (user or gemini)
   * Checks tag names for Gemini Business custom elements
   * 
   * @param messageElement - The message element to check
   * @returns 'user' or 'gemini'
   * 
   * Requirements: 3.7
   */
  identifySender(messageElement: HTMLElement): 'user' | 'gemini' {
    const tagName = messageElement.tagName.toLowerCase();
    
    // User messages: ucs-fast-markdown
    if (tagName === 'ucs-fast-markdown') {
      Logger.info('Identified as user message (ucs-fast-markdown)');
      return 'user';
    }
    
    // Gemini messages: ucs-summary
    if (tagName === 'ucs-summary') {
      Logger.info('Identified as gemini message (ucs-summary)');
      return 'gemini';
    }

    // Legacy check for backward compatibility
    if (tagName === 'ucs-text-streamer') {
      Logger.info('Identified as user message (ucs-text-streamer)');
      return 'user';
    }
    
    if (tagName === 'ucs-response-markdown') {
      Logger.info('Identified as gemini message (ucs-response-markdown)');
      return 'gemini';
    }

    // Check if it's a user message by selector
    const userSelectors = this.USER_MESSAGE_SELECTOR.split(',').map(s => s.trim());
    for (const selector of userSelectors) {
      if (messageElement.matches(selector)) {
        Logger.info('Identified as user message');
        return 'user';
      }
    }

    // Check if it's a gemini message by selector
    const geminiSelectors = this.GEMINI_MESSAGE_SELECTOR.split(',').map(s => s.trim());
    for (const selector of geminiSelectors) {
      if (messageElement.matches(selector)) {
        Logger.info('Identified as gemini message');
        return 'gemini';
      }
    }

    // Default to gemini if unable to determine
    Logger.warn('Unable to determine sender, defaulting to gemini');
    return 'gemini';
  }

  /**
   * Extract timestamp from a message element if available
   * 
   * @param messageElement - The message element
   * @returns Timestamp string or undefined
   */
  private extractTimestamp(messageElement: HTMLElement): string | undefined {
    // Try to find timestamp element
    const timestampSelectors = [
      '.timestamp',
      '[data-timestamp]',
      'time',
      '.message-time',
      '.time'
    ];

    for (const selector of timestampSelectors) {
      const timestampElement = messageElement.querySelector(selector);
      if (timestampElement) {
        const timestamp = timestampElement.textContent?.trim() || 
                         timestampElement.getAttribute('data-timestamp') ||
                         timestampElement.getAttribute('datetime');
        if (timestamp) {
          Logger.info(`Timestamp found: ${timestamp}`);
          return timestamp;
        }
      }
    }

    return undefined;
  }

  /**
   * Check if content contains code blocks
   * 
   * @param content - HTML content string
   * @returns True if content has code blocks
   */
  private hasCodeBlock(content: string): boolean {
    return content.includes('<pre') || content.includes('<code');
  }

  /**
   * Check if content contains tables
   * 
   * @param content - HTML content string
   * @returns True if content has tables
   */
  private hasTable(content: string): boolean {
    return content.includes('<table');
  }

  /**
   * Check if content contains lists
   * 
   * @param content - HTML content string
   * @returns True if content has lists
   */
  private hasList(content: string): boolean {
    return content.includes('<ul') || content.includes('<ol');
  }
}
