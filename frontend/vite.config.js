import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    host: true, // 👈 This allows access from external hosts
    allowedHosts: ['.onrender.com'] // 👈 Prevents blocked requests from Render
  },
  preview: {
    port: 4173,
    host: true,
    allowedHosts: ['.onrender.com']
  }
})
