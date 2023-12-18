module.exports = {
  extends: 'seek',
  globals: {
    // provided by jest-puppeteer
    page: true,
  },
  rules: {
    'no-process-exit': 'off',
    'no-var-requires': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/consistent-type-definitions': 'off',
  },
};
