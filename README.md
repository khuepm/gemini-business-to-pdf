# Gemini Business to PDF

Chrome extension cho phép xuất toàn bộ cuộc trò chuyện từ Gemini Business thành file PDF với định dạng đẹp và dễ đọc.

## Mô Tả

Gemini Business to PDF là một Chrome extension giúp bạn lưu trữ và chia sẻ các cuộc trò chuyện với Gemini AI một cách dễ dàng. Extension tự động mở rộng các tin nhắn bị thu nhỏ, giữ nguyên toàn bộ định dạng (bold, italic, code blocks, tables, lists), và tạo file PDF với tên thông minh dựa trên tiêu đề cuộc trò chuyện.

### Tính Năng Chính

- ✅ **Xuất PDF hoàn chỉnh**: Xuất toàn bộ nội dung cuộc trò chuyện thành file PDF chất lượng cao
- ✅ **Tự động mở rộng tin nhắn**: Tự động mở rộng các tin nhắn của người dùng bị thu nhỏ
- ✅ **Bảo toàn định dạng**: Giữ nguyên tất cả định dạng văn bản, code blocks, tables, và lists
- ✅ **Đặt tên thông minh**: Tự động đặt tên file PDF theo tiêu đề cuộc trò chuyện
- ✅ **Xử lý phía client**: Tất cả dữ liệu được xử lý trên trình duyệt của bạn, không gửi ra ngoài
- ✅ **Giao diện thân thiện**: Nút xuất PDF được tích hợp liền mạch vào giao diện Gemini Business

## Cài Đặt (Installation)

### Cài Đặt Từ Chrome Web Store

*(Sẽ có sẵn sau khi extension được publish)*

1. Truy cập Chrome Web Store
2. Tìm kiếm "Gemini Business to PDF"
3. Click "Add to Chrome"
4. Xác nhận cài đặt

### Cài Đặt Từ Source Code (Dành Cho Developer)

#### Yêu Cầu Hệ Thống

- Node.js phiên bản 18 trở lên
- npm hoặc yarn
- Google Chrome phiên bản 88 trở lên

#### Các Bước Cài Đặt

1. **Clone repository:**

```bash
git clone https://github.com/yourusername/gemini-business-to-pdf.git
cd gemini-business-to-pdf
```

2. **Cài đặt dependencies:**

```bash
npm install
```

3. **Build extension:**

```bash
npm run build
```

4. **Load extension vào Chrome:**

   - Mở Chrome và truy cập `chrome://extensions/`
   - Bật "Developer mode" (góc trên bên phải)
   - Click "Load unpacked"
   - Chọn thư mục `dist` trong project

5. **Xác nhận cài đặt:**

   Extension sẽ xuất hiện trong danh sách extensions với icon và tên "Gemini Business to PDF"

## Hướng Dẫn Sử Dụng (Usage Guide)

### Xuất Cuộc Trò Chuyện Thành PDF

1. **Mở Gemini Business:**
   - Truy cập https://gemini.google.com
   - Đăng nhập vào tài khoản Gemini Business của bạn
   - Mở cuộc trò chuyện bạn muốn xuất

2. **Tìm nút Export:**
   - Nút "Export PDF" sẽ xuất hiện ở góc trên bên phải của trang
   - Nút có icon PDF và text rõ ràng

3. **Click Export:**
   - Click vào nút "Export PDF"
   - Extension sẽ hiển thị loading indicator
   - Quá trình xuất bao gồm:
     - Tự động mở rộng tất cả tin nhắn bị thu nhỏ
     - Trích xuất toàn bộ nội dung chat
     - Chuyển đổi sang định dạng PDF
     - Tải xuống file

4. **Nhận file PDF:**
   - File PDF sẽ tự động được tải xuống
   - Tên file dựa trên tiêu đề cuộc trò chuyện
   - Nếu không có tiêu đề, file sẽ có tên dạng `gemini-chat-YYYYMMDD-HHMMSS.pdf`

### Lưu Ý Khi Sử Dụng

- **Cuộc trò chuyện dài**: Với các cuộc trò chuyện có hơn 100 tin nhắn, quá trình xuất có thể mất vài giây. Vui lòng đợi cho đến khi hoàn tất.
- **Định dạng đặc biệt**: Code blocks, tables, và lists sẽ được giữ nguyên định dạng trong PDF.
- **Scroll position**: Extension sẽ giữ nguyên vị trí cuộn của bạn sau khi mở rộng tin nhắn.

## Xử Lý Sự Cố (Troubleshooting)

### Nút Export Không Xuất Hiện

**Nguyên nhân có thể:**
- Extension chưa được cài đặt đúng cách
- Bạn không ở trang Gemini Business
- Extension bị vô hiệu hóa

