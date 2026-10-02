import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Sprint 1.4 (2026-10-02): custom domain (api.edesign-deploy.com + edesign-deploy.com)
  // icin base path root. GitHub Pages eski '/edesign-deploy/' subpath'i hala destekler
  // cunku CNAME otomatik root'a yonlendirir. Apex domain'e geciste
  // GitHub Pages repo ayarlarindan 'custom domain' eklenecek.
  base: '/edesign-deploy/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Heavy vendor deps stay in their own chunk so the auth/login screen
          // doesn't pay for dnd-kit, lucide-react, or i18n on first paint.
          'vendor-dnd': ['@dnd-kit/core', '@dnd-kit/modifiers', '@dnd-kit/utilities'],
          'vendor-icons': ['lucide-react'],
          'vendor-i18n': ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
          'vendor-state': ['zustand'],
        },
      },
    },
  },
})
