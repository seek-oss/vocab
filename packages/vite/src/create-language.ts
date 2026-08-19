import type { TranslationModule } from '@vocab/core';
import { getParsedICUMessages } from '@vocab/core/icu-handler';

import { getLanguageRegistry } from './language-registry';

export const createLanguage = (
  moduleId: string,
  loadImport: () => Promise<any>,
): TranslationModule<any> => {
  let promiseValue: Promise<void>;

  return {
    getValue: (locale) => {
      const messages = getLanguageRegistry().get(moduleId);
      if (!messages) {
        return undefined;
      }
      return getParsedICUMessages(messages, locale);
    },
    load: () => {
      if (!promiseValue) {
        promiseValue = loadImport().then((value) => {
          const messages = value.default ?? value;
          getLanguageRegistry().set(moduleId, messages);
        });
      }
      return promiseValue;
    },
  };
};