**Giải pháp:**
1. Kiểm tra extension đã được cài đặt và kích hoạt tại `chrome://extensions/`
2. Đảm bảo bạn đang ở domain `https://gemini.google.com/*`
3. Thử refresh lại trang
4. Kiểm tra console để xem có lỗi không (F12 → Console tab)

### Không Thể Xuất PDF

**Nguyên nhân có thể:**
- Cuộc trò chuyện quá dài
- Lỗi khi mở rộng tin nhắn
- Lỗi khi tạo PDF

**Giải pháp:**
1. Thử lại lần nữa
2. Kiểm tra console để xem thông báo lỗi cụ thể
3. Với cuộc trò chuyện rất dài (>200 tin nhắn), hãy kiên nhẫn đợi
4. Đảm bảo trình duyệt có đủ bộ nhớ

### File PDF Thiếu Nội Dung

**Nguyên nhân có thể:**
- Một số tin nhắn không thể mở rộng
- Lỗi khi trích xuất nội dung

**Giải pháp:**
1. Kiểm tra console để xem có warning về messages không mở rộng được
2. Thử cuộn xuống cuối cuộc trò chuyện trước khi xuất
3. Refresh trang và thử lại

### File PDF Không Tải Xuống

**Nguyên nhân có thể:**
- Trình duyệt chặn download
- Không đủ dung lượng đĩa
- Lỗi permissions

**Giải pháp:**
1. Kiểm tra settings download của Chrome
2. Cho phép downloads từ gemini.google.com
3. Kiểm tra dung lượng đĩa còn trống
4. Thử tải xuống vào thư mục khác

### Định Dạng PDF Không Đúng

**Nguyên nhân có thể:**
- Gemini Business đã thay đổi cấu trúc HTML
- Lỗi trong quá trình chuyển đổi

**Giải pháp:**
1. Đảm bảo bạn đang dùng phiên bản mới nhất của extension
2. Báo cáo issue trên GitHub với screenshot
3. Kiểm tra console để xem có lỗi không

### Lỗi "Extension Context Invalidated"

**Nguyên nhân:**
- Extension đã được reload hoặc update trong khi đang sử dụng

**Giải pháp:**
1. Refresh lại trang Gemini Business
2. Thử xuất PDF lại

## Chính Sách Bảo Mật (Privacy Policy)

### Thu Thập Dữ Liệu

**Gemini Business to PDF KHÔNG thu thập, lưu trữ, hoặc truyền tải bất kỳ dữ liệu cá nhân nào của bạn.**

### Xử Lý Dữ Liệu

- ✅ **Xử lý hoàn toàn phía client**: Tất cả dữ liệu được xử lý trực tiếp trên trình duyệt của bạn
- ✅ **Không gửi dữ liệu ra ngoài**: Extension không tạo bất kỳ network request nào đến server bên ngoài
- ✅ **Không lưu trữ**: Không có dữ liệu chat nào được lưu vào localStorage, sessionStorage, hoặc IndexedDB
- ✅ **Không tracking**: Extension không theo dõi hành vi sử dụng của bạn

### Quyền Truy Cập (Permissions)

Extension yêu cầu các quyền sau:

