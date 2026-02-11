# Shadow DOM Selectors - Gemini Business

## Đường Dẫn Shadow DOM Đã Xác Định

### Chat Container (Toàn bộ tin nhắn)
```javascript
document.querySelector("body > ucs-standalone-app")
  .shadowRoot.querySelector("div > div.ucs-standalone-outer-row-container > div > div.search-bar-and-results-container > div > ucs-results")
  .shadowRoot.querySelector("div > div > div.tile.chat-mode-conversation.chat-mode-conversation > div.chat-mode-scroller.tile-content > ucs-conversation")
  .shadowRoot.querySelector("div")
```

### Conversation Turn (Một cặp hỏi-đáp)
```javascript
// Mỗi turn chứa câu hỏi của user và câu trả lời của Gemini
document.querySelector("body > ucs-standalone-app")
  .shadowRoot.querySelector("div > div.ucs-standalone-outer-row-container > div > div.search-bar-and-results-container > div > ucs-results")
  .shadowRoot.querySelector("div > div > div.tile.chat-mode-conversation.chat-mode-conversation > div.chat-mode-scroller.tile-content > ucs-conversation")
  .shadowRoot.querySelector("div > div.turn.last")
```

### User Message (Câu hỏi của người dùng)
```javascript
// Element: ucs-fast-markdown
// Path to content:
document.querySelector("body > ucs-standalone-app")
  .shadowRoot.querySelector("div > div.ucs-standalone-outer-row-container > div > div.search-bar-and-results-container > div > ucs-results")
  .shadowRoot.querySelector("div > div > div.tile.chat-mode-conversation.chat-mode-conversation > div.chat-mode-scroller.tile-content > ucs-conversation")
  .shadowRoot.querySelector("div > div.turn.last > div > div > div > ucs-fast-markdown")
  .shadowRoot.querySelector("div > div > p")
```

### Chat Title (Tiêu đề cuộc trò chuyện)
```javascript
// Nav panel chứa conversation list
document.querySelector("body > ucs-standalone-app")
  .shadowRoot.querySelector("div > div.ucs-standalone-outer-row-container > ucs-nav-panel")
  .shadowRoot.querySelector("div > div.sections-container > div.conversation-list")

// Button của conversation đang mở (có class "selected")
document.querySelector("body > ucs-standalone-app")
  .shadowRoot.querySelector("div > div.ucs-standalone-outer-row-container > ucs-nav-panel")
  .shadowRoot.querySelector("div > div.sections-container > div.conversation-list > div:nth-child(3) > div > button.list-item.selected")

// Title element
document.querySelector("body > ucs-standalone-app")
  .shadowRoot.querySelector("div > div.ucs-standalone-outer-row-container > ucs-nav-panel")
  .shadowRoot.querySelector("div > div.sections-container > div.conversation-list > div:nth-child(3) > div > button.list-item.selected > div.conversation-title")
```
```javascript
// Element: ucs-summary
// Path to content (nested shadow roots):
document.querySelector("body > ucs-standalone-app")
  .shadowRoot.querySelector("div > div.ucs-standalone-outer-row-container > div > div.search-bar-and-results-container > div > ucs-results")
  .shadowRoot.querySelector("div > div > div.tile.chat-mode-conversation.chat-mode-conversation > div.chat-mode-scroller.tile-content > ucs-conversation")
  .shadowRoot.querySelector("div > div.turn.last > ucs-summary")
  .shadowRoot.querySelector("div > div > div.summary-contents > div.summary > ucs-text-streamer")
  .shadowRoot.querySelector("ucs-response-markdown")
  .shadowRoot.querySelector("ucs-fast-markdown")
  .shadowRoot.querySelector("div > div")
```

## Các Selectors Đã Xác Định

### 1. Message Elements (Tin nhắn) ✅
**Vị trí:** Bên trong chat container (trong Shadow DOM)

**Đã xác định:**
- Container: `div.turn` - Mỗi turn chứa một cặp user message + gemini response
- User message: `ucs-fast-markdown` element
- Gemini response: `ucs-summary` element

