# Privacy Policy - Gemini Business to PDF

**Last Updated**: January 2024

## Introduction

Gemini Business to PDF ("we", "our", or "the extension") is committed to protecting your privacy. This Privacy Policy explains how we handle information when you use our Chrome extension.

## TL;DR (Summary)

**We do NOT collect, store, or transmit ANY of your data. Period.**

All processing happens locally in your browser. Your conversations stay private.

## Information Collection and Use

### What We DO NOT Collect

Gemini Business to PDF does **NOT** collect, store, or transmit:

- ❌ Personal information (name, email, etc.)
- ❌ Chat conversations or content
- ❌ Usage statistics or analytics
- ❌ Browsing history
- ❌ IP addresses
- ❌ Device information
- ❌ Location data
- ❌ Cookies or tracking data
- ❌ Any other personal or non-personal information

### What We DO

✅ **Process data locally**: All chat content is processed entirely within your browser
✅ **Generate PDFs locally**: PDF creation happens on your device
✅ **Download files locally**: PDF files are saved directly to your computer
✅ **Respect your privacy**: We have no servers, no databases, no data collection

## How the Extension Works

1. **You click "Export PDF"**: The extension activates only when you explicitly click the export button
2. **Content extraction**: The extension reads the chat content from the current page's DOM
3. **Local processing**: All data processing happens in your browser's memory
4. **PDF generation**: The PDF is created using client-side JavaScript libraries
5. **Download**: The PDF is saved directly to your computer
6. **Cleanup**: All temporary data is immediately cleared from memory

**At no point is any data sent to external servers.**

## Data Storage

### Local Storage
The extension does **NOT** use:
- localStorage
- sessionStorage
- IndexedDB
- Chrome storage APIs
- Cookies
- Cache

### Temporary Memory
The extension temporarily holds chat content in browser memory during the export process. This data is:
- Only in RAM (never written to disk by the extension)
- Automatically cleared when the export completes
- Never persisted beyond the export operation

## Network Activity

### No External Requests
The extension does **NOT**:
- Make network requests to external servers
- Send data to analytics services
- Connect to third-party APIs
- Transmit data over the internet
- Use CDNs for runtime resources

### Verification
You can verify this by:
1. Opening Chrome DevTools (F12)
2. Going to the Network tab
3. Using the extension
4. Observing that no external requests are made

## Permissions Explanation

The extension requests the following Chrome permissions:

### activeTab
**Purpose**: To access the content of the current Gemini Business tab

**Why needed**: The extension needs to read the chat content from the page to export it to PDF

**What it does NOT do**: 
- Does not access other tabs
- Does not track your browsing
- Only activates when you click the export button

### host_permissions (https://gemini.google.com/*)
**Purpose**: To inject the export button into Gemini Business pages

**Why needed**: The extension needs to add the "Export PDF" button to the Gemini interface

**What it does NOT do**:
- Does not access other websites
- Does not track your activity on Gemini
- Only injects UI elements, does not modify chat functionality

## Third-Party Services

### None
The extension does **NOT** use any third-party services:
- No analytics (Google Analytics, Mixpanel, etc.)
- No error tracking (Sentry, Rollbar, etc.)
- No advertising networks
- No social media integrations
- No external APIs

### PDF Library
The extension uses **html2pdf.js**, an open-source JavaScript library that runs entirely in your browser. This library:
- Is bundled with the extension
- Does not make external requests
- Does not collect data
- Processes everything locally

## Data Security

### Client-Side Processing
Since all processing happens in your browser:
- Your data never leaves your device
- No transmission over networks
- No server-side vulnerabilities
- No data breach risks from our side

### Open Source
The extension's source code is publicly available on GitHub:
- You can audit the code yourself
- Security researchers can review it
- Community can verify our privacy claims
- Transparent development process

## Children's Privacy

The extension does not knowingly collect information from anyone, including children under 13. Since we don't collect any data at all, there are no special considerations for children's privacy beyond the general privacy protections described in this policy.

## Changes to This Privacy Policy

