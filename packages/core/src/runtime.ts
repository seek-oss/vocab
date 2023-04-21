import type { TranslationModule, TranslationMessagesByKey } from './types';

import { getParsedICUMessages } from './icu-handler';

export { createTranslationFile } from './translation-file';

export const createLanguage = (
  module: TranslationMessagesByKey,
): TranslationModule<any> => ({
  getValue: (locale) => getParsedICUMessages(module, locale),
  load: () => Promise.resolve(),
});
