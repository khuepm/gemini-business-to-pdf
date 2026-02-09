# Tài Liệu Thiết Kế - Gemini Business to PDF

## Tổng Quan

Gemini Business to PDF là một Chrome extension (Manifest V3) cho phép người dùng xuất toàn bộ cuộc trò chuyện từ Gemini Business thành file PDF. Extension hoạt động hoàn toàn ở phía client, không gửi dữ liệu ra ngoài, và bảo toàn đầy đủ định dạng của nội dung chat.

### Mục Tiêu Thiết Kế

- Tích hợp liền mạch với giao diện Gemini Business
- Xử lý tự động việc mở rộng tin nhắn bị thu nhỏ
- Bảo toàn 100% định dạng và styling của nội dung
- Tạo PDF chất lượng cao với tên file thông minh
- Đảm bảo hiệu năng tốt với các cuộc trò chuyện dài
- Bảo vệ quyền riêng tư của người dùng

## Kiến Trúc

### Tổng Quan Kiến Trúc

Extension sử dụng kiến trúc phân tầng với các thành phần độc lập:

```
┌─────────────────────────────────────────┐
│         Gemini Business Page            │
│  (DOM của trang web Gemini Business)    │
└──────────────┬──────────────────────────┘
               │
               │ inject
               ▼
┌─────────────────────────────────────────┐
│         Content Script                  │
│  ┌─────────────────────────────────┐   │
│  │   UI Injector                   │   │
│  │   - Tạo và inject Export Button │   │
│  │   - Quản lý UI state            │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │   Message Expander              │   │
│  │   - Tìm collapsed messages      │   │
│  │   - Mở rộng messages            │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │   Content Extractor             │   │
│  │   - Trích xuất chat content     │   │
│  │   - Bảo toàn HTML structure     │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │   Title Extractor               │   │
│  │   - Lấy chat title              │   │
│  │   - Sanitize filename           │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │   PDF Generator                 │   │
│  │   - Chuyển HTML sang PDF        │   │
│  │   - Áp dụng styling             │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```


### Luồng Hoạt Động Chính

```mermaid
sequenceDiagram
    participant User
    participant Button as Export Button
    participant Expander as Message Expander
    participant Extractor as Content Extractor
    participant Title as Title Extractor
    participant PDF as PDF Generator
    
    User->>Button: Click Export Button
    Button->>Button: Hiển thị loading, disable button
    Button->>Expander: Bắt đầu mở rộng messages
    Expander->>Expander: Tìm tất cả collapsed messages
    loop Cho mỗi collapsed message
        Expander->>Expander: Click để mở rộng
        Expander->>Expander: Đợi animation hoàn tất
    end
    Expander->>Extractor: Tất cả messages đã mở rộng
    Extractor->>Extractor: Trích xuất HTML content
    Extractor->>Title: Yêu cầu lấy title
    Title->>Title: Tìm và sanitize title
    Title->>PDF: Truyền content + filename
    PDF->>PDF: Tạo PDF với styling
    PDF->>User: Tải xuống file PDF
    PDF->>Button: Thông báo hoàn tất
    Button->>Button: Ẩn loading, enable button
    Button->>User: Hiển thị thông báo thành công
```

## Các Thành Phần và Giao Diện

### 1. UI Injector

**Trách nhiệm:**
- Tạo và inject Export Button vào DOM của Gemini Business
- Quản lý trạng thái UI (loading, disabled, enabled)
- Hiển thị thông báo cho người dùng

**Giao diện:**

```typescript
interface UIInjector {
  // Inject button vào trang
  injectButton(): void;
  
  // Hiển thị loading state
  showLoading(): void;
  
  // Ẩn loading state
  hideLoading(): void;
  
  // Disable button
  disableButton(): void;
  
  // Enable button
  enableButton(): void;
  
  // Hiển thị thông báo
  showNotification(message: string, type: 'success' | 'error'): void;
}
```

**Chi tiết triển khai:**
- Button được tạo bằng DOM API
- Sử dụng CSS để styling phù hợp với Gemini Business
- Position: fixed để luôn hiển thị
- Z-index cao để không bị che khuất
- Tooltip sử dụng thuộc tính `title` hoặc custom tooltip


### 2. Message Expander

**Trách nhiệm:**
- Tìm tất cả tin nhắn bị thu nhỏ trong chat container
- Mở rộng từng tin nhắn bằng cách mô phỏng click
- Đợi animation hoàn tất trước khi tiếp tục
- Xử lý lỗi khi không thể mở rộng

