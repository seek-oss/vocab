import { describe, expect, it, vi } from 'vitest';

import { createLanguage } from './create-language';

const messages = { greeting: 'Hello {name}' };

describe('createLanguage', () => {
  it('does not expose messages before load()', () => {
    const language = createLanguage(vi.fn());

    expect(language.getValue('en')).toBeUndefined();
  });

  it('makes getValue readable as soon as load() fulfills', async () => {
    const language = createLanguage(() =>
      Promise.resolve({ default: messages }),
    );

    await language.load();

    expect(language.getValue('en')?.greeting.format({ name: 'world' })).toBe(
      'Hello world',
    );
  });

  it('accepts modules that export messages as the module value', async () => {
    const language = createLanguage(() => Promise.resolve(messages));

    await language.load();

    expect(language.getValue('en')?.greeting.format({ name: 'world' })).toBe(
      'Hello world',
    );
  });

  it('returns the same promise from subsequent load() calls', () => {
    const language = createLanguage(() =>
      Promise.resolve({ default: messages }),
    );

    expect(language.load()).toBe(language.load());
  });
});
