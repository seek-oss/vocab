import { defineConfig } from 'vite';
import vitePluginVocab from '@vocab/vite';
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
        manualChunks: {
          react: ['react-dom', 'react'],
          vocab: ['@vocab/*'],
        },
      },
    },
  },
});
