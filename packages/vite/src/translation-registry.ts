import type { TranslationMessagesByKey } from '@vocab/core';

export const translationRegistryKey = '@vocab/vite/translation-registry';

export const getTranslationRegistry = () => {
  const registrySymbol = Symbol.for(translationRegistryKey);
  const globalObject = globalThis as typeof globalThis & {
    [registrySymbol]?: Map<string, TranslationMessagesByKey>;
  };

  return (globalObject[registrySymbol] ??= new Map());
};
