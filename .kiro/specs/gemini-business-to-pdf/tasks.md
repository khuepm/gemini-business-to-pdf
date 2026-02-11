# Kế Hoạch Triển Khai: Gemini Business to PDF

## Tổng Quan

Kế hoạch này chia việc triển khai Chrome extension "Gemini Business to PDF" thành các bước rõ ràng, có thể thực hiện được. Mỗi task tập trung vào việc viết, sửa đổi hoặc test code, xây dựng dần từng thành phần và tích hợp chúng lại với nhau.

## Tasks

- [x] 1. Thiết lập cấu trúc project và cấu hình cơ bản
  - Tạo cấu trúc thư mục cho Chrome extension
  - Tạo manifest.json với Manifest V3 configuration
  - Thiết lập TypeScript configuration (tsconfig.json)
  - Thiết lập build tool (webpack hoặc vite) để bundle extension
  - Tạo package.json với dependencies cần thiết (html2pdf.js, fast-check, jest/vitest)
  - Tạo các file icon placeholder
  - _Requirements: 7.1, 8.1, 8.5_

- [x] 2. Triển khai Logger và Error Handler utilities
  - [x] 2.1 Tạo Logger class với các methods info, warn, error
    - Implement logging với timestamp và prefix
    - Support logging với additional data
    - _Requirements: 6.6_
  
  - [x] 2.2 Tạo Error Handler class với custom error types
    - Define DOMError, ExpansionError, PDFError classes
    - Implement error handling methods cho từng loại lỗi
    - Integrate với Logger
    - _Requirements: 6.4_
  
  - [x] 2.3 Viết unit tests cho Logger và Error Handler
    - Test logging ở các levels khác nhau
    - Test error classification và handling
    - _Requirements: 6.4, 6.6_

- [x] 3. Triển khai UI Injector
  - [x] 3.1 Tạo UIInjector class với method injectButton
    - Tạo export button element với DOM API
    - Inject button vào header của Gemini Business page
    - Thêm icon và text cho button
    - Thêm tooltip (title attribute)
    - _Requirements: 1.1, 1.3, 1.4_
  
  - [x] 3.2 Implement UI state management methods
    - showLoading(): hiển thị spinner trong button
    - hideLoading(): ẩn spinner
    - disableButton(): disable button
    - enableButton(): enable button
    - _Requirements: 6.1, 6.2, 6.5_
  
  - [x] 3.3 Implement notification system
    - showNotification(message, type): hiển thị toast notification
    - Auto-dismiss notification sau 5 giây
    - Support success và error types
    - _Requirements: 5.7, 6.3, 6.4_
  
  - [x] 3.4 Tạo CSS styles cho button và notifications
    - Style export button với hover effects
    - Style loading spinner animation
    - Style notification toast với success/error variants
    - _Requirements: 1.5_
  
  - [x] 3.5 Viết unit tests cho UI Injector
    - Test button injection vào DOM
    - Test UI state changes (loading, disabled, enabled)
    - Test notification display
    - _Requirements: 1.1, 1.3, 1.4, 6.1, 6.2, 6.3, 6.4, 6.5, 5.7_


