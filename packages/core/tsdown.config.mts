import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'icu-handler': 'src/icu-handler.ts',
    'translation-file': 'src/translation-file.ts',
    runtime: 'src/runtime.ts',
    'translations.alt.schema': 'schemas/translations.alt.schema.json',
    'translations.schema': 'schemas/translations.schema.json',
  },
  format: ['esm', 'cjs'],
  exports: { devExports: '@vocab-private/monorepo' },
  dts: true,
  sourcemap: true,
  outputOptions: {
    codeSplitting: {
      // Isolate rolldown:runtime code from the rest of the code.
      // Without this, rolldown:runtime code gets added to the index.cjs file, which means the entire index.ts entry point is imported into other entries.
      groups: [{ name: 'rolldown-runtime', test: /\0rolldown\/runtime.js/ }],
    },
  },
});