**Giao diện:**

```typescript
interface MessageExpander {
  // Tìm tất cả collapsed messages
  findCollapsedMessages(): HTMLElement[];
  
  // Mở rộng một message
  expandMessage(message: HTMLElement): Promise<void>;
  
  // Mở rộng tất cả messages
  expandAllMessages(): Promise<ExpandResult>;
  
  // Kiểm tra xem message có bị collapsed không
  isCollapsed(message: HTMLElement): boolean;
}

interface ExpandResult {
  totalFound: number;
  expanded: number;
  failed: number;
  errors: string[];
}
```

**Chi tiết triển khai:**
- Sử dụng querySelector để tìm collapsed messages dựa trên class/attribute
- Trigger click event bằng `element.click()` hoặc `dispatchEvent`
- Sử dụng MutationObserver hoặc polling để detect khi expansion hoàn tất
- Timeout cho mỗi expansion (ví dụ: 2 giây)
- Lưu scroll position trước khi expand và restore sau đó
- Log chi tiết các lỗi để debug

### 3. Content Extractor

**Trách nhiệm:**
- Trích xuất toàn bộ nội dung chat từ DOM
- Bảo toàn cấu trúc HTML và styling
- Phân biệt tin nhắn của user và Gemini
- Xử lý các loại content đặc biệt (code, tables, lists)

**Giao diện:**

```typescript
interface ContentExtractor {
  // Trích xuất toàn bộ chat content
  extractChatContent(): ChatContent;
  
  // Trích xuất một message
  extractMessage(messageElement: HTMLElement): Message;
  
  // Xác định sender của message
  identifySender(messageElement: HTMLElement): 'user' | 'gemini';
}

interface ChatContent {
  messages: Message[];
  timestamp: Date;
}

interface Message {
  sender: 'user' | 'gemini';
  content: string; // HTML string
  timestamp?: string;
}
```

**Chi tiết triển khai:**
- Tìm chat container bằng selector cụ thể
- Iterate qua tất cả message elements
- Sử dụng `innerHTML` hoặc `outerHTML` để lấy content
- Clone elements để tránh modify DOM gốc
- Giữ nguyên inline styles và classes
- Xử lý đặc biệt cho:
  - Code blocks: giữ nguyên `<pre><code>` tags
  - Tables: giữ nguyên `<table>` structure
  - Lists: giữ nguyên `<ul>`, `<ol>`, `<li>` tags
  - Links: giữ nguyên `<a>` tags với href
  - Formatting: giữ nguyên `<strong>`, `<em>`, `<u>` tags


### 4. Title Extractor

**Trách nhiệm:**
- Tìm và trích xuất tiêu đề chat từ DOM
- Sanitize tên file để loại bỏ ký tự không hợp lệ
- Tạo tên file fallback nếu không có title
- Giới hạn độ dài tên file

**Giao diện:**

```typescript
interface TitleExtractor {
  // Trích xuất chat title từ DOM
  extractTitle(): string | null;
  
  // Tạo filename từ title
  generateFilename(title: string | null): string;
  
  // Sanitize filename
  sanitizeFilename(filename: string): string;
  
  // Truncate filename nếu quá dài
  truncateFilename(filename: string, maxLength: number): string;
}
```

**Chi tiết triển khai:**
- Tìm title element bằng selector (có thể cần inspect DOM để xác định)
- Lấy textContent hoặc innerText
- Sanitize bằng cách:
  - Replace các ký tự không hợp lệ: `/ \ : * ? " < > |` bằng `-` hoặc `_`
  - Trim whitespace
  - Remove multiple consecutive spaces/dashes
- Fallback filename format: `gemini-chat-${timestamp}.pdf`
  - Timestamp format: `YYYYMMDD-HHMMSS`
- Truncate ở 100 ký tự, cắt ở word boundary nếu có thể
- Luôn thêm extension `.pdf`

### 5. PDF Generator

**Trách nhiệm:**
- Chuyển đổi HTML content thành PDF
- Áp dụng styling cho PDF
- Trigger download file PDF

**Giao diện:**

```typescript
interface PDFGenerator {
  // Tạo PDF từ HTML content
  generatePDF(content: ChatContent, filename: string): Promise<void>;
  
  // Áp dụng styling cho PDF
  applyStyles(html: string): string;
  
  // Trigger download
  downloadPDF(pdfBlob: Blob, filename: string): void;
}

interface PDFOptions {
  format: 'A4' | 'Letter';
  margin: {
    top: string;
    right: string;
    bottom: string;
    left: string;
  };
  fontSize: string;
  fontFamily: string;
}
```

