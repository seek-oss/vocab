import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  createLanguage,
  getRegisteredVocabMessages,
  registerVocabMessages,
} from './create-language';

import { vocabMessagesRegistryKey } from './registry-key';

const REGISTRY_KEY = Symbol.for(vocabMessagesRegistryKey);

const clearRegistry = () => {
  const global = globalThis as typeof globalThis & {
    [REGISTRY_KEY]?: Map<string, unknown>;
  };
  global[REGISTRY_KEY]?.clear();
};

describe('createLanguage', () => {
  afterEach(() => {
    clearRegistry();
  });

  it('should return messages from the registry without calling load', () => {
    const id = 'virtual:vocab-en.json?source=hello';
    registerVocabMessages(id, { hello: 'Hello' });

    const language = createLanguage(id, () => {
      throw new Error('load should not be called');
    });

    expect(language.getValue('en')?.hello.format()).toBe('Hello');
  });

  it('should return undefined when the id is not registered', () => {
    const language = createLanguage('missing', () => Promise.resolve());

    expect(language.getValue('en')).toBeUndefined();
    expect(getRegisteredVocabMessages('missing')).toBeUndefined();
  });

  it('should memoize load()', async () => {
    const loadImport = vi.fn(() => Promise.resolve());
    const language = createLanguage('virtual:vocab-en.json', loadImport);

    const first = language.load();
    const second = language.load();

    expect(first).toBe(second);
    await first;
    expect(loadImport).toHaveBeenCalledTimes(1);
  });

  it('should read messages registered by load()', async () => {
    const id = 'virtual:vocab-en.json?source=hello';
    const language = createLanguage(id, async () => {
      registerVocabMessages(id, { hello: 'Hello' });
    });

    expect(language.getValue('en')).toBeUndefined();
    await language.load();
    expect(language.getValue('en')?.hello.format()).toBe('Hello');
  });
});
