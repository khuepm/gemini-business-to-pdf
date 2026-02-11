#!/bin/bash

# Script để build và package extension cho Chrome Web Store

set -e

echo "🚀 Building Gemini Business to PDF Extension..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Clean previous build
echo -e "${BLUE}📦 Cleaning previous build...${NC}"
rm -rf dist
rm -f gemini-business-to-pdf*.zip

# Install dependencies
echo -e "${BLUE}📥 Installing dependencies...${NC}"
npm install

# Run tests
echo -e "${BLUE}🧪 Running tests...${NC}"
npm test

# Build extension
echo -e "${BLUE}🔨 Building extension...${NC}"
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Build failed: dist directory not found${NC}"
    exit 1
fi

# Check required files
echo -e "${BLUE}✅ Checking required files...${NC}"
required_files=("manifest.json" "content.js" "styles/button.css" "icons/icon16.png" "icons/icon48.png" "icons/icon128.png")

for file in "${required_files[@]}"; do
    if [ ! -f "dist/$file" ]; then
        echo -e "${RED}❌ Missing required file: $file${NC}"
        exit 1
    fi
    echo -e "${GREEN}  ✓ $file${NC}"
done

# Get version from package.json
VERSION=$(node -p "require('./package.json').version")
echo -e "${BLUE}📌 Version: $VERSION${NC}"

# Create ZIP file
ZIP_NAME="gemini-business-to-pdf-v${VERSION}.zip"
echo -e "${BLUE}📦 Creating ZIP: $ZIP_NAME${NC}"

cd dist
zip -r "../$ZIP_NAME" .
cd ..

# Get file size
FILE_SIZE=$(du -h "$ZIP_NAME" | cut -f1)

echo ""
echo -e "${GREEN}✅ Build completed successfully!${NC}"
echo -e "${GREEN}📦 Package: $ZIP_NAME ($FILE_SIZE)${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "  1. Test the extension locally:"
echo "     - Open chrome://extensions/"
echo "     - Enable Developer mode"
echo "     - Click 'Load unpacked' and select the 'dist' folder"
echo ""
echo "  2. Upload to Chrome Web Store:"
echo "     - Go to https://chrome.google.com/webstore/devconsole"
echo "     - Upload $ZIP_NAME"
echo ""
echo "  3. Create GitHub Release:"
echo "     git tag v${VERSION}"
echo "     git push origin v${VERSION}"
echo ""
