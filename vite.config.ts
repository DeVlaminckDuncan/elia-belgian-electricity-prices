import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'favicon.svg'],
      manifest: {
        name: 'Belgian Electricity Prices',
        short_name: 'Elia Prices',
        description: 'Track Belgian electricity prices from Elia in real-time',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'favicon.svg',
            type: 'image/svg+xml',
            sizes: 'any'
          }
        ]
      }
    })
  ],
  server: {
    proxy: {
      '/api/elia': {
        target: 'https://griddata.elia.be',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/elia/, ''),
      }
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  }
});