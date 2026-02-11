/**
 * Utility functions for traversing Shadow DOM in Gemini Business
 */

/**
 * Traverses Shadow DOM to get the chat container element
 * Path: body > ucs-standalone-app -> shadowRoot -> ... -> ucs-conversation -> shadowRoot -> div
 */
export function getChatContainer(): HTMLElement | null {
  try {
    const app = document.querySelector("body > ucs-standalone-app") as HTMLElement & { shadowRoot: ShadowRoot };
    if (!app?.shadowRoot) return null;

    const results = app.shadowRoot.querySelector(
      "div > div.ucs-standalone-outer-row-container > div > div.search-bar-and-results-container > div > ucs-results"
    ) as HTMLElement & { shadowRoot: ShadowRoot };
    if (!results?.shadowRoot) return null;

    const conversation = results.shadowRoot.querySelector(
      "div > div > div.tile.chat-mode-conversation.chat-mode-conversation > div.chat-mode-scroller.tile-content > ucs-conversation"
    ) as HTMLElement & { shadowRoot: ShadowRoot };
    if (!conversation?.shadowRoot) return null;

    const chatContainer = conversation.shadowRoot.querySelector("div") as HTMLElement;
    return chatContainer;
  } catch (error) {
    console.error("Error traversing Shadow DOM:", error);
    return null;
  }
}

/**
 * Gets all conversation turns (user question + gemini response pairs)
 * Each turn contains both user message and gemini response
 */
export function getConversationTurns(): HTMLElement[] {
  const container = getChatContainer();
  if (!container) return [];

  // Each turn is wrapped in div.turn
  const turns = container.querySelectorAll('div.turn');
  return Array.from(turns) as HTMLElement[];
}

/**
 * Gets all message elements from the chat container
 * Returns both user messages and gemini responses
 */
export function getMessageElements(): HTMLElement[] {
  const container = getChatContainer();
  if (!container) return [];

  const messages: HTMLElement[] = [];
  
  // Get all conversation turns
  const turns = container.querySelectorAll('div.turn');
  
  for (const turn of turns) {
    // Find user message (ucs-fast-markdown)
    const userMessage = turn.querySelector('ucs-fast-markdown');
    if (userMessage) {
      messages.push(userMessage as HTMLElement);
    }
    
    // Find gemini response (ucs-summary)
    const geminiResponse = turn.querySelector('ucs-summary');
    if (geminiResponse) {
      messages.push(geminiResponse as HTMLElement);
    }
  }
  
  return messages;
}

/**
 * Gets the chat title element (may be outside Shadow DOM)
 */
export function getChatTitleElement(): HTMLElement | null {
  try {
    // Navigate to nav panel in Shadow DOM
    const app = document.querySelector("body > ucs-standalone-app") as HTMLElement & { shadowRoot: ShadowRoot };
    if (!app?.shadowRoot) return null;

    const navPanel = app.shadowRoot.querySelector("div > div.ucs-standalone-outer-row-container > ucs-nav-panel") as HTMLElement & { shadowRoot: ShadowRoot };
    if (!navPanel?.shadowRoot) return null;

    // Find the conversation list
    const conversationList = navPanel.shadowRoot.querySelector("div > div.sections-container > div.conversation-list");
    if (!conversationList) return null;

    // Find the selected conversation button (has class "selected")
    const selectedButton = conversationList.querySelector("button.list-item.selected");
    if (!selectedButton) {
      // Fallback: try to find any button with selected class
      const anySelected = conversationList.querySelector("button.selected");
      if (anySelected) {
        const titleElement = anySelected.querySelector("div.conversation-title") as HTMLElement;
        return titleElement;
      }
      return null;
    }

    // Get the conversation title from the selected button
    const titleElement = selectedButton.querySelector("div.conversation-title") as HTMLElement;
    return titleElement;
  } catch (error) {
    console.error("Error getting chat title element:", error);
    return null;
  }
}

/**
 * Gets all conversation titles from the conversation list
 * Useful for debugging or future features
 */
