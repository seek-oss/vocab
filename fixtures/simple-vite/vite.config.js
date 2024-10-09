import { defineConfig } from 'vite';
import vitePluginVocab from './src/plugins/vite-plugin-vocab';
import configFile from './vocab.config.cjs';

export default defineConfig({
  plugins: [
    vitePluginVocab({
      configFile,
    }),
  ],
  build: {
    minify: false,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react/*'],
        },
      },
    },
  },
});
