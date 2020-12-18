import { compile, resolveConfigSync } from '@vocab/core';
import {
  getAppSnapshot,
  startFixture,
  runServerFixture,
  TestServer,
} from './helpers';

describe('E2E', () => {
  describe('Server with initial render', () => {
    let server: TestServer;
    beforeAll(async () => {
      const config = resolveConfigSync(
        require.resolve('fixture-server/vocab.config.js'),
      );

      if (!config) {
        throw new Error(`Can't resolve "fixture-server" vocab config`);
      }

      await compile({}, config);
      server = await runServerFixture('fixture-server');
    });

    afterAll(() => {
      server.close();
    });
    it('should return english when route is en', async () => {
      const { sourceHtml, clientRenderContent } = await getAppSnapshot(
        `${server.url}/en/`,
      );

      expect(sourceHtml).toContain('Hello world');
      expect(clientRenderContent).toContain('Hello world');
    });
    it('should return french when route is fr', async () => {
      const { sourceHtml, clientRenderContent } = await getAppSnapshot(
        `${server.url}/fr/`,
      );

      expect(sourceHtml).toContain('Bonjour monde');
      expect(clientRenderContent).toContain('Bonjour monde');
    });
  });
  describe('Simple with plugin', () => {
    let server: TestServer;

    beforeAll(async () => {
      const config = resolveConfigSync(
        require.resolve('fixture-simple/vocab.config.js'),
      );

      if (!config) {
        throw new Error(`Can't resolve "fixture-simple" vocab config`);
      }

      await compile({}, config);
      server = await startFixture('fixture-simple');
    });

    beforeEach(async () => {
      await page.goto(server.url);
    });

    it('should default to english', async () => {
      const message = await page.waitForSelector('#message');

      await expect(message).toMatch('Hello world');
    });

    it('should switch to french', async () => {
      await page.click('button');

      const message = await page.waitForSelector('#message');

      await expect(message).toMatch('Bonjour monde');
    });

    afterAll(() => {
      server.close();
    });
  });

  describe('Simple without plugin', () => {
    let server: TestServer;

    beforeAll(async () => {
      const config = resolveConfigSync(
        require.resolve('fixture-simple/vocab.config.js'),
      );

      if (!config) {
        throw new Error(`Can't resolve "fixture-simple" vocab config`);
      }

      await compile({}, config);
      server = await startFixture('fixture-simple', {
        disableVocabPlugin: true,
      });
    });

    beforeEach(async () => {
      await page.goto(server.url);
    });

    it('should default to english', async () => {
      const message = await page.waitForSelector('#message');

      await expect(message).toMatch('Hello world');
    });

    it('should switch to french', async () => {
      await page.click('button');

      const message = await page.waitForSelector('#message');

      await expect(message).toMatch('Bonjour monde');
    });

    afterAll(() => {
      server.close();
    });
  });
});
