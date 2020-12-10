import {
  getDevLanguageFileFromTsFile,
  getAltLanguageFilePath,
  getTSFileFromDevLanguageFile,
} from './utils';

describe('getDevLanguageFileFromTsFile', () => {
  it('should be good', () => {
    expect(
      getDevLanguageFileFromTsFile('/my/awesome/client.translations.ts', {
        translationsDirname: 'monkeys',
      }),
    ).toBe('/my/awesome/monkeys/client.translations.json');
  });
});

describe('getAltLanguageFilePath', () => {
  it('should be good', () => {
    expect(
      getAltLanguageFilePath('/my/awesome/client.translations.json', 'fr'),
    ).toBe('/my/awesome/client.translations.fr.json');
  });
});

describe('getTSFileFromDevLanguageFile', () => {
  it('should be good', () => {
    expect(
      getTSFileFromDevLanguageFile(
        '/my/awesome/__translations__/client.translations.json',
      ),
    ).toBe('/my/awesome/client.translations.ts');
  });
});
