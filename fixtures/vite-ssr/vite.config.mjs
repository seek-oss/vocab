import { createRequire } from 'node:module';

import { defineConfig } from 'vite';
import { vitePluginVocab } from '@vocab/vite';
import { createVocabChunks } from '@vocab/vite/chunks';

const vocabConfig = createRequire(import.meta.url)('./vocab.config.cjs');

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [
    vitePluginVocab({
      vocabConfig,
    }),
  ],
  resolve: {
    conditions: [
      '@vocab-private/monorepo',
      'module',
      'browser',
      'development|production',
    ],
  },
  ssr: {
    resolve: {
      conditions: [
        '@vocab-private/monorepo',
        'module',
        'node',
        'development|production',
      ],
    },
  },
  build: {
    modulePreload: false,
    outDir: isSsrBuild ? 'dist/server' : 'dist/client',
    emptyOutDir: true,
    rollupOptions: {
      input: isSsrBuild ? 'src/server.tsx' : undefined,
      output: isSsrBuild
        ? {
            format: 'cjs',
            entryFileNames: 'server.cjs',
          }
        : {
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
}));
