# Hướng dẫn thêm Extension vào Chrome

## Cách 1: Cài đặt từ Source Code (Development)

### Bước 1: Build Extension

```bash
# Trong thư mục project
npm install
npm run build
```

Sau khi build xong, thư mục `dist` sẽ chứa extension.

### Bước 2: Mở Chrome Extensions

Có 3 cách để mở trang quản lý extensions:

1. **Cách 1**: Gõ `chrome://extensions/` vào thanh địa chỉ
2. **Cách 2**: Menu (⋮) → Extensions → Manage Extensions
3. **Cách 3**: Menu (⋮) → More Tools → Extensions

### Bước 3: Bật Developer Mode

Ở góc trên bên phải, bật công tắc "Developer mode"

![Developer Mode](https://developer.chrome.com/static/docs/extensions/mv3/getstarted/image/extensions-page-e0d64d89a6acf_1920.png)

### Bước 4: Load Extension

1. Click nút "Load unpacked" (Tải tiện ích đã giải nén)
2. Chọn thư mục `dist` trong project
3. Click "Select Folder"

### Bước 5: Xác nhận

Extension "Gemini Business to PDF" sẽ xuất hiện trong danh sách với:
- Icon extension
- Tên: "Gemini Business to PDF"
- Version: 1.0.0
- Status: Enabled (màu xanh)

## Cách 2: Cài đặt từ File ZIP (Production)

### Bước 1: Tải File ZIP

Có 2 nguồn để tải:

#### Từ GitHub Release (Khuyến nghị)
1. Truy cập https://github.com/YOUR_USERNAME/YOUR_REPO/releases
2. Chọn release mới nhất
3. Tải file `gemini-business-to-pdf-v*.zip`

#### Từ GitHub Actions Artifacts
1. Truy cập https://github.com/YOUR_USERNAME/YOUR_REPO/actions
2. Chọn workflow run thành công (màu xanh ✓)
3. Scroll xuống phần "Artifacts"
4. Tải "extension-build-*"

### Bước 2: Giải nén File

```bash
# macOS/Linux
unzip gemini-business-to-pdf-v1.0.0.zip -d gemini-extension

# Windows: Click phải → Extract All
```

### Bước 3: Load vào Chrome

Làm theo các bước 2-5 của Cách 1 ở trên, nhưng chọn thư mục đã giải nén thay vì thư mục `dist`.

## Cách 3: Cài đặt từ Chrome Web Store (Sắp có)

1. Truy cập Chrome Web Store
2. Tìm "Gemini Business to PDF"
3. Click "Add to Chrome"
4. Xác nhận permissions

## Kiểm tra Extension đã cài đặt thành công

### 1. Kiểm tra trong Extensions Page

- Mở `chrome://extensions/`
- Tìm "Gemini Business to PDF"
- Đảm bảo toggle ở trạng thái ON (màu xanh)

### 2. Kiểm tra trên Gemini Business

1. Truy cập https://business.gemini.google.com
2. Mở một cuộc trò chuyện
3. Nút "Export to PDF" sẽ xuất hiện ở góc trên bên phải

### 3. Kiểm tra Console (nếu có vấn đề)

1. Trên trang Gemini Business, nhấn F12
2. Chọn tab "Console"
3. Tìm messages từ extension (có prefix "[Gemini PDF]")

## Cập nhật Extension

### Từ Source Code

```bash
git pull
npm install
npm run build
```

Sau đó:
1. Vào `chrome://extensions/`
2. Tìm extension
3. Click nút reload (⟳)

### Từ File ZIP mới

1. Tải file ZIP mới
2. Giải nén
3. Vào `chrome://extensions/`
4. Click "Remove" trên extension cũ
5. Load unpacked extension mới

## Gỡ Extension

1. Mở `chrome://extensions/`
2. Tìm "Gemini Business to PDF"
3. Click "Remove"
4. Xác nhận

## Xử lý sự cố

### Extension không xuất hiện sau khi load

**Kiểm tra:**
- Developer mode đã bật chưa?
- Có chọn đúng thư mục không? (phải chọn thư mục chứa `manifest.json`)
- Có lỗi nào hiển thị không?

**Giải pháp:**
```bash
# Kiểm tra manifest.json có trong thư mục
ls dist/manifest.json

# Nếu không có, build lại
npm run build
```

### Extension bị vô hiệu hóa (disabled)

**Nguyên nhân:**
- Lỗi trong extension
- Manifest không hợp lệ
- Thiếu files cần thiết

**Giải pháp:**
1. Click "Details" trên extension
2. Xem phần "Errors" để biết lỗi cụ thể
3. Fix lỗi và reload extension

### Nút Export không xuất hiện

**Kiểm tra:**
1. Extension có enabled không?
2. Đang ở đúng URL không? (phải là `https://business.gemini.google.com/*`)
3. Có lỗi trong Console không?

**Giải pháp:**
1. Reload extension trong `chrome://extensions/`
2. Refresh trang Gemini Business (Ctrl+R hoặc Cmd+R)
3. Xóa cache và reload (Ctrl+Shift+R hoặc Cmd+Shift+R)

### Lỗi "Extension context invalidated"

**Nguyên nhân:**
Extension đã được reload/update trong khi đang sử dụng

**Giải pháp:**
Refresh lại trang Gemini Business

### Lỗi permissions

**Nguyên nhân:**
Extension không có quyền truy cập domain

**Giải pháp:**
1. Click "Details" trên extension
2. Scroll xuống "Site access"
3. Chọn "On specific sites"
4. Thêm `https://business.gemini.google.com/*`

## Tips

### Pin Extension vào Toolbar

1. Click icon puzzle (🧩) trên toolbar
2. Tìm "Gemini Business to PDF"
3. Click icon pin (📌)

### Xem Logs của Extension

1. Vào `chrome://extensions/`
2. Tìm extension
3. Click "Details"
4. Click "Inspect views: service worker" (nếu có)
5. Hoặc mở Console trên trang Gemini Business (F12)

### Development Tips

Khi đang develop:
```bash
# Terminal 1: Watch mode
npm run dev

# Sau mỗi lần thay đổi:
# 1. Vào chrome://extensions/
# 2. Click reload (⟳) trên extension
# 3. Refresh trang Gemini Business
```

## Tài liệu tham khảo

- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Migration Guide](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Extension Development Basics](https://developer.chrome.com/docs/extensions/mv3/getstarted/)
