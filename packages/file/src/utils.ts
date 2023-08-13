import {
  type ConsolidatedTranslation,
  getAltLanguageFilePath,
  getUniqueKey,
  type LoadedTranslation,
  type TranslationFileContents,
} from '@vocab/core';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { log, trace } from './logger';

interface MessageChange {
  key: string;
  newValue: string;
  oldValue: string | undefined;
}

export const getFormatFromPath = (filePath: string | undefined) =>
  filePath && filePath.endsWith('.json') ? 'json' : 'csv';

export const getGlobalKeyToConsolidatedTranslationMap = (
  translations: ConsolidatedTranslation[],
) => Object.fromEntries(translations.map((t) => [t.globalKey, t]));

/**
 * Updates the messages in the given translation file on disk with the given changes.
 *
 * Only messages are updates, not metadata, descriptions, or tags.
 *
 * For performance reasons the existing content is written as it would have already been needed to identify any changes changes.
 *
 * @param filePath Relative path to the translation file
 * @param existingContent The existing content of the translation file.
 * @param changes
 */
async function updateTranslationFileMessages(
  filePath: string,
  existingContent: TranslationFileContents,
  changes: MessageChange[],
) {
  if (changes.length === 0) {
    trace(`No changes in file ${filePath}`);
    return;
  }

  log(
    `Updating ${
      changes.length
    } translations in ${filePath}. Including: ${changes
      .slice(0, 3)
      .map(({ key }) => key)
      .join(', ')}`,
  );

  const newContent = { ...existingContent };

  changes.forEach(({ key, newValue }) => {
    if (newContent[key]) {
      newContent[key].message = newValue;
    } else {
      newContent[key] = { message: newValue };
    }
  });

  await mkdir(path.dirname(filePath), {
    recursive: true,
  });

  await writeFile(filePath, `${JSON.stringify(newContent, null, 2)}\n`);
}

function getChanges(
  keys: string[],
  getExistingMessage: (key: string) => string | undefined,
  getExternalMessage: (key: string) => string | undefined,
) {
  const changes: MessageChange[] = [];
  for (const key of keys) {
    const existingMessage = getExistingMessage(key);
    const externalMessage = getExternalMessage(key);
    if (!externalMessage && existingMessage) {
      trace(
        `No translation for key ${key}. The translation may have been deleted. Deleted translations are currently ignored.`,
      );
    } else if (existingMessage !== externalMessage && externalMessage) {
      changes.push({
        key,
        newValue: externalMessage,
        oldValue: existingMessage,
      });
    }
  }
  return changes;
}

/**
 * Merges in the given external translations into the translations, writing the changes to disk.
 *
 * Note: Doesn't not currently support updating metadata, descriptions, or tags. Only the messages themselves.
 */
export async function mergeInExternalTranslations(
  loadedTranslations: LoadedTranslation[],
  externalTranslations: ConsolidatedTranslation[],
  devLanguage: string,
  altLanguages: string[],
) {
  for (const loadedTranslation of loadedTranslations) {
    const devTranslations = loadedTranslation.languages[devLanguage];

    if (!devTranslations) {
      throw new Error('No dev language translations loaded');
    }

    const defaultValues: TranslationFileContents = { ...devTranslations };
    const existingKeys = Object.keys(defaultValues).filter(
      (key) => key !== '_meta',
    );

    const mapExternalTranslations =
      getGlobalKeyToConsolidatedTranslationMap(externalTranslations);

    const getExternalMessage = (language: string, key: string) =>
      mapExternalTranslations[getUniqueKey(key, loadedTranslation.namespace)]
        ?.messageByLanguage[language] || undefined;
    {
      const changes = getChanges(
        existingKeys,
        (key) => defaultValues[key].message,
        (key) => getExternalMessage(devLanguage, key),
      );

      updateTranslationFileMessages(
        loadedTranslation.filePath,
        defaultValues,
        changes,
      );
    }

    for (const altLanguage of altLanguages) {
      if (altLanguage in externalTranslations) {
        const altTranslations = {
          ...loadedTranslation.languages[altLanguage],
        };

        const changes = getChanges(
          existingKeys,
          (key) => altTranslations[key]?.message,
          (key) => getExternalMessage(altLanguage, key),
        );

        const altTranslationFilePath = getAltLanguageFilePath(
          loadedTranslation.filePath,
          altLanguage,
        );

        updateTranslationFileMessages(
          altTranslationFilePath,
          altTranslations,
          changes,
        );
      }
    }
  }
}
