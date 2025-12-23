import { defineConfig } from 'tsdown';

const readmeCopyIgnoreList = [
  'virtual-resource-loader',
  '@vocab/rollup-plugin',
];

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  exports: { devExports: '@vocab-private/monorepo' },
  sourcemap: true,
  workspace: ['./packages/*'],
  copy: (resolvedConfig) => {
    const shouldCopyReadme =
      resolvedConfig.name &&
      !readmeCopyIgnoreList.includes(resolvedConfig.name);

    if (shouldCopyReadme) {
      return [{ from: '../../README.md', verbose: true }];
    }

    return [];
  },
  failOnWarn: false,
});
