import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
  server: {
    allowedHosts: ['.railway.app'],
    host: '0.0.0.0',
    port: 8080
  },
  preview: {
    host: true,
    port: process.env.PORT ? parseInt(process.env.PORT) : 4173,
    proxy: {
      '/api': {
        target: (process.env.VITE_API_URL || 'http://localhost:3001/api').replace(/\/api$/, ''),
        changeOrigin: true,
      },
    },
  },
})