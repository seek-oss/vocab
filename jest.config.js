module.exports = {
  preset: 'jest-puppeteer',
  setupFilesAfterEnv: ['./jest.setup.js'],
  watchPathIgnorePatterns: ['<rootDir>/fixtures/phrase/'],
};
