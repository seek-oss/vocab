import type { TranslationMessagesByKey } from '@vocab/core';

export const languageRegistryKey = '@vocab/vite/language-modules';

export const getLanguageRegistry = () => {
  const registrySymbol = Symbol.for(languageRegistryKey);
  const globalObject = globalThis as typeof globalThis & {
    [registrySymbol]?: Map<string, TranslationMessagesByKey>;
  };

  return (globalObject[registrySymbol] ??= new Map());
};
