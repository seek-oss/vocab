import { TranslationFile, LanguageName } from '@vocab/types';
import React, {
  FunctionComponent,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
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

type UseTranslationsReturn<Translations extends BaseTranslation> = {
  ready: boolean;
  t: TranslateFn<Translations>;
};

// Ideally we could extract the translation keys from the Array. Using overload strategy supporting upto 3 files for now.
export function useTranslations<Translations extends BaseTranslation>(
  translations: TranslationFile<Translations>,
): UseTranslationsReturn<Translations>;
export function useTranslations<
  TranslationsA extends BaseTranslation,
  TranslationsB extends BaseTranslation
>(
  translationsA: TranslationFile<TranslationsA>,
  translationsB: TranslationFile<TranslationsB>,
): UseTranslationsReturn<TranslationsA & TranslationsB>;
export function useTranslations<
  TranslationsA extends BaseTranslation,
  TranslationsB extends BaseTranslation,
  TranslationsC extends BaseTranslation
>(
  translationsA: TranslationFile<TranslationsA>,
  translationsB: TranslationFile<TranslationsB>,
  translationsC: TranslationFile<TranslationsC>,
): UseTranslationsReturn<TranslationsA & TranslationsB & TranslationsC>;
export function useTranslations(
  ...translationFiles: Array<TranslationFile<BaseTranslation>>
): UseTranslationsReturn<BaseTranslation> {
  const { language, locale } = useLanguage();
  const [, forceRender] = useReducer((s: number) => s + 1, 0);
  const ready = useRef(true);

  const [allTranslations, loadPromises] = useMemo(() => {
    const loads = [];
    const combinedTranslations = {};

    for (const translationFile of translationFiles) {
      if (!translationFile[language]) {
        throw new Error(
          `Translations does not include passed language "${language}". Translations include possible options ${Object.keys(
            translationFile,
          )}`,
        );
      }

      const value = translationFile[language].getValue(locale || language);

      if (!value) {
        if (SERVER_RENDERING) {
          throw new Error(
            `Translations not syncronously available on server render. Applying translations dynamically server-side is not supported.`,
          );
        }

        loads.push(() => translationFile[language].load());
      }

      Object.assign(combinedTranslations, value);
    }

    return [combinedTranslations, loads];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, locale, ready.current, ...translationFiles]);

  useEffect(() => {
    if (loadPromises.length) {
      Promise.all(loadPromises.map((load) => load())).then(() => {
        ready.current = false;

        forceRender();
      });
    } else {
      ready.current = true;
    }
  }, [loadPromises]);

  if (loadPromises.length) {
    return { t: () => ' ', ready: false };
  }

  function t(key: string, params?: any) {
    // @ts-expect-error
    if (!allTranslations?.[key]) {
      return null;
    }

    // @ts-expect-error
    return allTranslations[key].format<string>(params);
  }

  return {
    ready: true,
    t,
  };
}
