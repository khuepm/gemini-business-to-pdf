# Markdown Export Feature

## Tổng Quan

Extension hiện hỗ trợ xuất cuộc trò chuyện Gemini Business sang định dạng Markdown (.md). Đây là định dạng mặc định vì nó bảo toàn tốt hơn cấu trúc nội dung từ Gemini so với PDF.

## Tại Sao Chọn Markdown?

### Vấn Đề Với PDF
- html2pdf.js không render được HTML từ Gemini Business đúng cách
- PDF output bị trống dù HTML extraction hoạt động hoàn hảo
- Logs cho thấy 20 messages, 204KB HTML được tạo nhưng PDF vẫn blank

### Ưu Điểm Của Markdown
- ✅ Bảo toàn tốt cấu trúc nội dung (headings, lists, code blocks, tables)
- ✅ Dễ đọc và chỉnh sửa với text editor
- ✅ Tương thích với nhiều công cụ (GitHub, VS Code, Notion, etc.)
- ✅ Kích thước file nhỏ hơn PDF
- ✅ Có thể convert sang PDF sau bằng các công cụ khác nếu cần
- ✅ Hỗ trợ version control (Git)

## Tính Năng

### Định Dạng Được Hỗ Trợ
- **Headers**: H1-H4 được convert sang Markdown headers
- **Text formatting**: Bold, italic được giữ nguyên
- **Code blocks**: Inline code và code blocks với syntax highlighting
- **Lists**: Ordered và unordered lists
- **Tables**: Markdown tables
- **Links**: Hyperlinks được bảo toàn
- **Images**: Hình ảnh đính kèm được bao gồm (với URL)

### Cấu Trúc File

```markdown
# [Tiêu đề cuộc trò chuyện]

**Xuất ngày:** [Ngày giờ xuất]

**Tổng số tin nhắn:** [Số lượng]

---

## 👤 Bạn

[Nội dung tin nhắn của người dùng]

---

## 🤖 Gemini

[Nội dung phản hồi của Gemini]

---
```

## Cách Sử Dụng

### Xuất Markdown (Mặc Định)
1. Mở cuộc trò chuyện trong Gemini Business
2. Click nút "Export" ở góc trên phải
3. File .md sẽ tự động download

### Chuyển Đổi Sang PDF (Nếu Cần)
Bạn có thể convert file Markdown sang PDF bằng các công cụ:

#### Online Tools
- [Markdown to PDF](https://www.markdowntopdf.com/)
- [Dillinger](https://dillinger.io/) - Export as PDF
- [StackEdit](https://stackedit.io/) - Export as PDF

#### Command Line Tools
```bash
# Sử dụng pandoc
pandoc input.md -o output.pdf

# Sử dụng markdown-pdf (npm)
npm install -g markdown-pdf
markdown-pdf input.md
```

#### Desktop Applications
- **Typora**: Markdown editor với PDF export
- **VS Code**: Với extension "Markdown PDF"
- **MacDown** (macOS): Native Markdown editor với export

## Implementation Details

### MarkdownGenerator Class

```typescript
class MarkdownGenerator {
  // Generate Markdown from chat content
  generateMarkdown(content: ChatContent, title: string): string
  
  // Convert HTML to Markdown format
  private htmlToMarkdown(html: string): string
  
  // Download Markdown file
  downloadMarkdown(markdown: string, filename: string): void
}
```

### Integration

MarkdownGenerator được tích hợp vào ExportController:

```typescript
class ExportController {
  private exportFormat: 'pdf' | 'markdown' = 'markdown'; // Default
  
  // Set export format
  setExportFormat(format: 'pdf' | 'markdown'): void
  
  // Get current format
  getExportFormat(): 'pdf' | 'markdown'
}
```

## Roadmap

### Version 1.1 (Planned)
- [ ] UI toggle để chọn giữa PDF và Markdown
- [ ] Tùy chọn cấu hình Markdown (style, format)
- [ ] Preview Markdown trước khi download
- [ ] Export nhiều cuộc trò chuyện cùng lúc

### Version 1.2 (Planned)
- [ ] Hỗ trợ thêm định dạng: HTML, JSON
- [ ] Tích hợp Markdown to PDF converter
- [ ] Custom templates cho Markdown output

## Troubleshooting

### File Markdown Thiếu Định Dạng
- Kiểm tra console logs để xem quá trình conversion
- Một số HTML phức tạp có thể không convert hoàn hảo
- Báo cáo issue với ví dụ cụ thể

### Hình Ảnh Không Hiển Thị
- Hình ảnh sử dụng URL từ Gemini
- URL có thể expire sau một thời gian
- Cân nhắc download hình ảnh riêng nếu cần lưu trữ lâu dài

### Muốn Quay Lại PDF
- PDF export vẫn có sẵn trong code
- Có thể switch bằng cách gọi `setExportFormat('pdf')`
- Tuy nhiên PDF hiện có vấn đề rendering với Gemini content

## Technical Notes

### HTML to Markdown Conversion
- Sử dụng regex-based conversion
- Xử lý nested structures (lists, tables)
- Decode HTML entities
- Clean up extra whitespace

### Memory Management
- Markdown generation nhẹ hơn PDF
- Không cần html2pdf.js library overhead
- Cleanup tự động sau download

### Browser Compatibility
- Hoạt động trên tất cả browsers hỗ trợ Chrome extensions
- Không phụ thuộc vào external libraries cho Markdown
- Pure JavaScript implementation

## Contributing

Nếu bạn muốn cải thiện Markdown export:
1. Fork repository
2. Tạo branch: `feature/markdown-improvements`
3. Implement changes
4. Add tests
5. Submit pull request

## References

- [Markdown Guide](https://www.markdownguide.org/)
- [CommonMark Spec](https://commonmark.org/)
- [GitHub Flavored Markdown](https://github.github.com/gfm/)
