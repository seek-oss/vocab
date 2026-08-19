import type { TranslationMessagesByKey, TranslationModule } from '@vocab/core';
import { getParsedICUMessages } from '@vocab/core/icu-handler';

import { vocabMessagesRegistryKey } from './registry-key';

const REGISTRY_KEY = Symbol.for(vocabMessagesRegistryKey);

type VocabMessageRegistry = Map<string, TranslationMessagesByKey>;

const getRegistry = (): VocabMessageRegistry => {
  const global = globalThis as typeof globalThis & {
    [REGISTRY_KEY]?: VocabMessageRegistry;
  };

  let registry = global[REGISTRY_KEY];
  if (!registry) {
    registry = new Map();
    global[REGISTRY_KEY] = registry;
  }

  return registry;
};

export const registerVocabMessages = (
  id: string,
  messages: TranslationMessagesByKey,
) => {
  getRegistry().set(id, messages);
};

export const getRegisteredVocabMessages = (id: string) => getRegistry().get(id);

export const createLanguage = (
  id: string,
  loadImport: () => Promise<unknown>,
): TranslationModule<any> => {
  let promiseValue: Promise<void>;

  return {
    getValue: (locale) => {
      const messages = getRegisteredVocabMessages(id);
      if (!messages) {
        return undefined;
      }
      return getParsedICUMessages(messages, locale);
    },
    load: () => {
      if (!promiseValue) {
        promiseValue = loadImport().then(() => undefined);
      }
      return promiseValue;
    },
  };
};
