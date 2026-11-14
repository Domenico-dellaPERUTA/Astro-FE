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
    // Pre-bundle esplicito di monaco-editor a startup dev: senza include, i
    // moduli dei linguaggi (es. basic-languages/python) vengono scoperti
    // solo al primo uso in runtime e invalidano la cache deps → 504
    // "Outdated Optimize Dep" e codice non colorato. Solo dev: la build
    // di produzione non usa optimizeDeps.
    optimizeDeps: {
      include: ['monaco-editor'],
    },
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