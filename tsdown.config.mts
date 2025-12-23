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
      resolvedConfig.pkg?.name &&
      !readmeCopyIgnoreList.includes(resolvedConfig.pkg.name);

    if (shouldCopyReadme) {
      return [{ from: '../../README.md', verbose: true }];
    }

    return [];
  },
  failOnWarn: false,
});
