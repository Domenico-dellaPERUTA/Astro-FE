// @ts-check
import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { readFileSync } from 'node:fs';

import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// Vite NON espone il file .env dentro astro.config.mjs: lo carichiamo a mano
// (senza dipendenze), senza sovrascrivere variabili già presenti nell'ambiente
try {
  for (const riga of readFileSync(new URL('./.env', import.meta.url), 'utf8').split('\n')) {
    const m = riga.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (m && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
    }
  }
} catch {
  // .env assente: si usa il fallback qui sotto
}

// Dominio di produzione: serve per canonical, Open Graph e sitemap.xml.
// Riferimento nel file .env (SITE=...) o variabile d'ambiente SITE.
const SITE = process.env.SITE || 'https://note.altervista.org/';

export default defineConfig({
  site: SITE,
  integrations: [
    vue(),
    sitemap({
      // Esclude le pagine utilitarie (noindex) dall'indice dei motori
      filter: (page) => !page.includes('/latex-editor') && !page.includes('/markdown-editor'),
    }),
  ],
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