- [x] 4. Triển khai Message Expander
  - [x] 4.1 Tạo MessageExpander class với method findCollapsedMessages
    - Implement DOM query để tìm tất cả collapsed messages
    - Return array of HTMLElement
    - _Requirements: 2.1_
  
  - [x] 4.2 Viết property test cho findCollapsedMessages
    - **Property 1: Tìm tất cả collapsed messages**
    - **Validates: Requirements 2.1**
    - Generate random DOM structures với varying số lượng collapsed messages
    - Verify tất cả collapsed messages được tìm thấy
  
  - [x] 4.3 Implement method expandMessage
    - Trigger click event trên collapsed message
    - Sử dụng MutationObserver hoặc polling để detect expansion complete
    - Implement timeout (2 seconds)
    - Return Promise<void>
    - _Requirements: 2.2, 2.3_
  
  - [x] 4.4 Viết property test cho expandMessage
    - **Property 2: Mở rộng messages thành công**
    - **Validates: Requirements 2.2**
    - Generate random collapsed messages
    - Verify message state changes sau expand
  
  - [x] 4.5 Implement method expandAllMessages
    - Lưu scroll position hiện tại
    - Iterate qua tất cả collapsed messages và expand
    - Restore scroll position sau khi hoàn tất
    - Handle errors gracefully, tiếp tục với messages khác
    - Return ExpandResult với statistics
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [x] 4.6 Viết property tests cho expandAllMessages
    - **Property 3: Đợi tất cả messages mở rộng**
    - **Validates: Requirements 2.3**
    - **Property 4: Xử lý lỗi expansion gracefully**
    - **Validates: Requirements 2.4**
    - **Property 5: Bảo toàn scroll position**
    - **Validates: Requirements 2.5**
  
  - [x] 4.7 Viết unit tests cho Message Expander
    - Test với empty chat (no collapsed messages)
    - Test với 1 collapsed message
    - Test timeout scenario
    - Test error handling
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 5. Checkpoint - Đảm bảo tất cả tests pass
  - Chạy tất cả tests đã viết cho Logger, Error Handler, UI Injector, và Message Expander
  - Fix bất kỳ issues nào được phát hiện
  - Hỏi user nếu có câu hỏi phát sinh

- [x] 6. Triển khai Content Extractor
  - [x] 6.1 Tạo ContentExtractor class với method extractChatContent
    - Tìm chat container trong DOM
    - Iterate qua tất cả message elements
    - Extract từng message bằng extractMessage method
    - Return ChatContent object với array of messages
    - _Requirements: 3.1_
  
  - [x] 6.2 Viết property test cho extractChatContent
    - **Property 6: Trích xuất tất cả messages**
    - **Validates: Requirements 3.1**
    - Generate random chat containers với varying số lượng messages
    - Verify tất cả messages được extract
  
  - [x] 6.3 Implement method extractMessage
    - Clone message element để tránh modify DOM gốc
    - Extract HTML content (innerHTML hoặc outerHTML)
    - Identify sender bằng identifySender method
    - Extract timestamp nếu có
    - Return Message object
    - _Requirements: 3.2, 3.3, 3.7_
  
  - [x] 6.4 Implement method identifySender
    - Check classes/attributes của message element
    - Return 'user' hoặc 'gemini'
    - _Requirements: 3.7_
  
  - [x] 6.5 Viết property tests cho Content Extractor
    - **Property 7: Bảo toàn HTML structure**
    - **Validates: Requirements 3.2**
    - **Property 8: Bảo toàn tất cả formatting**
    - **Validates: Requirements 3.3, 3.4, 3.5, 3.6**
    - **Property 9: Phân biệt sender chính xác**
    - **Validates: Requirements 3.7**
    - Generate random HTML với various formatting (bold, italic, code, tables, lists)
    - Verify structure và formatting được preserve
  
  - [x] 6.6 Viết unit tests cho Content Extractor
    - Test với empty chat
    - Test với messages chứa code blocks
    - Test với messages chứa tables
    - Test với messages chứa lists
    - Test sender identification
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_


