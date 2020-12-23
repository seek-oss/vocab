import { TranslationModule, TranslationMessagesByKey } from '@vocab/types';

import { getParsedICUMessages } from './icu-handler';

export const createLanguage = (
  module: TranslationMessagesByKey,
  id: string,
): TranslationModule<any> => ({
  id,
  getValue: (locale) => getParsedICUMessages(module, locale),
  load: () => Promise.resolve(),
});
