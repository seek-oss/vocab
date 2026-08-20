import { defineConfig } from 'vite';
import { vitePluginVocab } from '@vocab/vite';
import { getChunkName } from '@vocab/vite/get-chunk-name';
import vocabConfig from './vocab.config.cjs';

const injectEnTranslationsChunk = () => ({
  name: 'inject-en-translations',
  transformIndexHtml: {
    order: 'post',
    handler(_html, ctx) {
      if (!ctx.bundle) {
        return;
      }

      // Matching on `name` rather than `fileName` so that the lookup keeps
      // working if the chunk file name pattern includes a hash.
      const chunk = Object.values(ctx.bundle).find(
        (item) => item.type === 'chunk' && item.name === getChunkName('en'),
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
      },
    },
  },
});
