import { validateConfig } from './config';

describe('validateConfig', () => {
  const generator = {
    transformMessage: (message: string) => message,
    transformElement: (message: string) => message,
  };

  it('should allow a valid config', () => {
    const config = { devLanguage: 'en', languages: [{ name: 'en' }] };
    expect(() => validateConfig(config)).not.toThrow();
  });

  it('should throw an error on no config', () => {
    // @ts-expect-error For Science!!!
    expect(() => validateConfig({})).toThrowError(
      expect.objectContaining({ code: 'InvalidStructure' }),
    );
  });

  it("should throw an error when the devLanguage isn't defined in languages", () => {
    expect(() =>
      validateConfig({ devLanguage: 'en', languages: [{ name: 'th' }] }),
    ).toThrowError(expect.objectContaining({ code: 'InvalidDevLanguage' }));
  });

  it('should throw an error when a generated language name conflicts with a real language name', () => {
    expect(() =>
      validateConfig({
        devLanguage: 'en',
        languages: [{ name: 'en' }],
        generatedLanguages: [{ name: 'en', generator }],
      }),
    ).toThrowError(
      expect.objectContaining({ code: 'InvalidGeneratedLanguage' }),
    );
  });

  it("should throw an error when a generated language extends a language that doesn't exist", () => {
    expect(() =>
      validateConfig({
        devLanguage: 'en',
        languages: [{ name: 'en' }],
        generatedLanguages: [{ name: 'pseudo', extends: 'fr', generator }],
      }),
    ).toThrowError(expect.objectContaining({ code: 'InvalidExtends' }));
  });

  it('should throw an error when there are duplicate languages', () => {
    expect(() =>
      validateConfig({
        devLanguage: 'en',
        languages: [{ name: 'en' }, { name: 'en' }],
      }),
    ).toThrowError(expect.objectContaining({ code: 'DuplicateLanguage' }));
  });

  it('should throw an error when there are duplicate generated languages', () => {
    expect(() =>
      validateConfig({
        devLanguage: 'en',
        languages: [{ name: 'en' }],
        generatedLanguages: [
          { name: 'pseudo', generator },
          { name: 'pseudo', generator },
        ],
      }),
    ).toThrowError(
      expect.objectContaining({ code: 'DuplicateGeneratedLanguage' }),
    );
  });

  it('should throw an error when a language extends a missing language', () => {
    expect(() =>
      validateConfig({
        devLanguage: 'en',
        languages: [{ name: 'en' }, { name: 'en-US', extends: 'en-AU' }],
      }),
    ).toThrowError(expect.objectContaining({ code: 'InvalidExtends' }));
  });

  it('should throw an error when a generated language extends a missing language', () => {
    expect(() =>
      validateConfig({
        devLanguage: 'en',
        languages: [{ name: 'en' }],
        generatedLanguages: [{ name: 'pseudo', extends: 'en-US', generator }],
      }),
    ).toThrowError(expect.objectContaining({ code: 'InvalidExtends' }));
  });
});
