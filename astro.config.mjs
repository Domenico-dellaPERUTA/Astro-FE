// @ts-check
import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import tailwindcss from '@tailwindcss/vite';

import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default defineConfig({
  integrations: [vue()],
  telemetry: false,
  vite: {
    plugins: [tailwindcss()],
    build: {
      chunkSizeWarningLimit: 1500,
      assetsInclude: ['**/*.mp3', '**/*.wav', '**/*.ogg'],
      // ⚠️ Niente asset inline (base64): gli mp3 brevi (es. dizionario
      // Inglese: ~1000 clip da pochi KB) finirebbero come data URI dentro
      // l'HTML della pagina, appesantendola di MB. Restano file esterni
      // con URL /_astro/…
      assetsInlineLimit: 0,
    },
  },
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },
});