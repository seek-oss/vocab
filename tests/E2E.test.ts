import 'expect-puppeteer';
import 'vitest-puppeteer';

page.setDefaultTimeout(20_000);

import {
  getAppSnapshot,
  collectAppSnapshot,
  startFixture,
  runServerFixture,
  runViteSsrFixture,
  type TestServer,
  getLanguageChunk,
  previewViteFixture,
} from '@vocab-private/test-helpers';

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

  describe('Vite SSR with plugin', () => {
    let server: TestServer;

    beforeAll(async () => {
      server = await runViteSsrFixture('vite-ssr');
    });

    afterAll(() => {
      server.close();
    });

    // Client language chunks load asynchronously. Hydrating without waiting
    // for them updates state during render, which React 19 rejects.
    it('should return english when route is en', async () => {
      const { sourceHtml, clientRenderContent, errors } =
        await collectAppSnapshot(`${server.url}/en/`);

      expect(sourceHtml).toContain('Hello world');
      expect(clientRenderContent).toContain('Hello world');
      // A second translation file for the same language must be installed by
      // the same chunk, otherwise only part of the page can hydrate.
      expect(clientRenderContent).toContain("I'm a header in english");
      expect(errors).toEqual([]);
    });

    it('should return french when route is fr', async () => {
      const { sourceHtml, clientRenderContent, errors } =
        await collectAppSnapshot(`${server.url}/fr/`);

      expect(sourceHtml).toContain('Bonjour monde');
      expect(clientRenderContent).toContain('Bonjour monde');
      expect(clientRenderContent).toContain("I'm a header in french");
      expect(errors).toEqual([]);
    });
  });

  describe('Simple with plugin', () => {
    let server: TestServer;

    beforeAll(async () => {
      server = await startFixture('simple', { bundler: 'webpack' });
    });

    beforeEach(async () => {
      await vitestPuppeteer.resetPage();
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
      await vitestPuppeteer.resetPage();
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

    beforeAll(async () => {
      server = await previewViteFixture('vite', {
        bundler: 'vite',
      });
    });

    beforeEach(async () => {
      await vitestPuppeteer.resetPage();
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

    it('should expose loaded messages on the first tick when the language chunk is on the page', async () => {
      const enCommon = await page.waitForSelector('#sync-en-common');
      const enClient = await page.waitForSelector('#sync-en-client');

      await expect(enCommon).toMatchTextContent('loaded');
      await expect(enClient).toMatchTextContent('loaded');
    });

    it('should leave messages unloaded when their language chunk is not on the page', async () => {
      const frInitial = await page.waitForSelector('#sync-fr-initial');

      await expect(frInitial).toMatchTextContent('missing');
    });

    it('should load sibling translation files for the same language', async () => {
      await page.click('#load-fr-sibling');

      const frSibling = await page.waitForSelector('#sync-fr-sibling');
      await expect(frSibling).toMatchTextContent('loaded');
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

    afterAll(async () => {
      await server.close();
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

    afterAll(async () => {
      await server.close();
    });

    beforeEach(async () => {
      await vitestPuppeteer.resetPage();
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
  });

  describe('Direct with plugin', () => {
    let server: TestServer;

    beforeAll(async () => {
      server = await startFixture('direct');
    });

    beforeEach(async () => {
      await vitestPuppeteer.resetPage();
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
