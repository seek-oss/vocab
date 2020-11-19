import { TranslationModule, RawJsonTranslations } from '@vocab/types';

import { getParsedICUMessages } from './icu-handler';

export const createLanguage = (
  moduleId: string,
  loadImport: () => Promise<any>,
  locale: string,
): TranslationModule<any> => {
  let promiseValue: Promise<any>;

  return {
    getValue: () => {
      // @ts-expect-error Missing webpack types
      if (!__webpack_modules__[moduleId]) {
        return undefined;
      }

      // @ts-expect-error Missing webpack types
      const m = __webpack_require__(moduleId) as RawJsonTranslations;

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