**Cấu trúc:**
```
div.turn
├── div > div > div > ucs-fast-markdown (user message)
│   └── shadowRoot
│       └── div > div > p (content)
└── ucs-summary (gemini response)
    └── shadowRoot
        └── div > div > div.summary-contents > div.summary > ucs-text-streamer
            └── shadowRoot
                └── ucs-response-markdown
                    └── shadowRoot
                        └── ucs-fast-markdown
                            └── shadowRoot
                                └── div > div (content)
```

**Đã implement trong:** `src/utils/shadow-dom-utils.ts`
- `getConversationTurns()` - Lấy tất cả turns
- `getMessageElements()` - Lấy tất cả messages (user + gemini)
- `extractUserMessageContent()` - Extract nội dung user message
- `extractGeminiResponseContent()` - Extract nội dung gemini response

---

### 2. Collapsed Messages (Tin nhắn bị thu nhỏ) ⚠️
**Vị trí:** Bên trong chat container (trong Shadow DOM)

**Cần xác định thêm:**
- Attribute hoặc class đánh dấu message bị collapsed
- Element nào cần click để expand

**Hiện tại (placeholder):**
```javascript
// Checking for collapsed state on div.turn or message elements
turn.classList.contains('collapsed')
turn.getAttribute('data-collapsed') === 'true'
turn.getAttribute('aria-expanded') === 'false'
```

**TODO:** Inspect một message đã bị thu nhỏ để xác định chính xác

**Đã implement trong:** `src/utils/shadow-dom-utils.ts` - `getCollapsedMessages()`

---

### 3. Chat Title (Tiêu đề cuộc trò chuyện) ✅
**Vị trí:** Trong Shadow DOM của nav panel (sidebar)

**Đã xác định:**
- Container: `ucs-nav-panel` > `div.conversation-list`
- Selected conversation: `button.list-item.selected`
- Title element: `div.conversation-title` bên trong button

**Cấu trúc:**
```
ucs-standalone-app
└── shadowRoot
    └── div > div.ucs-standalone-outer-row-container > ucs-nav-panel
        └── shadowRoot
            └── div > div.sections-container > div.conversation-list
                └── div > div > button.list-item.selected
                    └── div.conversation-title (text content)
```

**Path đầy đủ:**
```javascript
document.querySelector("body > ucs-standalone-app")
  .shadowRoot.querySelector("div > div.ucs-standalone-outer-row-container > ucs-nav-panel")
  .shadowRoot.querySelector("div > div.sections-container > div.conversation-list > div:nth-child(3) > div > button.list-item.selected > div.conversation-title")
```

**Lưu ý:**
- Button có class `list-item selected` là conversation đang được mở
- Có thể có nhiều conversations trong list, nhưng chỉ một có class `selected`

**Đã implement trong:** `src/utils/shadow-dom-utils.ts`
- `getChatTitleElement()` - Lấy title của conversation đang mở
- `getAllConversationTitles()` - Lấy tất cả titles (cho debugging)

---

### 4. Header Container (Nơi inject button) ⚠️
**Vị trí:** Thường ở ngoài Shadow DOM, ở top của page

**Cần xác định:**
- Selector cho header/toolbar element
- Vị trí tốt nhất để inject export button

**Cập nhật trong file:** `src/utils/shadow-dom-utils.ts` - function `getHeaderElement()`

**Hiện tại (placeholder):**
```javascript
const selectors = [
  'header',
  '[role="banner"]',
  '.header',
  '.top-bar'
];
```

**TODO:** Inspect để tìm vị trí tốt nhất cho button

---

## Checklist Cập Nhật

- [x] Xác định selector cho message elements
- [x] Xác định cách phân biệt user vs gemini messages
- [x] Implement extraction functions cho user và gemini messages
- [x] Xác định selector cho chat title
- [x] Implement getChatTitleElement() function
- [ ] Xác định selector cho collapsed messages
- [ ] Xác định element để click expand
- [ ] Xác định selector cho header container
- [x] Cập nhật `src/utils/shadow-dom-utils.ts` với message và title selectors
- [ ] Test extraction functions với data thực tế
- [ ] Verify tất cả chức năng hoạt động đúng

