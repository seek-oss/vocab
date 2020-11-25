import { validateConfig } from './getConfig';

describe('validateConfig', () => {
  it('should allow a valid config', () => {
    const config = { devLanguage: 'en', languages: [{ name: 'en' }] };
    expect(() => validateConfig(config)).not.toThrow();
  });

  it('should add defaults to config', () => {
    const config: any = { devLanguage: 'en', languages: [{ name: 'en' }] };
    validateConfig(config);
    expect(config.translationsDirname).toBe('__translations__');
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

  it('should throw an error when there are duplicate languages', () => {
    expect(() =>
      validateConfig({
        devLanguage: 'en',
        languages: [{ name: 'en' }, { name: 'en' }],
      }),
    ).toThrowError(expect.objectContaining({ code: 'DuplicateLanguage' }));
  });

  it('should throw an error when extending a missing language', () => {
    expect(() =>
      validateConfig({
        devLanguage: 'en',
        languages: [{ name: 'en' }, { name: 'en-US', extends: 'en-AU' }],
      }),
    ).toThrowError(expect.objectContaining({ code: 'InvalidExtends' }));
  });
});
