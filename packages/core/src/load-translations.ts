import path from 'path';

import glob from 'fast-glob';
import type {
  TranslationsByKey,
  UserConfig,
  LoadedTranslation,
  LanguageTarget,
  LanguageName,
  TranslationFileMetadata,
  TranslationFileContents,
} from './types';
import chalk from 'chalk';

import { trace } from './logger';
import {
  defaultTranslationDirSuffix,
  type Fallback,
  getAltLanguageFilePath,
  getAltLanguages,
  getDevTranslationFileGlob,
} from './utils';
import { generateLanguageFromTranslations } from './generate-language';

export function getUniqueKey(key: string, namespace: string) {
  return `${key}.${namespace}`;
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

function getLanguageFallbacks({
  languages,
}: {
  languages: Array<LanguageTarget>;
}) {
  const languageFallbackMap = new Map<LanguageName, LanguageName>();

  for (const lang of languages) {
    if (lang.extends) {
      languageFallbackMap.set(lang.name, lang.extends);
    }
  }

  return languageFallbackMap;
}

export function getLanguageHierarchy({
  languages,
}: {
  languages: Array<LanguageTarget>;
}) {
  const hierarchyMap = new Map<LanguageName, Array<LanguageName>>();
  const fallbacks = getLanguageFallbacks({ languages });

  for (const lang of languages) {
    const langHierarchy = [];
    let currLang = lang.extends;

    while (currLang) {
      langHierarchy.push(currLang);

      currLang = fallbacks.get(currLang);
    }

    hierarchyMap.set(lang.name, langHierarchy);
  }

  return hierarchyMap;
}

export function getFallbackLanguageOrder({
  languages,
  languageName,
  devLanguage,
  fallbacks,
}: {
  languages: LanguageTarget[];
  languageName: string;
  devLanguage: string;
  fallbacks: Fallback;
}) {
  const languageHierarchy = getLanguageHierarchy({ languages }).get(
    languageName,
  );

  if (!languageHierarchy) {
    throw new Error(`Missing language hierarchy for ${languageName}`);
  }

  const fallbackLanguageOrder: Array<string> = [languageName];

  if (fallbacks !== 'none') {
    fallbackLanguageOrder.unshift(...languageHierarchy.reverse());

    if (fallbacks === 'all' && fallbackLanguageOrder[0] !== devLanguage) {
      fallbackLanguageOrder.unshift(devLanguage);
    }
  }

  return fallbackLanguageOrder;
}

function getNamespaceByFilePath(
  relativePath: string,
  { translationsDirectorySuffix = defaultTranslationDirSuffix }: UserConfig,
) {
  let namespace = path
    .dirname(relativePath)
    .replace(/^src\//, '')
    .replace(/\//g, '_');

  if (namespace.endsWith(translationsDirectorySuffix)) {
    namespace = namespace.slice(0, -translationsDirectorySuffix.length);
  }

  return namespace;
}

function printValidationError(...params: unknown[]) {
  // eslint-disable-next-line no-console
  console.error(chalk.red('Error loading translation:'), ...params);
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
      } catch (e) {
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

function stripTagsFromTranslations(translations: TranslationsByKey) {
  return Object.fromEntries(
    Object.entries(translations).map(([key, { tags, ...rest }]) => [key, rest]),
  );
}

export function loadTranslation(
  {
    filePath,
    fallbacks,
    withTags,
  }: {
    filePath: string;
    fallbacks: Fallback;
    withTags?: boolean;
  },
  userConfig: UserConfig,
): LoadedTranslation {
  trace(
    `Loading translation file in "${fallbacks}" fallback mode: "${filePath}"`,
  );

  const languageSet: Record<
    string,
    Record<string, { message: string; description?: string | undefined }>
  > = {};

  delete require.cache[filePath];
  const translationContent = require(filePath);
  const relativePath = path.relative(
    userConfig.projectRoot || process.cwd(),
    filePath,
  );
  const {
    $namespace,
    keys: devTranslation,
    metadata,
  } = getTranslationsFromFile(translationContent, {
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

export async function loadAllTranslations(
  {
    fallbacks,
    includeNodeModules,
    withTags,
  }: { fallbacks: Fallback; includeNodeModules: boolean; withTags?: boolean },
  config: UserConfig,
): Promise<Array<LoadedTranslation>> {
  const { projectRoot, ignore = [] } = config;

  const translationFiles = await glob(getDevTranslationFileGlob(config), {
    ignore: includeNodeModules ? ignore : [...ignore, '**/node_modules/**'],
    absolute: true,
    cwd: projectRoot,
  });

  trace(`Found ${translationFiles.length} translation files`);

  const result = await Promise.all(
    translationFiles.map((filePath) =>
      loadTranslation({ filePath, fallbacks, withTags }, config),
    ),
  );

  const keys = new Set<string>();

  for (const loadedTranslation of result) {
    for (const key of loadedTranslation.keys) {
      const uniqueKey = getUniqueKey(key, loadedTranslation.namespace);
      if (keys.has(uniqueKey)) {
        trace(`Duplicate keys found`);
        throw new Error(
          `Duplicate keys found. Key with namespace ${loadedTranslation.namespace} and key ${key} was found multiple times.`,
        );
      }
      keys.add(uniqueKey);

      const globalKey =
        loadedTranslation.languages[config.devLanguage][key].globalKey;
      if (globalKey) {
        if (keys.has(globalKey)) {
          throw new Error(
            `Duplicate keys found. Key with global key ${globalKey} and key ${key} was found multiple times`,
          );
        }
        keys.add(globalKey);
      }
    }
  }
  return result;
}