**Chi tiết triển khai:**
- Sử dụng thư viện: **jsPDF** hoặc **html2pdf.js**
  - jsPDF: Lightweight, hỗ trợ tốt HTML to PDF
  - html2pdf.js: Wrapper của html2canvas + jsPDF, dễ sử dụng
- Styling:
  - Font: Sans-serif (Arial, Helvetica) cho dễ đọc
  - Font size: 12pt cho body, 14pt cho headers
  - Line height: 1.5 cho dễ đọc
  - Margins: 20mm cho tất cả các cạnh
  - Colors: Giữ nguyên colors từ HTML
- Xử lý page breaks:
  - Tránh break giữa message
  - Sử dụng CSS `page-break-inside: avoid`
- Download:
  - Tạo Blob từ PDF
  - Tạo temporary `<a>` element với download attribute
  - Trigger click để download
  - Cleanup temporary element


### 6. Main Controller

**Trách nhiệm:**
- Điều phối các thành phần
- Xử lý luồng export từ đầu đến cuối
- Xử lý lỗi và logging

**Giao diện:**

```typescript
interface ExportController {
  // Khởi tạo extension
  initialize(): void;
  
  // Xử lý export action
  handleExport(): Promise<void>;
  
  // Xử lý lỗi
  handleError(error: Error): void;
  
  // Logging
  log(message: string, level: 'info' | 'warn' | 'error'): void;
}
```

**Chi tiết triển khai:**

```typescript
async function handleExport(): Promise<void> {
  try {
    // 1. Hiển thị loading và disable button
    uiInjector.showLoading();
    uiInjector.disableButton();
    log('Bắt đầu export PDF', 'info');
    
    // 2. Mở rộng tất cả messages
    log('Đang mở rộng messages...', 'info');
    const expandResult = await messageExpander.expandAllMessages();
    log(`Đã mở rộng ${expandResult.expanded}/${expandResult.totalFound} messages`, 'info');
    
    if (expandResult.failed > 0) {
      log(`Không thể mở rộng ${expandResult.failed} messages`, 'warn');
    }
    
    // 3. Trích xuất content
    log('Đang trích xuất nội dung...', 'info');
    const content = contentExtractor.extractChatContent();
    log(`Đã trích xuất ${content.messages.length} messages`, 'info');
    
    // 4. Lấy title và tạo filename
    log('Đang tạo filename...', 'info');
    const title = titleExtractor.extractTitle();
    const filename = titleExtractor.generateFilename(title);
    log(`Filename: ${filename}`, 'info');
    
    // 5. Tạo PDF
    log('Đang tạo PDF...', 'info');
    await pdfGenerator.generatePDF(content, filename);
    log('PDF đã được tạo và tải xuống', 'info');
    
    // 6. Hiển thị thông báo thành công
    uiInjector.showNotification('Đã xuất PDF thành công!', 'success');
    
  } catch (error) {
    handleError(error);
  } finally {
    // 7. Cleanup: ẩn loading và enable button
    uiInjector.hideLoading();
    uiInjector.enableButton();
  }
}

function handleError(error: Error): void {
  log(`Lỗi: ${error.message}`, 'error');
  console.error('Export PDF error:', error);
  uiInjector.showNotification(
    `Không thể xuất PDF: ${error.message}`,
    'error'
  );
}
```

## Mô Hình Dữ Liệu

### ChatContent

```typescript
interface ChatContent {
  // Danh sách messages
  messages: Message[];
  
  // Timestamp khi extract
  timestamp: Date;
  
  // Metadata (optional)
  metadata?: {
    totalMessages: number;
    userMessages: number;
    geminiMessages: number;
  };
}
```

### Message

```typescript
interface Message {
  // Người gửi
  sender: 'user' | 'gemini';
  
  // Nội dung HTML
  content: string;
  
  // Timestamp (nếu có trong DOM)
  timestamp?: string;
  
  // Metadata (optional)
  metadata?: {
    hasCodeBlock: boolean;
    hasTable: boolean;
    hasList: boolean;
  };
}
```

### ExpandResult

```typescript
interface ExpandResult {
  // Tổng số messages tìm thấy
  totalFound: number;
  
  // Số messages đã mở rộng thành công
  expanded: number;
  
  // Số messages thất bại
  failed: number;
  
  // Danh sách lỗi
  errors: string[];
}
```

