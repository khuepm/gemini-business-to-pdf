/**
 * MessageExpander - Handles expanding collapsed messages in Gemini Business chat
 * 
 * Responsibilities:
 * - Find all collapsed messages in the chat container
 * - Expand individual messages by triggering click events
 * - Expand all messages while preserving scroll position
 * - Handle errors gracefully during expansion
 */

import { Logger } from '../utils/logger';
import { ExpansionError } from '../utils/error-handler';

/**
 * Result of expanding all messages
 */
export interface ExpandResult {
  totalFound: number;
  expanded: number;
  failed: number;
  errors: string[];
}

/**
 * MessageExpander class for handling message expansion
 */
export class MessageExpander {
  // Timeout for each message expansion (2 seconds)
  private readonly EXPANSION_TIMEOUT = 2000;
  
  // Polling interval for checking expansion completion (100ms)
  private readonly POLLING_INTERVAL = 100;
  
  // Selector for collapsed messages (placeholder, will be updated in task 14)
  private readonly COLLAPSED_MESSAGE_SELECTOR = '.collapsed, [data-collapsed="true"], .message.collapsed';

  constructor() {
    Logger.info('MessageExpander initialized');
  }

  /**
   * Find all collapsed messages in the chat container
   * 
   * @returns Array of HTMLElement representing collapsed messages
   * 
   * Requirements: 2.1
   */
  findCollapsedMessages(): HTMLElement[] {
    Logger.info('Finding collapsed messages');
    
    try {
      // Query all collapsed messages using the selector
      const collapsedMessages = Array.from(
        document.querySelectorAll<HTMLElement>(this.COLLAPSED_MESSAGE_SELECTOR)
      );
      
      Logger.info(`Found ${collapsedMessages.length} collapsed messages`);
      return collapsedMessages;
    } catch (error) {
      Logger.error('Error finding collapsed messages', error);
      return [];
    }
  }

  /**
   * Check if a message element is collapsed
   * 
   * @param message - The message element to check
   * @returns True if the message is collapsed, false otherwise
   */
  isCollapsed(message: HTMLElement): boolean {
    // Check if element has collapsed class or attribute
    return (
      message.classList.contains('collapsed') ||
      message.getAttribute('data-collapsed') === 'true' ||
      message.matches(this.COLLAPSED_MESSAGE_SELECTOR)
    );
  }

  /**
   * Expand a single collapsed message
   * Triggers click event and waits for expansion to complete
   * 
   * @param message - The collapsed message element to expand
   * @returns Promise that resolves when expansion is complete
   * 
   * Requirements: 2.2, 2.3
   */
  async expandMessage(message: HTMLElement): Promise<void> {
    Logger.info('Expanding message');
    
    return new Promise((resolve, reject) => {
      try {
        // Check if message is already expanded
        if (!this.isCollapsed(message)) {
          Logger.info('Message is already expanded');
          resolve();
          return;
        }

        // Set up timeout
        const timeoutId = setTimeout(() => {
          observer?.disconnect();
          const error = new ExpansionError('Message expansion timeout', 1);
          Logger.warn('Message expansion timed out');
          reject(error);
        }, this.EXPANSION_TIMEOUT);

        // Set up MutationObserver to detect when expansion is complete
        let observer: MutationObserver | null = null;
        
        const checkExpansion = () => {
          if (!this.isCollapsed(message)) {
            clearTimeout(timeoutId);
            observer?.disconnect();
            Logger.info('Message expanded successfully');
            resolve();
            return true;
          }
          return false;
        };

        // Create MutationObserver to watch for DOM changes
        observer = new MutationObserver(() => {
          checkExpansion();
        });

        // Observe the message element for attribute and class changes
        observer.observe(message, {
          attributes: true,
          attributeFilter: ['class', 'data-collapsed'],
          subtree: true,
          childList: true
        });

        // Trigger click event to expand the message
        message.click();
        Logger.info('Click event triggered on message');

        // Check immediately in case expansion is synchronous
        setTimeout(() => {
          if (checkExpansion()) {
            return;
          }
        }, 50);

      } catch (error) {
        Logger.error('Error expanding message', error);
        reject(error);
      }
    });
  }

  /**
   * Expand all collapsed messages in the chat
   * Preserves scroll position and handles errors gracefully
   * 
   * @returns Promise that resolves with ExpandResult containing statistics
   * 
   * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
   */
  async expandAllMessages(): Promise<ExpandResult> {
    Logger.info('Starting to expand all messages');
    
    const result: ExpandResult = {
      totalFound: 0,
      expanded: 0,
      failed: 0,
      errors: []
    };

    try {
      // Save current scroll position
      const scrollX = window.scrollX;
      const scrollY = window.scrollY;
      Logger.info(`Saved scroll position: (${scrollX}, ${scrollY})`);

      // Find all collapsed messages
      const collapsedMessages = this.findCollapsedMessages();
      result.totalFound = collapsedMessages.length;

      if (collapsedMessages.length === 0) {
        Logger.info('No collapsed messages found');
        return result;
      }

      // Expand each message sequentially
      for (const message of collapsedMessages) {
        try {
          await this.expandMessage(message);
          result.expanded++;
        } catch (error) {
          result.failed++;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          result.errors.push(errorMessage);
          Logger.warn(`Failed to expand message: ${errorMessage}`);
          // Continue with next message (graceful error handling)
        }
      }

      // Restore scroll position
      window.scrollTo(scrollX, scrollY);
      Logger.info(`Restored scroll position: (${scrollX}, ${scrollY})`);

      Logger.info(`Expansion complete: ${result.expanded}/${result.totalFound} successful, ${result.failed} failed`);
      
    } catch (error) {
      Logger.error('Error in expandAllMessages', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      result.errors.push(errorMessage);
    }

    return result;
  }
}
