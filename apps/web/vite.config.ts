import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/app/',
  server: {
    proxy: {
      '/api': 'http://localhost:4001',
    },
  },
  plugins: [react()],
})
