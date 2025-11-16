import { defineConfig } from 'tsdown';

export default defineConfig({
  format: ['cjs'],
  exports: true,
  sourcemap: true,
});
