import {
  TranslationFile,
  LanguageName,
  TranslationRequirementsByKey,
} from '@vocab/types';
import React, {
  FunctionComponent,
  ReactNode,
  useContext,
  useMemo,
  useReducer,
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

type AnyFunction = (...args: any) => any;
type FormatXMLElementReactNodeFn = (parts: ReactNode[]) => ReactNode;

type MapToReactNodeFunction<Params extends Record<string, any>> = {
  [key in keyof Params]: Params[key] extends AnyFunction
    ? FormatXMLElementReactNodeFn
    : Params[key];
};

type TranslateFn<RequirementsByKey extends TranslationRequirementsByKey> = {
  <TranslationKey extends keyof RequirementsByKey>(
    key: TranslationKey,
    params: MapToReactNodeFunction<
      Parameters<RequirementsByKey[TranslationKey]['format']>[0]
    >,
  ): ReturnType<RequirementsByKey[TranslationKey]['format']> extends string
    ? string
    : ReactNode | string | Array<ReactNode | string>;
  <TranslationKey extends keyof RequirementsByKey>(
    key: Parameters<
      RequirementsByKey[TranslationKey]['format']
    >[0] extends Record<string, any>
      ? never
      : TranslationKey,
  ): string;
};

export function useTranslations<
  Language extends string,
  RequirementsByKey extends TranslationRequirementsByKey
>(
  translations: TranslationFile<Language, RequirementsByKey>,
): {
  ready: boolean;
  t: TranslateFn<RequirementsByKey>;
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
      t: (() => ' ') as TranslateFn<TranslationRequirementsByKey>,
      ready: false,
    };
  }

  const t: TranslateFn<RequirementsByKey> = (key: string, params?: any) => {
    if (!translationsObject?.[key]) {
      return null;
    }

    const formattedResult = translationsObject[key].format(params as any);
    return formattedResult;
  };

  return {
    ready: true,
    t,
  };
}
