import { defineConfig } from 'tsdown';
import { vocabTranslations } from '@vocab/rollup-plugin';

export default defineConfig({
  entry: './src/index.ts',
  unbundle: true,
  dts: true,
  format: ['cjs', 'esm'],
  plugins: [vocabTranslations({ root: './src' })],
});