export function getAllConversationTitles(): Array<{ title: string; isSelected: boolean }> {
  try {
    const app = document.querySelector("body > ucs-standalone-app") as HTMLElement & { shadowRoot: ShadowRoot };
    if (!app?.shadowRoot) return [];

    const navPanel = app.shadowRoot.querySelector("div > div.ucs-standalone-outer-row-container > ucs-nav-panel") as HTMLElement & { shadowRoot: ShadowRoot };
    if (!navPanel?.shadowRoot) return [];

    const conversationList = navPanel.shadowRoot.querySelector("div > div.sections-container > div.conversation-list");
    if (!conversationList) return [];

    const buttons = conversationList.querySelectorAll("button.list-item");
    const titles: Array<{ title: string; isSelected: boolean }> = [];

    buttons.forEach(button => {
      const titleElement = button.querySelector("div.conversation-title");
      if (titleElement) {
        titles.push({
          title: titleElement.textContent?.trim() || '',
          isSelected: button.classList.contains('selected')
        });
      }
    });

    return titles;
  } catch (error) {
    console.error("Error getting all conversation titles:", error);
    return [];
  }
}

/**
 * Gets the header element where we can inject the export button
 */
export function getHeaderElement(): HTMLElement | null {
  // Try to find header outside Shadow DOM first
  const selectors = [
    'header',
    '[role="banner"]',
    '.header',
    '.top-bar'
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) return element;
  }

  // Fallback: inject at body level
  return document.body;
}

/**
 * Extracts content from a user message element (ucs-fast-markdown)
 */
export function extractUserMessageContent(userMessage: HTMLElement): string {
  try {
    if (userMessage.shadowRoot) {
      const content = userMessage.shadowRoot.querySelector('div > div > p');
      if (content) {
        return content.innerHTML;
      }
      // Fallback: get all content from shadow root
      return userMessage.shadowRoot.querySelector('div')?.innerHTML || '';
    }
    return userMessage.textContent || '';
  } catch (error) {
    console.error('Error extracting user message content:', error);
    return userMessage.textContent || '';
  }
}

/**
 * Extracts content from a gemini response element (ucs-summary)
 */
export function extractGeminiResponseContent(geminiResponse: HTMLElement): string {
  try {
    if (geminiResponse.shadowRoot) {
      // Navigate through nested shadow roots
      const summaryContents = geminiResponse.shadowRoot.querySelector('div > div > div.summary-contents > div.summary > ucs-text-streamer') as HTMLElement & { shadowRoot: ShadowRoot };
      
      if (summaryContents?.shadowRoot) {
        const responseMarkdown = summaryContents.shadowRoot.querySelector('ucs-response-markdown') as HTMLElement & { shadowRoot: ShadowRoot };
        
        if (responseMarkdown?.shadowRoot) {
          const fastMarkdown = responseMarkdown.shadowRoot.querySelector('ucs-fast-markdown') as HTMLElement & { shadowRoot: ShadowRoot };
          
          if (fastMarkdown?.shadowRoot) {
            const content = fastMarkdown.shadowRoot.querySelector('div > div');
            if (content) {
              return content.innerHTML;
            }
          }
        }
      }
      
      // Fallback: try to get text content
      return geminiResponse.shadowRoot.textContent || '';
    }
    return geminiResponse.textContent || '';
  } catch (error) {
    console.error('Error extracting gemini response content:', error);
    return geminiResponse.textContent || '';
  }
}

/**
 * Finds all collapsed message elements
 * Note: Based on the structure, collapsed messages might be indicated by specific classes or attributes
 */
export function getCollapsedMessages(): HTMLElement[] {
  const container = getChatContainer();
  if (!container) return [];

  const collapsed: HTMLElement[] = [];
  
  // Check all turns for collapsed state
  const turns = container.querySelectorAll('div.turn');
  
  for (const turn of turns) {
    // Check if turn has collapsed class or attribute
    if (turn.classList.contains('collapsed') || 
        turn.getAttribute('data-collapsed') === 'true' ||
        turn.getAttribute('aria-expanded') === 'false') {
      collapsed.push(turn as HTMLElement);
    }
    
    // Also check individual message elements
    const userMessage = turn.querySelector('ucs-fast-markdown');
    if (userMessage && (
        userMessage.classList.contains('collapsed') ||
        userMessage.getAttribute('data-collapsed') === 'true')) {
      collapsed.push(userMessage as HTMLElement);
    }
  }
  
  return collapsed;
}

/**
 * Checks if we're on Gemini Business domain
 */
export function isGeminiBusinessDomain(): boolean {
  const hostname = window.location.hostname;
  return hostname.includes('gemini') || hostname.includes('google.com');
}
