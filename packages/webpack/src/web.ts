/* eslint-disable no-console */
import type { TranslationModule, TranslationMessagesByKey } from '@vocab/types';
import { getParsedICUMessages } from '@vocab/core/icu-handler';

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
        console.error(
          `@vocab/webpack getValue: Module not found ${moduleId} in:`,
          Object.keys(
            // @ts-expect-error Missing webpack types
            __webpack_modules__,
          ),
        );

        try {
          // @ts-expect-error Missing webpack types
          const m = __webpack_require__(moduleId) as TranslationMessagesByKey;
          console.log('Why did the require not error?');
          return getParsedICUMessages(m, locale);
        } catch (error) {
          console.log('An expected error requiring', error);
          return undefined;
        }
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