---

## Ghi Chú Bổ Sung

### Shadow DOM Access Pattern
```javascript
// Pattern để access Shadow DOM
const element = document.querySelector('host-element') as HTMLElement & { shadowRoot: ShadowRoot };
if (element?.shadowRoot) {
  const content = element.shadowRoot.querySelector('selector');
}
```

### Debugging Tips
- Sử dụng `$0` trong Console để reference element đang được select trong Elements tab
- Sử dụng `$0.shadowRoot` để access Shadow DOM của element đó
- Sử dụng `querySelectorAll` để test selectors và đếm số lượng elements tìm được


---

## Test Scripts

### Test trong DevTools Console

```javascript
// ============================================
// Test 1: Chat Container
// ============================================
const container = document.querySelector("body > ucs-standalone-app")
  .shadowRoot.querySelector("div > div.ucs-standalone-outer-row-container > div > div.search-bar-and-results-container > div > ucs-results")
  .shadowRoot.querySelector("div > div > div.tile.chat-mode-conversation.chat-mode-conversation > div.chat-mode-scroller.tile-content > ucs-conversation")
  .shadowRoot.querySelector("div");

console.log('✅ Chat container:', container);

// ============================================
// Test 2: Conversation Turns
// ============================================
const turns = container.querySelectorAll('div.turn');
console.log(`✅ Found ${turns.length} conversation turns`);

// ============================================
// Test 3: User Messages
// ============================================
const userMessages = container.querySelectorAll('ucs-fast-markdown');
console.log(`✅ Found ${userMessages.length} user messages`);

// Test extracting first user message content
if (userMessages.length > 0) {
  const firstUserMsg = userMessages[0];
  if (firstUserMsg.shadowRoot) {
    const content = firstUserMsg.shadowRoot.querySelector('div > div > p');
    console.log('📝 First user message:', content?.innerHTML);
  }
}

// ============================================
// Test 4: Gemini Responses
// ============================================
const geminiResponses = container.querySelectorAll('ucs-summary');
console.log(`✅ Found ${geminiResponses.length} gemini responses`);

// Test extracting first gemini response content
if (geminiResponses.length > 0) {
  const firstGeminiMsg = geminiResponses[0];
  if (firstGeminiMsg.shadowRoot) {
    const textStreamer = firstGeminiMsg.shadowRoot.querySelector('div > div > div.summary-contents > div.summary > ucs-text-streamer');
    if (textStreamer?.shadowRoot) {
      const responseMarkdown = textStreamer.shadowRoot.querySelector('ucs-response-markdown');
      if (responseMarkdown?.shadowRoot) {
        const fastMarkdown = responseMarkdown.shadowRoot.querySelector('ucs-fast-markdown');
        if (fastMarkdown?.shadowRoot) {
          const content = fastMarkdown.shadowRoot.querySelector('div > div');
          console.log('🤖 First gemini response:', content?.innerHTML);
        }
      }
    }
  }
}

// ============================================
// Test 5: Chat Title
// ============================================
const app = document.querySelector("body > ucs-standalone-app");
if (app?.shadowRoot) {
  const navPanel = app.shadowRoot.querySelector("div > div.ucs-standalone-outer-row-container > ucs-nav-panel");
  if (navPanel?.shadowRoot) {
    const conversationList = navPanel.shadowRoot.querySelector("div > div.sections-container > div.conversation-list");
    if (conversationList) {
      console.log('✅ Found conversation list');
      
      // Find selected conversation
      const selectedButton = conversationList.querySelector("button.list-item.selected");
      if (selectedButton) {
        const titleElement = selectedButton.querySelector("div.conversation-title");
        console.log('📌 Current chat title:', titleElement?.textContent);
      } else {
        console.log('⚠️ No selected conversation found');
      }
      
      // List all conversations
      const allButtons = conversationList.querySelectorAll("button.list-item");
      console.log(`📋 Total conversations: ${allButtons.length}`);
      allButtons.forEach((btn, idx) => {
        const title = btn.querySelector("div.conversation-title");
        const isSelected = btn.classList.contains('selected');
        console.log(`  ${idx + 1}. ${isSelected ? '✓' : ' '} ${title?.textContent}`);
      });
    }
  }
}

// ============================================
// Test 6: All Messages in Order
// ============================================
console.log('\n📋 All messages in order:');
turns.forEach((turn, index) => {
  console.log(`\n--- Turn ${index + 1} ---`);
  
  // User message
  const userMsg = turn.querySelector('ucs-fast-markdown');
  if (userMsg?.shadowRoot) {
    const userContent = userMsg.shadowRoot.querySelector('div > div > p');
    console.log('👤 User:', userContent?.textContent?.substring(0, 50) + '...');
  }
  
  // Gemini response
  const geminiMsg = turn.querySelector('ucs-summary');
  if (geminiMsg?.shadowRoot) {
    const textStreamer = geminiMsg.shadowRoot.querySelector('div > div > div.summary-contents > div.summary > ucs-text-streamer');
    if (textStreamer?.shadowRoot) {
      const responseMarkdown = textStreamer.shadowRoot.querySelector('ucs-response-markdown');
      if (responseMarkdown?.shadowRoot) {
        const fastMarkdown = responseMarkdown.shadowRoot.querySelector('ucs-fast-markdown');
        if (fastMarkdown?.shadowRoot) {
          const geminiContent = fastMarkdown.shadowRoot.querySelector('div > div');
          console.log('🤖 Gemini:', geminiContent?.textContent?.substring(0, 50) + '...');
        }
      }
    }
  }
});
```

