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
});
