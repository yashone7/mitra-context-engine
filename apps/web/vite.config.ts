import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/dump': 'http://localhost:8787',
      '/confirm': 'http://localhost:8787',
      '/now': 'http://localhost:8787',
      '/done': 'http://localhost:8787',
    },
  },
})
