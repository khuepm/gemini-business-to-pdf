# Chrome Web Store Submission Checklist

Use this checklist to ensure your extension is ready for Chrome Web Store submission.

## Pre-Submission Preparation

### 1. Developer Account Setup
- [ ] Created Chrome Web Store Developer account
- [ ] Paid $5 one-time registration fee
- [ ] Completed developer profile
- [ ] Verified email address
- [ ] Set up payment method (if planning paid extensions in future)

### 2. Extension Testing

#### Functionality Testing
- [ ] Extension loads without errors
- [ ] Export button appears on Gemini Business pages
- [ ] Export button does NOT appear on other websites
- [ ] PDF export works with short conversations (1-10 messages)
- [ ] PDF export works with medium conversations (10-50 messages)
- [ ] PDF export works with long conversations (50-100 messages)
- [ ] PDF export works with very long conversations (100+ messages)
- [ ] Collapsed messages are expanded correctly
- [ ] All formatting is preserved (bold, italic, underline)
- [ ] Code blocks are preserved with formatting
- [ ] Tables are preserved correctly
- [ ] Lists (ordered and unordered) are preserved
- [ ] Links are preserved and clickable in PDF
- [ ] Filename is generated correctly from chat title
- [ ] Fallback filename works when no title exists
- [ ] Invalid characters are removed from filename
- [ ] Long filenames are truncated properly
- [ ] PDF downloads successfully
- [ ] Success notification appears after export
- [ ] Error notification appears on failure
- [ ] Loading indicator shows during export
- [ ] Button is disabled during export
- [ ] Button is re-enabled after export completes
- [ ] Scroll position is preserved after expanding messages

#### Error Handling Testing
- [ ] Handles empty chat gracefully
- [ ] Handles chat with only 1 message
- [ ] Handles messages that fail to expand
- [ ] Handles PDF generation errors
- [ ] Handles download errors
- [ ] Shows appropriate error messages
- [ ] Logs errors to console for debugging

#### Browser Compatibility
- [ ] Tested on Chrome 88
- [ ] Tested on Chrome 100
- [ ] Tested on latest Chrome version
- [ ] Tested on Chromium (if applicable)
- [ ] Tested on Edge (Chromium-based)

#### Operating System Testing
- [ ] Tested on Windows 10/11
- [ ] Tested on macOS
- [ ] Tested on Linux (if applicable)

#### Performance Testing
- [ ] No memory leaks detected
- [ ] CPU usage is reasonable
- [ ] Extension doesn't slow down browser
- [ ] Large conversations don't cause timeout
- [ ] Memory is cleaned up after export

#### Security Testing
- [ ] No console errors or warnings
- [ ] No security vulnerabilities detected
- [ ] No external network requests made
- [ ] No data stored in localStorage/sessionStorage
- [ ] No data stored in IndexedDB
- [ ] Content Security Policy is followed
- [ ] No eval() or similar dangerous functions used

### 3. Code Quality

#### Code Review
- [ ] Code is clean and well-organized
- [ ] No unnecessary console.log statements
- [ ] Comments explain complex logic
- [ ] No TODO or FIXME comments left
- [ ] No dead code or unused imports
- [ ] Consistent code style throughout
- [ ] TypeScript types are properly defined
- [ ] No TypeScript errors
- [ ] No ESLint errors or warnings

#### Build Process
- [ ] Production build completes successfully
- [ ] Build output is optimized and minified
- [ ] Source maps are generated (for debugging)
- [ ] All assets are included in dist folder
- [ ] manifest.json is copied to dist
- [ ] Icons are copied to dist
- [ ] CSS files are copied to dist
- [ ] No development dependencies in production build

### 4. Testing Coverage

#### Unit Tests
- [ ] All unit tests pass
- [ ] Test coverage is adequate (>80%)
- [ ] Edge cases are tested
- [ ] Error conditions are tested

#### Property-Based Tests
- [ ] All property tests pass
- [ ] Tests run with 100+ iterations
- [ ] No flaky tests
- [ ] All properties are validated

#### Integration Tests
- [ ] End-to-end flow is tested
- [ ] All components work together
- [ ] Real-world scenarios are covered

### 5. Documentation

#### README.md
- [ ] Clear description of extension
- [ ] Installation instructions (from source)
- [ ] Usage guide with screenshots
- [ ] Troubleshooting section
- [ ] Privacy policy statement
- [ ] Contact information
- [ ] License information
- [ ] Contributing guidelines

#### CHANGELOG.md
- [ ] Version 1.0.0 documented
- [ ] All features listed
- [ ] Release date included

#### Code Documentation
- [ ] Public APIs are documented
- [ ] Complex functions have comments
- [ ] TypeScript interfaces are documented

## Chrome Web Store Listing

### 1. Basic Information

#### Extension Details
- [ ] Name: "Gemini Business to PDF" (max 45 characters)
- [ ] Summary: Written (max 132 characters)
- [ ] Detailed description: Written (max 16,000 characters)
- [ ] Category: Selected (Productivity)
- [ ] Language: Set (Vietnamese primary, English secondary)

