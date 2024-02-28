import type {
  TranslationFile,
  LanguageName,
  ParsedFormatFnByKey,
  ParsedFormatFn,
} from '@vocab/core';
import React, {
  type ReactNode,
  useContext,
  useMemo,
  useReducer,
  isValidElement,
  cloneElement,
  useCallback,
} from 'react';

type Locale = string;

interface TranslationsContextValue {
  /**
   * The `language` passed in to your `VocabProvider`
   */
  language: LanguageName;
  /**
   * The `locale` passed in to your `VocabProvider`
   *
   * Please note that this value will be `undefined` if you have not passed a `locale` to your `VocabProvider`.
   * If your languages are named with IETF language tags, you should just use `language` instead of
   * this value, unless you specifically need to access your `locale` override.
   */
  locale?: Locale;
}

const TranslationsContext = React.createContext<
  TranslationsContextValue | undefined
>(undefined);

// Not extending TranslationsContextValue so we can tailor the docs for each prop to be better
// suited to the provider, rather than for the useLanguage hook
interface VocabProviderProps {
  /**
   * The language to load translations for. Must be one of the language names defined in your `vocab.config.js`.
   */
  language: TranslationsContextValue['language'];
  /**
   * A locale override. By default, Vocab will use the `language` as the locale when formatting messages if
   * `locale` is not set. If your languages are named with IETF language tags, you probably don't need to
   * set this value.
   *
   * You may want to override the locale for a specific language if the default formatting for that locale
   * is not desired.
   *
   * @example
   * // Override the locale for th-TH to use the Gregorian calendar instead of the default Buddhist calendar
   * <VocabProvider language="th-TH" locale="th-TH-u-ca-gregory">
   *   </App>
   * <VocabProvider />
   */
  locale?: TranslationsContextValue['locale'];
  children: ReactNode;
}

/**
 * Provides a translation context for your application
 *
 * @example
 * import { VocabProvider } from '@vocab/react';
 *
 * <VocabProvider language="en">
 *   <App />
 * <VocabProvider />
 */
export const VocabProvider = ({
  children,
  language,
  locale,
}: VocabProviderProps) => {
  const value = useMemo(() => ({ language, locale }), [language, locale]);

  return (
    <TranslationsContext.Provider value={value}>
      {children}
    </TranslationsContext.Provider>
  );
};

/**
 * @returns The `language` and `locale` values passed in to your `VocabProvider`
 */
export const useLanguage = (): TranslationsContextValue => {
  const context = useContext(TranslationsContext);
  if (!context) {
    throw new Error(
      'Attempted to access translation without Vocab context set. Did you forget to render VocabProvider?',
    );
  }
  if (!context.language) {
    throw new Error(
      'Attempted to access translation without language set. Did you forget to pass language to VocabProvider?',
    );
  }

  return context;
};

const SERVER_RENDERING = typeof window === 'undefined';

type FormatXMLElementReactNodeFn = (parts: ReactNode[]) => ReactNode;

type MapToReactNodeFunction<Params extends Record<string, any>> = {
  [key in keyof Params]: Params[key] extends ParsedFormatFn
    ? FormatXMLElementReactNodeFn
    : Params[key];
};

type TranslateFn<FormatFnByKey extends ParsedFormatFnByKey> = {
  <TranslationKey extends keyof FormatFnByKey>(
    key: TranslationKey,
    params: MapToReactNodeFunction<
      Parameters<FormatFnByKey[TranslationKey]>[0]
    >,
  ): ReturnType<FormatFnByKey[TranslationKey]> extends string
    ? string
    : ReactNode | string | Array<ReactNode | string>;
  <TranslationKey extends keyof FormatFnByKey>(
    key: Parameters<FormatFnByKey[TranslationKey]>[0] extends Record<
      string,
      any
    >
      ? never
      : TranslationKey,
  ): string;
};

export function useTranslations<
  Language extends string,
  FormatFnByKey extends ParsedFormatFnByKey,
>(
  translations: TranslationFile<Language, FormatFnByKey>,
): {
  ready: boolean;
  t: TranslateFn<FormatFnByKey>;
} {
  const { language, locale } = useLanguage();
  const [, forceRender] = useReducer((s: number) => s + 1, 0);

  const translationsObject = translations.getLoadedMessages(
    language as any,
    locale || language,
  );

  let ready = true;

  if (!translationsObject) {
    if (SERVER_RENDERING) {
      throw new Error(
        `Translations not synchronously available on server render. Applying translations dynamically server-side is not supported.`,
      );
    }

    translations.load(language as any).then(() => {
      forceRender();
    });
    ready = false;
  }

  const t = useCallback(
    (key: string, params?: any) => {
      if (!translationsObject) {
        return ' ';
      }

      const message = translationsObject?.[key];

      if (!message) {
        // eslint-disable-next-line no-console
        console.error(
          `Unable to find translation for key "${key}". Possible keys are ${Object.keys(
            translationsObject,
          )
            .map((v) => `"${v}"`)
            .join(', ')}`,
        );
        return '';
      }

      const result = message.format(params);

      if (Array.isArray(result)) {
        for (let i = 0; i < result.length; i++) {
          const item = result[i];
          if (
            typeof item === 'object' &&
            item &&
            !item.key &&
            isValidElement(item)
          ) {
            result[i] = cloneElement(item, { key: `_vocab-${i}` });
          }
        }
      }

      return result;
    },
    [translationsObject],
  );

  return {
    ready,
    t,
  };
}
