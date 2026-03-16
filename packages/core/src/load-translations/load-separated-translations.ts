import pc from 'picocolors';
import { trace } from 'console';
import { generateLanguageFromTranslations } from '../generate-language';
import type {
  TranslationFileContents,
  TranslationFileMetadata,
  TranslationsByKey,
  UserConfig,
} from '../types';

/** Dev language file with optional $namespace (unified/separated shape). */
type RootTranslationFileContent = TranslationFileContents & {
  $namespace?: string;
};
import {
  getAltLanguageFilePath,
  getAltLanguages,
  type Fallback,
} from '../utils';
import { getNamespaceByFilePath } from './common';
import { getFallbackLanguageOrder } from './language-hierarchy';

export function loadTranslationsFromSeparatedFormat({
  filePath,
  relativePath,
  withTags,
  fallbacks,
  content,
  userConfig,
}: {
  filePath: string;
  relativePath: string;
  withTags?: boolean;
  fallbacks: Fallback;
  content: RootTranslationFileContent;
  userConfig: UserConfig;
}) {
  const languageSet: Record<
    string,
    Record<string, { message: string; description?: string | undefined }>
  > = {};

  const {
    $namespace,
    keys: devTranslation,
    metadata,
  } = getTranslationsFromFile(content, {
    filePath,
    isAltLanguage: false,
    withTags,
  });
  const namespace: string =
    typeof $namespace === 'string'
      ? $namespace
      : getNamespaceByFilePath(relativePath, userConfig);

  trace(`Found file ${filePath}. Using namespace ${namespace}`);

  languageSet[userConfig.devLanguage] = devTranslation;

  const devTranslationNoTags = withTags
    ? stripTagsFromTranslations(devTranslation)
    : devTranslation;
  const altLanguages = getAltLanguages(userConfig);
  for (const languageName of altLanguages) {
    languageSet[languageName] = loadAltLanguageFile(
      {
        filePath,
        languageName,
        devTranslation: devTranslationNoTags,
        fallbacks,
      },
      userConfig,
    );
  }

  for (const generatedLanguage of userConfig.generatedLanguages || []) {
    const { name: generatedLanguageName, generator } = generatedLanguage;
    const baseLanguage = generatedLanguage.extends || userConfig.devLanguage;
    const baseTranslations = languageSet[baseLanguage];

    languageSet[generatedLanguageName] = generateLanguageFromTranslations({
      baseTranslations,
      generator,
    });
  }

  return {
    filePath,
    keys: Object.keys(devTranslation),
    namespace,
    relativePath,
    languages: languageSet,
    metadata,
  };
}

function getTranslationsFromFile(
  translationFileContents: unknown,
  {
    isAltLanguage,
    filePath,
    withTags,
  }: { isAltLanguage: boolean; filePath: string; withTags?: boolean },
): {
  $namespace: unknown;
  keys: TranslationsByKey;
  metadata: TranslationFileMetadata;
} {
  if (!translationFileContents || typeof translationFileContents !== 'object') {
    throw new Error(
      `Unable to read translation file ${filePath}. Translations must be an object.`,
    );
  }

  const { $namespace, _meta, ...keys } =
    translationFileContents as TranslationFileContents;

  if (isAltLanguage && $namespace) {
    printValidationError(
      `Found $namespace in alt language file in ${filePath}. $namespace is only used in the dev language and will be ignored.`,
    );
  }

  if (!isAltLanguage && $namespace && typeof $namespace !== 'string') {
    printValidationError(
      `Found non-string $namespace in language file in ${filePath}. $namespace must be a string.`,
    );
  }

  if (isAltLanguage && _meta?.tags) {
    printValidationError(
      `Found _meta.tags in alt language file in ${filePath}. _meta.tags is only used in the dev language and will be ignored.`,
    );
  }

  // Never return tags if we're fetching translations for an alt language
  const includeTags = !isAltLanguage && withTags;
  const validKeys: TranslationsByKey = {};

  for (const [translationKey, { tags, ...translation }] of Object.entries(
    keys,
  )) {
    if (typeof translation === 'string') {
      printValidationError(
        `Found string for a translation "${translationKey}" in ${filePath}. Translation must be an object of the format {message: string}.`,
      );
      continue;
    }

    if (!translation) {
      printValidationError(
        `Found empty translation "${translationKey}" in ${filePath}. Translation must be an object of the format {message: string}.`,
      );
      continue;
    }

    if (!translation.message || typeof translation.message !== 'string') {
      printValidationError(
        `No message found for translation "${translationKey}" in ${filePath}. Translation must be an object of the format {message: string}.`,
      );
      continue;
    }

    validKeys[translationKey] = {
      ...translation,
      tags: includeTags ? tags : undefined,
    };
  }

  const metadata = { tags: includeTags ? _meta?.tags : undefined };

  return { $namespace, keys: validKeys, metadata };
}

export function loadAltLanguageFile(
  {
    filePath,
    languageName,
    devTranslation,
    fallbacks,
  }: {
    filePath: string;
    languageName: string;
    devTranslation: TranslationsByKey;
    fallbacks: Fallback;
  },
  { devLanguage, languages }: UserConfig,
): TranslationsByKey {
  const altLanguageTranslation = {};

  const fallbackLanguageOrder = getFallbackLanguageOrder({
    languages,
    languageName,
    devLanguage,
    fallbacks,
  });

  trace(
    `Loading alt language file with precedence: ${fallbackLanguageOrder
      .slice()
      .reverse()
      .join(' -> ')}`,
  );

  for (const fallbackLanguage of fallbackLanguageOrder) {
    if (fallbackLanguage !== devLanguage) {
      try {
        const altFilePath = getAltLanguageFilePath(filePath, fallbackLanguage);
        delete require.cache[altFilePath];

        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const translationFile = require(altFilePath);
        const { keys: fallbackLanguageTranslation } = getTranslationsFromFile(
          translationFile,
          {
            filePath: altFilePath,
            isAltLanguage: true,
          },
        );
        Object.assign(
          altLanguageTranslation,
          mergeWithDevLanguageTranslation({
            translation: fallbackLanguageTranslation,
            devTranslation,
          }),
        );
      } catch {
        trace(`Missing alt language file ${getAltLanguageFilePath(
          filePath,
          fallbackLanguage,
        )}
        `);
      }
    } else {
      Object.assign(altLanguageTranslation, devTranslation);
    }
  }

  return altLanguageTranslation;
}

function printValidationError(...params: unknown[]) {
  // eslint-disable-next-line no-console
  console.error(pc.red('Error loading translation:'), ...params);
}

export function stripTagsFromTranslations(translations: TranslationsByKey) {
  return Object.fromEntries(
    Object.entries(translations).map(([key, { tags, ...rest }]) => [key, rest]),
  );
}

export function mergeWithDevLanguageTranslation({
  translation,
  devTranslation,
}: {
  translation: TranslationsByKey;
  devTranslation: TranslationsByKey;
}) {
  // Only use keys from the dev translation
  const keys = Object.keys(devTranslation);
  const newLanguage: TranslationsByKey = {};

  for (const key of keys) {
    if (translation[key]) {
      newLanguage[key] = {
        message: translation[key].message,
        description: devTranslation[key].description,
      };
    }
  }

  return newLanguage;
}