We may update this Privacy Policy from time to time. Changes will be posted:
- In the extension's GitHub repository
- In the Chrome Web Store listing
- With an updated "Last Updated" date

Significant changes will be announced through:
- Extension update notes
- GitHub releases
- Chrome Web Store description

## Your Rights

Since we don't collect any data, there is no data to:
- Access
- Modify
- Delete
- Export
- Restrict processing of

Your conversations remain entirely under your control.

## Compliance

### GDPR (General Data Protection Regulation)
The extension is GDPR-compliant because:
- No personal data is collected
- No data processing occurs outside your device
- No data is stored or transmitted
- No consent is required (as there's no data collection)

### CCPA (California Consumer Privacy Act)
The extension is CCPA-compliant because:
- No personal information is collected
- No personal information is sold
- No personal information is shared

### Other Regulations
The extension complies with privacy regulations worldwide by simply not collecting any data.

## Technical Details

### Manifest V3
The extension uses Chrome's Manifest V3, which provides:
- Enhanced security
- Better privacy controls
- Stricter permission requirements
- No remote code execution

### No eval()
The extension does not use `eval()` or similar dangerous functions that could execute arbitrary code.

### Content Security Policy
The extension follows strict Content Security Policy rules to prevent:
- Cross-site scripting (XSS)
- Code injection
- Unauthorized data access

## Transparency

### What You Can Verify

You can verify our privacy claims by:

1. **Inspecting the source code**: Available on GitHub
2. **Monitoring network activity**: Use Chrome DevTools to see no external requests
3. **Checking storage**: Verify no data is stored in browser storage
4. **Reading the manifest**: See exactly what permissions are requested

### What We Promise

We promise to:
- Never collect your data
- Never sell your data (we don't have any to sell)
- Never change our privacy practices without notice
- Keep the extension open source
- Maintain transparency

## Contact Us

If you have questions about this Privacy Policy or the extension's privacy practices:

### GitHub Issues
https://github.com/yourusername/gemini-business-to-pdf/issues

### Email
privacy@example.com

### Response Time
We aim to respond to privacy inquiries within 48 hours.

## Disclaimer

### Gemini Business
This extension is not affiliated with, endorsed by, or sponsored by Google or Gemini. It is an independent tool created to enhance the Gemini Business user experience.

### Your Responsibility
While we don't collect your data, you are responsible for:
- How you use the exported PDFs
- Who you share the PDFs with
- Complying with Gemini's Terms of Service
- Protecting sensitive information in your exports

## Legal Basis for Processing (GDPR)

Since the extension does not collect or process personal data, no legal basis is required under GDPR. All processing happens locally on your device under your direct control.

## Data Protection Officer

Given the nature of the extension (no data collection), we do not have a Data Protection Officer. For privacy questions, please use the contact methods above.

## Cookies

The extension does **NOT** use cookies of any kind.

## Automated Decision Making

The extension does not perform any automated decision-making or profiling.

## International Data Transfers

Since no data is collected or transmitted, there are no international data transfers.

## Retention Period

No data is retained because no data is collected.

## Right to Lodge a Complaint

If you believe your privacy rights have been violated, you have the right to lodge a complaint with your local data protection authority. However, since we don't collect any data, there should be no privacy violations from our extension.

---

## Summary Table

| Aspect | Status |
|--------|--------|
| Data Collection | ❌ None |
| Data Storage | ❌ None |
| Data Transmission | ❌ None |
| Third-party Services | ❌ None |
| Analytics | ❌ None |
| Cookies | ❌ None |
| Tracking | ❌ None |
| Local Processing | ✅ Yes |
| Open Source | ✅ Yes |
| GDPR Compliant | ✅ Yes |
| CCPA Compliant | ✅ Yes |

---

**This privacy policy is as simple as it gets: We don't collect anything. Your data is yours, and it stays yours.**

If you have any questions or concerns, please don't hesitate to reach out through GitHub Issues or email.

**Last Updated**: January 2024
**Version**: 1.0.0
