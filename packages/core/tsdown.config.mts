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
  inputOptions: {
    experimental: {
      // Without this, rolldown:runtime code gets added to the index.cjs file, which is then imported into other modules.
      // This causes issues with jest since prettier is imported in the index.cjs file and uses a dynamic import,
      // so we need to enable strict execution order so that the rolldown:runtime code is isolated from the rest of the code.
      strictExecutionOrder: true,
    },
  },
});
