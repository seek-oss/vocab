import { TranslationModule, TranslationMessagesByKey } from '@vocab/types';

import { getParsedICUMessages } from './icu-handler';

export const createLanguage = (
  module: TranslationMessagesByKey,
): TranslationModule<any> => ({
  getValue: (locale) => getParsedICUMessages(module, locale),
  load: () => Promise.resolve(),
});
