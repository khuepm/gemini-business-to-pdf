import { defineConfig } from 'vite';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync } from 'fs';

export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        content: resolve(__dirname, 'src/content/content.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        format: 'iife',
        manualChunks: undefined, // Disable chunking for Chrome extension
      },
    },
    minify: 'esbuild',
    sourcemap: false,
    chunkSizeWarningLimit: 1000, // Increase limit for Chrome extensions
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  plugins: [
    {
      name: 'copy-files',
      closeBundle() {
        // Ensure dist directory exists
        if (!existsSync('dist')) {
          mkdirSync('dist', { recursive: true });
        }
        
        // Copy manifest.json
        copyFileSync('manifest.json', 'dist/manifest.json');
        
        // Copy styles
        if (!existsSync('dist/styles')) {
          mkdirSync('dist/styles', { recursive: true });
        }
        copyFileSync('src/styles/button.css', 'dist/styles/button.css');
        
        // Copy icons directory
        if (!existsSync('dist/icons')) {
          mkdirSync('dist/icons', { recursive: true });
        }
        copyFileSync('icons/icon16.png', 'dist/icons/icon16.png');
        copyFileSync('icons/icon48.png', 'dist/icons/icon48.png');
        copyFileSync('icons/icon128.png', 'dist/icons/icon128.png');
      },
    },
  ],
});
