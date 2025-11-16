import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  exports: { devExports: '@vocab-private/monorepo' },
  sourcemap: true,
  workspace: ['./packages/*'],
});
