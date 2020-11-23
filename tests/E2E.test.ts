import { startFixture, TestServer } from "./helpers";

describe('E2E', () => {
  let server: TestServer;

  beforeAll(async () => {
      server = await startFixture('fixture-simple');
      await page.goto(server.url);
  });

  it('should work', async () => {
    expect(page.url).toBe(server.url);
  });

  afterAll(() => {
    server.close();
  });
})