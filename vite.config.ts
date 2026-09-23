import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/edesign-deploy/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Heavy vendor deps stay in their own chunk so the auth/login screen
          // doesn't pay for dnd-kit, lucide-react, or i18n on first paint.
          'vendor-react': ['react', 'react-dom'],
          'vendor-dnd': ['@dnd-kit/core', '@dnd-kit/modifiers', '@dnd-kit/utilities'],
          'vendor-icons': ['lucide-react'],
          'vendor-i18n': ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
          'vendor-state': ['zustand'],
        },
      },
    },
  },
})
