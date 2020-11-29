import FormData from 'form-data';

import { callPhrase, ensureBranch } from './phrase-api';
import { trace } from './logger';
import { loadAllTranslations, getUniqueKey } from '@vocab/core';
import { UserConfig } from '@vocab/types';

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
    { fallbacks: 'none' },
    config,
  );
  const allLanguages = config.languages.map((v) => v.name);
  await ensureBranch(branch);

  const phraseTranslations: Record<string, TranslationFile> = {};

  for (const loadedTranslation of allLanguageTranslations) {
    for (const language of allLanguages) {
      const localTranslations = loadedTranslation.languages.get(language);
      if (!localTranslations) {
        continue;
      }
      if (!phraseTranslations[language]) {
        phraseTranslations[language] = {};
      }
      for (const localKey of Object.keys(localTranslations)) {
        const phraseKey = getUniqueKey(localKey, loadedTranslation.namespace);
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
