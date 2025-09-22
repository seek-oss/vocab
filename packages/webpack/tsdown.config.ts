import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts', 'src/chunk-name.ts', 'src/loader.ts', 'src/web.ts'],
  format: ['esm', 'cjs'],
  exports: true,
  dts: true,
  sourcemap: true,
});
