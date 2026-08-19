import { defineConfig } from 'vite';
import { vitePluginVocab } from '@vocab/vite';
import { createVocabChunks } from '@vocab/vite/chunks';
import vocabConfig from './vocab.config.cjs';

const injectEnTranslationsChunk = () => ({
  name: 'inject-en-translations',
  transformIndexHtml: {
    order: 'post',
    handler(_html, ctx) {
      if (!ctx.bundle) {
        return;
      }

      const chunk = Object.values(ctx.bundle).find(
        (item) => item.type === 'chunk' && item.name === 'en-translations',
      );

      if (!chunk || chunk.type !== 'chunk') {
        return;
      }

      return [
        {
          tag: 'script',
          attrs: {
            type: 'module',
            src: `/${chunk.fileName}`,
          },
          injectTo: 'head-prepend',
        },
      ];
    },
  },
});

export default defineConfig({
  plugins: [
    vitePluginVocab({
      vocabConfig,
    }),
    injectEnTranslationsChunk(),
  ],
  resolve: {
    conditions: ['@vocab-private/monorepo'],
  },
  build: {
    rollupOptions: {
      output: {
        chunkFileNames: '[name].js',
        manualChunks: (id, ctx) => {
          const vocabChunk = createVocabChunks(id, ctx);
          if (vocabChunk) {
            return vocabChunk;
          }
        },
      },
    },
  },
});
