import { defineConfig } from 'vite';
import { vitePluginVocab } from '@vocab/vite';
import vocabConfig from './vocab.config.cjs';

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
    modulePreload: { polyfill: false },
    outDir: isSsrBuild ? 'dist/server' : 'dist/client',
    emptyOutDir: true,
    manifest: !isSsrBuild,
    rollupOptions: {
      input: isSsrBuild ? 'src/server.tsx' : undefined,
      output: isSsrBuild
        ? {
            format: 'cjs',
            entryFileNames: 'server.cjs',
          }
        : undefined,
    },
  },
}));
