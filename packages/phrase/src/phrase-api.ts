import type { TranslationsByLanguage } from '@vocab/core';
import type { DiffByLanguage } from './diff-utils';
import { log, trace } from './logger';
import { translationsToCsv } from './csv';
import { callPhrase } from './phrase-api/call-phrase';

export async function pullAllTranslations(
  branch: string,
): Promise<TranslationsByLanguage> {
  const phraseResult = await callPhrase<
    Array<{
      key: { name: string };
      locale: { name: string };
      content: string;
      validated: boolean;
    }>
  >(`translations?branch=${branch}&per_page=100`);

  const translations: TranslationsByLanguage = {};

  for (const r of phraseResult) {
    if (!translations[r.locale.name]) {
      translations[r.locale.name] = {};
    }
    translations[r.locale.name][r.key.name] = {
      message: r.content,
      validated: r.validated,
    };
  }

  return translations;
}

export async function addKey(
  keyName: string,
  keyData: { description?: string; tags?: string[] },
  branch: string,
): Promise<{ id: string; name: string }> {
  const payload = {
    name: keyName,
    branch,
    ...(keyData.description && { description: keyData.description }),
    ...(keyData.tags &&
      keyData.tags.length > 0 && { tags: keyData.tags.join(',') }),
  };

  // Try to create the key first
  const result = await callPhrase<{ id: string; name: string }>(`keys`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  trace(`Created key: ${keyName}`);
  return result;
}

/**
 * Create or update a key in Phrase
 * @param keyName The key name
 * @param keyData Key data including description and tags
 * @param branch Branch name
 * @returns The key object from Phrase
 */
export async function createOrUpdateKey(
  keyName: string,
  keyData: { description?: string; tags?: string[] },
  branch: string,
): Promise<{ id: string; name: string }> {
  const payload = {
    name: keyName,
    branch,
    ...(keyData.description && { description: keyData.description }),
    ...(keyData.tags &&
      keyData.tags.length > 0 && { tags: keyData.tags.join(',') }),
  };

  try {
    // Try to create the key first
    const result = await callPhrase<{ id: string; name: string }>(`keys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    trace(`Created key: ${keyName}`);
    return result;
  } catch {
    // If key already exists, update it
    trace(`Key ${keyName} already exists, updating...`);

    // First, find the key to get its ID
    const existingKeys = await callPhrase<Array<{ id: string; name: string }>>(
      `keys?q=name:${encodeURIComponent(keyName)}&branch=${branch}`,
    );

    const existingKey = existingKeys.find((k) => k.name === keyName);
    if (!existingKey) {
      throw new Error(`Could not find or create key: ${keyName}`);
    }

    // Update the existing key
    const updatedKey = await callPhrase<{ id: string; name: string }>(
      `keys/${existingKey.id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      },
    );

    trace(`Updated key: ${keyName}`);
    return updatedKey;
  }
}

/**
 * Create or update a translation for a key
 * @param keyId The key ID in Phrase
 * @param languageCode The language code
 * @param content The translation content
 * @param branch Branch name
 * @returns The translation object from Phrase
 */
export async function createOrUpdateTranslation(
  keyId: string,
  languageCode: string,
  content: string,
  branch: string,
): Promise<{ id: string; content: string }> {
  // First, get the locale ID for the language
  const locales =
    await callPhrase<Array<{ id: string; code: string }>>(`locales`);

  const locale = locales.find((l) => l.code === languageCode);
  if (!locale) {
    throw new Error(`Locale not found for language: ${languageCode}`);
  }

  const payload = {
    branch,
    content,
  };

  try {
    // Try to create the translation
    const result = await callPhrase<{ id: string; content: string }>(
      `keys/${keyId}/translations`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...payload,
          locale_id: locale.id,
        }),
      },
    );

    trace(
      `Created translation for key ${keyId} in ${languageCode}: ${content}`,
    );
    return result;
  } catch {
    // If translation already exists, update it
    trace(
      `Translation exists for key ${keyId} in ${languageCode}, updating...`,
    );

    // Find the existing translation
    const translations = await callPhrase<
      Array<{ id: string; content: string }>
    >(`keys/${keyId}/translations?branch=${branch}`);

    const existingTranslation = translations.find(
      (t) => t.content !== undefined,
    );
    if (!existingTranslation) {
      throw new Error(
        `Could not find translation for key ${keyId} in ${languageCode}`,
      );
    }

    // Update the existing translation
    const updatedTranslation = await callPhrase<{
      id: string;
      content: string;
    }>(`translations/${existingTranslation.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    trace(
      `Updated translation for key ${keyId} in ${languageCode}: ${content}`,
    );
    return updatedTranslation;
  }
}

/**
 * Delete a key from Phrase
 * @param keyId The key ID to delete
 * @param branch Branch name
 */
export async function deleteKey(keyId: string, branch: string): Promise<void> {
  await callPhrase(`keys/${keyId}?branch=${branch}`, {
    method: 'DELETE',
  });

  trace(`Deleted key: ${keyId}`);
}

/**
 * New diff-based push translations function
 * @param translationsByLanguage All local translations
 * @param options Push options including branch and dev language
 * @param diff The diff object showing what needs to be changed
 * @returns Success indicator
 */
export async function pushTranslationsWithDiff(
  translationsByLanguage: TranslationsByLanguage,
  { devLanguage, branch }: { devLanguage: string; branch: string },
  diff: DiffByLanguage,
): Promise<{ success: boolean }> {
  const allLanguages = Object.keys(translationsByLanguage);

  // Process each language
  for (const language of allLanguages) {
    const languageDiff = diff[language];
    if (!languageDiff) {
      continue;
    }

    log(`Processing ${language} translations...`);

    // Handle added translations
    for (const [keyName, translationData] of Object.entries(
      languageDiff.added || {},
    )) {
      // Create or update the key (only for dev language to avoid duplicates)
      let keyId: string;
      if (language === devLanguage) {
        const keyResult = await createOrUpdateKey(
          keyName,
          {
            description: translationData.description,
            tags: translationData.tags,
          },
          branch,
        );
        keyId = keyResult.id;
      } else {
        // For non-dev languages, we need to find the existing key
        const existingKeys = await callPhrase<
          Array<{ id: string; name: string }>
        >(`keys?q=name:${encodeURIComponent(keyName)}&branch=${branch}`);
        const existingKey = existingKeys.find((k) => k.name === keyName);
        if (!existingKey) {
          trace(
            `Key ${keyName} not found for language ${language}, skipping...`,
          );
          continue;
        }
        keyId = existingKey.id;
      }

      // Create or update the translation
      await createOrUpdateTranslation(
        keyId,
        language,
        translationData.message,
        branch,
      );
    }

    // Handle modified translations
    for (const [keyName, modification] of Object.entries(
      languageDiff.modified || {},
    )) {
      const localTranslation = modification.local;

      // Find the existing key
      const existingKeys = await callPhrase<
        Array<{ id: string; name: string }>
      >(`keys?q=name:${encodeURIComponent(keyName)}&branch=${branch}`);
      const existingKey = existingKeys.find((k) => k.name === keyName);
      if (!existingKey) {
        trace(
          `Key ${keyName} not found for modification in ${language}, skipping...`,
        );
        continue;
      }

      // Update key metadata (only for dev language)
      if (language === devLanguage) {
        await createOrUpdateKey(
          keyName,
          {
            description: localTranslation.description,
            tags: localTranslation.tags,
          },
          branch,
        );
      }

      // Update the translation
      await createOrUpdateTranslation(
        existingKey.id,
        language,
        localTranslation.message,
        branch,
      );
    }

    // Handle deleted translations (if requested)
    for (const [keyName] of Object.entries(languageDiff.deleted || {})) {
      // Find the existing key
      const existingKeys = await callPhrase<
        Array<{ id: string; name: string }>
      >(`keys?q=name:${encodeURIComponent(keyName)}&branch=${branch}`);
      const existingKey = existingKeys.find((k) => k.name === keyName);
      if (existingKey) {
        await deleteKey(existingKey.id, branch);
      }
    }
  }

  return { success: true };
}

// Keep the old function for backward compatibility
export async function pushTranslations(
  translationsByLanguage: TranslationsByLanguage,
  {
    autoTranslate,
    branch,
    devLanguage,
  }: { autoTranslate?: boolean; branch: string; devLanguage: string },
) {
  const { csvFileStrings, keyIndex, commentIndex, tagColumn, messageIndex } =
    translationsToCsv(translationsByLanguage, devLanguage);

  let devLanguageUploadId = '';

  for (const [language, csvFileString] of Object.entries(csvFileStrings)) {
    const formData = new FormData();

    formData.append(
      'file',
      new Blob([csvFileString], {
        type: 'text/csv',
      }),
      `${language}.translations.csv`,
    );

    formData.append('file_format', 'csv');
    formData.append('branch', branch);
    formData.append('update_translations', 'true');
    formData.append('update_descriptions', 'true');

    if (autoTranslate) {
      formData.append('autotranslate', 'true');
    }

    formData.append(`locale_mapping[${language}]`, messageIndex.toString());

    formData.append('format_options[key_index]', keyIndex.toString());
    formData.append('format_options[comment_index]', commentIndex.toString());
    formData.append('format_options[tag_column]', tagColumn.toString());
    formData.append('format_options[enable_pluralization]', 'false');

    log(`Uploading translations for language ${language}`);

    const result = await callPhrase<
      | {
          id: string;
        }
      | {
          message: string;
          errors: unknown[];
        }
      | undefined
    >(`uploads`, {
      method: 'POST',
      body: formData,
    });

    trace('Upload result:\n', result);

    if (result && 'id' in result) {
      log('Upload ID:', result.id, '\n');
      log('Successfully Uploaded\n');
    } else {
      log(`Error uploading: ${result?.message}\n`);
      log('Response:', result);
      throw new Error('Error uploading');
    }

    if (language === devLanguage) {
      devLanguageUploadId = result.id;
    }
  }

  return {
    devLanguageUploadId,
  };
}

export async function deleteUnusedKeys(uploadId: string, branch: string) {
  const query = `unmentioned_in_upload:${uploadId}`;
  const { records_affected } = await callPhrase<{ records_affected: number }>(
    'keys',
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ branch, q: query }),
    },
  );

  log(
    'Successfully deleted',
    records_affected,
    'unused keys from branch',
    branch,
  );
}

export async function ensureBranch(branch: string) {
  await callPhrase(`branches`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: branch }),
  });

  log('Created branch:', branch);
}
