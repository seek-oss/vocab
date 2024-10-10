import { defineConfig } from 'vite';
import vitePluginVocab from '@vocab/vite';
import userConfig from './vocab.config.cjs';

export default defineConfig({
  plugins: [
    vitePluginVocab({
      configFile: userConfig,
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react-dom', 'react'],
          vocab: ['@vocab/*'],
        },
      },
    },
  },
});
