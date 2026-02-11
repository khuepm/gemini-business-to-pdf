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
 * Gets all message elements from the chat container
 */
export function getMessageElements(): HTMLElement[] {
  const container = getChatContainer();
  if (!container) return [];

  // TODO: Update selector based on actual message structure
  const messages = container.querySelectorAll('[data-message], .message, [role="article"]');
  return Array.from(messages) as HTMLElement[];
}

/**
 * Gets the chat title element (may be outside Shadow DOM)
 */
export function getChatTitleElement(): HTMLElement | null {
  // Try common locations for title
  const selectors = [
    'h1[data-title]',
    '.chat-title',
    '[aria-label*="conversation"]',
    'header h1',
    'header h2'
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) return element;
  }

  // Try inside Shadow DOM
  const container = getChatContainer();
  if (container) {
    for (const selector of selectors) {
      const element = container.querySelector(selector) as HTMLElement;
      if (element) return element;
    }
  }

  return null;
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
 * Finds all collapsed message elements
 */
export function getCollapsedMessages(): HTMLElement[] {
  const container = getChatContainer();
  if (!container) return [];

  // TODO: Update selector based on actual collapsed message structure
  const collapsed = container.querySelectorAll('[data-collapsed="true"], .collapsed-message, [aria-expanded="false"]');
  return Array.from(collapsed) as HTMLElement[];
}

/**
 * Checks if we're on Gemini Business domain
 */
export function isGeminiBusinessDomain(): boolean {
  const hostname = window.location.hostname;
  return hostname.includes('gemini') || hostname.includes('google.com');
}
