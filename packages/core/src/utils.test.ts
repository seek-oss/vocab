import { getDevLanguageFileFromTsFile } from './utils';

describe('getDevLanguageFileFromTsFile', () => {
  it('should be good', () => {
    expect(
      getDevLanguageFileFromTsFile('/my/awesome/client.translations.ts', {
        translationsDirname: 'monkeys',
      }),
    ).toBe('/my/awesome/monkeys/client.translations.json');
  });
});
