import seek from 'eslint-config-seek/vitest';

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
  ...seek,
];
