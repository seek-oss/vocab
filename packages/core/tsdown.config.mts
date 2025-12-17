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
      // Without this, rolldown:runtime code gets added to the index.cjs file, which is then imports the entire index.ts entry into other modules.
      groups: [{ name: 'rolldown-runtime', test: /rolldown:runtime/ }],
    },
  },
});
