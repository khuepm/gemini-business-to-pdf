# Hướng dẫn CI/CD với GitHub Actions

## Tổng quan

Project sử dụng GitHub Actions để tự động hóa quá trình build, test và release extension.

## Workflows

### 1. Build Workflow (`.github/workflows/build.yml`)

**Kích hoạt khi:**
- Push code lên branch `main` hoặc `develop`
- Tạo Pull Request vào branch `main`
- Trigger thủ công từ GitHub UI

**Các bước thực hiện:**
1. Checkout code
2. Setup Node.js 20
3. Install dependencies với npm ci
4. Chạy tests
5. Build extension
6. Tạo file ZIP
7. Upload artifacts

**Artifacts được tạo:**
- `extension-build-{SHA}`: File ZIP của extension
- `dist-folder`: Thư mục dist để debug

**Retention:**
- ZIP file: 30 ngày
- Dist folder: 7 ngày

### 2. Release Workflow (`.github/workflows/release.yml`)

**Kích hoạt khi:**
- Push tag có format `v*` (vd: `v1.0.0`, `v1.2.3`)

**Các bước thực hiện:**
1. Checkout code
2. Setup Node.js 20
3. Install dependencies
4. Chạy tests
5. Build extension
6. Tạo file ZIP với tên version
7. Tạo GitHub Release
8. Upload ZIP file vào Release

**Output:**
- GitHub Release với file ZIP đính kèm
- Release notes tự động từ commits

## Cách sử dụng

### Build tự động khi Push

```bash
# Commit và push code
git add .
git commit -m "Add new feature"
git push origin main
```

GitHub Actions sẽ tự động:
1. Chạy tests
2. Build extension
3. Upload artifacts

Xem kết quả tại: `https://github.com/YOUR_USERNAME/YOUR_REPO/actions`

### Tạo Release mới

#### Bước 1: Cập nhật Version

Cập nhật version trong 2 files:

**package.json:**
```json
{
  "version": "1.0.1"
}
```

**manifest.json:**
```json
{
  "version": "1.0.1"
}
```

#### Bước 2: Commit Changes

```bash
git add package.json manifest.json
git commit -m "Bump version to 1.0.1"
git push origin main
```

#### Bước 3: Tạo và Push Tag

```bash
# Tạo tag
git tag v1.0.1

# Push tag
git push origin v1.0.1
```

#### Bước 4: Kiểm tra Release

1. Truy cập `https://github.com/YOUR_USERNAME/YOUR_REPO/actions`
2. Xem workflow "Release Extension" đang chạy
3. Sau khi hoàn thành, truy cập `https://github.com/YOUR_USERNAME/YOUR_REPO/releases`
4. Release mới sẽ xuất hiện với file ZIP đính kèm

### Download Artifacts

#### Từ Actions

1. Truy cập `https://github.com/YOUR_USERNAME/YOUR_REPO/actions`
2. Click vào workflow run
3. Scroll xuống phần "Artifacts"
4. Click để download

#### Từ Releases

1. Truy cập `https://github.com/YOUR_USERNAME/YOUR_REPO/releases`
2. Chọn release
3. Download file ZIP trong phần "Assets"

## Cấu hình Workflows

### Thay đổi Node.js Version

Trong cả 2 workflow files, tìm:

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'  # Thay đổi version ở đây
```

### Thay đổi Branches

Trong `build.yml`, tìm:

```yaml
on:
  push:
    branches: [ main, develop ]  # Thêm/bớt branches
  pull_request:
    branches: [ main ]
```

### Thay đổi Retention Period

Trong `build.yml`, tìm:

```yaml
- name: Upload build artifact
  uses: actions/upload-artifact@v4
  with:
    retention-days: 30  # Thay đổi số ngày
```

### Thêm Environment Variables

```yaml
- name: Build extension
  run: npm run build
  env:
    NODE_ENV: production
    CUSTOM_VAR: value
```

## Secrets và Permissions

### GitHub Token

Workflow sử dụng `GITHUB_TOKEN` tự động được cung cấp bởi GitHub Actions.

**Permissions cần thiết:**
- `contents: write` - Để tạo releases

Đã được cấu hình trong `release.yml`:

```yaml
permissions:
  contents: write
