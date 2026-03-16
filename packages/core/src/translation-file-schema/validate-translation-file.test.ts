import { validateTranslationFile } from './index';

describe('validateTranslationFile', () => {
  it('parses file with only message (separated-style)', () => {
    const data = {
      hello: { message: 'Hello' },
      world: { message: 'world' },
    };
    const result = validateTranslationFile(data);
    expect(result).toEqual(data);
    expect(result.hello).toEqual({ message: 'Hello' });
  });

  it('parses file with only dev-language key and other lang keys (merged-style)', () => {
    const data = {
      hello: {
        en: { message: 'Hello' },
        fr: { message: 'Bonjour' },
      },
    };
    const result = validateTranslationFile(data);
    expect(result).toEqual(data);
  });

  it('parses file with message and lang keys (mixed)', () => {
    const data = {
      hello: {
        message: 'Hello',
        fr: { message: 'Bonjour' },
      },
    };
    const result = validateTranslationFile(data);
    expect(result).toEqual(data);
  });

  it('parses file with string form for language values (preferred)', () => {
    const data = {
      hello: {
        message: 'Hello',
        fr: 'Bonjour de Vocab',
      },
    };
    const result = validateTranslationFile(data);
    expect(result.hello).toEqual({ message: 'Hello', fr: 'Bonjour de Vocab' });
  });

  it('parses file with message and translations (inline)', () => {
    const data = {
      hello: {
        message: 'Hello',
        translations: { fr: { message: 'Bonjour' } },
      },
    };
    const result = validateTranslationFile(data);
    expect(result).toEqual(data);
  });

  it('parses file with _meta and $namespace', () => {
    const data = {
      _meta: { tags: ['a'] },
      $namespace: 'ns',
      hello: { message: 'Hello' },
    };
    const result = validateTranslationFile(data);
    expect(result).toEqual(data);
  });

  it('throws on non-object', () => {
    expect(() => validateTranslationFile(null)).toThrow(
      'Invalid translation file: must be a unified format object',
    );
    expect(() => validateTranslationFile('string')).toThrow(
      'Invalid translation file: must be a unified format object',
    );
  });
});
