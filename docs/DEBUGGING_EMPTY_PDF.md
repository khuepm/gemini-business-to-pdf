# Hướng dẫn Debug PDF trống

## Vấn đề
PDF được tạo ra nhưng không có nội dung (trống trơn).

## Các bước kiểm tra

### 1. Kiểm tra Console Logs

Sau khi cài đặt extension và mở Gemini Business, hãy:

1. Mở Developer Tools (F12 hoặc Cmd+Option+I trên Mac)
2. Chuyển sang tab Console
3. Nhấn nút "Export to PDF"
4. Quan sát các log messages:

```
[ContentExtractor] Starting to extract chat content
[ContentExtractor] Chat container found
[ContentExtractor] Found X message elements
[ContentExtractor] User message content extracted: ...
[ContentExtractor] Gemini message content extracted: ...
[PDFGenerator] Applying styles to X messages
[PDFGenerator] Message 1: sender=user, contentLength=...
[PDFGenerator] Final HTML length: ...
```

### 2. Kiểm tra nội dung được trích xuất

Nếu bạn thấy:
- `contentLength=0` → Nội dung không được trích xuất
- `Warning: Message X has empty content!` → Tin nhắn trống

### 3. Kiểm tra Shadow DOM structure

Gemini Business sử dụng Shadow DOM. Cấu trúc có thể thay đổi. Để kiểm tra:

```javascript
// Trong Console của DevTools
const app = document.querySelector("body > ucs-standalone-app");
console.log("App:", app);
console.log("Shadow Root:", app?.shadowRoot);

// Kiểm tra chat container
const getChatContainer = () => {
  const app = document.querySelector("body > ucs-standalone-app");
  if (!app?.shadowRoot) return null;
  
  const results = app.shadowRoot.querySelector(
    "div > div.ucs-standalone-outer-row-container > div > div.search-bar-and-results-container > div > ucs-results"
  );
  if (!results?.shadowRoot) return null;
  
  const conversation = results.shadowRoot.querySelector(
    "div > div > div.tile.chat-mode-conversation.chat-mode-conversation > div.chat-mode-scroller.tile-content > ucs-conversation"
  );
  if (!conversation?.shadowRoot) return null;
  
  return conversation.shadowRoot.querySelector("div");
};

const container = getChatContainer();
console.log("Chat container:", container);

// Kiểm tra messages
if (container) {
  const turns = container.querySelectorAll('div.turn');
  console.log("Turns found:", turns.length);
  
  turns.forEach((turn, i) => {
    console.log(`Turn ${i}:`, turn);
    const userMsg = turn.querySelector('ucs-fast-markdown');
    const geminiMsg = turn.querySelector('ucs-summary');
    console.log(`  User message:`, userMsg);
    console.log(`  Gemini message:`, geminiMsg);
    
    if (userMsg?.shadowRoot) {
      console.log(`  User content:`, userMsg.shadowRoot.textContent);
    }
    if (geminiMsg?.shadowRoot) {
      console.log(`  Gemini content:`, geminiMsg.shadowRoot.textContent);
    }
  });
}
```

### 4. Các nguyên nhân phổ biến

#### A. Shadow DOM structure đã thay đổi
Google có thể cập nhật cấu trúc DOM của Gemini Business. Nếu selectors không còn đúng:

**Giải pháp:**
1. Inspect element để tìm cấu trúc mới
2. Cập nhật selectors trong `src/utils/shadow-dom-utils.ts`

#### B. Nội dung chưa được load đầy đủ
Nếu bạn nhấn Export quá nhanh sau khi mở trang:

**Giải pháp:**
- Đợi trang load hoàn toàn
- Scroll qua các tin nhắn để đảm bảo chúng được render

#### C. Messages bị collapsed
Một số tin nhắn có thể bị thu gọn (collapsed):

**Giải pháp:**
- Expand tất cả messages trước khi export
- Hoặc cập nhật code để tự động expand messages

### 5. Test với HTML trực tiếp

Để kiểm tra xem vấn đề có phải ở PDF generation không:

```javascript
// Trong Console
const extractor = new ContentExtractor();
const content = extractor.extractChatContent();
console.log("Extracted content:", content);

const generator = new PDFGenerator();
const html = generator.applyStyles(content, "Test Chat");
console.log("Generated HTML:", html);

// Tạo một tab mới với HTML này để xem
const newWindow = window.open();
newWindow.document.write(html);
```

### 6. Kiểm tra html2pdf.js

Nếu HTML có nội dung nhưng PDF vẫn trống:

```javascript
// Test html2pdf trực tiếp
import html2pdf from 'html2pdf.js';

const testHtml = `
  <html>
    <body>
      <h1>Test PDF</h1>
      <p>This is a test paragraph.</p>
    </body>
  </html>
`;

html2pdf()
  .set({
    margin: 20,
    filename: 'test.pdf',
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  })
  .from(testHtml)
  .save();
```

## Các cải tiến đã thực hiện

### 1. Cải thiện extraction logic
- Thêm nhiều fallback paths để trích xuất nội dung
- Kiểm tra `.trim()` để đảm bảo có nội dung thực sự
- Thử nhiều selectors khác nhau

### 2. Thêm logging chi tiết
- Log mỗi bước của quá trình extraction
- Log độ dài nội dung của mỗi message
- Cảnh báo khi message trống

### 3. Cải thiện error handling
- Graceful fallbacks khi không tìm thấy shadow root
- Thử innerHTML trước khi dùng textContent
- Log errors để dễ debug

## Liên hệ

Nếu vấn đề vẫn tiếp diễn, hãy:
1. Chụp screenshot của Console logs
2. Chụp screenshot của DOM structure (Elements tab)
3. Mô tả chi tiết các bước bạn đã thực hiện
