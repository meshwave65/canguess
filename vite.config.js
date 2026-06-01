import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: 'autoUpdate',

      includeAssets: [
        'favicon.ico',
        'icon-192.png',
        'icon-512.png'
      ],

      manifest: {
        name: 'Bolão Zé Bangu',
        short_name: 'Bolão',

        description:
          'Bolão Zé Bangu - O palpite da galera',

        theme_color: '#C1121F',
        background_color: '#FFFFFF',

        display: 'standalone',

        orientation: 'portrait',

        start_url: '/',

        scope: '/',

        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },

          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          },

          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    })
  ]
})