```

### Thêm Custom Secrets

Nếu cần secrets khác (vd: API keys):

1. Vào repository Settings
2. Chọn "Secrets and variables" → "Actions"
3. Click "New repository secret"
4. Thêm secret

Sử dụng trong workflow:

```yaml
- name: Deploy
  env:
    API_KEY: ${{ secrets.API_KEY }}
  run: ./deploy.sh
```

## Monitoring và Debugging

### Xem Logs

1. Truy cập Actions tab
2. Click vào workflow run
3. Click vào job (vd: "build")
4. Xem logs của từng step

### Re-run Failed Workflows

1. Mở workflow run bị failed
2. Click "Re-run jobs" → "Re-run failed jobs"

### Debug với SSH (nếu cần)

Thêm step này vào workflow:

```yaml
- name: Setup tmate session
  uses: mxschmitt/action-tmate@v3
  if: failure()
```

## Best Practices

### 1. Version Numbering

Sử dụng [Semantic Versioning](https://semver.org/):
- `MAJOR.MINOR.PATCH` (vd: `1.2.3`)
- MAJOR: Breaking changes
- MINOR: New features (backward compatible)
- PATCH: Bug fixes

### 2. Commit Messages

Format tốt cho auto-generated release notes:

```
feat: Add export to markdown feature
fix: Fix PDF generation for long conversations
docs: Update installation guide
chore: Update dependencies
```

### 3. Testing trước Release

```bash
# Local test
npm test
npm run build

# Test extension
# Load dist folder vào Chrome và test thủ công
```

### 4. Rollback nếu có vấn đề

```bash
# Xóa tag local
git tag -d v1.0.1

# Xóa tag remote
git push origin :refs/tags/v1.0.1

# Xóa release trên GitHub UI
```

## Troubleshooting

### Workflow không chạy

**Kiểm tra:**
- Workflow files có trong `.github/workflows/`?
- Syntax YAML có đúng không?
- Branch/tag có match với trigger không?

**Giải pháp:**
```bash
# Validate YAML
npm install -g yaml-validator
yaml-validator .github/workflows/*.yml
```

### Tests fail trên CI nhưng pass local

**Nguyên nhân:**
- Environment khác nhau
- Dependencies version khác
- Timezone/locale khác

**Giải pháp:**
```yaml
# Thêm vào workflow
- name: Debug environment
  run: |
    node --version
    npm --version
    npm list
```

### Build artifacts quá lớn

**Giải pháp:**
- Kiểm tra `dist` folder có chứa `node_modules` không
- Đảm bảo `.gitignore` đúng
- Optimize build configuration

### Permission denied khi tạo Release

**Kiểm tra:**
```yaml
permissions:
  contents: write  # Cần có permission này
```

## Tích hợp với Chrome Web Store

### Tự động publish (Advanced)

Có thể tự động publish lên Chrome Web Store bằng API:

```yaml
- name: Publish to Chrome Web Store
  env:
    CLIENT_ID: ${{ secrets.CHROME_CLIENT_ID }}
    CLIENT_SECRET: ${{ secrets.CHROME_CLIENT_SECRET }}
    REFRESH_TOKEN: ${{ secrets.CHROME_REFRESH_TOKEN }}
  run: |
    # Upload và publish extension
    # Xem: https://developer.chrome.com/docs/webstore/using_webstore_api/
```

**Lưu ý:** Cần setup OAuth credentials từ Google Cloud Console.

## Status Badges

Thêm badges vào README.md:

```markdown
[![Build Extension](https://github.com/USERNAME/REPO/actions/workflows/build.yml/badge.svg)](https://github.com/USERNAME/REPO/actions/workflows/build.yml)
[![Release](https://github.com/USERNAME/REPO/actions/workflows/release.yml/badge.svg)](https://github.com/USERNAME/REPO/actions/workflows/release.yml)
```

Thay `USERNAME` và `REPO` bằng thông tin thực tế.

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Chrome Web Store API](https://developer.chrome.com/docs/webstore/using_webstore_api/)
- [Semantic Versioning](https://semver.org/)
