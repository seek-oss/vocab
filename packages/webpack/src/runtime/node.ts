import { TranslationModule, RawJsonTranslations } from '@vocab/types';

import { getParsedICUMessages } from './icu-handler';

export const createLanguage = (
  module: RawJsonTranslations,
  locale: string,
): TranslationModule<any> => ({
  getValue: () => getParsedICUMessages(module, locale),
  load: () => Promise.resolve(),
});
