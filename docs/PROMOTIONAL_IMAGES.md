# Promotional Images Guide

This document provides specifications and design guidelines for creating promotional images for the Chrome Web Store listing.

## Required Images

### 1. Extension Icons (Required)

#### Icon 16x16
- **File**: `icons/icon16.png`
- **Size**: 16x16 pixels
- **Format**: PNG with transparency
- **Usage**: Browser toolbar, extension menu
- **Design Notes**:
  - Simplified version of main icon
  - Must be recognizable at tiny size
  - Use solid colors, avoid gradients
  - No text

#### Icon 48x48
- **File**: `icons/icon48.png`
- **Size**: 48x48 pixels
- **Format**: PNG with transparency
- **Usage**: Extension management page
- **Design Notes**:
  - Medium detail level
  - Clear and recognizable
  - Consistent with 128x128 design

#### Icon 128x128
- **File**: `icons/icon128.png`
- **Size**: 128x128 pixels
- **Format**: PNG with transparency
- **Usage**: Chrome Web Store listing, installation dialog
- **Design Notes**:
  - Full detail version
  - Professional and polished
  - Represents PDF export functionality
  - Use Gemini-inspired colors (blue, purple)

### 2. Promotional Tiles

#### Small Promotional Tile (Required)
- **Size**: 440x280 pixels
- **Format**: PNG or JPEG
- **File size**: < 1MB
- **Usage**: Search results in Chrome Web Store

**Design Specifications**:
```
┌─────────────────────────────────────┐
│                                     │
│         [PDF Icon]                  │
│                                     │
│    Gemini Business to PDF           │
│                                     │
│    Export conversations easily      │
│                                     │
└─────────────────────────────────────┘
```

