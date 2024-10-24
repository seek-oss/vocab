import {
  getAppSnapshot,
  startFixture,
  runServerFixture,
  type TestServer,
  getLanguageChunk,
  previewViteFixture,
  debugPageOrFrame,
} from '@vocab-private/test-helpers';
import type { Page } from 'puppeteer';

import 'expect-puppeteer';
import 'jest-puppeteer';

describe('E2E', () => {
  describe('Server with initial render', () => {
    let server: TestServer;

    beforeAll(async () => {
      server = await runServerFixture('server');
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
      server = await startFixture('simple', { bundler: 'webpack' });
    });

    beforeEach(async () => {
      await jestPuppeteer.resetPage();
      await page.goto(server.url, { waitUntil: 'networkidle0' });
    });

    it('should default to en-AU english', async () => {
      const message = await page.waitForSelector('#message');
      const publishDate = await page.waitForSelector('#publish-date');

      await expect(message).toMatchTextContent('Hello world');
      await expect(publishDate).toMatchTextContent(
        'Vocab was published on 20/11/2020',
      );
    });

    it('should handle to en-US locale', async () => {
      await page.click('#toggle-locale');

      const publishDate = await page.waitForSelector('#publish-date');

      await expect(publishDate).toMatchTextContent(
        'Vocab was published on 11/20/2020',
      );
    });

    it('should switch to french', async () => {
      await page.select('#language-select', 'fr');

      const message = await page.waitForSelector('#message');

      await expect(message).toMatchTextContent('Bonjour monde');
    });

    it('should switch to pseudo', async () => {
      await page.select('#language-select', 'pseudo');

      const message = await page.waitForSelector('#message');

      await expect(message).toMatchTextContent('[Ḩẽẽƚƚöö] [ŵöööřƚƌ]', {
        timeout: 2000,
      });
    });

    it('should allow special characters', async () => {
      const message = await page.waitForSelector('#special-characters');

      await expect(message).toMatchTextContent('‘’“”\'"!@#$%^&*()_+\\/`~\\\\');
    });

    it('should return the expected en chunk', async () => {
      expect(
        await getLanguageChunk({ serverUrl: server.url, language: 'en' }),
      ).toMatchSnapshot();
    });

    it('should return the expected fr chunk', async () => {
      expect(
        await getLanguageChunk({ serverUrl: server.url, language: 'fr' }),
      ).toMatchSnapshot();
    });

    it('should return the expected pseudo chunk', async () => {
      expect(
        await getLanguageChunk({ serverUrl: server.url, language: 'pseudo' }),
      ).toMatchSnapshot();
    });

    afterAll(() => {
      server.close();
    });
  });

  describe('Simple without plugin', () => {
    let server: TestServer;

    beforeAll(async () => {
      server = await startFixture('simple', {
        disableVocabPlugin: true,
      });
    });

    beforeEach(async () => {
      await jestPuppeteer.resetPage();
      await page.goto(server.url, { waitUntil: 'networkidle0' });
    });

    it('should default to english', async () => {
      const message = await page.waitForSelector('#message');

      await expect(message).toMatchTextContent('Hello world');
    });

    it('should switch to french', async () => {
      await page.select('#language-select', 'fr');

      const message = await page.waitForSelector('#message');

      await expect(message).toMatchTextContent('Bonjour monde');
    });

    it('should switch to pseudo', async () => {
      await page.select('#language-select', 'pseudo');

      const message = await page.waitForSelector('#message');

      await expect(message).toMatchTextContent('[Ḩẽẽƚƚöö] [ŵöööřƚƌ]');
    });

    afterAll(() => {
      server.close();
    });
  });

  describe('vite with plugin', () => {
    let server: TestServer;
    let localPage: Page;

    beforeAll(async () => {
      server = await previewViteFixture('vite', {
        bundler: 'vite',
      });
      localPage = await browser.newPage();
      localPage.on('request', (request) => {
        // eslint-disable-next-line no-console
        console.log('PUPPETEER:network-request', request.url());
      });

      localPage.on('response', (response) => {
        // eslint-disable-next-line no-console
        console.log('PUPPETEER:network-response', response.url());
      });
    });

    beforeEach(async () => {
      // eslint-disable-next-line no-console
      console.log('server.url', server.url);
      await jestPuppeteer.resetPage();
      await localPage.goto(server.url, { waitUntil: 'networkidle0' });
    });

    afterAll(async () => {
      await server.close();
      await localPage.close();
    });

    it('should default to en-AU english', async () => {
      debugPageOrFrame(localPage);
      const message = await localPage.waitForSelector('#message');
      const publishDate = await localPage.waitForSelector('#publish-date');

      await expect(message).toMatchTextContent('Hello world');
      await expect(publishDate).toMatchTextContent(
        'Vocab was published on 20/11/2020',
      );
    });

    it('should handle to en-US locale', async () => {
      await localPage.click('#toggle-locale');

      const publishDate = await localPage.waitForSelector('#publish-date');

      await expect(publishDate).toMatchTextContent(
        'Vocab was published on 11/20/2020',
      );
    });

    it('should switch to french', async () => {
      await localPage.select('#language-select', 'fr');

      const message = await localPage.waitForSelector('#message');

      await expect(message).toMatchTextContent('Bonjour monde');
    });

    it('should switch to pseudo', async () => {
      await localPage.select('#language-select', 'pseudo');

      const message = await localPage.waitForSelector('#message');

      await expect(message).toMatchTextContent('[Ḩẽẽƚƚöö] [ŵöööřƚƌ]', {
        timeout: 2000,
      });
    });

    it('should allow special characters', async () => {
      const message = await localPage.waitForSelector('#special-characters');

      await expect(message).toMatchTextContent('‘’“”\'"!@#$%^&*()_+\\/`~\\\\');
    });

    it('should return the expected en chunk', async () => {
      expect(
        await getLanguageChunk({
          serverUrl: `${server.url}`,
          language: 'en',
        }),
      ).toMatchSnapshot();
    });

    it('should return the expected fr chunk', async () => {
      expect(
        await getLanguageChunk({
          serverUrl: `${server.url}`,
          language: 'fr',
        }),
      ).toMatchSnapshot();
    });

    it('should return the expected pseudo chunk', async () => {
      expect(
        await getLanguageChunk({
          serverUrl: `${server.url}`,
          language: 'pseudo',
        }),
      ).toMatchSnapshot();
    });
  });

  describe('vite without plugin', () => {
    let server: TestServer;

    beforeAll(async () => {
      server = await previewViteFixture('vite', {
        bundler: 'vite',
        disableVocabPlugin: true,
      });
    });

    beforeEach(async () => {
      await jestPuppeteer.resetPage();
      await page.goto(server.url, { waitUntil: 'networkidle0' });
    });

    it('should default to en-AU english', async () => {
      const message = await page.waitForSelector('#message');
      const publishDate = await page.waitForSelector('#publish-date');

      await expect(message).toMatchTextContent('Hello world');
      await expect(publishDate).toMatchTextContent(
        'Vocab was published on 20/11/2020',
      );
    });

    it('should handle to en-US locale', async () => {
      await page.click('#toggle-locale');

      const publishDate = await page.waitForSelector('#publish-date');

      await expect(publishDate).toMatchTextContent(
        'Vocab was published on 11/20/2020',
      );
    });

    it('should switch to french', async () => {
      await page.select('#language-select', 'fr');

      const message = await page.waitForSelector('#message');

      await expect(message).toMatchTextContent('Bonjour monde');
    });

    it('should switch to pseudo', async () => {
      await page.select('#language-select', 'pseudo');

      const message = await page.waitForSelector('#message');

      await expect(message).toMatchTextContent('[Ḩẽẽƚƚöö] [ŵöööřƚƌ]', {
        timeout: 2000,
      });
    });

    it('should allow special characters', async () => {
      const message = await page.waitForSelector('#special-characters');

      await expect(message).toMatchTextContent('‘’“”\'"!@#$%^&*()_+\\/`~\\\\');
    });

    afterAll(async () => {
      await server.close();
    });
  });

  describe('Direct with plugin', () => {
    let server: TestServer;

    beforeAll(async () => {
      server = await startFixture('direct');
    });

    beforeEach(async () => {
      await jestPuppeteer.resetPage();
      await page.goto(server.url, { waitUntil: 'networkidle0' });
    });

    it('should default to en-US english', async () => {
      await page.click('#show-message');
      await page.click('#update-message');

      const syncMessage = await page.waitForSelector('#sync-message');
      const asyncMessage = await page.waitForSelector('#async-message');

      await expect(syncMessage).toMatchTextContent('Hello Synchronously');
      await expect(asyncMessage).toMatchTextContent('Hello Asynchronously');
      await expect(syncMessage).toMatchTextContent(
        '*Vocab* was published on 11/20/2020',
      );
    });

    it('should switch to french', async () => {
      await page.select('#language-select', 'fr');

      await page.click('#show-message');
      await page.click('#update-message');

      const syncMessage = await page.waitForSelector('#sync-message');
      const asyncMessage = await page.waitForSelector('#async-message');

      await expect(syncMessage).toMatchTextContent('Bonjour Synchronously');
      await expect(asyncMessage).toMatchTextContent('Bonjour Asynchronously');
    });

    it('should switch to pseudo', async () => {
      await page.select('#language-select', 'pseudo');

      await page.click('#show-message');
      await page.click('#update-message');

      const syncMessage = await page.waitForSelector('#sync-message');
      const asyncMessage = await page.waitForSelector('#async-message');

      await expect(syncMessage).toMatchTextContent('[Ḩẽẽƚƚöö] Synchronously');
      await expect(asyncMessage).toMatchTextContent('[Ḩẽẽƚƚöö] Asynchronously');
    });

    afterAll(() => {
      server.close();
    });
  });
});