- [x] 7. Triển khai Title Extractor
  - [x] 7.1 Tạo TitleExtractor class với method extractTitle
    - Tìm title element trong DOM bằng selector
    - Extract textContent hoặc innerText
    - Return string hoặc null nếu không tìm thấy
    - _Requirements: 4.1_
  
  - [x] 7.2 Viết property test cho extractTitle
    - **Property 10: Trích xuất title thành công**
    - **Validates: Requirements 4.1**
    - Generate random DOM states với và không có title
    - Verify title được extract chính xác
  
  - [x] 7.3 Implement method sanitizeFilename
    - Replace invalid characters (/, \, :, *, ?, ", <, >, |) với underscore
    - Trim whitespace
    - Remove multiple consecutive spaces/underscores
    - _Requirements: 4.4_
  
  - [x] 7.4 Implement method truncateFilename
    - Truncate ở maxLength (100 characters)
    - Cố gắng cắt ở word boundary
    - _Requirements: 4.5_
  
  - [x] 7.5 Implement method generateFilename
    - Nếu title tồn tại: sanitize và truncate title
    - Nếu title null/empty: tạo fallback "gemini-chat-[timestamp]"
    - Luôn thêm extension ".pdf"
    - _Requirements: 4.2, 4.3, 4.4, 4.5_
  
  - [x] 7.6 Viết property test cho generateFilename
    - **Property 11: Filename generation và sanitization**
    - **Validates: Requirements 4.2, 4.4, 4.5**
    - Generate random strings (bao gồm invalid characters, very long strings)
    - Verify filename luôn valid, không có invalid chars, không quá dài
  
  - [x] 7.7 Viết unit tests cho Title Extractor
    - Test với title bình thường
    - Test với title chứa tất cả invalid characters
    - Test với title rất dài (>100 chars)
    - Test với title null/empty (fallback case)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 8. Triển khai PDF Generator
  - [x] 8.1 Tạo PDFGenerator class và integrate html2pdf.js library
    - Import html2pdf.js
    - Define PDFOptions interface
    - Setup default options (A4, margins, fonts)
    - _Requirements: 5.1_
  
  - [x] 8.2 Implement method applyStyles
    - Tạo HTML template với PDF_STYLES
    - Wrap messages trong styled containers
    - Thêm header với chat title và export date
    - Distinguish user vs gemini messages với different backgrounds
    - _Requirements: 5.2, 5.4, 5.5_
  
  - [x] 8.3 Implement method generatePDF
    - Convert ChatContent thành styled HTML
    - Call html2pdf với options
    - Generate PDF blob
    - Call downloadPDF với blob và filename
    - _Requirements: 5.1, 5.3, 5.6_
  
  - [x] 8.4 Viết property test cho generatePDF
    - **Property 12: HTML to PDF conversion với format preservation**
    - **Validates: Requirements 5.1, 5.3**
    - Generate random HTML content với various formatting
    - Verify PDF được tạo thành công và formatting được preserve
  
  - [x] 8.5 Implement method downloadPDF
    - Tạo object URL từ blob
    - Tạo temporary <a> element với download attribute
    - Set href và filename
    - Trigger click
    - Cleanup: revoke object URL và remove element
    - _Requirements: 5.6_
  
  - [x] 8.6 Viết property test cho downloadPDF
    - **Property 13: PDF download với đúng filename**
    - **Validates: Requirements 5.6**
    - Generate random filenames
    - Mock download và verify filename được sử dụng đúng
  
  - [x] 8.7 Viết unit tests cho PDF Generator
    - Test applyStyles với different message types
    - Test generatePDF với sample content
    - Test downloadPDF trigger
    - Mock html2pdf library
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [x] 9. Checkpoint - Đảm bảo tất cả tests pass
  - Chạy tất cả tests cho Content Extractor, Title Extractor, và PDF Generator
  - Fix bất kỳ issues nào được phát hiện
  - Hỏi user nếu có câu hỏi phát sinh


- [x] 10. Triển khai Main Controller và tích hợp các thành phần
  - [x] 10.1 Tạo ExportController class
    - Khởi tạo tất cả dependencies (UIInjector, MessageExpander, ContentExtractor, TitleExtractor, PDFGenerator)
    - Implement initialize method để setup extension khi page load
    - _Requirements: 1.1_
  
  - [x] 10.2 Implement method handleExport
    - Orchestrate toàn bộ export flow:
      1. Show loading và disable button
      2. Expand all messages
      3. Extract content
      4. Get title và generate filename
      5. Generate và download PDF
      6. Show success notification
    - Wrap trong try-catch để handle errors
    - Luôn cleanup trong finally block
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 4.1, 4.2, 5.1, 5.6, 5.7, 6.1, 6.2, 6.5_
  
  - [x] 10.3 Wire up button click event
    - Attach handleExport to export button click event
    - Prevent multiple simultaneous exports
    - _Requirements: 1.1, 6.2_
  
  - [x] 10.4 Viết property tests cho ExportController
    - **Property 14: Button disabled trong khi processing**
    - **Validates: Requirements 6.2**
    - **Property 15: Error handling với message cụ thể**
    - **Validates: Requirements 6.4**
    - **Property 16: Button re-enabled sau completion**
    - **Validates: Requirements 6.5**
  
  - [x] 10.5 Viết integration tests cho complete export flow
    - Test end-to-end flow từ button click đến PDF download
    - Mock DOM của Gemini Business
    - Mock html2pdf library
    - Verify tất cả steps được execute đúng thứ tự
    - Test error scenarios
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 4.1, 5.1, 5.6, 6.1, 6.2, 6.5_

- [x] 11. Tạo content script entry point
  - [x] 11.1 Tạo content.ts file
    - Import ExportController
    - Khởi tạo controller khi DOM ready
    - Add event listener cho DOMContentLoaded
    - _Requirements: 1.1, 7.1_
  
  - [x] 11.2 Implement domain restriction check
    - Verify URL matches Gemini Business domain
    - Chỉ initialize extension nếu đúng domain
    - _Requirements: 7.2_
  
  - [x] 11.3 Viết property test cho domain restriction
    - **Property 17: Domain restriction**
    - **Validates: Requirements 7.2**
    - Generate random URLs
    - Verify extension chỉ initialize trên Gemini Business domain

- [x] 12. Triển khai security và privacy features
  - [x] 12.1 Implement network monitoring để verify no external requests
    - Add test để check không có outbound network calls
    - _Requirements: 8.2, 8.3_
  
  - [x] 12.2 Viết property test cho no external data transmission
    - **Property 19: No external data transmission**
    - **Validates: Requirements 8.2**
    - Mock network layer
    - Verify không có requests đến external domains
  
  - [x] 12.3 Implement storage checking
    - Verify không có data được lưu vào localStorage/sessionStorage/IndexedDB
    - _Requirements: 8.4_
  
  - [x] 12.4 Viết property test cho no data persistence
    - **Property 20: No data persistence**
    - **Validates: Requirements 8.4**
    - Check storage sau export operations
    - Verify storage remains empty

- [x] 13. Performance optimization và testing
  - [x] 13.1 Implement chunking cho large conversations
    - Xử lý messages theo batches nếu >200 messages
    - Sử dụng requestIdleCallback để tránh block UI
    - _Requirements: 7.4_
  
  - [x] 13.2 Viết property test cho large conversations
    - **Property 18: Xử lý large conversations**
    - **Validates: Requirements 7.4**
    - Generate conversations với 100-500 messages
    - Verify extension xử lý thành công không timeout
  
  - [x] 13.3 Implement memory cleanup
    - Revoke object URLs sau download
    - Clear references sau export
    - Remove event listeners khi cần
    - _Requirements: 7.5_


- [x] 14. Xác định và cập nhật DOM selectors thực tế cho Gemini Business
  - [x] 14.1 Inspect DOM của Gemini Business với Shadow DOM structure
    - **Shadow DOM Path đã xác định:**
      ```javascript
      // Chat container
      document.querySelector("body > ucs-standalone-app")
        .shadowRoot.querySelector("div > div.ucs-standalone-outer-row-container > div > div.search-bar-and-results-container > div > ucs-results")
        .shadowRoot.querySelector("div > div > div.tile.chat-mode-conversation > div.chat-mode-scroller.tile-content > ucs-conversation")
        .shadowRoot.querySelector("div")
      
      // User message content
      ucs-fast-markdown -> shadowRoot -> div > div
      
      // Gemini response content
      ucs-summary -> shadowRoot -> ... -> ucs-fast-markdown -> shadowRoot -> div > div
      
      // Attached images
      turn -> ucs-carousel -> ucs-file-bubble -> shadowRoot -> div > img
      ```
    - ✅ Đã tìm selector cho chat container (trong Shadow DOM)
    - ✅ Đã tìm selector cho message elements (trong Shadow DOM)
    - ✅ Đã tìm selector để phân biệt user vs gemini messages
    - ✅ Đã tìm selector cho collapsed messages
    - ✅ Đã tìm selector cho expand trigger
    - ✅ Đã tìm selector cho chat title
    - ✅ Đã tìm selector cho header container (để inject button)
    - ✅ Đã document tất cả selectors trong shadow-dom-utils.ts
    - _Requirements: 1.1, 2.1, 3.1, 4.1_
  
  - [x] 14.2 Cập nhật code để xử lý Shadow DOM
    - ✅ Đã tạo utility functions để traverse Shadow DOM (shadow-dom-utils.ts)
    - ✅ Đã update ContentExtractor để access Shadow DOM
    - ✅ Đã update MessageExpander để access Shadow DOM
    - ✅ Đã update TitleExtractor để access Shadow DOM
    - ✅ Đã replace placeholder selectors trong tất cả modules
    - ✅ Đã test với DOM thực tế
    - ✅ Đã thêm hỗ trợ trích xuất hình ảnh đính kèm
    - _Requirements: 1.1, 2.1, 3.1, 4.1_
  
  - [x] 14.3 Implement Markdown export as alternative to PDF
    - ✅ Đã tạo MarkdownGenerator class
    - ✅ Đã integrate vào ExportController
    - ✅ Markdown là định dạng mặc định (PDF có vấn đề rendering)
    - ✅ Hỗ trợ code blocks, tables, lists, hình ảnh
    - ✅ Đã build và test thành công
    - _Requirements: 5.1, 5.2, 5.3, 5.6_

- [x] 15. Build và package extension
  - [x] 15.1 Configure build process
    - Setup webpack/vite để bundle TypeScript thành JavaScript
    - Bundle html2pdf.js library
    - Copy manifest.json và assets vào dist folder
    - Minify code cho production
    - _Requirements: 7.1_
  
  - [x] 15.2 Tạo build scripts trong package.json
    - npm run build: production build
    - npm run dev: development build với watch mode
    - npm run test: chạy tất cả tests
    - _Requirements: 7.1_
  
  - [x] 15.3 Test extension trong Chrome
    - Load unpacked extension vào Chrome
    - Navigate đến Gemini Business
    - Test export functionality với real chat
    - Verify PDF output quality
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 7.6_

- [x] 16. Final checkpoint và polish
  - [x] 16.1 Chạy tất cả tests và đảm bảo pass
    - Run unit tests
    - Run property tests với 100+ iterations
    - Fix any failing tests
    - _Requirements: All_
  
  - [x] 16.2 Manual testing với various scenarios
    - Test với empty chat
    - Test với chat có 1 message
    - Test với chat có nhiều messages (>100)
    - Test với messages chứa code blocks
    - Test với messages chứa tables
    - Test với messages chứa lists
    - Test với chat title dài
    - Test với chat không có title
    - Test error scenarios
    - _Requirements: All_
  
  - [x] 16.3 Code review và cleanup
    - Remove console.logs không cần thiết
    - Add comments cho complex logic
    - Ensure consistent code style
    - Update README với installation và usage instructions
    - _Requirements: All_
  
  - [x] 16.4 Verify manifest permissions
    - Đảm bảo chỉ request permissions cần thiết
    - Verify host_permissions chỉ cho Gemini Business domain
    - _Requirements: 8.1, 8.5_

- [x] 17. Documentation và deployment preparation
  - [x] 17.1 Tạo README.md
    - Mô tả extension
    - Installation instructions
    - Usage guide
    - Troubleshooting
    - Privacy policy statement
    - _Requirements: All_
  
  - [x] 17.2 Tạo CHANGELOG.md
    - Document version 1.0.0 features
    - _Requirements: All_
  
  - [x] 17.3 Prepare cho Chrome Web Store submission (optional)
    - Tạo promotional images
    - Write store description
    - Prepare privacy policy
    - _Requirements: All_

## Ghi Chú

- Tasks được đánh dấu `*` là optional và có thể bỏ qua để có MVP nhanh hơn
- Mỗi task reference các requirements cụ thể để đảm bảo traceability
- Các checkpoint tasks đảm bảo validation từng bước
- Property tests validate tính đúng đắn phổ quát với 100+ iterations
- Unit tests validate các ví dụ cụ thể và edge cases
- Integration tests đảm bảo các thành phần hoạt động tốt cùng nhau
