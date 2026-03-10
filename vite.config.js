import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['vite.svg'],
      manifest: {
        name: 'ERP Pulse Dashboard',
        short_name: 'ERP Pulse',
        description: 'Modern ERP dashboard for finance, CRM, inventory, and scheduling.',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/vite.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'document',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'erp-pages-cache',
            },
          },
          {
            urlPattern: ({ request }) => ['script', 'style', 'worker'].includes(request.destination),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'erp-assets-cache',
            },
          },
        ],
      },
    }),
  ],
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined;
          }

          if (id.includes('xlsx') || id.includes('jspdf') || id.includes('file-saver')) {
            return 'export-vendors';
          }

          if (id.includes('react-big-calendar') || id.includes('date-fns')) {
            return 'calendar-vendors';
          }

          if (id.includes('recharts')) {
            return 'chart-vendors';
          }

          if (id.includes('firebase')) {
            return 'firebase-vendors';
          }

          return 'vendor';
        },
      },
    },
  },
});
