import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: 'autoUpdate',

      manifest: {
        name: 'Mi Proyecto',
        short_name: 'Mi Proyecto',
        description: 'Una aplicación web progresiva para mi proyecto.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#4CAF50',

        icons: [
          {
            src: '/icons/icon192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/icon512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ],

        screenshots: [
          {
            src: '/screenshots/captura.png',
            sizes: '1846x999',
            type: 'image/png',
            form_factor: 'narrow'
          }
        ]
      },

      workbox: {
        runtimeCaching: []
      },

      devOptions: {
        enabled: true
      }
    })
  ]
})