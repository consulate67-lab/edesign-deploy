import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/** Shopify app içi XSLT editör bundle → shopify-app/editor */
export default defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname, 'src/shopify-embed'),
  base: '/shopify/editor/',
  build: {
    outDir: path.resolve(__dirname, 'shopify-app/editor'),
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-dnd': ['@dnd-kit/core', '@dnd-kit/modifiers', '@dnd-kit/utilities'],
          'vendor-icons': ['lucide-react'],
          'vendor-i18n': ['i18next', 'react-i18next'],
          'vendor-monaco': ['@monaco-editor/react', '@monaco-editor/loader'],
        },
      },
    },
  },
  server: {
    port: 5174,
  },
});
