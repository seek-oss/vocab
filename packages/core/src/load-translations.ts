import path from 'path';

import { glob } from 'tinyglobby';
import type {
  TranslationsByKey,
  UserConfig,
  LoadedTranslation,
  LanguageTarget,
  LanguageName,
  TranslationFileMetadata,
} from './types';
import pc from 'picocolors';

import { trace } from './logger';
import {
  defaultTranslationDirSuffix,
  type Fallback,
  getAltLanguageFilePath,
  getAltLanguages,
  getDevTranslationFileGlob,
} from './utils';
import { generateLanguageFromTranslations } from './generate-language';
import {
  altTranslationFileToKeysSchema,
  vocabTranslationFileToLoadedSchema,
} from './translation-json-schema';

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

function getLanguageFallbacks({ languages }: { languages: LanguageTarget[] }) {
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
  languages: LanguageTarget[];
}) {
  const hierarchyMap = new Map<LanguageName, LanguageName[]>();
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

  const fallbackLanguageOrder: string[] = [languageName];

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
  console.error(pc.red('Error loading translation:'), ...params);
}

function getTranslationsFromDevFile(
  translationFileContents: unknown,
  options: { filePath: string; includeTranslationMetadata?: boolean },
): {
  $namespace: string | undefined;
  keys: TranslationsByKey;
  metadata: TranslationFileMetadata;
} {
  return vocabTranslationFileToLoadedSchema(
    options.includeTranslationMetadata,
  ).parse(translationFileContents);
}

function getTranslationsFromAltFile(
  translationFileContents: unknown,
  { filePath }: { filePath: string },
): {
  keys: TranslationsByKey;
} {
  const keys = altTranslationFileToKeysSchema(filePath, (message) =>
    printValidationError(message),
  ).parse(translationFileContents);

  return { keys };
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
        const { keys: fallbackLanguageTranslation } =
          getTranslationsFromAltFile(translationFile, {
            filePath: altFilePath,
          });
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

/** Dev-language snapshot without per-key `tags`, for merging alt files (tags are not propagated from dev into alt). */
function stripTagsFromDevTranslationsForAltMerge(
  translations: TranslationsByKey,
) {
  return Object.fromEntries(
    Object.entries(translations).map(([key, { tags, ...rest }]) => [key, rest]),
  );
}

/**
 * Load a single main `translations.json` and resolved alt (and generated) languages.
 *
 * @param options.includeTranslationMetadata - When `true`, each entry includes `description`, `tags`, `globalKey`, and `metadata.tags` from `_meta`. When `false` or omitted, entries are minimal (`message` and `globalKey` only) and file-level tag metadata is omitted.
 */
export function loadTranslation(
  {
    filePath,
    fallbacks,
    includeTranslationMetadata,
  }: {
    filePath: string;
    fallbacks: Fallback;
    includeTranslationMetadata?: boolean;
  },
  userConfig: UserConfig,
): LoadedTranslation {
  trace(
    `Loading translation file in "${fallbacks}" fallback mode: "${filePath}"`,
  );

  const languageSet: Record<string, TranslationsByKey> = {};

  delete require.cache[filePath];
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const translationContent = require(filePath);
  const relativePath = path.relative(
    userConfig.projectRoot || process.cwd(),
    filePath,
  );
  const {
    $namespace,
    keys: devTranslation,
    metadata,
  } = getTranslationsFromDevFile(translationContent, {
    filePath,
    includeTranslationMetadata,
  });
  const namespace: string =
    typeof $namespace === 'string'
      ? $namespace
      : getNamespaceByFilePath(relativePath, userConfig);

  trace(`Found file ${filePath}. Using namespace ${namespace}`);

  languageSet[userConfig.devLanguage] = devTranslation;

  const devTranslationForAltMerge = includeTranslationMetadata
    ? stripTagsFromDevTranslationsForAltMerge(devTranslation)
    : devTranslation;
  const altLanguages = getAltLanguages(userConfig);
  for (const languageName of altLanguages) {
    languageSet[languageName] = loadAltLanguageFile(
      {
        filePath,
        languageName,
        devTranslation: devTranslationForAltMerge,
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

/**
 * Load every main `translations.json` in the project (per config).
 *
 * @param options.includeTranslationMetadata - See {@link loadTranslation}.
 */
export async function loadAllTranslations(
  {
    fallbacks,
    includeNodeModules,
    includeTranslationMetadata,
  }: {
    fallbacks: Fallback;
    includeNodeModules: boolean;
    includeTranslationMetadata?: boolean;
  },
  config: UserConfig,
): Promise<LoadedTranslation[]> {
  const { projectRoot, ignore = [] } = config;

  const translationFiles = await glob(getDevTranslationFileGlob(config), {
    ignore: includeNodeModules ? ignore : [...ignore, '**/node_modules/**'],
    dot: true,
    absolute: true,
    cwd: projectRoot,
    expandDirectories: false,
  });

  trace(`Found ${translationFiles.length} translation files`);

  const loadedTranslations: LoadedTranslation[] = [];
  const keys = new Set<string>();

  for (const translationFile of translationFiles) {
    const loadedTranslation = loadTranslation(
      { filePath: translationFile, fallbacks, includeTranslationMetadata },
      config,
    );

    loadedTranslations.push(loadedTranslation);

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

  return loadedTranslations;
}
