import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createLanguage } from './create-language';
import { getLanguageRegistry } from './language-registry';

const moduleId = 'virtual:vocab-en-1a2b3c4d.js';
const messages = { greeting: 'Hello {name}' };

describe('createLanguage', () => {
  beforeEach(() => {
    getLanguageRegistry().clear();
  });

  it('synchronously reads messages registered by an evaluated language chunk', () => {
    const loadImport = vi.fn();
    getLanguageRegistry().set(moduleId, messages);

    const language = createLanguage(moduleId, loadImport);

    expect(language.getValue('en')?.greeting.format({ name: 'world' })).toBe(
      'Hello world',
    );
    expect(loadImport).not.toHaveBeenCalled();
  });

  it('reads messages registered as a side effect of loading a language', async () => {
    const loadImport = vi.fn(async () => {
      getLanguageRegistry().set(moduleId, messages);
    });
    const language = createLanguage(moduleId, loadImport);

    expect(language.getValue('en')).toBeUndefined();

    await language.load();

    expect(language.getValue('en')?.greeting.format({ name: 'world' })).toBe(
      'Hello world',
    );
    expect(loadImport).toHaveBeenCalledOnce();
  });

  it('memoizes language loads', async () => {
    const loadImport = vi.fn(() => Promise.resolve());
    const language = createLanguage(moduleId, loadImport);

    const firstLoad = language.load();
    const secondLoad = language.load();

    expect(firstLoad).toBe(secondLoad);
    await firstLoad;
    expect(loadImport).toHaveBeenCalledOnce();
  });
});
