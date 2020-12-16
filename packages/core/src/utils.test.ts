import {
  getDevLanguageFileFromTsFile,
  getAltLanguageFilePath,
  getTSFileFromDevLanguageFile,
  getDevLanguageFileFromAltLanguageFile,
  isDevLanguageFile,
  isAltLanguageFile,
} from './utils';

describe('getDevLanguageFileFromTsFile', () => {
  it('should find a translation.json file', () => {
    expect(getDevLanguageFileFromTsFile('/my/foobar/index.ts')).toBe(
      '/my/foobar/translations.json',
    );
  });
});

describe('getAltLanguageFilePath', () => {
  it('should find a translation.json file', () => {
    expect(getAltLanguageFilePath('/my/awesome/translations.json', 'fr')).toBe(
      '/my/awesome/fr.translations.json',
    );
  });
});

describe('getTSFileFromDevLanguageFile', () => {
  it('should find a translation.ts file', () => {
    expect(getTSFileFromDevLanguageFile('/my/foobar/translations.json')).toBe(
      '/my/foobar/index.ts',
    );
  });
});

describe('getDevLanguageFileFromAltLanguageFile', () => {
  it('should find a translation.json file', () => {
    expect(
      getDevLanguageFileFromAltLanguageFile(
        '/my/awesome/__translations__/fr.translations.json',
      ),
    ).toBe('/my/awesome/__translations__/translations.json');
  });
});

describe('isDevLanguageFile', () => {
  it('should match dev language filename', () => {
    expect(
      isDevLanguageFile('/my/awesome/__translations__/translations.json'),
    ).toBe(true);
  });

  it('should match relative dev language filename', () => {
    expect(isDevLanguageFile('translations.json')).toBe(true);
  });

  it('should not match alt language filename', () => {
    expect(
      isDevLanguageFile('/my/awesome/__translations__/fr.translations.json'),
    ).toBe(false);
  });
});

describe('isAltLanguageFile', () => {
  it('should match alt language filename', () => {
    expect(
      isAltLanguageFile('/my/awesome/__translations__/fr.translations.json'),
    ).toBe(true);
  });

  it('should match relative alt language filename', () => {
    expect(isAltLanguageFile('fr.translations.json')).toBe(true);
  });

  it('should not match alt language filename', () => {
    expect(
      isAltLanguageFile('/my/awesome/__translations__/translations.json'),
    ).toBe(false);
  });
});
