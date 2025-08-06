import { defineConfig } from 'vitest/config';

export default defineConfig({
  server: {
    watch: {
      ignored: ['fixtures/phrase/*'],
    },
  },
  test: {
    globals: true,
    name: 'browser',
    environment: 'puppeteer',
    globalSetup: 'vitest-environment-puppeteer/global-init',
  },
});
