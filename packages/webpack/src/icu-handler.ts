import { ParsedICUMessages, RawJsonTranslations } from '@vocab/types';
import IntlMessageFormat from 'intl-messageformat';

const moduleCache = new WeakMap();

export const getParsedICUMessages = (
  m: RawJsonTranslations,
  locale: string,
): ParsedICUMessages<any> => {
  if (moduleCache.has(m)) {
    return moduleCache.get(m);
  }

  const parsedICUMessages: ParsedICUMessages<any> = {};

  for (const translation of Object.keys(m)) {
    parsedICUMessages[translation] = new IntlMessageFormat(
      m[translation],
      locale,
    );
  }

  moduleCache.set(m, parsedICUMessages);

  return parsedICUMessages;
};
