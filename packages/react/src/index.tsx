import { TranslationFile } from '@vocab/types';
import React, {
  FunctionComponent,
  ReactNode,
  useContext,
  useReducer,
} from 'react';

type Language = string;

interface TranslationsValue {
  language: Language;
}

const TranslationsContext = React.createContext<TranslationsValue | undefined>(
  undefined,
);

export const TranslationsProvider: FunctionComponent<TranslationsValue> = ({
  children,
  language,
}) => (
  <TranslationsContext.Provider value={{ language }}>
    {children}
  </TranslationsContext.Provider>
);

export const useLanguage = (): Language => {
  const context = useContext(TranslationsContext);
  if (!context) {
    throw new Error(
      'Attempted to access translation without language set. Did you forget to render TranslationsProvider?',
    );
  }
  return context.language;
};
type TranslationItem = {
  message: string;
  params?: Record<string, any>;
  returnType: string | ReactNode;
};

type BaseTranslation = Record<string, TranslationItem>;

const SERVER_RENDERING = typeof window === 'undefined';

type TranslateFn<Translations extends BaseTranslation> = {
  <TranslationKey extends keyof Translations>(
    key: TranslationKey,
    params: Translations[TranslationKey]['params'] extends Record<string, any>
      ? Translations[TranslationKey]['params']
      : Record<string, unknown>,
  ): Translations[TranslationKey]['returnType'];
  <TranslationKey extends keyof Translations>(
    key: Translations[TranslationKey]['params'] extends Record<string, any>
      ? never
      : TranslationKey,
  ): Translations[TranslationKey]['returnType'];
};

export function useTranslation<Translations extends BaseTranslation>(
  translations: TranslationFile<Translations>,
): {
  ready: boolean;
  t: TranslateFn<Translations>;
} {
  const language = useLanguage();
  const [, forceRender] = useReducer((s: number) => s + 1, 0);
  let translationsObject = translations[language].getValue();

  if (!translationsObject) {
    if (SERVER_RENDERING) {
      throw new Error('You should have preloaded this. Call Matt');
    }
    translations[language].load().then(() => {
      translationsObject = translations[language].getValue();
      forceRender();
    });
    return { t: () => ' ', ready: false };
  }

  function t<TranslationKey extends keyof Translations>(
    key: TranslationKey,
    params?: Translations[TranslationKey]['params'],
  ) {
    if (!translationsObject?.[key]) {
      return null;
    }

    return translationsObject[key].format<string>(params);
  }

  return {
    ready: true,
    t,
  };
}