#### Version Information
- [ ] Version number: 1.0.0
- [ ] Version name: Set (optional)

### 2. Visual Assets

#### Icons (Required)
- [ ] Icon 16x16 created and optimized
- [ ] Icon 48x48 created and optimized
- [ ] Icon 128x128 created and optimized
- [ ] All icons are PNG with transparency
- [ ] Icons are recognizable at all sizes
- [ ] Icons follow design guidelines

#### Promotional Images (Required)
- [ ] Small promotional tile (440x280) created
- [ ] Image is high quality
- [ ] Image is under 1MB
- [ ] Image accurately represents extension

#### Promotional Images (Optional but Recommended)
- [ ] Large promotional tile (920x680) created
- [ ] Marquee promotional tile (1400x560) created
- [ ] All images are high quality
- [ ] All images are under 1MB
- [ ] Images follow design guidelines

#### Screenshots (Required - at least 1)
- [ ] Screenshot 1: Main feature (1280x800)
- [ ] Screenshot 2: PDF output (1280x800)
- [ ] Screenshot 3: Features overview (1280x800)
- [ ] Screenshot 4: Privacy & security (1280x800)
- [ ] Screenshot 5: Use cases (1280x800)
- [ ] All screenshots have captions
- [ ] Screenshots are high quality
- [ ] Screenshots accurately show extension
- [ ] Screenshots are under 1MB each

### 3. Store Listing Content

#### Description Quality
- [ ] Clear and concise
- [ ] Highlights key features
- [ ] Explains benefits to users
- [ ] No spelling or grammar errors
- [ ] No misleading claims
- [ ] Follows Chrome Web Store policies
- [ ] Includes use cases
- [ ] Mentions privacy/security

#### Keywords
- [ ] Primary keywords identified
- [ ] Secondary keywords identified
- [ ] Long-tail keywords identified
- [ ] Keywords are relevant
- [ ] Keywords are not spammy

### 4. Privacy & Permissions

#### Privacy Policy
- [ ] Privacy policy document created
- [ ] Privacy policy is clear and accurate
- [ ] Privacy policy URL is accessible
- [ ] Privacy policy explains data handling
- [ ] Privacy policy is GDPR compliant
- [ ] Privacy policy is CCPA compliant

#### Permissions
- [ ] Only necessary permissions requested
- [ ] activeTab permission justified
- [ ] host_permissions justified
- [ ] Permissions explanation written
- [ ] No excessive permissions requested

#### Data Usage
- [ ] Data collection: None (verified)
- [ ] Data transmission: None (verified)
- [ ] Data storage: None (verified)
- [ ] Third-party services: None (verified)

### 5. Support & Contact

#### Support Information
- [ ] Support email set up
- [ ] Support URL provided (GitHub Issues)
- [ ] Website URL provided (GitHub repo)
- [ ] Response process established

#### Legal Information
- [ ] Terms of service (if applicable)
- [ ] License file included (MIT)
- [ ] Copyright information correct

## Technical Requirements

### 1. Manifest.json

#### Manifest V3 Compliance
- [ ] manifest_version: 3
- [ ] name field present
- [ ] version field present (1.0.0)
- [ ] description field present
- [ ] icons field present with all sizes
- [ ] permissions array present
- [ ] host_permissions array present
- [ ] content_scripts array present
- [ ] No deprecated fields used
- [ ] No manifest errors

#### Content Scripts
- [ ] Matches pattern is correct
- [ ] JS files are listed correctly
- [ ] CSS files are listed correctly
- [ ] run_at is set appropriately
- [ ] No unnecessary scripts included

### 2. File Structure

#### Required Files
- [ ] manifest.json in root of dist
- [ ] All icon files present
- [ ] All JS files present
- [ ] All CSS files present
- [ ] No unnecessary files in dist

#### File Sizes
- [ ] Total extension size < 10MB
- [ ] Individual files are optimized
- [ ] No large unnecessary assets

### 3. Package Creation

#### ZIP File
- [ ] Created ZIP of dist folder contents
- [ ] ZIP file is under 10MB
- [ ] ZIP contains only necessary files
- [ ] ZIP structure is correct (no nested folders)
- [ ] ZIP file name is descriptive

## Submission Process

### 1. Upload Extension

#### Developer Dashboard
- [ ] Logged into Chrome Web Store Developer Dashboard
- [ ] Clicked "New Item"
- [ ] Uploaded ZIP file
- [ ] Upload completed successfully
- [ ] No upload errors

### 2. Fill Store Listing

#### Product Details
- [ ] Name entered
- [ ] Summary entered
- [ ] Description entered
- [ ] Category selected
- [ ] Language selected

#### Graphic Assets
- [ ] Icon uploaded
- [ ] Small promotional tile uploaded
- [ ] Large promotional tile uploaded (optional)
- [ ] Marquee tile uploaded (optional)
- [ ] All screenshots uploaded
- [ ] All captions added

#### Additional Fields
- [ ] Official URL entered
- [ ] Homepage URL entered
- [ ] Support URL entered
- [ ] Privacy policy URL entered

### 3. Privacy Practices

