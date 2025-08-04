import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwind from '@tailwindcss/vite' // <-- Use the official Vite plugin

export default defineConfig({
  plugins: [
    react(),
    tailwind(), // <-- Add the plugin here
  ],
  server: {
    proxy: {
      '/generate': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
