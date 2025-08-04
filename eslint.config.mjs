/* eslint-disable import-x/no-rename-default */
import seek from 'eslint-config-seek';
import vitest from '@vitest/eslint-plugin';

const modifiedSeek = seek.map((config) => {
  // Removing the jest plugin and rules so they don't conflict with the vitest plugin
  if (config.plugins?.jest) {
    delete config.plugins.jest;
  }

  if (config.rules) {
    for (const ruleName of Object.keys(config.rules)) {
      if (ruleName.includes('jest')) {
        config.rules[ruleName] = 'off';
      }
    }
  }

  return config;
});

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
  ...modifiedSeek,
  {
    rules: {
      'no-process-exit': 'off',
      'no-var-requires': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/consistent-type-definitions': 'off',
    },
  },
  {
    plugins: {
      vitest,
    },
    rules: {
      ...vitest.configs.recommended.rules,
      'vitest/no-focused-tests': 'error',
    },
  },
];
