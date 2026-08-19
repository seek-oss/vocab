import type { TranslationModule } from '@vocab/core';
import { getParsedICUMessages } from '@vocab/core/icu-handler';
import { getTranslationRegistry } from './translation-registry';

export const createLanguage = (
  moduleId: string,
  loadImport: () => Promise<any>,
): TranslationModule<any> => {
  let promiseValue: Promise<any>;
  let resolvedValue: any;

  return {
    getValue: (locale) => {
      resolvedValue ??= getTranslationRegistry().get(moduleId);

      if (!resolvedValue) {
        return undefined;
      }
      return getParsedICUMessages(resolvedValue, locale);
    },
    load: () => {
      if (!promiseValue) {
        promiseValue = loadImport();
        promiseValue.then((value) => {
          resolvedValue = value.default;
        });
      }
      return promiseValue;
    },
  };
};
