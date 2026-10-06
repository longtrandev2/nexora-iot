import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

/** Spring Boot backend the dev server proxies to (override with BE_URL when it runs elsewhere). */
const backend = process.env.BE_URL ?? 'http://localhost:8080'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // Same-origin /api + /ws in dev → no CORS, and STOMP works through the proxy.
  server: {
    proxy: {
      '/api': { target: backend },
      '/ws': { target: backend, ws: true },
    },
  },
})
