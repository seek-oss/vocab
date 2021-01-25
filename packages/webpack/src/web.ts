import type { TranslationModule, TranslationMessagesByKey } from '@vocab/types';
import { getParsedICUMessages } from '@vocab/core/icu-handler';

export { createTranslationFile } from '@vocab/core/translation-file';

export const createLanguage = (
  moduleId: string,
  loadImport: () => Promise<any>,
): TranslationModule<any> => {
  let promiseValue: Promise<any>;

  return {
    getValue: (locale) => {
      // @ts-expect-error Missing webpack types
      if (!__webpack_modules__[moduleId]) {
        return undefined;
      }

      // @ts-expect-error Missing webpack types
      const m = __webpack_require__(moduleId) as TranslationMessagesByKey;

      return getParsedICUMessages(m, locale);
    },
    load: () => {
      if (!promiseValue) {
        promiseValue = loadImport();
      }
      return promiseValue;
    },
  };
};
