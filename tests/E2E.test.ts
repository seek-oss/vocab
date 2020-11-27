import { startFixture, TestServer } from './helpers';

describe('E2E', () => {
  let server: TestServer;

  beforeAll(async () => {
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
