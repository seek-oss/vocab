# `@vocab/rollup-plugin`

Copy `translations.json` files into your bundle, preserving directory structure.

## Why

`translations.json` files are never directly referenced by your code, so bundlers typically don't include them in a package bundle.
However, these files are critical for applications that use Vocab with a bundler plugin.

This plugin ensures that they are copied over while maintaining the same directory structure as your source code.

## Installation

```sh
pnpm install -D @vocab/rollup-plugin
```

## Usage

> [!IMPORTANT]
> This plugin will only work if `preserveModules` (or `tsdown`'s `unbundle`) is set to `true`.

```ts
// rollup.config.ts
import { vocabTranslations } from '@vocab/rollup-plugin';

export default {
  input: './src/index.ts',
  output: {
    dir: 'dist',
    format: 'es',
    preserveModules: true
  },
  plugins: [vocabTranslations({ root: './src' })]
};
```

```ts
// tsdown.config.ts
import { defineConfig } from 'tsdown';
import { vocabTranslations } from '@vocab/rollup-plugin';

export default defineConfig({
  entry: './src/index.ts',
  unbundle: true,
  format: 'esm',
  plugins: [vocabTranslations({ root: './src' })]
});
```
