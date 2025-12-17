import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/icu-handler.ts',
    'src/translation-file.ts',
    'src/runtime.ts',
  ],
  format: ['esm', 'cjs'],
  exports: { devExports: '@vocab-private/monorepo' },
  dts: true,
  sourcemap: true,
  outputOptions: {
    advancedChunks: {
      // Isolate rolldown:runtime code from the rest of the code.
      // Without this, rolldown:runtime code gets added to the index.cjs file, which means the entire index.ts entry point is imported into other entries.
      groups: [{ name: 'rolldown-runtime', test: /rolldown:runtime/ }],
    },
  },
});
