/**
 * MessageExpander - Responsible for finding and expanding collapsed messages
 * in Gemini Business chat interface
 */

import { Logger } from '../utils/logger';

/**
 * Result of expanding messages
 */
export interface ExpandResult {
  totalFound: number;
  expanded: number;
  failed: number;
  errors: string[];
}

/**
 * MessageExpander handles finding and expanding collapsed messages
 * in the chat container
 */
export class MessageExpander {
  /**
   * Find all collapsed messages in the chat container
   * 
   * NOTE: DOM selectors are placeholders and will be updated in task 14
   * when actual Gemini Business DOM structure is inspected
   * 
   * @returns Array of HTMLElement representing collapsed messages
   * @validates Requirements 2.1
   */
  findCollapsedMessages(): HTMLElement[] {
    Logger.info('Finding collapsed messages...');

    // Placeholder selector - will be updated in task 14
    // This selector should match messages that are in a collapsed state
    const collapsedSelector = '.collapsed-message, [data-collapsed="true"], .message.collapsed';

    try {
      const collapsedElements = document.querySelectorAll<HTMLElement>(collapsedSelector);
      const collapsedArray = Array.from(collapsedElements);

      Logger.info(`Found ${collapsedArray.length} collapsed messages`);
      return collapsedArray;
    } catch (error) {
      Logger.error('Error finding collapsed messages', error);
      return [];
    }
  }

  /**
   * Check if a message element is collapsed
   * 
   * @param message - The message element to check
   * @returns true if the message is collapsed, false otherwise
   */
  isCollapsed(message: HTMLElement): boolean {
    // Placeholder implementation - will be refined in task 14
    // Check for common indicators of collapsed state
    return (
      message.classList.contains('collapsed') ||
      message.classList.contains('collapsed-message') ||
      message.getAttribute('data-collapsed') === 'true' ||
      message.getAttribute('aria-expanded') === 'false'
    );
  }

  /**
   * Expand a single collapsed message
   * 
   * @param message - The collapsed message element to expand
   * @returns Promise that resolves when expansion is complete
   * @validates Requirements 2.2, 2.3
   */
  async expandMessage(message: HTMLElement): Promise<void> {
    Logger.info('Expanding message...');

    return new Promise<void>((resolve, reject) => {
      const timeout = 2000; // 2 seconds timeout
      let timeoutId: NodeJS.Timeout;
      let observer: MutationObserver | null = null;

      // Set up timeout
      timeoutId = setTimeout(() => {
        if (observer) {
          observer.disconnect();
        }
        Logger.warn('Message expansion timed out after 2 seconds');
        reject(new Error('Expansion timeout'));
      }, timeout);

      // Function to clean up and resolve
      const cleanup = () => {
        clearTimeout(timeoutId);
        if (observer) {
          observer.disconnect();
        }
        Logger.info('Message expansion complete');
        resolve();
      };

      // Set up MutationObserver to detect when expansion is complete
      observer = new MutationObserver((mutations) => {
        // Check if the message is no longer collapsed
        if (!this.isCollapsed(message)) {
          cleanup();
        }
      });

      // Observe changes to the message element and its subtree
      observer.observe(message, {
        attributes: true,
        attributeFilter: ['class', 'data-collapsed', 'aria-expanded'],
        childList: true,
        subtree: true
      });

      try {
        // Find the clickable element within the message
        // This could be the message itself or a child element like a button
        // Placeholder selectors - will be updated in task 14
        const clickTarget = message.querySelector<HTMLElement>('.expand-button, [role="button"]') || message;

        // Trigger click event to expand the message
        clickTarget.click();
        Logger.info('Click event triggered on message');

        // Also check immediately if already expanded (in case expansion is instant)
        setTimeout(() => {
          if (!this.isCollapsed(message)) {
            cleanup();
          }
        }, 100);
      } catch (error) {
        clearTimeout(timeoutId);
        if (observer) {
          observer.disconnect();
        }
        Logger.error('Error triggering click on message', error);
        reject(error);
      }
    });
  }

  /**
   * Expand all collapsed messages in the chat
   * 
   * @returns Promise that resolves with ExpandResult containing statistics
   * @validates Requirements 2.1, 2.2, 2.3, 2.4, 2.5
   */
  async expandAllMessages(): Promise<ExpandResult> {
    Logger.info('Starting expandAllMessages...');

    // Initialize result
    const result: ExpandResult = {
      totalFound: 0,
      expanded: 0,
      failed: 0,
      errors: []
    };

    // Save current scroll position (Requirement 2.5)
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    Logger.info(`Saved scroll position: (${scrollX}, ${scrollY})`);

    try {
      // Find all collapsed messages (Requirement 2.1)
      const collapsedMessages = this.findCollapsedMessages();
      result.totalFound = collapsedMessages.length;

      Logger.info(`Found ${result.totalFound} collapsed messages to expand`);

      // If no collapsed messages, return early
      if (result.totalFound === 0) {
        Logger.info('No collapsed messages found');
        return result;
      }

      // Iterate through all collapsed messages and expand them (Requirements 2.2, 2.3, 2.4)
      for (let i = 0; i < collapsedMessages.length; i++) {
        const message = collapsedMessages[i];
        Logger.info(`Expanding message ${i + 1}/${result.totalFound}...`);

        try {
          // Expand the message (Requirement 2.2)
          await this.expandMessage(message);
          result.expanded++;
          Logger.info(`Successfully expanded message ${i + 1}`);
        } catch (error) {
          // Handle errors gracefully, continue with other messages (Requirement 2.4)
          result.failed++;
          const errorMessage = error instanceof Error ? error.message : String(error);
          result.errors.push(`Message ${i + 1}: ${errorMessage}`);
          Logger.warn(`Failed to expand message ${i + 1}: ${errorMessage}`);
          // Continue with next message instead of stopping
        }
      }

      Logger.info(`Expansion complete: ${result.expanded} succeeded, ${result.failed} failed`);
    } catch (error) {
      // Handle unexpected errors in the overall process
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error('Unexpected error in expandAllMessages', error);
      result.errors.push(`Unexpected error: ${errorMessage}`);
    } finally {
      // Restore scroll position after completion (Requirement 2.5)
      window.scrollTo(scrollX, scrollY);
      Logger.info(`Restored scroll position to: (${scrollX}, ${scrollY})`);
    }

    return result;
  }
}
