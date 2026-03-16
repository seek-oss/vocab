import pc from 'picocolors';
import { trace } from 'console';
import { generateLanguageFromTranslations } from '../generate-language';
import type { ValidatedTranslationFile } from '../translation-file-schema';
import type {
  LanguageName,
  TranslationFileMetadata,
  TranslationsByKey,
  UserConfig,
} from '../types';
import { getAltLanguages, type Fallback, getLanguages } from '../utils';
import { getNamespaceByFilePath } from './common';
import {
  loadAltLanguageFile,
  mergeWithDevLanguageTranslation,
} from './load-separated-translations';

function stripTagsFromTranslations(
  translations: TranslationsByKey,
): TranslationsByKey {
  return Object.fromEntries(
    Object.entries(translations).map(([key, { tags, ...rest }]) => [key, rest]),
  );
}

function normalizeLanguageValue(
  val: string | { message: string; validated?: boolean },
): { message: string; validated?: boolean } {
  if (typeof val === 'string') {
    return { message: val };
  }
  return { message: val.message, validated: val.validated };
}

function toTranslationData(obj: {
  message: string;
  validated?: boolean;
  description?: string;
  globalKey?: string;
  tags?: string[];
  skipValidation?: boolean;
}): TranslationsByKey[string] {
  const result: TranslationsByKey[string] = { message: obj.message };
  if (obj.validated !== undefined) {
    result.validated = obj.validated;
  }
  if (obj.description !== undefined) {
    result.description = obj.description;
  }
  if (obj.globalKey !== undefined) {
    result.globalKey = obj.globalKey;
  }
  if (obj.tags !== undefined) {
    result.tags = obj.tags;
  }
  if (obj.skipValidation !== undefined) {
    result.skipValidation = obj.skipValidation;
  }
  return result;
}

function getDevLanguageValue(
  entry: Record<string, unknown>,
  devLanguage: LanguageName,
): { message: string; validated?: boolean } | null {
  const fromMessage = entry.message;
  const fromDevKey = entry[devLanguage];
  let raw: unknown = null;
  if (fromMessage !== undefined && fromMessage !== null) {
    raw = fromMessage;
  } else if (fromDevKey !== undefined && fromDevKey !== null) {
    raw = fromDevKey;
  }
  if (raw === null || raw === undefined) {
    return null;
  }
  if (typeof raw === 'string') {
    return { message: raw };
  }
  if (typeof raw === 'object' && raw !== null && 'message' in raw) {
    const obj = raw as { message: string; validated?: boolean };
    return {
      message:
        typeof obj.message === 'string' ? obj.message : String(obj.message),
      validated: obj.validated,
    };
  }
  return null;
}

function parseUnifiedFormat(
  content: ValidatedTranslationFile,
  userConfig: UserConfig,
  withTags?: boolean,
): Record<LanguageName, TranslationsByKey> {
  const { _meta, $namespace: _ns, ...entries } = content;
  const devLanguage = userConfig.devLanguage;
  const allLanguages = getLanguages({ languages: userConfig.languages });
  const result: Record<LanguageName, TranslationsByKey> = {};
  for (const lang of allLanguages) {
    result[lang] = {};
  }

  const includeTags = withTags ?? false;

  for (const [key, rawEntry] of Object.entries(entries)) {
    if (key === '_meta' || key === '$namespace') {
      continue;
    }
    const entry =
      rawEntry !== null && typeof rawEntry === 'object'
        ? (rawEntry as Record<string, unknown>)
        : {};
    const devValue = getDevLanguageValue(entry, devLanguage);
    if (!devValue) {
      // eslint-disable-next-line no-console
      console.error(
        pc.red('Error loading translation:'),
        `Key "${key}" has no dev language value. Provide either "message" or "${devLanguage}".`,
      );
      continue;
    }
    const description =
      typeof entry.description === 'string' ? entry.description : undefined;
    const globalKey =
      typeof entry.globalKey === 'string' ? entry.globalKey : undefined;
    const tags = Array.isArray(entry.tags) ? entry.tags : undefined;
    const allowUnvalidated = entry.allowUnvalidated === true ? true : undefined;

    result[devLanguage][key] = toTranslationData({
      message: devValue.message,
      validated: devValue.validated,
      description,
      globalKey,
      tags: includeTags ? tags : undefined,
      skipValidation: allowUnvalidated,
    });

    const translations = entry.translations;
    const translationsRecord =
      translations !== null &&
      typeof translations === 'object' &&
      !Array.isArray(translations)
        ? (translations as Record<string, unknown>)
        : {};

    for (const lang of allLanguages) {
      if (lang === devLanguage) {
        continue;
      }
      const fromTopLevel = entry[lang];
      const fromTranslations = translationsRecord[lang];
      let raw: unknown = null;
      if (fromTopLevel !== undefined && fromTopLevel !== null) {
        raw = fromTopLevel;
      } else if (fromTranslations !== undefined && fromTranslations !== null) {
        raw = fromTranslations;
      }
      if (raw === null || raw === undefined) {
        continue;
      }
      const normalized = normalizeLanguageValue(
        raw as string | { message: string; validated?: boolean },
      );
      result[lang][key] = toTranslationData({
        message: normalized.message,
        validated: normalized.validated,
        description: lang === devLanguage ? description : undefined,
        globalKey: lang === devLanguage ? globalKey : undefined,
        skipValidation: allowUnvalidated,
      });
    }
  }

  return result;
}

