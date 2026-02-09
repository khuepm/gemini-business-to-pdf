# Gemini Business to PDF

Chrome extension to export Gemini Business conversations to PDF format.

## Features

- Export complete chat conversations to PDF
- Automatically expands collapsed messages
- Preserves formatting (bold, italic, code blocks, tables, lists)
- Smart filename generation based on chat title
- Client-side processing (no data sent to external servers)

## Development

### Setup

```bash
npm install
```

### Build

```bash
# Production build
npm run build

# Development build with watch mode
npm run dev
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

### Installation

1. Build the extension: `npm run build`
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the `dist` folder

## Project Structure

```
gemini-business-to-pdf/
├── manifest.json           # Chrome extension manifest
├── src/
│   ├── content/           # Content scripts
│   ├── utils/             # Utility functions
│   └── styles/            # CSS styles
├── tests/                 # Test files
│   ├── unit/             # Unit tests
│   └── property/         # Property-based tests
└── icons/                # Extension icons
```

## Privacy

This extension processes all data locally in your browser. No chat content is sent to external servers.

## License

MIT
