import type { TranslationModule } from '@vocab/core';
import { getParsedICUMessages } from '@vocab/core/icu-handler';

export { createTranslationFile } from '@vocab/core/translation-file';

export const createLanguage = (
  loadImport: () => Promise<any>,
): TranslationModule<any> => {
  let promiseValue: Promise<any>;
  let resolvedValue: any;

  return {
    getValue: (locale) => {
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
