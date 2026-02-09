# Tài Liệu Yêu Cầu - Gemini Business to PDF

## Giới Thiệu

Gemini Business to PDF là một Chrome extension cho phép người dùng xuất toàn bộ nội dung cuộc trò chuyện từ trang web Gemini Business thành file PDF. Extension sẽ tự động mở rộng các tin nhắn bị thu nhỏ, giữ nguyên định dạng và styling, và đặt tên file PDF theo tiêu đề của cuộc trò chuyện.

## Thuật Ngữ

- **Extension**: Chrome extension được cài đặt vào trình duyệt Chrome
- **Content_Script**: Script được inject vào trang web Gemini Business để tương tác với DOM
- **Chat_Container**: Phần tử DOM chứa toàn bộ nội dung cuộc trò chuyện
- **Message_Bubble**: Các hộp thoại chat riêng lẻ (của người dùng hoặc Gemini)
- **Collapsed_Message**: Tin nhắn của người dùng đã bị thu nhỏ bởi Gemini
- **Chat_Title**: Tiêu đề của cuộc trò chuyện hiện tại
- **Export_Button**: Nút được thêm vào trang để kích hoạt chức năng xuất PDF
- **PDF_Generator**: Module xử lý việc chuyển đổi nội dung HTML thành PDF

## Yêu Cầu

### Yêu Cầu 1: Inject Nút Xuất PDF

**User Story:** Là người dùng Gemini Business, tôi muốn có một nút xuất PDF trên giao diện, để tôi có thể dễ dàng lưu cuộc trò chuyện.

#### Tiêu Chí Chấp Nhận

1. WHEN trang Gemini Business được tải xong, THE Extension SHALL inject một Export_Button vào giao diện
2. THE Export_Button SHALL được đặt ở vị trí dễ nhìn và không che khuất nội dung chat
3. THE Export_Button SHALL có icon và text rõ ràng để người dùng hiểu chức năng
4. WHEN người dùng di chuột qua Export_Button, THE Extension SHALL hiển thị tooltip mô tả chức năng
5. THE Export_Button SHALL có styling phù hợp với giao diện Gemini Business

### Yêu Cầu 2: Mở Rộng Tin Nhắn Bị Thu Nhỏ

**User Story:** Là người dùng, tôi muốn tất cả tin nhắn của tôi được mở rộng đầy đủ trong PDF, để không bỏ sót nội dung nào.

#### Tiêu Chí Chấp Nhận

1. WHEN Export_Button được nhấn, THE Extension SHALL xác định tất cả Collapsed_Message trong Chat_Container
2. WHEN một Collapsed_Message được tìm thấy, THE Extension SHALL mô phỏng hành động click để mở rộng tin nhắn đó
3. THE Extension SHALL đợi cho đến khi tất cả Collapsed_Message được mở rộng hoàn toàn trước khi tiếp tục
4. IF một Collapsed_Message không thể mở rộng được, THEN THE Extension SHALL ghi log lỗi và tiếp tục với các tin nhắn khác
5. THE Extension SHALL xử lý việc mở rộng tin nhắn mà không làm thay đổi trạng thái cuộn (scroll position) của trang

### Yêu Cầu 3: Trích Xuất Nội Dung Chat

**User Story:** Là người dùng, tôi muốn toàn bộ nội dung chat được trích xuất chính xác, để PDF phản ánh đúng cuộc trò chuyện.

#### Tiêu Chí Chấp Nhận

1. WHEN tất cả tin nhắn đã được mở rộng, THE Extension SHALL trích xuất toàn bộ nội dung từ Chat_Container
2. THE Extension SHALL bảo toàn cấu trúc HTML của mỗi Message_Bubble
3. THE Extension SHALL giữ nguyên tất cả định dạng văn bản (bold, italic, underline, links)
4. THE Extension SHALL giữ nguyên code blocks với syntax highlighting
5. THE Extension SHALL giữ nguyên danh sách (ordered và unordered lists)
6. THE Extension SHALL giữ nguyên bảng biểu (tables) nếu có
7. THE Extension SHALL phân biệt rõ ràng tin nhắn của người dùng và tin nhắn của Gemini

### Yêu Cầu 4: Lấy Tiêu Đề Chat

**User Story:** Là người dùng, tôi muốn file PDF có tên dựa trên tiêu đề chat, để dễ dàng quản lý và tìm kiếm sau này.

