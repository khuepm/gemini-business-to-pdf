# Shadow DOM Selectors - Gemini Business

## Đường Dẫn Shadow DOM Đã Xác Định

```javascript
document.querySelector("body > ucs-standalone-app")
  .shadowRoot.querySelector("div > div.ucs-standalone-outer-row-container > div > div.search-bar-and-results-container > div > ucs-results")
  .shadowRoot.querySelector("div > div > div.tile.chat-mode-conversation.chat-mode-conversation > div.chat-mode-scroller.tile-content > ucs-conversation")
  .shadowRoot.querySelector("div")
```

## Các Selectors Cần Xác Định

### 1. Message Elements (Tin nhắn)
**Vị trí:** Bên trong chat container (trong Shadow DOM)

**Cần tìm:**
- Selector cho tất cả message elements
- Cách phân biệt user messages vs gemini messages
- Cấu trúc HTML của mỗi message

**Cập nhật trong file:** `src/utils/shadow-dom-utils.ts` - function `getMessageElements()`

**Hiện tại (placeholder):**
```javascript
const messages = container.querySelectorAll('[data-message], .message, [role="article"]');
```

**Cần thay thế bằng:** Selector thực tế sau khi inspect

---

### 2. Collapsed Messages (Tin nhắn bị thu nhỏ)
**Vị trí:** Bên trong chat container (trong Shadow DOM)

**Cần tìm:**
- Selector cho collapsed messages
- Attribute hoặc class đánh dấu message bị collapsed
- Element nào cần click để expand

**Cập nhật trong file:** `src/utils/shadow-dom-utils.ts` - function `getCollapsedMessages()`

**Hiện tại (placeholder):**
```javascript
const collapsed = container.querySelectorAll('[data-collapsed="true"], .collapsed-message, [aria-expanded="false"]');
```

**Cần thay thế bằng:** Selector thực tế sau khi inspect

---

### 3. Chat Title (Tiêu đề cuộc trò chuyện)
**Vị trí:** Có thể ở ngoài Shadow DOM hoặc bên trong

**Cần tìm:**
- Selector cho title element
- Vị trí của title trong DOM hierarchy

**Cập nhật trong file:** `src/utils/shadow-dom-utils.ts` - function `getChatTitleElement()`

**Hiện tại (placeholder):**
```javascript
const selectors = [
  'h1[data-title]',
  '.chat-title',
  '[aria-label*="conversation"]',
  'header h1',
  'header h2'
];
```

**Cần thay thế bằng:** Selector thực tế sau khi inspect

---

### 4. Header Container (Nơi inject button)
**Vị trí:** Thường ở ngoài Shadow DOM, ở top của page

**Cần tìm:**
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

**Cần thay thế bằng:** Selector thực tế sau khi inspect

---

## Hướng Dẫn Inspect DOM

### Bước 1: Mở DevTools
1. Truy cập trang Gemini Business
2. Mở DevTools (F12 hoặc Cmd+Option+I)
3. Chọn tab "Elements"

### Bước 2: Inspect Shadow DOM
1. Tìm element `<ucs-standalone-app>` trong DOM tree
2. Expand `#shadow-root` để xem nội dung bên trong
3. Tiếp tục traverse theo đường dẫn đã xác định

### Bước 3: Tìm Message Elements
1. Trong chat container, tìm các message elements
2. Click vào một message để xem cấu trúc HTML
3. Ghi chú:
   - Tag name của message element
   - Classes hoặc attributes đặc biệt
   - Cách phân biệt user vs gemini messages

### Bước 4: Tìm Collapsed Messages
1. Tìm một message đã bị thu nhỏ (nếu có)
2. So sánh với message đã expand để tìm sự khác biệt
3. Ghi chú:
   - Attribute hoặc class đánh dấu collapsed state
   - Element nào có thể click để expand

### Bước 5: Test Selectors
Sử dụng Console trong DevTools để test selectors:

```javascript
// Test chat container
const container = document.querySelector("body > ucs-standalone-app")
  .shadowRoot.querySelector("div > div.ucs-standalone-outer-row-container > div > div.search-bar-and-results-container > div > ucs-results")
  .shadowRoot.querySelector("div > div > div.tile.chat-mode-conversation.chat-mode-conversation > div.chat-mode-scroller.tile-content > ucs-conversation")
  .shadowRoot.querySelector("div");

console.log('Chat container:', container);

// Test message elements
const messages = container.querySelectorAll('YOUR_SELECTOR_HERE');
console.log('Messages found:', messages.length);

// Test collapsed messages
const collapsed = container.querySelectorAll('YOUR_COLLAPSED_SELECTOR_HERE');
console.log('Collapsed messages:', collapsed.length);
```

---

## Checklist Cập Nhật

- [ ] Xác định selector cho message elements
- [ ] Xác định cách phân biệt user vs gemini messages
- [ ] Xác định selector cho collapsed messages
- [ ] Xác định element để click expand
- [ ] Xác định selector cho chat title
- [ ] Xác định selector cho header container
- [ ] Cập nhật `src/utils/shadow-dom-utils.ts` với selectors thực tế
- [ ] Test extension trên trang Gemini Business thực tế
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