function getInlineAltLanguage(
  content: ValidatedTranslationFile,
  langCode: LanguageName,
  devLanguage: LanguageName,
  devTranslation: TranslationsByKey,
  withTags?: boolean,
): TranslationsByKey {
  const { _meta, $namespace: _ns, ...entries } = content;
  const out: TranslationsByKey = {};
  const includeTags = withTags ?? false;

  for (const [key, rawEntry] of Object.entries(entries)) {
    if (key === '_meta' || key === '$namespace') {
      continue;
    }
    if (!devTranslation[key]) {
      continue;
    }
    const entry =
      rawEntry !== null && typeof rawEntry === 'object'
        ? (rawEntry as Record<string, unknown>)
        : {};
    const translations = entry.translations;
    const translationsRecord =
      translations !== null &&
      typeof translations === 'object' &&
      !Array.isArray(translations)
        ? (translations as Record<string, unknown>)
        : {};
    const fromTopLevel = entry[langCode];
    const fromTranslations = translationsRecord[langCode];
    let raw: unknown = null;
    if (fromTopLevel !== undefined && fromTopLevel !== null) {
      raw = fromTopLevel;
    } else if (fromTranslations !== undefined && fromTranslations !== null) {
      raw = fromTranslations;
    }
    if (raw === null || raw === undefined) {
      continue;
    }
    const normalized = normalizeLanguageValue(
      raw as string | { message: string; validated?: boolean },
    );
    const devData = devTranslation[key];
    out[key] = toTranslationData({
      message: normalized.message,
      validated: normalized.validated,
      description: devData?.description,
      globalKey: devData?.globalKey,
      tags: includeTags && Array.isArray(entry.tags) ? entry.tags : undefined,
    });
  }
  return out;
}

export function loadTranslationsFromUnifiedFormat({
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
  content: ValidatedTranslationFile;
  userConfig: UserConfig;
}) {
  const namespace = getNamespaceByFilePath(relativePath, userConfig);
  const languageSet = parseUnifiedFormat(content, userConfig, withTags);

  const devLanguage = userConfig.devLanguage;
  const devTranslation = languageSet[devLanguage] || {};
  const $namespace =
    content.$namespace && typeof content.$namespace === 'string'
      ? content.$namespace
      : undefined;
  const resolvedNamespace = $namespace ?? namespace;
  trace(`Found file ${filePath}. Using namespace ${resolvedNamespace}`);

  const devTranslationNoTags = withTags
    ? stripTagsFromTranslations(devTranslation)
    : devTranslation;
  const altLanguages = getAltLanguages(userConfig);

  for (const languageName of altLanguages) {
    const inline = getInlineAltLanguage(
      content,
      languageName,
      devLanguage,
      devTranslation,
      withTags,
    );
    const fromAltFile = loadAltLanguageFile(
      {
        filePath,
        languageName,
        devTranslation: devTranslationNoTags,
        fallbacks,
      },
      userConfig,
    );
    const merged = mergeWithDevLanguageTranslation({
      translation: { ...fromAltFile, ...inline },
      devTranslation: devTranslationNoTags,
    });
    languageSet[languageName] = merged;
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

  const _meta = content._meta;
  const metadata: TranslationFileMetadata = {
    tags: withTags ? _meta?.tags : undefined,
  };

  return {
    filePath,
    keys: Object.keys(devTranslation),
    namespace: resolvedNamespace,
    relativePath,
    languages: languageSet,
    metadata,
  };
}