#### Tiêu Chí Chấp Nhận

1. WHEN Export_Button được nhấn, THE Extension SHALL tìm và trích xuất Chat_Title từ DOM
2. IF Chat_Title tồn tại, THEN THE Extension SHALL sử dụng nó làm tên file PDF
3. IF Chat_Title không tồn tại hoặc rỗng, THEN THE Extension SHALL tạo tên file mặc định theo định dạng "gemini-chat-[timestamp]"
4. THE Extension SHALL loại bỏ các ký tự không hợp lệ trong tên file (/, \, :, *, ?, ", <, >, |)
5. THE Extension SHALL giới hạn độ dài tên file ở 100 ký tự để tránh lỗi hệ thống file

### Yêu Cầu 5: Tạo và Xuất File PDF

**User Story:** Là người dùng, tôi muốn nhận được file PDF với định dạng đẹp và dễ đọc, để có thể lưu trữ và chia sẻ cuộc trò chuyện.

#### Tiêu Chí Chấp Nhận

1. WHEN nội dung chat đã được trích xuất, THE PDF_Generator SHALL chuyển đổi HTML thành PDF
2. THE PDF_Generator SHALL áp dụng styling để PDF dễ đọc và chuyên nghiệp
3. THE PDF_Generator SHALL bảo toàn tất cả định dạng văn bản từ HTML gốc
4. THE PDF_Generator SHALL sử dụng font chữ rõ ràng và kích thước phù hợp
5. THE PDF_Generator SHALL thêm margins và padding hợp lý cho các phần tử
6. WHEN PDF được tạo xong, THE Extension SHALL tự động tải xuống file với tên đã xác định
7. THE Extension SHALL hiển thị thông báo thành công sau khi tải xuống hoàn tất

### Yêu Cầu 6: Xử Lý Lỗi và Trạng Thái

**User Story:** Là người dùng, tôi muốn được thông báo rõ ràng về trạng thái và lỗi, để biết extension đang hoạt động hay gặp vấn đề.

#### Tiêu Chí Chấp Nhận

1. WHEN Export_Button được nhấn, THE Extension SHALL hiển thị loading indicator
2. WHILE quá trình xuất PDF đang diễn ra, THE Extension SHALL vô hiệu hóa Export_Button để tránh click trùng lặp
3. IF quá trình xuất PDF thành công, THEN THE Extension SHALL hiển thị thông báo thành công
4. IF quá trình xuất PDF thất bại, THEN THE Extension SHALL hiển thị thông báo lỗi với mô tả cụ thể
5. WHEN quá trình hoàn tất (thành công hoặc thất bại), THE Extension SHALL kích hoạt lại Export_Button
6. THE Extension SHALL ghi log chi tiết các bước thực hiện để hỗ trợ debug

### Yêu Cầu 7: Tương Thích và Hiệu Năng

**User Story:** Là người dùng, tôi muốn extension hoạt động mượt mà và không làm chậm trình duyệt, để có trải nghiệm tốt.

#### Tiêu Chí Chấp Nhận

1. THE Extension SHALL tuân thủ Chrome Extension Manifest V3
2. THE Extension SHALL chỉ hoạt động trên domain của Gemini Business
3. THE Extension SHALL không làm chậm tốc độ tải trang Gemini Business
4. THE Extension SHALL xử lý các cuộc trò chuyện dài (hơn 100 tin nhắn) mà không gây treo trình duyệt
5. THE Extension SHALL giải phóng bộ nhớ sau khi hoàn tất xuất PDF
6. THE Extension SHALL tương thích với các phiên bản Chrome từ 88 trở lên

### Yêu Cầu 8: Quyền và Bảo Mật

**User Story:** Là người dùng, tôi muốn extension chỉ yêu cầu quyền cần thiết và bảo vệ dữ liệu của tôi, để đảm bảo an toàn và riêng tư.

#### Tiêu Chí Chấp Nhận

1. THE Extension SHALL chỉ yêu cầu quyền truy cập vào domain Gemini Business
2. THE Extension SHALL không gửi dữ liệu chat đến bất kỳ server bên ngoài nào
3. THE Extension SHALL xử lý toàn bộ việc tạo PDF ở phía client
4. THE Extension SHALL không lưu trữ nội dung chat vào bộ nhớ local storage hoặc cache
5. THE Extension SHALL khai báo rõ ràng tất cả permissions trong manifest file
