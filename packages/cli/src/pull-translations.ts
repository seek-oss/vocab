import { promises as fs } from 'fs';
import path from 'path';

import {
  getAllTranslationFiles,
  getAltLanguageFilePath,
  getAltLanguages,
  getDefaultLanguage,
} from '@vocab/utils';

import { callPhrase, getUniqueNameForFile } from './phrase-api';

const alternativeLanguages = getAltLanguages();
const defaultlanguage = getDefaultLanguage();

interface TranslationFile {
  [k: string]: { message: string; description?: string };
}
type Language = string;

function readTranslationFromDisk<Optional extends boolean>(
  relativePath: string,
  optional: Optional,
): Optional extends false ? TranslationFile : TranslationFile | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const result = require(path.resolve(relativePath));
    return result;
  } catch (error) {
    if (optional) {
      // @ts-ignore
      return null;
    }
    throw error;
  }
}

async function getAllTranslationsFromPhrase(
  branch: string,
): Promise<Record<Language, TranslationFile>> {
  const phraseResult: Array<{
    key: { name: string };
    locale: { code: string };
    content: string;
  }> = await callPhrase(`translations?branch=${branch}&per_page=100`);
  const translations: Record<Language, TranslationFile> = {};
  for (const r of phraseResult) {
    if (!translations[r.locale.code]) {
      translations[r.locale.code] = {};
    }
    translations[r.locale.code][r.key.name] = { message: r.content };
  }
  return translations;
}

function getPhraseKey(key: string, namespace: string) {
  return `${namespace}-${key}`;
}

interface PullOptions {
  branch?: string;
}
export default async function pull({
  branch = 'local-development',
}: PullOptions) {
  const allTranslations = await getAllTranslationsFromPhrase(branch);
  const uniqueNames = new Set();
  const files = await getAllTranslationFiles();
  for (const relativePath of files) {
    const uniqueName = getUniqueNameForFile(relativePath);
    if (uniqueNames.has(uniqueName)) {
      throw new Error(
        'Duplicate unique names found. Improve name hasing algorthym',
      );
    }
    uniqueNames.add(uniqueName);
    const defaultValues = readTranslationFromDisk(relativePath, false);

    const localKeys = Object.keys(defaultValues);

    for (const key of localKeys) {
      defaultValues[key] = {
        ...defaultValues[key],
        ...allTranslations[defaultlanguage][getPhraseKey(key, uniqueName)],
      };
    }
    await fs.writeFile(
      relativePath,
      `${JSON.stringify(defaultValues, null, 2)}\n`,
    );

    for (const alternativeLanguage of alternativeLanguages) {
      const alternativeLanguageFilePath = getAltLanguageFilePath(
        relativePath,
        alternativeLanguage,
      );
      const extraValues =
        readTranslationFromDisk(alternativeLanguageFilePath, true) || {};

      for (const key of localKeys) {
        if (
          !allTranslations[alternativeLanguage][getPhraseKey(key, uniqueName)]
            .message
        ) {
          throw new Error('Error. No message on translation');
        }
        extraValues[key] = {
          ...extraValues[key],
          message:
            allTranslations[alternativeLanguage][getPhraseKey(key, uniqueName)]
              .message,
        };
      }
      await fs.mkdir(path.dirname(alternativeLanguageFilePath), {
        recursive: true,
      });
      await fs.writeFile(
        alternativeLanguageFilePath,
        `${JSON.stringify(extraValues, null, 2)}\n`,
      );
    }
  }
}
