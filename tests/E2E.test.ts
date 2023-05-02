import {
  getAppSnapshot,
  startFixture,
  runServerFixture,
  type TestServer,
  getLanguageChunk,
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

  describe('Simple with plugin', () => {
    let server: TestServer;

    beforeAll(async () => {
      server = await startFixture('simple');
    });

    beforeEach(async () => {
      await page.goto(server.url);
    });

    it('should default to en-AU english', async () => {
      const message = await page.waitForSelector('#message');
      const publishDate = await page.waitForSelector('#publish-date');

      await expect(message).toMatch('Hello world');
      await expect(publishDate).toMatch('Vocab was published on 20/11/2020');
    });

    it('should handle to en-US locale', async () => {
      await page.click('#toggle-locale');

      const publishDate = await page.waitForSelector('#publish-date');

      await expect(publishDate).toMatch('Vocab was published on 11/20/2020');
    });

    it('should switch to french', async () => {
      await page.select('#language-select', 'fr');

      const message = await page.waitForSelector('#message');

      await expect(message).toMatch('Bonjour monde');
    });

    it('should switch to pseudo', async () => {
      await page.select('#language-select', 'pseudo');

      const message = await page.waitForSelector('#message');

      await expect(message).toMatch('[Ḩẽẽƚƚöö] [ŵöööřƚƌ]');
    });

    it('should allow special characters', async () => {
      const message = await page.waitForSelector('#special-characters');

      await expect(message).toMatch('‘’“”\'"!@#$%^&*()_+\\/`~\\\\');
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
      await page.goto(server.url);
    });

    it('should default to english', async () => {
      const message = await page.waitForSelector('#message');

      await expect(message).toMatch('Hello world');
    });

    it('should switch to french', async () => {
      await page.select('#language-select', 'fr');

      const message = await page.waitForSelector('#message');

      await expect(message).toMatch('Bonjour monde');
    });

    it('should switch to pseudo', async () => {
      await page.select('#language-select', 'pseudo');

      const message = await page.waitForSelector('#message');

      await expect(message).toMatch('[Ḩẽẽƚƚöö] [ŵöööřƚƌ]');
    });

    afterAll(() => {
      server.close();
    });
  });

  describe('Direct with plugin', () => {
    let server: TestServer;

    beforeAll(async () => {
      server = await startFixture('direct');
    });

    beforeEach(async () => {
      await page.goto(server.url);
    });

    it('should default to en-US english', async () => {
      await page.click('#show-message');
      await page.click('#update-message');

      const syncMessage = await page.waitForSelector('#sync-message');
      const asyncMessage = await page.waitForSelector('#async-message');

      await expect(syncMessage).toMatch('Hello Synchronously');
      await expect(asyncMessage).toMatch('Hello Asynchronously');
      await expect(syncMessage).toMatch('*Vocab* was published on 11/20/2020');
    });

    it('should switch to french', async () => {
      await page.select('#language-select', 'fr');

      await page.click('#show-message');
      await page.click('#update-message');

      const syncMessage = await page.waitForSelector('#sync-message');
      const asyncMessage = await page.waitForSelector('#async-message');

      await expect(syncMessage).toMatch('Bonjour Synchronously');
      await expect(asyncMessage).toMatch('Bonjour Asynchronously');
    });

    it('should switch to pseudo', async () => {
      await page.select('#language-select', 'pseudo');

      await page.click('#show-message');
      await page.click('#update-message');

      const syncMessage = await page.waitForSelector('#sync-message');
      const asyncMessage = await page.waitForSelector('#async-message');

      await expect(syncMessage).toMatch('[Ḩẽẽƚƚöö] Synchronously');
      await expect(asyncMessage).toMatch('[Ḩẽẽƚƚöö] Asynchronously');
    });

    afterAll(() => {
      server.close();
    });
  });
});
