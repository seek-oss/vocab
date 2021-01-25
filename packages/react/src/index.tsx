import {
  TranslationFile,
  LanguageName,
  TranslationRequirementsByKey,
} from '@vocab/types';
import React, {
  FunctionComponent,
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

type TranslateFn<RequirementsByKey extends TranslationRequirementsByKey> = {
  <TranslationKey extends keyof RequirementsByKey>(
    key: TranslationKey,
    params: RequirementsByKey[TranslationKey]['params'] extends Record<
      string,
      any
    >
      ? RequirementsByKey[TranslationKey]['params']
      : Record<string, unknown>,
  ): RequirementsByKey[TranslationKey]['returnType'];
  <TranslationKey extends keyof RequirementsByKey>(
    key: RequirementsByKey[TranslationKey]['params'] extends Record<string, any>
      ? never
      : TranslationKey,
  ): RequirementsByKey[TranslationKey]['returnType'];
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
  // TranslationFile<Language, Translations>['__translatedLanguageRequirements']
  const { language, locale } = useLanguage();
  const [, forceRender] = useReducer((s: number) => s + 1, 0);
  const translationsObject = translations.getMessages(
    language as any,
    locale || language,
  );

  if (!translationsObject) {
    if (SERVER_RENDERING) {
      throw new Error(
        `Translations not syncronously available on server render. Applying translations dynamically server-side is not supported.`,
      );
    }
    translations.load(language as any).then(() => {
      forceRender();
    });
    return { t: () => ' ', ready: false };
  }

  const t: TranslateFn<RequirementsByKey> = (key: string, params?: any) => {
    if (!translationsObject?.[key]) {
      return null;
    }

    return translationsObject[key].format(params as any);
  };

  return {
    ready: true,
    t,
  };
}
