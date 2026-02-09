# Project Structure

## Directory Layout

```
gemini-business-to-pdf/
├── .kiro/                          # Kiro spec files
│   └── specs/
│       └── gemini-business-to-pdf/
│           ├── requirements.md
│           ├── design.md
│           └── tasks.md
├── dist/                           # Build output (generated)
│   ├── icons/
│   ├── styles/
│   │   └── button.css
│   ├── content.js
│   └── manifest.json
├── icons/                          # Extension icons
│   ├── README.md
│   └── PLACEHOLDER.txt
├── node_modules/                   # Dependencies (generated)
├── src/                            # Source code
│   ├── content/
│   │   └── content.ts             # Main content script
│   ├── styles/
│   │   └── button.css             # Button and notification styles
│   └── utils/
│       ├── logger.ts              # Logging utility
│       ├── error-handler.ts       # Error handling
│       └── dom-utils.ts           # DOM utilities
├── tests/                          # Test files
│   ├── unit/                      # Unit tests
│   ├── property/                  # Property-based tests
│   └── setup.ts                   # Test setup
├── .gitignore
├── manifest.json                   # Chrome extension manifest
├── package.json                    # NPM dependencies
├── README.md                       # Project documentation
├── tsconfig.json                   # TypeScript configuration
├── vite.config.ts                  # Vite build configuration
└── vitest.config.ts               # Vitest test configuration
```

## Key Files

### Configuration Files

- **manifest.json**: Chrome Extension Manifest V3 configuration
- **tsconfig.json**: TypeScript compiler options
- **vite.config.ts**: Build tool configuration with file copying
- **vitest.config.ts**: Test framework configuration
- **package.json**: Project dependencies and scripts

### Source Files

- **src/content/content.ts**: Main entry point for content script
- **src/styles/button.css**: Styles for export button and notifications
- **src/utils/**: Utility modules (to be implemented in later tasks)

### Build Output

The `dist/` directory contains the built extension ready to load into Chrome:
- Bundled JavaScript (content.js)
- Copied manifest.json
- Copied CSS files
- Icons directory (icons need to be added manually)

## NPM Scripts

- `npm run build`: Production build
- `npm run dev`: Development build with watch mode
- `npm test`: Run all tests once
- `npm run test:watch`: Run tests in watch mode

## Dependencies

### Production
- **html2pdf.js**: HTML to PDF conversion library

### Development
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool
- **Vitest**: Unit testing framework
- **fast-check**: Property-based testing library
- **jsdom**: DOM implementation for testing
- **@types/chrome**: Chrome extension API types

## Next Steps

1. Implement Logger and Error Handler (Task 2)
2. Implement UI Injector (Task 3)
3. Implement Message Expander (Task 4)
4. Continue with remaining tasks in tasks.md
