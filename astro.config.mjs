// @ts-check
import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  integrations: [vue()],
  vite: {
    plugins: [tailwindcss()],
    build: {
      chunkSizeWarningLimit: 1500,
      assetsInclude: ['**/*.mp3', '**/*.wav', '**/*.ogg'],
    }
  }
});