import { ParsedICUMessages, TranslationMessagesByKey } from '@vocab/types';
import IntlMessageFormat from 'intl-messageformat';

type ICUMessagesByLocale = {
  [locale: string]: ParsedICUMessages<any>;
};

const moduleCache = new WeakMap<
  TranslationMessagesByKey,
  ICUMessagesByLocale
>();

export const getParsedICUMessages = (
  m: TranslationMessagesByKey,
  locale: string,
): ParsedICUMessages<any> => {
  const moduleCachedResult = moduleCache.get(m);

  if (moduleCachedResult && moduleCachedResult[locale]) {
    return moduleCachedResult[locale];
  }

  const parsedICUMessages: ParsedICUMessages<any> = {};

  for (const translation of Object.keys(m)) {
    const intlMessageFormat = new IntlMessageFormat(m[translation], locale);
    parsedICUMessages[translation] = {
      format: (params: any) => intlMessageFormat.format(params),
    };
  }

  moduleCache.set(m, { ...moduleCachedResult, [locale]: parsedICUMessages });

  return parsedICUMessages;
};
