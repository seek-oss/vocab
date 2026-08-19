import type { TranslationModule } from '@vocab/core';
import { getParsedICUMessages } from '@vocab/core/icu-handler';
import { getTranslationRegistry } from './translation-registry';

export const createLanguage = (
  moduleId: string,
  loadImport: () => Promise<unknown>,
): TranslationModule<any> => {
  let promiseValue: Promise<void>;

  return {
    getValue: (locale) => {
      const messages = getTranslationRegistry().get(moduleId);
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
