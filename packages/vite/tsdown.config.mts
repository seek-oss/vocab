import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/chunks.ts',
    'src/get-chunk-name.ts',
    'src/runtime.ts',
  ],
  format: ['esm', 'cjs'],
  exports: { devExports: '@vocab-private/monorepo' },
  dts: true,
  sourcemap: true,
});
