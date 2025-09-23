import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { vocabTranslations } from '@vocab/rollup-plugin';

/**
 * @type {import('rollup').RollupOptions}
 */
export default {
  input: 'src/index.ts',
  external: ['@vocab/core', '@vocab/core/runtime'],
  plugins: [nodeResolve(), typescript(), vocabTranslations()],
  output: {
    dir: 'dist',
    format: 'esm',
  },
};
