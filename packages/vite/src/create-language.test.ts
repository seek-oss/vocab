import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createLanguage } from './create-language';
import { getLanguageRegistry } from './language-registry';

const moduleId = 'virtual:vocab-en.json?source=abc';
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

  it('registers messages before load() fulfills', async () => {
    const loadImport = vi.fn().mockResolvedValue({ default: messages });
    const language = createLanguage(moduleId, loadImport);

    expect(language.getValue('en')).toBeUndefined();

    await language.load();

    expect(language.getValue('en')?.greeting.format({ name: 'world' })).toBe(
      'Hello world',
    );
    expect(loadImport).toHaveBeenCalledOnce();
  });

  it('reads value.default or the module namespace', async () => {
    const loadImport = vi.fn().mockResolvedValue(messages);
    const language = createLanguage(moduleId, loadImport);

    await language.load();

    expect(language.getValue('en')?.greeting.format({ name: 'world' })).toBe(
      'Hello world',
    );
  });
});
