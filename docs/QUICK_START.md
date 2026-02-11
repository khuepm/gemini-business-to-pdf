# Quick Start Guide

## 🚀 Cài đặt và sử dụng trong 5 phút

### 1. Build Extension (2 phút)

```bash
# Clone repository
git clone <your-repo-url>
cd gemini-business-to-pdf

# Install và build
npm install
npm run build
```

### 2. Thêm vào Chrome (1 phút)

1. Mở Chrome và gõ: `chrome://extensions/`
2. Bật "Developer mode" (góc trên phải)
3. Click "Load unpacked"
4. Chọn thư mục `dist`

### 3. Sử dụng (1 phút)

1. Truy cập https://business.gemini.google.com
2. Mở một cuộc trò chuyện
3. Click nút "Export to PDF" ở góc trên phải
4. File PDF sẽ tự động download

## 📦 Build và Package

### Build thông thường
```bash
npm run build
```

### Build và tạo ZIP file
```bash
npm run package
```

### Development mode (auto rebuild)
```bash
npm run dev
```

## 🧪 Testing

```bash
# Chạy tất cả tests
npm test

# Watch mode
npm run test:watch
```

## 🔄 CI/CD với GitHub Actions

### Setup (1 lần duy nhất)

1. Push code lên GitHub
2. Workflows sẽ tự động chạy

### Tạo Release mới

```bash
# 1. Cập nhật version trong package.json và manifest.json
# 2. Commit
git add .
git commit -m "Bump version to 1.0.1"
git push

# 3. Tạo tag
git tag v1.0.1
git push origin v1.0.1
```

GitHub Actions sẽ tự động:
- Chạy tests
- Build extension
- Tạo GitHub Release
- Upload file ZIP

## 📚 Tài liệu chi tiết

- [Hướng dẫn cài đặt đầy đủ](INSTALLATION.md)
- [Hướng dẫn thêm vào Chrome](CHROME_INSTALLATION_GUIDE.md)
- [Hướng dẫn CI/CD](CI_CD_GUIDE.md)
- [Chrome Web Store submission](CHROME_WEB_STORE.md)

## ❓ Gặp vấn đề?

### Extension không xuất hiện
```bash
# Rebuild
rm -rf dist
npm run build
```

### Nút Export không hiện
- Kiểm tra extension đã enabled chưa
- Refresh trang Gemini Business
- Xem Console (F12) để check lỗi

### Build bị lỗi
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 🎯 Commands cheat sheet

```bash
npm install          # Cài dependencies
npm run build        # Build production
npm run dev          # Build với watch mode
npm test             # Chạy tests
npm run package      # Build và tạo ZIP
```

## 📊 Project Structure

```
gemini-business-to-pdf/
├── src/              # Source code
├── dist/             # Build output (load vào Chrome)
├── tests/            # Test files
├── docs/             # Documentation
├── .github/          # GitHub Actions workflows
└── scripts/          # Build scripts
```

## 🔗 Links hữu ích

- GitHub Actions: `https://github.com/YOUR_USERNAME/YOUR_REPO/actions`
- Releases: `https://github.com/YOUR_USERNAME/YOUR_REPO/releases`
- Chrome Extensions: `chrome://extensions/`