**Design Elements**:
- Background: Gradient (Gemini blue #1a73e8 to purple #8e24aa)
- Main icon: Large PDF document with arrow
- Title: "Gemini Business to PDF" (white, bold, 32px)
- Subtitle: "Export conversations easily" (white, 18px)
- Keep design simple and readable

#### Large Promotional Tile (Optional but Recommended)
- **Size**: 920x680 pixels
- **Format**: PNG or JPEG
- **File size**: < 1MB
- **Usage**: Featured placement in Chrome Web Store

**Design Specifications**:
```
┌───────────────────────────────────────────────────┐
│                                                   │
│  [Screenshot]     Gemini Business to PDF         │
│   of Gemini                                       │
│   with button     ✓ Auto-expand messages         │
│                   ✓ Preserve formatting           │
│                   ✓ Smart filename                │
│                   ✓ 100% Private & Secure         │
│                                                   │
│                   [Free & Open Source Badge]      │
│                                                   │
└───────────────────────────────────────────────────┘
```

**Design Elements**:
- Left side (40%): Screenshot of Gemini with export button highlighted
- Right side (60%):
  - Extension name (large, bold)
  - 4 key features with checkmarks
  - "Free & Open Source" badge
  - Professional color scheme
- Background: Clean white or light gradient

#### Marquee Promotional Tile (Optional)
- **Size**: 1400x560 pixels
- **Format**: PNG or JPEG
- **File size**: < 1MB
- **Usage**: Top banner in Chrome Web Store (if featured)

**Design Specifications**:
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  [Icon]   Export Gemini Conversations to PDF    [Screenshot]   │
│   Large                                          Preview        │
│           Fast • Secure • Format-Preserving                     │
│                                                                 │
│           [Privacy] [Speed] [Quality] icons                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Design Elements**:
- Left: Large extension icon/logo
- Center: 
  - Main headline (48px, bold)
  - Feature tagline (24px)
  - 3 feature icons with labels
- Right: Screenshot preview
- Professional, clean, modern design

### 3. Screenshots (Required - at least 1, recommended 5)

#### Screenshot Specifications
- **Size**: 1280x800 pixels (16:10 ratio) OR 640x400 pixels
- **Format**: PNG or JPEG
- **File size**: < 1MB each
- **Maximum**: 5 screenshots

#### Screenshot 1: Main Feature (Required)
**Caption**: "Export button integrates seamlessly into Gemini Business"

**Content**:
- Full Gemini Business interface
- Export PDF button clearly visible and highlighted
- Arrow or annotation pointing to button
- Clean, professional screenshot

**How to Create**:
1. Open Gemini Business in Chrome
2. Ensure extension is installed
3. Take screenshot at 1280x800 resolution
4. Add subtle highlight/arrow to export button
5. Crop and optimize

#### Screenshot 2: PDF Output
**Caption**: "Beautiful PDF output with preserved formatting"

**Content**:
- Split screen design
- Left: Gemini chat interface
- Right: Generated PDF preview
- Show code blocks, tables, or formatted content
- Demonstrate format preservation

**How to Create**:
1. Export a conversation with rich formatting
2. Open the PDF
3. Create side-by-side comparison
4. Add labels "Original" and "PDF Output"
5. Highlight preserved formatting

#### Screenshot 3: Features Overview
**Caption**: "Powerful features for your workflow"

**Content**:
- Feature showcase design
- Icons + text for each feature:
  - 🔄 Auto-expand messages
  - 📝 Preserve formatting
  - 📁 Smart filename
  - 🔒 Client-side processing
  - 🚫 No data collection
- Professional layout
- Consistent branding

**How to Create**:
1. Design in Figma/Canva/Photoshop
2. Use extension colors
3. Clear, readable icons
4. Professional typography
5. Export at 1280x800

#### Screenshot 4: Privacy & Security
**Caption**: "Your data stays private - 100% client-side processing"

**Content**:
- Privacy-focused design
- Large shield or lock icon
- Key privacy points:
  - "No data sent to external servers"
  - "No storage or tracking"
  - "Open source & auditable"
  - "GDPR & CCPA compliant"
- Trust badges
- Professional, reassuring design

**How to Create**:
1. Design privacy-focused graphic
2. Use security-related icons
3. Clear, bold statements
4. Professional color scheme
5. Export at 1280x800

#### Screenshot 5: Use Cases
**Caption**: "Perfect for documentation, sharing, and archiving"

**Content**:
- Use case showcase
- 4-6 use case cards:
  - 📚 Documentation
  - 👥 Team Collaboration
  - 🔬 Research Backup
  - 📖 Training Materials
  - 💼 Business Records
  - 🎓 Academic Work
- Icons + short descriptions
- Professional layout

**How to Create**:
1. Design use case cards
2. Use relevant icons
3. Brief, clear descriptions
4. Consistent styling
5. Export at 1280x800

## Design Guidelines

### Color Palette

#### Primary Colors
- **Gemini Blue**: #1a73e8
- **Gemini Purple**: #8e24aa
- **White**: #ffffff
- **Dark Text**: #202124

#### Secondary Colors
- **Success Green**: #34a853
- **Light Gray**: #f8f9fa
- **Medium Gray**: #5f6368
- **Border Gray**: #dadce0

### Typography

#### Fonts
- **Primary**: Roboto (Google's font)
- **Fallback**: Arial, Helvetica, sans-serif

#### Font Sizes
- **Large Headline**: 48px (bold)
- **Medium Headline**: 32px (bold)
- **Subheadline**: 24px (medium)
- **Body Text**: 18px (regular)
- **Small Text**: 14px (regular)

### Icon Style

#### Design Principles
- **Flat design**: No 3D effects
- **Rounded corners**: 8-12px radius
- **Consistent stroke**: 2-3px width
- **Simple shapes**: Easy to recognize
- **Professional**: Not cartoonish

#### PDF Icon Concept
```
┌─────────┐
│ ┌─────┐ │
│ │ PDF │ │  ← Document with "PDF" text
│ │     │ │
│ └─────┘ │
│    ↓    │  ← Download arrow
└─────────┘
```

Alternative: Document with Gemini colors gradient

### Layout Principles

#### Composition
- **Rule of thirds**: Place key elements at intersection points
- **Visual hierarchy**: Most important info largest/first
- **White space**: Don't overcrowd
- **Alignment**: Keep elements aligned
- **Balance**: Distribute visual weight evenly

#### Readability
- **High contrast**: Text must be easily readable
- **Font size**: Large enough to read in thumbnails
- **Line length**: Not too long (50-75 characters)
- **Line height**: 1.5x font size for body text

## Tools for Creating Images

### Recommended Tools

#### Professional (Paid)
- **Adobe Photoshop**: Industry standard, full control
- **Adobe Illustrator**: Vector graphics, scalable
- **Sketch**: Mac-only, great for UI design
- **Figma**: Web-based, collaborative

#### Free Alternatives
- **GIMP**: Free Photoshop alternative
- **Inkscape**: Free vector graphics editor
- **Canva**: Easy-to-use, templates available
- **Photopea**: Web-based Photoshop alternative

#### Screenshot Tools
- **Chrome DevTools**: Device mode for consistent sizes
- **Lightshot**: Easy screenshot annotation
- **Snagit**: Professional screenshot tool
- **macOS Screenshot**: Built-in (Cmd+Shift+4)

### Templates

#### Canva Templates
Search for:
- "Chrome Extension Promo"
- "App Store Screenshot"
- "Software Promotion"
- "Tech Product Banner"

#### Figma Community
Search for:
- "Chrome Web Store Assets"
- "Extension Promotional Images"
- "App Store Screenshots"

## Image Optimization

### File Size Optimization

#### PNG Images
```bash
# Using pngquant (lossy compression)
pngquant --quality=80-95 input.png -o output.png

# Using optipng (lossless compression)
optipng -o7 input.png
```

#### JPEG Images
```bash
# Using ImageMagick
convert input.jpg -quality 85 output.jpg

# Using jpegoptim
jpegoptim --max=85 input.jpg
```

### Online Tools
- **TinyPNG**: https://tinypng.com/
- **Squoosh**: https://squoosh.app/
- **Compressor.io**: https://compressor.io/

## Quality Checklist

### Before Submission

#### Technical Quality
- [ ] Correct dimensions for each image
- [ ] File size under 1MB
- [ ] High resolution (no pixelation)
- [ ] Proper format (PNG for transparency, JPEG for photos)
- [ ] No compression artifacts

#### Design Quality
- [ ] Professional appearance
- [ ] Consistent branding
- [ ] Readable text (even in thumbnails)
- [ ] High contrast
- [ ] No spelling errors

#### Content Quality
- [ ] Accurately represents extension
- [ ] Shows key features
- [ ] Clear value proposition
- [ ] No misleading claims
- [ ] Follows Chrome Web Store policies

#### Accessibility
- [ ] Text readable for colorblind users
- [ ] Sufficient contrast ratios
- [ ] Not relying solely on color to convey info
- [ ] Clear visual hierarchy

## Examples and Inspiration

### Similar Extensions to Study
- Grammarly
- LastPass
- Honey
- Momentum
- Dark Reader

### What to Look For
- How they showcase features
- Screenshot composition
- Color schemes
- Typography choices
- Call-to-action placement

## Asset Delivery

### File Naming Convention
```
icon-16.png
icon-48.png
icon-128.png
promo-small-440x280.png
promo-large-920x680.png
promo-marquee-1400x560.png
screenshot-1-main-feature.png
screenshot-2-pdf-output.png
screenshot-3-features.png
screenshot-4-privacy.png
screenshot-5-use-cases.png
```

### Folder Structure
```
promotional-assets/
├── icons/
│   ├── icon-16.png
│   ├── icon-48.png
│   └── icon-128.png
├── promo-tiles/
│   ├── promo-small-440x280.png
│   ├── promo-large-920x680.png
│   └── promo-marquee-1400x560.png
├── screenshots/
│   ├── screenshot-1-main-feature.png
│   ├── screenshot-2-pdf-output.png
│   ├── screenshot-3-features.png
│   ├── screenshot-4-privacy.png
│   └── screenshot-5-use-cases.png
└── source-files/
    ├── icons.psd
    ├── promo-tiles.fig
    └── screenshots.sketch
```

## Chrome Web Store Policies

### What to Avoid

#### Prohibited Content
- ❌ Misleading claims
- ❌ Fake reviews or ratings
- ❌ Competitor comparisons
- ❌ Inappropriate content
- ❌ Copyright violations

#### Design Don'ts
- ❌ Low-quality or pixelated images
- ❌ Excessive text
- ❌ Cluttered layouts
- ❌ Inconsistent branding
- ❌ Unreadable fonts

### Best Practices

#### Do's
- ✅ Show actual extension UI
- ✅ Demonstrate real features
- ✅ Use high-quality images
- ✅ Keep it simple and clear
- ✅ Maintain consistent branding

## Timeline

### Recommended Schedule

**Week 1: Planning**
- Define key messages
- Gather inspiration
- Create mood board
- Sketch layouts

**Week 2: Design**
- Create icons (all sizes)
- Design promotional tiles
- Create screenshot mockups
- Get feedback

**Week 3: Refinement**
- Iterate based on feedback
- Optimize images
- Create variations
- Final review

**Week 4: Delivery**
- Export all assets
- Optimize file sizes
- Organize files
- Prepare for upload

## Resources

### Stock Images
- Unsplash: https://unsplash.com/
- Pexels: https://pexels.com/
- Pixabay: https://pixabay.com/

### Icons
- Feather Icons: https://feathericons.com/
- Material Icons: https://material.io/icons/
- Font Awesome: https://fontawesome.com/

### Colors
- Coolors: https://coolors.co/
- Adobe Color: https://color.adobe.com/
- Material Design Colors: https://materialui.co/colors/

### Fonts
- Google Fonts: https://fonts.google.com/
- Font Squirrel: https://fontsquirrel.com/

---

**Note**: All promotional images should accurately represent the extension's functionality and follow Chrome Web Store guidelines. When in doubt, keep it simple, professional, and honest.
