import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import Sitemap from 'vite-plugin-sitemap'

export default defineConfig({
  plugins: [
    react(),
    Sitemap({
      hostname: 'https://speedmock.me',
      dynamicRoutes: ['/about', '/contact', '/services']
    }),
  ],

  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    allowedHosts: true,

    hmr: {
      protocol: "wss",
      host: "tubular-unlighted-tingle.ngrok-free.dev",
      clientPort: 443,
    },

    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
})
