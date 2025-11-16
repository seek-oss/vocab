import { defineConfig } from 'tsdown';

export default defineConfig({
  format: ['cjs'],
  exports: {
    devExports: '@vocab-private/monorepo',
  },
  sourcemap: true,
});
