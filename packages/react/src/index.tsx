import { TranslationFile, LanguageName } from '@vocab/types';
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
  registerModule?: (moduleId: string) => void;
}

const TranslationsContext = React.createContext<TranslationsValue | undefined>(
  undefined,
);

export const VocabProvider: FunctionComponent<TranslationsValue> = ({
  children,
  language,
  registerModule,
  locale,
}) => {
  const value = useMemo(() => ({ language, locale, registerModule }), [
    language,
    locale,
    registerModule,
  ]);

  return (
    <TranslationsContext.Provider value={value}>
      {children}
    </TranslationsContext.Provider>
  );
};

export const useVocabContext = (): TranslationsValue => {
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

export function useTranslations<Translations extends BaseTranslation>(
  translations: TranslationFile<Translations>,
): {
  ready: boolean;
  t: TranslateFn<Translations>;
} {
  const { language, locale, registerModule } = useVocabContext();
  const [, forceRender] = useReducer((s: number) => s + 1, 0);
  if (!translations[language]) {
    throw new Error(
      `Translations does not include passed language "${language}". Translations include possible options ${Object.keys(
        translations,
      )}`,
    );
  }
  const translationsObject = translations[language].getValue(
    locale || language,
  );

  if (!translationsObject) {
    if (SERVER_RENDERING) {
      throw new Error(
        `Translations not syncronously available on server render. Applying translations dynamically server-side is not supported.`,
      );
    }
    translations[language].load().then(() => {
      forceRender();
    });
    return { t: () => ' ', ready: false };
  }

  if (registerModule && typeof translations[language].id === 'string') {
    registerModule(translations[language].id!);
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
