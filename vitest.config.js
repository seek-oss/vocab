import { defineConfig, defaultInclude, defaultExclude } from 'vitest/config';

export default defineConfig({
  server: {
    watch: {
      ignored: ['fixtures/phrase/*'],
    },
  },
  test: {
    globals: true,
    restoreMocks: true,
    exclude: defaultExclude,
    projects: [
      {
        extends: true,
        test: {
          name: 'node',
          include: defaultInclude,
          exclude: ['tests/E2E.test.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'browser',
          environment: 'puppeteer',
          globalSetup: 'vitest-environment-puppeteer/global-init',
          include: ['tests/E2E.test.ts'],
        },
      },
    ],
  },
});
