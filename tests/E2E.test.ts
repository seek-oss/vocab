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
    const message = await page.$eval(
      '#message',
      (el) => (el as HTMLDivElement).innerText,
    );

    expect(message).toBe('Hello world');
  });

  it('should switch to french', async () => {
    await page.$eval('button', (el) => (el as HTMLButtonElement).click());
    const message = await page.$eval(
      '#message',
      (el) => (el as HTMLDivElement).innerText,
    );

    expect(message).toBe('Bonjour monde');
  });

  afterAll(() => {
    server.close();
  });
});
