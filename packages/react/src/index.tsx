import {
  TranslationFile,
  LanguageName,
  ParsedFormatFnByKey,
  ParsedFormatFn,
} from '@vocab/types';
import React, {
  FunctionComponent,
  ReactNode,
  useContext,
  useMemo,
  useReducer,
  isValidElement,
  cloneElement,
} from 'react';

type Locale = string;

interface TranslationsValue {
  language: LanguageName;
  locale?: Locale;
}

const TranslationsContext = React.createContext<TranslationsValue | undefined>(
  undefined,
);

export const VocabProvider: FunctionComponent<TranslationsValue> = ({
  children,
  language,
  locale,
}) => {
  const value = useMemo(() => ({ language, locale }), [language, locale]);

  return (
    <TranslationsContext.Provider value={value}>
      {children}
    </TranslationsContext.Provider>
  );
};

export const useLanguage = (): TranslationsValue => {
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

  if (!translationsObject) {
    if (SERVER_RENDERING) {
      throw new Error(
        `Translations not synchronously available on server render. Applying translations dynamically server-side is not supported.`,
      );
    }
    translations.load(language as any).then(() => {
      forceRender();
    });
    return {
      t: (() => ' ') as TranslateFn<ParsedFormatFnByKey>,
      ready: false,
    };
  }

  const t = (key: string, params?: any) => {
    if (!translationsObject?.[key]) {
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

    const result = translationsObject[key].format(params);

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
  };

  return {
    ready: true,
    t,
  };
}
