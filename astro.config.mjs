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
    },
  },
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },
});