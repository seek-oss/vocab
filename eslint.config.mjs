import eslintConfigSeek from 'eslint-config-seek';

export default [
  {
    ignores: [
      '**/.idea/',
      '**/.vscode/',
      '**/node_modules*/',
      '**/dist/',
      '**/dist-*/',
      '.changeset/*',
      'packages/cli/bin.js',
      '**/*.vocab/index.ts',
    ],
  },
  ...eslintConfigSeek,
  {
    languageOptions: {
      // `jest-puppeteer` provides a global `page` object
      globals: {
        page: true,
      },
    },

    rules: {
      'no-process-exit': 'off',
      'no-var-requires': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/consistent-type-definitions': 'off',
    },
  },
];
