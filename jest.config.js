/** @type import('jest').Config */
module.exports = {
  preset: 'jest-puppeteer',
  setupFilesAfterEnv: ['./jest.setup.js'],
  watchPathIgnorePatterns: ['<rootDir>/fixtures/phrase/'],
  testTimeout: 20_000,
};
