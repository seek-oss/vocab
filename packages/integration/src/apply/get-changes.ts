import {
  type LoadedTranslation,
  type TranslationFileContents,
  getUniqueKey,
  getAltLanguageFilePath,
} from '@vocab/core';
import { trace } from '../logger';
import type { MessagesByLanguageByKey } from './types';

function getChangesInFile(
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

export interface MessageChange {
  key: string;
  newValue: string;
  oldValue: string | undefined;
}

/**
 * Merges in the given external translations into the translations, writing the changes to disk.
 *
 * Note: Doesn't not currently support updating metadata, descriptions, or tags. Only the messages themselves.
 */
export async function getAllChanges(
  loadedTranslations: LoadedTranslation[],
  externalTranslations: MessagesByLanguageByKey,
  devLanguage: string,
  altLanguages: string[],
) {
  const changesByFile: Record<string, MessageChange[]> = {};

  for (const loadedTranslation of loadedTranslations) {
    const devTranslations = loadedTranslation.languages[devLanguage];

    if (!devTranslations) {
      throw new Error('No dev language translations loaded');
    }

    const devLanguageValues: TranslationFileContents = { ...devTranslations };
    const existingKeys = Object.keys(devLanguageValues).filter(
      (key) => key !== '_meta',
    );

    const getExternalMessage = (
      language: string,
      key: string,
    ): string | undefined => {
      const uniqueKey = getUniqueKey(key, loadedTranslation.namespace);
      return externalTranslations[uniqueKey]?.[language] || undefined;
    };

    // Update Dev Language
    {
      const changes = getChangesInFile(
        existingKeys,
        (key) => devLanguageValues[key].message,
        (key) => getExternalMessage(devLanguage, key),
      );
      if (changes.length > 0) {
        changesByFile[loadedTranslation.filePath] = changes;
      }
    }

    // Update Alt Languages
    for (const altLanguage of altLanguages) {
      const altTranslations = {
        ...loadedTranslation.languages[altLanguage],
      };

      const altTranslationFilePath = getAltLanguageFilePath(
        loadedTranslation.filePath,
        altLanguage,
      );

      const changes = getChangesInFile(
        existingKeys,
        (key) => altTranslations[key]?.message,
        (key) => getExternalMessage(altLanguage, key),
      );

      if (changes.length > 0) {
        changesByFile[altTranslationFilePath] = changes;
      }
    }
  }
  return changesByFile;
}