1. **activeTab**: Để tương tác với trang Gemini Business hiện tại
2. **host_permissions (https://gemini.google.com/*)**: Để inject content script vào trang Gemini Business

**Tại sao cần các quyền này?**
- Extension cần truy cập DOM của trang Gemini Business để trích xuất nội dung chat
- Extension cần inject nút Export PDF vào giao diện
- Extension KHÔNG yêu cầu quyền truy cập vào các trang web khác

### Bảo Mật

- Extension tuân thủ Chrome Extension Manifest V3 - tiêu chuẩn bảo mật mới nhất
- Source code mở, có thể audit tại GitHub
- Không sử dụng eval() hoặc các hàm nguy hiểm khác
- Không inject inline scripts

### Liên Hệ

Nếu bạn có bất kỳ câu hỏi nào về chính sách bảo mật, vui lòng liên hệ qua GitHub Issues.

## Phát Triển (Development)

### Cấu Trúc Project

```
gemini-business-to-pdf/
├── manifest.json              # Chrome extension manifest (Manifest V3)
├── src/
│   ├── content/              # Content scripts
│   │   ├── content.ts        # Main entry point
│   │   ├── export-controller.ts    # Điều phối quá trình export
│   │   ├── message-expander.ts     # Mở rộng tin nhắn
│   │   ├── content-extractor.ts    # Trích xuất nội dung
│   │   ├── title-extractor.ts      # Lấy tiêu đề chat
│   │   └── pdf-generator.ts        # Tạo PDF
│   ├── utils/                # Utility functions
│   │   ├── logger.ts         # Logging
│   │   └── dom-utils.ts      # DOM helpers
│   └── styles/
│       └── button.css        # Styles cho export button
├── tests/                    # Test files
│   ├── unit/                # Unit tests
│   ├── property/            # Property-based tests
│   ├── integration/         # Integration tests
│   └── setup.ts             # Test setup
├── icons/                   # Extension icons
└── dist/                    # Build output
```

### Scripts

```bash
# Development build với watch mode
npm run dev

# Production build
npm run build

# Chạy tất cả tests
npm test

# Chạy tests ở watch mode
npm run test:watch

# Chạy tests với coverage
npm run test:coverage
```

### Testing

Extension sử dụng **Vitest** cho testing và **fast-check** cho property-based testing.

#### Unit Tests

```bash
# Chạy unit tests
npm test tests/unit

# Chạy một test file cụ thể
npm test tests/unit/title-extractor.test.ts
```

#### Property-Based Tests

```bash
# Chạy property tests
npm test tests/property

# Chạy với nhiều iterations hơn
npm test tests/property -- --runs=1000
```

#### Integration Tests

```bash
# Chạy integration tests
npm test tests/integration
```

### Đóng Góp (Contributing)

Chúng tôi hoan nghênh mọi đóng góp! Vui lòng:

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Mở Pull Request

### Code Style

- Sử dụng TypeScript
- Follow ESLint rules
- Viết tests cho code mới
- Document public APIs

## Yêu Cầu Hệ Thống (Requirements)

### Trình Duyệt

- Google Chrome phiên bản 88 trở lên
- Chromium-based browsers (Edge, Brave, Opera) có thể hoạt động nhưng chưa được test chính thức

### Hệ Điều Hành

- Windows 10/11
- macOS 10.15 trở lên
- Linux (các distro phổ biến)

### Tài Khoản

- Tài khoản Gemini Business hợp lệ
- Truy cập vào https://gemini.google.com

## Công Nghệ Sử Dụng

- **TypeScript**: Ngôn ngữ lập trình chính
- **Vite**: Build tool
- **html2pdf.js**: Thư viện chuyển đổi HTML sang PDF
- **Vitest**: Testing framework
- **fast-check**: Property-based testing
- **jsdom**: DOM testing environment

## Roadmap

### Version 1.1 (Planned)

- [ ] Hỗ trợ xuất nhiều cuộc trò chuyện cùng lúc
- [ ] Tùy chọn cấu hình PDF (font size, margins, colors)
- [ ] Hỗ trợ dark mode trong PDF
- [ ] Thêm watermark tùy chọn

### Version 1.2 (Planned)

- [ ] Xuất sang các định dạng khác (Markdown, HTML)
- [ ] Lọc tin nhắn theo thời gian
- [ ] Tìm kiếm trong cuộc trò chuyện trước khi xuất

## Giấy Phép (License)

MIT License - xem file [LICENSE](LICENSE) để biết chi tiết.

## Liên Hệ và Hỗ Trợ

- **GitHub Issues**: [Report bugs hoặc request features](https://github.com/yourusername/gemini-business-to-pdf/issues)
- **Email**: support@example.com
- **Documentation**: [Wiki](https://github.com/yourusername/gemini-business-to-pdf/wiki)

## Changelog

### Version 1.0.0 (Current)

- ✅ Xuất cuộc trò chuyện thành PDF
- ✅ Tự động mở rộng tin nhắn
- ✅ Bảo toàn định dạng
- ✅ Đặt tên file thông minh
- ✅ Xử lý phía client
- ✅ Property-based testing
- ✅ Comprehensive test coverage

## Câu Hỏi Thường Gặp (FAQ)

### Extension có miễn phí không?

Có, extension hoàn toàn miễn phí và open source.

### Extension có hoạt động với Gemini miễn phí không?

Extension được thiết kế cho Gemini Business, nhưng có thể hoạt động với Gemini miễn phí. Tuy nhiên, chúng tôi không đảm bảo tính tương thích.

### Tôi có thể tùy chỉnh định dạng PDF không?

Hiện tại chưa hỗ trợ tùy chỉnh. Tính năng này sẽ có trong version 1.1.

### Extension có hoạt động offline không?

Không, bạn cần kết nối internet để truy cập Gemini Business. Tuy nhiên, quá trình tạo PDF hoạt động hoàn toàn offline.

### Dữ liệu của tôi có an toàn không?

Có, tất cả dữ liệu được xử lý trên trình duyệt của bạn. Extension không gửi bất kỳ dữ liệu nào ra ngoài.

### Tôi có thể xuất cuộc trò chuyện rất dài không?

Có, extension hỗ trợ cuộc trò chuyện với hơn 100 tin nhắn. Tuy nhiên, với cuộc trò chuyện rất dài (>500 tin nhắn), quá trình có thể mất vài phút.

---

**Made with ❤️ for Gemini Business users**
