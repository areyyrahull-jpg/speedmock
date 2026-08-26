
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import Sitemap from 'vite-plugin-sitemap'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
  
 Sitemap({ 
      hostname: 'https://speedmock.me', // Replace with your live URL
      dynamicRoutes: ['/about', '/contact', '/services'] // Add your pages here
    }),
   
  proxy: {
    "/api": {
      target: "http://localhost:5000",
      changeOrigin: true,
    },
  },
},
})
