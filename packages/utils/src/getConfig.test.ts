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
});
