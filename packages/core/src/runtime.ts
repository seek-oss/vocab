import { TranslationModule, TranslationMessagesByKey } from '@vocab/types';

import { getParsedICUMessages } from './icu-handler';

export const createLanguage = (
  module: TranslationMessagesByKey,
  locale: string,
): TranslationModule<any> => ({
  getValue: () => getParsedICUMessages(module, locale),
  load: () => Promise.resolve(),
});
