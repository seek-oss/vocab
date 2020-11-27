import FormData from 'form-data';

import { callPhrase, ensureBranch, getUniqueNameForFile } from './phrase-api';
import { trace } from './logger';
import { loadAllTranslations } from '@vocab/core';
import { UserConfig } from '@vocab/types';
import { getPhraseKey } from './utils';

interface TranslationFile {
  [k: string]: { message: string; description?: string };
}

async function uploadFile(
  contents: TranslationFile,
  locale_id: string,
  branch: string,
) {
  const formData = new FormData();
  formData.append('file', Buffer.from(JSON.stringify(contents)), {
    contentType: 'application/json',
    filename: `${locale_id}.json`,
  });

  formData.append('file_format', 'json');
  formData.append('locale_id', locale_id);
  formData.append('branch', branch);
  formData.append('update_translations', 'true');

  trace('Starting to upload:', locale_id);

  await callPhrase(`uploads`, {
    method: 'POST',
    body: formData,
  });
  trace('Successfully Uploaded:', locale_id, '\n');
}

interface PushOptions {
  branch: string;
}

/**
 * Uploading to the Phrase API for each language. Adding a unique namespace to each key using file path they key came from
 */
export async function push({ branch }: PushOptions, config: UserConfig) {
  const allLanguageTranslations = await loadAllTranslations(
    { useFallbacks: false },
    config,
  );
  const allLanguages = config.languages.map((v) => v.name);
  await ensureBranch(branch);

  const phraseTranslations: Record<string, TranslationFile> = {};
  const uniqueNames = new Set();

  for (const loadedTranslation of allLanguageTranslations) {
    const uniqueName = getUniqueNameForFile(loadedTranslation);
    if (uniqueNames.has(uniqueName)) {
      throw new Error(
        `Duplicate unique names found. Improve name hashing algorthym. Hash: "${uniqueName}"`,
      );
    }
    uniqueNames.add(uniqueName);
    for (const language of allLanguages) {
      const localTranslations = loadedTranslation.languages.get(language);
      if (!localTranslations) {
        continue;
      }
      if (!phraseTranslations[language]) {
        phraseTranslations[language] = {};
      }
      for (const localKey of Object.keys(localTranslations)) {
        const phraseKey = getPhraseKey(localKey, uniqueName);
        if (phraseTranslations[language][phraseKey]) {
          throw new Error(`Duplicate key found. Key "${phraseKey}"`);
        }
        phraseTranslations[language][phraseKey] = localTranslations[localKey];
      }
    }
  }

  for (const language of allLanguages) {
    if (phraseTranslations[language]) {
      await uploadFile(phraseTranslations[language], language, branch);
    }
  }
}
