import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { recipeLibrary } from './plugins/vite-plugin-recipe-library';
import { plateLibrary } from './plugins/vite-plugin-plate-library';

// base must match the GitHub Pages repo path: https://<user>.github.io/recipe-app/
export default defineConfig({
  base: '/recipe-app/',
  plugins: [
    react(),
    tailwindcss(),
    recipeLibrary(),
    plateLibrary(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png'],
      manifest: {
        name: 'My Recipes',
        short_name: 'Recipes',
        description: 'Personal recipe manager',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/recipe-app/',
        scope: '/recipe-app/',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,jpg,jpeg,svg,woff2}'],
      },
    }),
  ],
});