### PDFOptions

```typescript
interface PDFOptions {
  // Kích thước trang
  format: 'A4' | 'Letter';
  
  // Margins
  margin: {
    top: string;    // e.g., '20mm'
    right: string;
    bottom: string;
    left: string;
  };
  
  // Typography
  fontSize: string;      // e.g., '12pt'
  fontFamily: string;    // e.g., 'Arial, sans-serif'
  lineHeight: number;    // e.g., 1.5
  
  // Colors
  userMessageBg: string;    // e.g., '#e3f2fd'
  geminiMessageBg: string;  // e.g., '#f5f5f5'
}
```


## Thuộc Tính Đúng Đắn (Correctness Properties)

*Một property (thuộc tính) là một đặc điểm hoặc hành vi phải đúng trong tất cả các lần thực thi hợp lệ của hệ thống - về cơ bản, đây là một phát biểu chính thức về những gì hệ thống nên làm. Properties đóng vai trò là cầu nối giữa các đặc tả có thể đọc được bởi con người và các đảm bảo tính đúng đắn có thể xác minh được bằng máy.*

### Phản Chiếu Property (Property Reflection)

Sau khi phân tích prework, tôi xác định các properties có thể được kết hợp hoặc loại bỏ để tránh trùng lặp:

**Kết hợp:**
- Properties 3.3, 3.4, 3.5, 3.6 (giữ nguyên formatting) → Kết hợp thành một property tổng quát về format preservation
- Properties 4.2 và 4.4 (filename generation và sanitization) → Kết hợp vì sanitization là một phần của filename generation
- Properties 5.1 và 5.3 (HTML to PDF conversion và format preservation) → Kết hợp vì format preservation là yêu cầu của conversion

**Loại bỏ:**
- Property 6.6 (logging) → Đây là implementation detail, không phải functional requirement cần test

Sau khi reflection, các properties còn lại đều cung cấp giá trị validation độc nhất.

### Properties

**Property 1: Tìm tất cả collapsed messages**

*Với bất kỳ* DOM state nào chứa chat container, hàm findCollapsedMessages phải trả về tất cả các message elements có trạng thái collapsed, không bỏ sót message nào.

**Validates: Requirements 2.1**

---

**Property 2: Mở rộng messages thành công**

*Với bất kỳ* collapsed message nào, sau khi gọi expandMessage, message đó phải chuyển sang trạng thái expanded (không còn collapsed).

**Validates: Requirements 2.2**

---

**Property 3: Đợi tất cả messages mở rộng**

*Với bất kỳ* tập hợp collapsed messages nào, hàm expandAllMessages chỉ được return khi tất cả messages đã hoàn tất việc mở rộng (hoặc timeout).

**Validates: Requirements 2.3**

---

**Property 4: Xử lý lỗi expansion gracefully**

*Với bất kỳ* tập hợp messages nào trong đó có một số messages không thể expand, hàm expandAllMessages vẫn phải xử lý thành công các messages còn lại và trả về thông tin chi tiết về failures.

**Validates: Requirements 2.4**

---

**Property 5: Bảo toàn scroll position**

*Với bất kỳ* scroll position ban đầu nào, sau khi expandAllMessages hoàn tất, scroll position phải giống như ban đầu (tolerance: ±5px).

**Validates: Requirements 2.5**

---

**Property 6: Trích xuất tất cả messages**

*Với bất kỳ* chat container nào chứa N messages, hàm extractChatContent phải trả về đúng N messages, không bỏ sót message nào.

**Validates: Requirements 3.1**

---

**Property 7: Bảo toàn HTML structure**

*Với bất kỳ* message element nào, HTML structure được extract phải tương đương với structure gốc (same tags, same nesting, same attributes).

**Validates: Requirements 3.2**

---

**Property 8: Bảo toàn tất cả formatting**

*Với bất kỳ* message nào chứa formatting (bold, italic, underline, links, code blocks, tables, lists), tất cả formatting này phải được giữ nguyên trong extracted HTML.

**Validates: Requirements 3.3, 3.4, 3.5, 3.6**

---

**Property 9: Phân biệt sender chính xác**

*Với bất kỳ* message element nào, hàm identifySender phải xác định đúng sender là 'user' hoặc 'gemini' dựa trên DOM structure/classes.

**Validates: Requirements 3.7**

---

