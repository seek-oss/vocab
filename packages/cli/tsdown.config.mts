import { defineConfig } from 'tsdown';

export default defineConfig({
  format: ['esm'],
  exports: {
    devExports: '@vocab-private/monorepo',
  },
  sourcemap: true,
});
