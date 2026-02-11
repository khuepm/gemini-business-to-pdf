# Hướng dẫn cài đặt Extension

## Cài đặt từ Source Code

### Yêu cầu
- Node.js 20 trở lên
- npm hoặc yarn

### Các bước cài đặt

#### 1. Clone repository
```bash
git clone <repository-url>
cd gemini-business-to-pdf
```

#### 2. Cài đặt dependencies
```bash
npm install
```

#### 3. Build extension
```bash
npm run build
```

Sau khi build xong, thư mục `dist` sẽ chứa extension đã được build.

#### 4. Cài đặt extension vào Chrome

##### Bước 1: Mở Chrome Extensions
- Mở Chrome browser
- Truy cập `chrome://extensions/`
- Hoặc: Menu (⋮) → Extensions → Manage Extensions

##### Bước 2: Bật Developer Mode
- Bật công tắc "Developer mode" ở góc trên bên phải

##### Bước 3: Load Extension
- Click nút "Load unpacked"
- Chọn thư mục `dist` trong project của bạn
- Extension sẽ được cài đặt và kích hoạt

##### Bước 4: Xác nhận cài đặt
- Extension "Gemini Business to PDF" sẽ xuất hiện trong danh sách
- Icon extension sẽ hiển thị trên thanh công cụ Chrome

#### 5. Sử dụng Extension

1. Truy cập https://business.gemini.google.com
2. Mở một cuộc trò chuyện
3. Nút "Export to PDF" sẽ xuất hiện trên giao diện
4. Click nút để xuất cuộc trò chuyện thành PDF

## Cài đặt từ GitHub Actions Build

### Tải file build từ GitHub

#### Từ Release (Khuyến nghị)
1. Truy cập trang Releases của repository
2. Tải file `gemini-business-to-pdf-v*.zip` từ release mới nhất
3. Giải nén file ZIP

#### Từ Actions Artifacts
1. Truy cập tab "Actions" trên GitHub repository
2. Chọn workflow run thành công
3. Tải artifact "extension-build-*"
4. Giải nén file ZIP

### Cài đặt vào Chrome

1. Mở `chrome://extensions/`
2. Bật "Developer mode"
3. Click "Load unpacked"
4. Chọn thư mục đã giải nén
5. Extension sẽ được cài đặt

## Development Mode

Để phát triển extension với hot reload:

```bash
npm run dev
```

Lệnh này sẽ watch các thay đổi và tự động rebuild. Sau mỗi lần rebuild, bạn cần:
1. Vào `chrome://extensions/`
2. Click nút reload (⟳) trên extension

## Gỡ lỗi

### Extension không xuất hiện
- Kiểm tra Developer mode đã được bật
- Kiểm tra thư mục `dist` có đầy đủ file
- Xem Console trong Chrome DevTools để kiểm tra lỗi

### Nút Export không xuất hiện
- Đảm bảo bạn đang ở đúng URL: `https://business.gemini.google.com/*`
- Mở DevTools (F12) và kiểm tra Console để xem lỗi
- Reload lại trang web

### Lỗi khi build
```bash
# Xóa node_modules và cài lại
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Đóng gói để phân phối

### Tạo file ZIP cho Chrome Web Store

```bash
# Build extension
npm run build

# Tạo ZIP
cd dist
zip -r ../gemini-business-to-pdf.zip .
cd ..
```

File `gemini-business-to-pdf.zip` có thể được upload lên Chrome Web Store.

## Cập nhật Extension

### Cập nhật từ source code
```bash
git pull
npm install
npm run build
```

Sau đó reload extension trong `chrome://extensions/`

### Cập nhật version
1. Cập nhật version trong `package.json`
2. Cập nhật version trong `manifest.json`
3. Commit và tạo tag:
```bash
git tag v1.0.1
git push origin v1.0.1
```

GitHub Actions sẽ tự động build và tạo release.

## Hỗ trợ

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra phần Gỡ lỗi ở trên
2. Xem Issues trên GitHub repository
3. Tạo Issue mới với thông tin chi tiết về lỗi
