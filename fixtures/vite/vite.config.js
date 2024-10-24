import { defineConfig } from 'vite';
import vitePluginVocab from '@vocab/vite';
import { createVocabChunks } from '@vocab/vite/create-vocab-chunks';
import userConfig from './vocab.config.cjs';

export default defineConfig({
  plugins: [
    vitePluginVocab({
      configFile: userConfig,
      combineLanguageChunks: false,
    }),
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
