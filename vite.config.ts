import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'

export default defineConfig({
  // Set base path for GitHub Pages deployment
  base: '/MicroFocus/',
  
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
    VueI18nPlugin({
      include: fileURLToPath(new URL('./src/i18n/locales/**/*.ts', import.meta.url)),
      strictMessage: false,
      escapeHtml: false,
      compositionOnly: true,
      fullInstall: false,
    }),
  ],
  
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
