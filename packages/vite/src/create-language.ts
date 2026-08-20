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
        // Language modules register themselves as a side effect. loadImport()
        // is the per-language preload aggregator, which statically imports
        // every translation file for this language.
        promiseValue = loadImport().then(() => undefined);
      }
      return promiseValue;
    },
  };
};
