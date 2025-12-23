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
      // @ts-expect-error tsdown has a dev dep on pkg-types instead of a dep
      // https://github.com/rolldown/tsdown/issues/667
      resolvedConfig.pkg?.name &&
      // @ts-expect-error Same as above
      !readmeCopyIgnoreList.includes(resolvedConfig.pkg.name);

    if (shouldCopyReadme) {
      return [{ from: '../../README.md', verbose: true }];
    }

    return [];
  },
  failOnWarn: false,
});
