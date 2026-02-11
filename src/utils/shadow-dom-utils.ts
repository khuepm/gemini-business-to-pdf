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
 * Each turn contains: user message (ucs-fast-markdown) and gemini response (ucs-summary)
 */
export function getMessageElements(): HTMLElement[] {
  const container = getChatContainer();
  if (!container) {
    console.warn('[getMessageElements] Chat container not found');
    return [];
  }

  const messages: HTMLElement[] = [];
  
  // Get all conversation turns (div.turn)
  const turns = container.querySelectorAll('div.turn');
  console.log(`[getMessageElements] Found ${turns.length} turns`);
  
  for (const turn of turns) {
    // Find user message (ucs-fast-markdown) - usually in div > div > div > ucs-fast-markdown
    const userMessage = turn.querySelector('ucs-fast-markdown');
    if (userMessage) {
      console.log('[getMessageElements] Found user message in turn');
      messages.push(userMessage as HTMLElement);
    }
    
    // Find gemini response (ucs-summary)
    const geminiResponse = turn.querySelector('ucs-summary');
    if (geminiResponse) {
      console.log('[getMessageElements] Found gemini response in turn');
      messages.push(geminiResponse as HTMLElement);
    }
  }
  
  console.log(`[getMessageElements] Total messages found: ${messages.length}`);
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
 * Now targets the customer-logo-container to place button next to Gemini Business logo
 */
export function getHeaderElement(): HTMLElement | null {
  try {
    // Navigate to header in Shadow DOM
    const app = document.querySelector("body > ucs-standalone-app") as HTMLElement & { shadowRoot: ShadowRoot };
    if (!app?.shadowRoot) return null;

    // Try to get the customer-logo-container (next to Gemini Business logo)
    const logoContainer = app.shadowRoot.querySelector(
      "div > div.ucs-standalone-outer-row-container > div > div.ucs-standalone-header.is-nav-panel-enabled.format-header.is-chat-mode > div.customer-logo-container.static"
    ) as HTMLElement;
    
    if (logoContainer) {
      console.log('[getHeaderElement] Found customer-logo-container');
      return logoContainer;
    }

    // Fallback: try without all the specific classes
    const headerFallback = app.shadowRoot.querySelector(
      "div > div.ucs-standalone-outer-row-container > div > div.ucs-standalone-header > div.customer-logo-container"
    ) as HTMLElement;
    
    if (headerFallback) {
      console.log('[getHeaderElement] Found customer-logo-container (fallback)');
      return headerFallback;
    }

    // Try header-actions as another fallback
    const headerActions = app.shadowRoot.querySelector(
      "div > div.ucs-standalone-outer-row-container > div > div.ucs-standalone-header > div.header-actions"
    ) as HTMLElement;
    
    if (headerActions) {
      console.log('[getHeaderElement] Found header-actions');
      return headerActions;
    }

    // Last fallback: try to find any header element
    const anyHeader = app.shadowRoot.querySelector("div.ucs-standalone-header") as HTMLElement;
    console.log('[getHeaderElement] Using fallback header:', !!anyHeader);
    return anyHeader || document.body;
  } catch (error) {
    console.error("Error getting header element:", error);
    return document.body;
  }
}

/**
 * Extracts content from a user message element (ucs-fast-markdown)
 * Also extracts attached images from ucs-carousel if present
 * Path: ucs-fast-markdown -> shadowRoot -> div > div > p (or div > div for full content)
 * Images: parent turn -> ucs-carousel -> ucs-file-bubble -> shadowRoot -> div > img
 */
export function extractUserMessageContent(userMessage: HTMLElement): string {
  try {
    let content = '';
    
    if (userMessage.shadowRoot) {
      // Primary: Get full content from div > div (contains all content including multiple paragraphs)
      const fullContent = userMessage.shadowRoot.querySelector('div > div');
      if (fullContent) {
        const innerHTML = fullContent.innerHTML.trim();
        if (innerHTML) {
          console.log('[extractUserMessageContent] Extracted from div > div:', innerHTML.substring(0, 100));
          content = innerHTML;
        }
      }
      
      // Fallback 1: try p tag only (might be truncated)
      if (!content) {
        const pContent = userMessage.shadowRoot.querySelector('div > div > p');
        if (pContent) {
          const innerHTML = pContent.innerHTML.trim();
          if (innerHTML) {
            console.log('[extractUserMessageContent] Extracted from p tag:', innerHTML.substring(0, 100));
            content = innerHTML;
          }
        }
      }
      
      // Fallback 2: try any div with content
      if (!content) {
        const anyDiv = userMessage.shadowRoot.querySelector('div');
        if (anyDiv) {
          const innerHTML = anyDiv.innerHTML.trim();
          if (innerHTML) {
            console.log('[extractUserMessageContent] Extracted from any div:', innerHTML.substring(0, 100));
            content = innerHTML;
          }
        }
      }
      
      // Fallback 3: get text content from shadow root
      if (!content) {
        const textContent = userMessage.shadowRoot.textContent?.trim();
        if (textContent) {
          console.log('[extractUserMessageContent] Extracted from textContent:', textContent.substring(0, 100));
          content = textContent;
        }
      }
    }
    
    // If no shadow root, try regular content
    if (!content) {
      const innerHTML = userMessage.innerHTML.trim();
      if (innerHTML) {
        console.log('[extractUserMessageContent] Extracted from innerHTML (no shadow):', innerHTML.substring(0, 100));
        content = innerHTML;
      }
    }
    
    if (!content) {
      const textContent = userMessage.textContent?.trim() || '';
      console.log('[extractUserMessageContent] Fallback to textContent:', textContent.substring(0, 100));
      content = textContent;
    }
    
    // Check for attached images in the parent turn
    const turn = userMessage.closest('div.turn');
    if (turn) {
      const carousel = turn.querySelector('ucs-carousel');
      if (carousel) {
        console.log('[extractUserMessageContent] Found carousel with images');
        const fileBubbles = carousel.querySelectorAll('ucs-file-bubble');
        
        if (fileBubbles.length > 0) {
          console.log(`[extractUserMessageContent] Found ${fileBubbles.length} file bubbles`);
          const images: string[] = [];
          
          fileBubbles.forEach((bubble, index) => {
            const bubbleElement = bubble as HTMLElement & { shadowRoot: ShadowRoot };
            if (bubbleElement.shadowRoot) {
              const img = bubbleElement.shadowRoot.querySelector('div > img') as HTMLImageElement;
              if (img && img.src) {
                console.log(`[extractUserMessageContent] Found image ${index + 1}: ${img.src.substring(0, 50)}...`);
                images.push(`<img src="${img.src}" alt="Attached image ${index + 1}" style="max-width: 100%; height: auto; margin: 10px 0;" />`);
              }
            }
          });
          
          // Append images to content
          if (images.length > 0) {
            content += '<div class="attached-images">' + images.join('') + '</div>';
            console.log(`[extractUserMessageContent] Added ${images.length} images to content`);
          }
        }
      }
    }
    
    return content;
  } catch (error) {
    console.error('Error extracting user message content:', error);
    return userMessage.textContent?.trim() || '';
  }
}

/**
 * Extracts content from a gemini response element (ucs-summary)
 * Path: ucs-summary -> shadowRoot -> div > div > div.summary-contents > div.summary > ucs-text-streamer 
 *       -> shadowRoot -> ucs-response-markdown -> shadowRoot -> ucs-fast-markdown -> shadowRoot -> div > div
 */
export function extractGeminiResponseContent(geminiResponse: HTMLElement): string {
  try {
    if (geminiResponse.shadowRoot) {
      // Primary path: Navigate through nested shadow roots
      const summaryContents = geminiResponse.shadowRoot.querySelector('div > div > div.summary-contents > div.summary > ucs-text-streamer') as HTMLElement & { shadowRoot: ShadowRoot };
      
      if (summaryContents?.shadowRoot) {
        const responseMarkdown = summaryContents.shadowRoot.querySelector('ucs-response-markdown') as HTMLElement & { shadowRoot: ShadowRoot };
        
        if (responseMarkdown?.shadowRoot) {
          const fastMarkdown = responseMarkdown.shadowRoot.querySelector('ucs-fast-markdown') as HTMLElement & { shadowRoot: ShadowRoot };
          
          if (fastMarkdown?.shadowRoot) {
            // Get full content from div > div
            const content = fastMarkdown.shadowRoot.querySelector('div > div');
            if (content) {
              const innerHTML = content.innerHTML.trim();
              if (innerHTML) {
                console.log('[extractGeminiResponseContent] Extracted from nested shadow DOM:', innerHTML.substring(0, 100));
                return innerHTML;
              }
            }
            
            // Try just div
            const divContent = fastMarkdown.shadowRoot.querySelector('div');
            if (divContent) {
              const innerHTML = divContent.innerHTML.trim();
              if (innerHTML) {
                console.log('[extractGeminiResponseContent] Extracted from div:', innerHTML.substring(0, 100));
                return innerHTML;
              }
            }
          }
        }
      }
      
      // Fallback 1: try simpler paths - summary-contents
      const summaryDiv = geminiResponse.shadowRoot.querySelector('div.summary-contents');
      if (summaryDiv) {
        const innerHTML = summaryDiv.innerHTML.trim();
        if (innerHTML) {
          console.log('[extractGeminiResponseContent] Extracted from summary-contents:', innerHTML.substring(0, 100));
          return innerHTML;
        }
      }
      
      // Fallback 2: try any div with content
      const anyDiv = geminiResponse.shadowRoot.querySelector('div');
      if (anyDiv) {
        const innerHTML = anyDiv.innerHTML.trim();
        if (innerHTML) {
          console.log('[extractGeminiResponseContent] Extracted from any div:', innerHTML.substring(0, 100));
          return innerHTML;
        }
      }
      
      // Fallback 3: try to get text content
      const textContent = geminiResponse.shadowRoot.textContent?.trim();
      if (textContent) {
        console.log('[extractGeminiResponseContent] Extracted from textContent:', textContent.substring(0, 100));
        return textContent;
      }
    }
    
    // If no shadow root, try regular content
    const innerHTML = geminiResponse.innerHTML.trim();
    if (innerHTML) {
      console.log('[extractGeminiResponseContent] Extracted from innerHTML (no shadow):', innerHTML.substring(0, 100));
      return innerHTML;
    }
    
    const textContent = geminiResponse.textContent?.trim() || '';
    console.log('[extractGeminiResponseContent] Fallback to textContent:', textContent.substring(0, 100));
    return textContent;
  } catch (error) {
    console.error('Error extracting gemini response content:', error);
    return geminiResponse.textContent?.trim() || '';
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
  // Check for Gemini Business domains
  return hostname.includes('gemini.google') || 
         hostname.includes('business.gemini') ||
         (hostname.includes('google.com') && window.location.href.includes('gemini'));
}