#### Privacy Tab
- [ ] Data usage disclosure completed
- [ ] "Does not collect data" selected
- [ ] Permissions justified
- [ ] Privacy policy linked

### 4. Distribution

#### Visibility
- [ ] Visibility set (Public/Unlisted/Private)
- [ ] Regions selected (Worldwide recommended)
- [ ] Pricing set (Free)

#### Audience
- [ ] Mature content: No
- [ ] Target audience defined

### 5. Review & Submit

#### Final Review
- [ ] Previewed store listing
- [ ] All information is correct
- [ ] All images display correctly
- [ ] All links work
- [ ] No errors or warnings

#### Submission
- [ ] Clicked "Submit for Review"
- [ ] Confirmation received
- [ ] Submission ID noted

## Post-Submission

### 1. Review Process

#### Monitoring
- [ ] Check dashboard daily for status updates
- [ ] Check email for notifications
- [ ] Respond promptly to any requests from Google

#### Expected Timeline
- [ ] Aware that review takes 1-3 days typically
- [ ] Prepared to wait up to 1 week
- [ ] Have plan for addressing rejection

### 2. If Approved

#### Launch Activities
- [ ] Verify extension is live in store
- [ ] Test installation from store
- [ ] Announce launch on social media
- [ ] Post on Product Hunt
- [ ] Share on relevant forums/communities
- [ ] Update GitHub README with store link

#### Monitoring
- [ ] Set up alerts for reviews
- [ ] Monitor installation metrics
- [ ] Track user feedback
- [ ] Monitor error reports

### 3. If Rejected

#### Response Plan
- [ ] Read rejection reason carefully
- [ ] Address all issues mentioned
- [ ] Make necessary changes
- [ ] Re-test thoroughly
- [ ] Re-submit with explanation

#### Common Rejection Reasons
- [ ] Misleading description
- [ ] Excessive permissions
- [ ] Privacy policy issues
- [ ] Functionality issues
- [ ] Policy violations

## Ongoing Maintenance

### 1. User Support

#### Response Plan
- [ ] Process for handling user reviews
- [ ] Process for handling support emails
- [ ] Process for handling GitHub issues
- [ ] Target response time: 24-48 hours

### 2. Updates

#### Update Strategy
- [ ] Bug fix process defined
- [ ] Feature update process defined
- [ ] Version numbering scheme
- [ ] Changelog maintenance

### 3. Metrics

#### Track These Metrics
- [ ] Daily/weekly installs
- [ ] Total users
- [ ] Uninstall rate
- [ ] Star rating
- [ ] Review sentiment
- [ ] Support ticket volume

## Legal & Compliance

### 1. Licenses

#### Open Source
- [ ] MIT License file included
- [ ] Third-party licenses acknowledged
- [ ] Copyright notices correct

### 2. Trademarks

#### Compliance
- [ ] Not using Google trademarks improperly
- [ ] Not using Gemini trademarks improperly
- [ ] Clear that extension is unofficial
- [ ] No trademark violations

### 3. Privacy Regulations

#### GDPR
- [ ] Privacy policy is GDPR compliant
- [ ] No data collection (compliant by default)
- [ ] User rights respected

#### CCPA
- [ ] Privacy policy is CCPA compliant
- [ ] No personal information collected
- [ ] No data sold or shared

## Final Checks

### Before Clicking Submit

#### Triple Check
- [ ] Extension name is correct
- [ ] Version number is correct
- [ ] All images are correct
- [ ] All links work
- [ ] Privacy policy is accessible
- [ ] Support email works
- [ ] Extension actually works as described

#### Team Review
- [ ] At least one other person reviewed
- [ ] Feedback incorporated
- [ ] All concerns addressed

#### Backup
- [ ] Source code backed up
- [ ] All assets backed up
- [ ] Submission details documented

---

## Submission Checklist Summary

**Total Items**: ~200+

**Critical Items** (Must have):
- [ ] Extension works correctly
- [ ] No security issues
- [ ] Privacy policy present
- [ ] At least 1 screenshot
- [ ] Small promotional tile
- [ ] All required icons
- [ ] Manifest V3 compliant
- [ ] Permissions justified

**Recommended Items** (Should have):
- [ ] 5 screenshots
- [ ] Large promotional tile
- [ ] Comprehensive testing
- [ ] Good documentation
- [ ] Support channels set up

**Optional Items** (Nice to have):
- [ ] Marquee promotional tile
- [ ] Multiple language support
- [ ] Video demo
- [ ] Press kit

---

## Quick Reference

### Minimum Requirements for Submission
1. Working extension (ZIP file)
2. Name, summary, description
3. Category and language
4. Icons (16, 48, 128)
5. Small promotional tile (440x280)
6. At least 1 screenshot
7. Privacy policy
8. Support email

### Recommended for Success
1. All of the above
2. 5 high-quality screenshots
3. Large promotional tile
4. Comprehensive description
5. Clear value proposition
6. Professional design
7. Thorough testing
8. Good documentation

---

**Last Updated**: January 2024
**Version**: 1.0.0

**Note**: This checklist is comprehensive but not exhaustive. Always refer to the official Chrome Web Store Developer Program Policies for the most up-to-date requirements.
