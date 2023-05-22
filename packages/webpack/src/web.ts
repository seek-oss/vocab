import type { TranslationModule, TranslationMessagesByKey } from '@vocab/core';
import { getParsedICUMessages } from '@vocab/core/icu-handler';

export { createTranslationFile } from '@vocab/core/translation-file';

const _interopDefault = (e: any) => (e && e.__esModule ? e : { default: e });

export const createLanguage = (
  loadImport: () => Promise<any>,
): TranslationModule<any> => {
  let promise: Promise<any> | undefined;
  let value: TranslationMessagesByKey | undefined;

  return {
    getValue: (locale) => {
      if (!value) {
        // we don't have the value yet, so we can't parse it
        return;
      }
      return getParsedICUMessages(value, locale);
    },
    load: async () => {
      if (!promise) {
        promise = loadImport();
      }
      // save the value so we can parse it
      value = _interopDefault(await promise).default;
      return promise;
    },
  };
};