**Property 10: Trích xuất title thành công**

*Với bất kỳ* DOM state nào có chat title element, hàm extractTitle phải tìm và trả về title text chính xác.

**Validates: Requirements 4.1**

---

**Property 11: Filename generation và sanitization**

*Với bất kỳ* title string nào (bao gồm cả các ký tự không hợp lệ), hàm generateFilename phải:
- Sử dụng title làm base filename nếu title tồn tại
- Loại bỏ tất cả ký tự không hợp lệ (/, \, :, *, ?, ", <, >, |)
- Giới hạn độ dài ở 100 ký tự
- Trả về filename hợp lệ với extension .pdf

**Validates: Requirements 4.2, 4.4, 4.5**

---

**Property 12: HTML to PDF conversion với format preservation**

*Với bất kỳ* HTML content nào (bao gồm formatting, code blocks, tables, lists), hàm generatePDF phải:
- Tạo ra một PDF blob hợp lệ
- Bảo toàn tất cả formatting từ HTML gốc trong PDF output

**Validates: Requirements 5.1, 5.3**

---

**Property 13: PDF download với đúng filename**

*Với bất kỳ* PDF blob và filename nào, hàm downloadPDF phải trigger browser download với đúng filename đã chỉ định.

**Validates: Requirements 5.6**

---

**Property 14: Button disabled trong khi processing**

*Với bất kỳ* export operation nào đang chạy, Export Button phải ở trạng thái disabled cho đến khi operation hoàn tất (success hoặc error).

**Validates: Requirements 6.2**

---

**Property 15: Error handling với message cụ thể**

*Với bất kỳ* error nào xảy ra trong quá trình export, hàm handleError phải hiển thị error notification với message mô tả cụ thể về lỗi.

**Validates: Requirements 6.4**

---

**Property 16: Button re-enabled sau completion**

*Với bất kỳ* export operation nào (thành công hoặc thất bại), sau khi operation hoàn tất, Export Button phải được enable lại.

**Validates: Requirements 6.5**

---

**Property 17: Domain restriction**

*Với bất kỳ* URL nào không phải domain của Gemini Business, content script không được inject vào trang đó.

**Validates: Requirements 7.2**

---

**Property 18: Xử lý large conversations**

*Với bất kỳ* chat conversation nào có hơn 100 messages, extension phải xử lý thành công mà không gây timeout hoặc crash.

**Validates: Requirements 7.4**

---

**Property 19: No external data transmission**

*Với bất kỳ* export operation nào, extension không được tạo bất kỳ network request nào đến domain bên ngoài (tất cả xử lý ở client).

**Validates: Requirements 8.2**

---

**Property 20: No data persistence**

*Với bất kỳ* export operation nào, sau khi hoàn tất, không có dữ liệu chat nào được lưu trong localStorage, sessionStorage, hoặc IndexedDB.

**Validates: Requirements 8.4**


## Xử Lý Lỗi

### Các Loại Lỗi

1. **DOM Not Found Errors**
   - Chat container không tìm thấy
   - Title element không tồn tại
   - Message elements không tìm thấy
   - **Xử lý:** Log warning, sử dụng fallback values, hiển thị error notification

2. **Expansion Errors**
   - Không thể click vào collapsed message
   - Timeout khi đợi expansion
   - **Xử lý:** Log error, tiếp tục với messages khác, ghi nhận failed count

3. **PDF Generation Errors**
   - Thư viện PDF không load được
   - HTML quá phức tạp để convert
   - Out of memory
   - **Xử lý:** Log error, hiển thị error notification với hướng dẫn

4. **Download Errors**
   - Browser block download
   - Không đủ disk space
   - **Xử lý:** Log error, hiển thị error notification, suggest retry

### Error Handling Strategy

```typescript
class ErrorHandler {
  // Xử lý lỗi chung
  static handle(error: Error, context: string): void {
    console.error(`[Gemini PDF Export] ${context}:`, error);
    
    // Phân loại lỗi
    if (error instanceof DOMError) {
      this.handleDOMError(error, context);
    } else if (error instanceof ExpansionError) {
      this.handleExpansionError(error, context);
    } else if (error instanceof PDFError) {
      this.handlePDFError(error, context);
    } else {
      this.handleGenericError(error, context);
    }
  }
  
  // Xử lý DOM errors
  static handleDOMError(error: DOMError, context: string): void {
    const message = 'Không thể tìm thấy phần tử cần thiết trên trang. ' +
                   'Vui lòng đảm bảo bạn đang ở trang chat Gemini Business.';
    uiInjector.showNotification(message, 'error');
  }
  
  // Xử lý expansion errors
  static handleExpansionError(error: ExpansionError, context: string): void {
    const message = `Không thể mở rộng ${error.failedCount} tin nhắn. ` +
                   'PDF có thể thiếu một số nội dung.';
    uiInjector.showNotification(message, 'error');
  }
  
  // Xử lý PDF errors
  static handlePDFError(error: PDFError, context: string): void {
    const message = 'Không thể tạo file PDF. ' +
                   'Vui lòng thử lại hoặc liên hệ hỗ trợ.';
    uiInjector.showNotification(message, 'error');
  }
  
  // Xử lý generic errors
  static handleGenericError(error: Error, context: string): void {
    const message = `Đã xảy ra lỗi: ${error.message}`;
    uiInjector.showNotification(message, 'error');
  }
}
```

### Logging Strategy

```typescript
enum LogLevel {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

class Logger {
  private static prefix = '[Gemini PDF Export]';
  
  static log(message: string, level: LogLevel = LogLevel.INFO, data?: any): void {
    const timestamp = new Date().toISOString();
    const logMessage = `${this.prefix} [${timestamp}] ${message}`;
    
    switch (level) {
      case LogLevel.INFO:
        console.log(logMessage, data || '');
        break;
      case LogLevel.WARN:
        console.warn(logMessage, data || '');
        break;
      case LogLevel.ERROR:
        console.error(logMessage, data || '');
        break;
    }
  }
  
  static info(message: string, data?: any): void {
    this.log(message, LogLevel.INFO, data);
  }
  
  static warn(message: string, data?: any): void {
    this.log(message, LogLevel.WARN, data);
  }
  
  static error(message: string, data?: any): void {
    this.log(message, LogLevel.ERROR, data);
  }
}
```

## Chiến Lược Kiểm Thử

### Tổng Quan

Extension sẽ được test bằng cả **unit tests** và **property-based tests** để đảm bảo tính đúng đắn toàn diện.

- **Unit tests:** Kiểm tra các ví dụ cụ thể, edge cases, và error conditions
- **Property tests:** Xác minh các thuộc tính phổ quát trên nhiều inputs được generate tự động

### Thư Viện Testing

- **Framework:** Jest hoặc Vitest
- **Property-based testing:** fast-check (cho JavaScript/TypeScript)
- **DOM testing:** jsdom hoặc happy-dom
- **Mocking:** Jest mocks hoặc Vitest mocks

### Cấu Hình Property Tests

Mỗi property test phải:
- Chạy tối thiểu **100 iterations** (do randomization)
- Có comment tag: `Feature: gemini-business-to-pdf, Property {number}: {property_text}`
- Reference đến property tương ứng trong design document

### Test Coverage

**Unit Tests sẽ cover:**
- Các ví dụ cụ thể cho mỗi function
- Edge cases:
  - Empty chat (không có messages)
  - Chat với chỉ 1 message
  - Title rỗng hoặc null
  - Filename với tất cả ký tự không hợp lệ
  - HTML với nested structures phức tạp
- Error conditions:
  - DOM elements không tồn tại
  - Expansion timeout
  - PDF generation failure
- Integration points:
  - Button click trigger export flow
  - Export flow hoàn chỉnh từ đầu đến cuối

**Property Tests sẽ cover:**
- Property 1: findCollapsedMessages với random DOM structures
- Property 2: expandMessage với random message elements
- Property 3: expandAllMessages với random số lượng messages
- Property 4: Error handling với random failure scenarios
- Property 5: Scroll position preservation với random scroll values
- Property 6: extractChatContent với random số lượng messages
- Property 7: HTML structure preservation với random HTML
- Property 8: Format preservation với random formatting combinations
- Property 9: Sender identification với random message types
- Property 10: Title extraction với random title strings
- Property 11: Filename generation với random input strings
- Property 12: PDF generation với random HTML content
- Property 13: Download trigger với random filenames
- Property 14: Button state với random operation durations
- Property 15: Error messages với random error types
- Property 16: Button re-enable với random completion scenarios
- Property 17: Domain restriction với random URLs
- Property 18: Large conversations với random message counts (100-500)
- Property 19: Network monitoring với random operations
- Property 20: Storage checking với random operations

### Test Structure Example

```typescript
// Unit test example
describe('TitleExtractor', () => {
  it('should extract title from DOM', () => {
    // Setup DOM
    document.body.innerHTML = '<h1 class="chat-title">My Chat</h1>';
    
    // Execute
    const extractor = new TitleExtractor();
    const title = extractor.extractTitle();
    
    // Assert
    expect(title).toBe('My Chat');
  });
  
  it('should handle missing title', () => {
    document.body.innerHTML = '';
    const extractor = new TitleExtractor();
    const title = extractor.extractTitle();
    expect(title).toBeNull();
  });
});

// Property test example
describe('TitleExtractor - Property Tests', () => {
  // Feature: gemini-business-to-pdf, Property 11: Filename generation và sanitization
  it('should generate valid filename for any input string', () => {
    fc.assert(
      fc.property(
        fc.string(), // Generate random strings
        (inputTitle) => {
          const extractor = new TitleExtractor();
          const filename = extractor.generateFilename(inputTitle);
          
          // Verify properties
          expect(filename).toBeTruthy();
          expect(filename.endsWith('.pdf')).toBe(true);
          expect(filename.length).toBeLessThanOrEqual(104); // 100 + '.pdf'
          expect(filename).not.toMatch(/[\/\\:*?"<>|]/); // No invalid chars
        }
      ),
      { numRuns: 100 } // Run 100 iterations
    );
  });
});
```

### Mock Strategy

**Mocking DOM:**
- Sử dụng jsdom để tạo DOM environment
- Mock các elements cụ thể của Gemini Business
- Mock MutationObserver cho expansion detection

**Mocking PDF Library:**
- Mock jsPDF hoặc html2pdf.js
- Verify function calls và parameters
- Return mock Blob objects

**Mocking Browser APIs:**
- Mock `document.createElement`
- Mock `URL.createObjectURL`
- Mock download trigger

### CI/CD Integration

- Tests chạy tự động trên mỗi commit
- Property tests chạy với seed cố định để reproducible
- Coverage target: 80% cho unit tests
- Tất cả property tests phải pass


## Chi Tiết Kỹ Thuật Bổ Sung

### Chrome Extension Structure

```
gemini-business-to-pdf/
├── manifest.json           # Manifest V3 configuration
├── src/
│   ├── content/
│   │   ├── content.ts     # Main content script
│   │   ├── ui-injector.ts
│   │   ├── message-expander.ts
│   │   ├── content-extractor.ts
│   │   ├── title-extractor.ts
│   │   └── pdf-generator.ts
│   ├── utils/
│   │   ├── logger.ts
│   │   ├── error-handler.ts
│   │   └── dom-utils.ts
│   └── styles/
│       └── button.css      # Styles cho export button
├── lib/
│   └── html2pdf.bundle.js  # PDF library
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── tests/
    ├── unit/
    │   ├── ui-injector.test.ts
    │   ├── message-expander.test.ts
    │   ├── content-extractor.test.ts
    │   ├── title-extractor.test.ts
    │   └── pdf-generator.test.ts
    └── property/
        ├── message-expander.property.test.ts
        ├── content-extractor.property.test.ts
        ├── title-extractor.property.test.ts
        └── pdf-generator.property.test.ts
```

### Manifest.json Configuration

```json
{
  "manifest_version": 3,
  "name": "Gemini Business to PDF",
  "version": "1.0.0",
  "description": "Xuất cuộc trò chuyện Gemini Business thành file PDF",
  "permissions": [
    "activeTab"
  ],
  "host_permissions": [
    "https://gemini.google.com/*"
  ],
  "content_scripts": [
    {
      "matches": ["https://gemini.google.com/*"],
      "js": ["lib/html2pdf.bundle.js", "content/content.js"],
      "css": ["styles/button.css"],
      "run_at": "document_idle"
    }
  ],
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}
```

### DOM Selectors (Cần Xác Định)

Các selectors sau cần được xác định bằng cách inspect DOM thực tế của Gemini Business:

```typescript
const SELECTORS = {
  // Chat container chứa tất cả messages
  chatContainer: '.chat-container', // TBD
  
  // Individual message elements
  messageElement: '.message', // TBD
  
  // User message (để phân biệt với Gemini)
  userMessage: '.user-message', // TBD
  
  // Gemini message
  geminiMessage: '.gemini-message', // TBD
  
  // Collapsed message indicator
  collapsedMessage: '.collapsed', // TBD
  
  // Expand button/trigger
  expandTrigger: '.expand-button', // TBD
  
  // Chat title
  chatTitle: '.chat-title', // TBD
  
  // Header container (để inject button)
  headerContainer: '.header-actions', // TBD
};
```

### Button Styling

```css
.gemini-pdf-export-button {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  
  padding: 10px 20px;
  background: #1a73e8;
  color: white;
  border: none;
  border-radius: 4px;
  
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  
  display: flex;
  align-items: center;
  gap: 8px;
  
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  transition: all 0.2s ease;
}

.gemini-pdf-export-button:hover {
  background: #1557b0;
  box-shadow: 0 4px 8px rgba(0,0,0,0.3);
}

.gemini-pdf-export-button:disabled {
  background: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}

.gemini-pdf-export-button .icon {
  width: 16px;
  height: 16px;
}

.gemini-pdf-export-button .spinner {
  width: 16px;
  height: 16px;
  border: 2px solid white;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.gemini-pdf-notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 10000;
  
  padding: 12px 20px;
  border-radius: 4px;
  
  font-size: 14px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  
  animation: slideIn 0.3s ease;
}

.gemini-pdf-notification.success {
  background: #4caf50;
  color: white;
}

.gemini-pdf-notification.error {
  background: #f44336;
  color: white;
}

@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
```

### PDF Styling Template

```typescript
const PDF_STYLES = `
  <style>
    body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 12pt;
      line-height: 1.5;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .message {
      margin-bottom: 20px;
      padding: 15px;
      border-radius: 8px;
      page-break-inside: avoid;
    }
    
    .message.user {
      background-color: #e3f2fd;
      margin-left: 40px;
    }
    
    .message.gemini {
      background-color: #f5f5f5;
      margin-right: 40px;
    }
    
    .message-header {
      font-weight: bold;
      margin-bottom: 8px;
      font-size: 11pt;
      color: #666;
    }
    
    .message-content {
      color: #333;
    }
    
    .message-content code {
      background-color: #f0f0f0;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      font-size: 11pt;
    }
    
    .message-content pre {
      background-color: #f8f8f8;
      padding: 12px;
      border-radius: 4px;
      border-left: 3px solid #1a73e8;
      overflow-x: auto;
      page-break-inside: avoid;
    }
    
    .message-content pre code {
      background: none;
      padding: 0;
    }
    
    .message-content table {
      border-collapse: collapse;
      width: 100%;
      margin: 10px 0;
      page-break-inside: avoid;
    }
    
    .message-content th,
    .message-content td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }
    
    .message-content th {
      background-color: #f0f0f0;
      font-weight: bold;
    }
    
    .message-content ul,
    .message-content ol {
      margin: 10px 0;
      padding-left: 30px;
    }
    
    .message-content li {
      margin: 5px 0;
    }
    
    .message-content a {
      color: #1a73e8;
      text-decoration: none;
    }
    
    .message-content a:hover {
      text-decoration: underline;
    }
    
    h1, h2, h3, h4, h5, h6 {
      margin-top: 20px;
      margin-bottom: 10px;
      page-break-after: avoid;
    }
    
    .pdf-header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #1a73e8;
    }
    
    .pdf-header h1 {
      margin: 0;
      color: #1a73e8;
    }
    
    .pdf-header .export-date {
      color: #666;
      font-size: 10pt;
      margin-top: 5px;
    }
  </style>
`;
```

### Performance Considerations

1. **Lazy Loading:**
   - Chỉ load PDF library khi user click export button
   - Sử dụng dynamic import nếu có thể

2. **Chunking:**
   - Với conversations rất dài (>200 messages), xử lý theo chunks
   - Sử dụng `requestIdleCallback` để tránh block UI

3. **Memory Management:**
   - Clear references sau khi export xong
   - Revoke object URLs sau download
   - Cleanup event listeners

4. **Optimization:**
   - Debounce button clicks
   - Cache DOM queries
   - Minimize DOM manipulations

### Security Considerations

1. **Content Security Policy:**
   - Tuân thủ CSP của Gemini Business
   - Không inject inline scripts
   - Sử dụng nonce nếu cần

2. **XSS Prevention:**
   - Sanitize HTML content trước khi process
   - Không execute scripts trong extracted content
   - Escape special characters trong filenames

3. **Data Privacy:**
   - Không log sensitive content
   - Không gửi data ra ngoài
   - Clear data sau processing

4. **Permissions:**
   - Chỉ request minimum permissions cần thiết
   - Giải thích rõ ràng tại sao cần mỗi permission

