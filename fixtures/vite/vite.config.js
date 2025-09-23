import { defineConfig } from 'vite';
import { vitePluginVocab } from '@vocab/vite';
import { createVocabChunks } from '@vocab/vite/chunks';
import vocabConfig from './vocab.config.cjs';
import Inspect from 'vite-plugin-inspect';

export default defineConfig({
  plugins: [
    vitePluginVocab({
      vocabConfig,
    }),
    Inspect({ build: true }),
  ],
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
