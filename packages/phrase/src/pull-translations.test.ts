import path from 'path';
import { pull } from './pull-translations';
import { pullAllTranslations } from './phrase-api';
import { writeFile } from './file';

jest.mock('./file', () => ({
  writeFile: jest.fn(() => Promise.resolve),
  mkdir: jest.fn(() => Promise.resolve),
}));

jest.mock('./phrase-api', () => ({
  ensureBranch: jest.fn(() => Promise.resolve()),
  pullAllTranslations: jest.fn(() => Promise.resolve({ en: {}, fr: {} })),
}));

function runPhrase() {
  return pull(
    { branch: 'tester' },
    {
      devLanguage: 'en',
      languages: [{ name: 'en' }, { name: 'fr' }],
      projectRoot: path.resolve(__dirname, '..', '..', '..', 'fixtures/phrase'),
    },
  );
}

describe('pull', () => {
  beforeEach(() => {
    (pullAllTranslations as jest.Mock).mockClear();
    (writeFile as jest.Mock).mockClear();
  });
  it('should resolve', async () => {
    await expect(runPhrase()).resolves.toBeUndefined();

    expect(writeFile as jest.Mock).toHaveBeenCalledTimes(2);
  });
  it('should update keys', async () => {
    (pullAllTranslations as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        en: {
          'hello.fixtures_phrase_src___translations___client': {
            message: 'Hi there',
          },
        },
        fr: {
          'hello.fixtures_phrase_src___translations___client': {
            message: 'merci',
          },
        },
      }),
    );

    await expect(runPhrase()).resolves.toBeUndefined();

    expect(
      (writeFile as jest.Mock).mock.calls.map(
        ([_filePath, contents]: [string, string]) => JSON.parse(contents),
      ),
    ).toMatchInlineSnapshot(`
      Array [
        Object {
          "hello": Object {
            "message": "Hi there",
          },
          "world": Object {
            "message": "world",
          },
        },
        Object {
          "hello": Object {
            "message": "merci",
          },
          "world": Object {
            "message": "monde",
          },
        },
      ]
    `);
  });
});