### Test Helper Functions (Copy vào Console)

```javascript
// Helper function để extract user message content
function extractUserMessage(element) {
  if (element.shadowRoot) {
    const content = element.shadowRoot.querySelector('div > div > p');
    return content?.innerHTML || '';
  }
  return element.textContent || '';
}

// Helper function để extract gemini response content
function extractGeminiResponse(element) {
  if (element.shadowRoot) {
    const textStreamer = element.shadowRoot.querySelector('div > div > div.summary-contents > div.summary > ucs-text-streamer');
    if (textStreamer?.shadowRoot) {
      const responseMarkdown = textStreamer.shadowRoot.querySelector('ucs-response-markdown');
      if (responseMarkdown?.shadowRoot) {
        const fastMarkdown = responseMarkdown.shadowRoot.querySelector('ucs-fast-markdown');
        if (fastMarkdown?.shadowRoot) {
          const content = fastMarkdown.shadowRoot.querySelector('div > div');
          return content?.innerHTML || '';
        }
      }
    }
  }
  return element.textContent || '';
}

// Helper function để get chat title
function getChatTitle() {
  const app = document.querySelector("body > ucs-standalone-app");
  if (app?.shadowRoot) {
    const navPanel = app.shadowRoot.querySelector("div > div.ucs-standalone-outer-row-container > ucs-nav-panel");
    if (navPanel?.shadowRoot) {
      const conversationList = navPanel.shadowRoot.querySelector("div > div.sections-container > div.conversation-list");
      if (conversationList) {
        const selectedButton = conversationList.querySelector("button.list-item.selected");
        if (selectedButton) {
          const titleElement = selectedButton.querySelector("div.conversation-title");
          return titleElement?.textContent?.trim() || null;
        }
      }
    }
  }
  return null;
}

// Test helpers
const container = document.querySelector("body > ucs-standalone-app")
  .shadowRoot.querySelector("div > div.ucs-standalone-outer-row-container > div > div.search-bar-and-results-container > div > ucs-results")
  .shadowRoot.querySelector("div > div > div.tile.chat-mode-conversation.chat-mode-conversation > div.chat-mode-scroller.tile-content > ucs-conversation")
  .shadowRoot.querySelector("div");

const userMsg = container.querySelector('ucs-fast-markdown');
const geminiMsg = container.querySelector('ucs-summary');

console.log('User message:', extractUserMessage(userMsg));
console.log('Gemini response:', extractGeminiResponse(geminiMsg));
console.log('Chat title:', getChatTitle());
```
