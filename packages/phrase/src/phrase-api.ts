/* eslint-disable no-console */
import FormData from 'form-data';
import type { TranslationsByLanguage } from '@vocab/core';
import fetch from 'node-fetch';
import { log, trace } from './logger';
import { translationsToCsv } from './csv';

function _callPhrase(path: string, options: Parameters<typeof fetch>[1] = {}) {
  const phraseApiToken = process.env.PHRASE_API_TOKEN;

  if (!phraseApiToken) {
    throw new Error('Missing PHRASE_API_TOKEN');
  }

  return fetch(path, {
    ...options,
    headers: {
      Authorization: `token ${phraseApiToken}`,
      // Provide identification via User Agent as requested in https://developers.phrase.com/api/#overview--identification-via-user-agent
      'User-Agent': 'SEEK Demo Candidate App (jhope@seek.com.au)',
      ...options.headers,
    },
  }).then(async (response) => {
    console.log(`${path}: ${response.status} - ${response.statusText}`);

    const secondsUntilLimitReset = Math.ceil(
      Number.parseFloat(response.headers.get('X-Rate-Limit-Reset') || '0') -
        Date.now() / 1000,
    );
    console.log(
      `Rate Limit: ${response.headers.get(
        'X-Rate-Limit-Remaining',
      )} of ${response.headers.get(
        'X-Rate-Limit-Limit',
      )} remaining. (${secondsUntilLimitReset} seconds remaining)`,
    );

    trace('\nLink:', response.headers.get('Link'), '\n');
    // Print All Headers:
    // console.log(Array.from(r.headers.entries()));

    try {
      const result = await response.json();

      trace(`Internal Result (Length: ${result.length})\n`);

      if (
        (!options.method || options.method === 'GET') &&
        response.headers.get('Link')?.includes('rel=next')
      ) {
        const [, nextPageUrl] =
          response.headers.get('Link')?.match(/<([^>]*)>; rel=next/) ?? [];

        if (!nextPageUrl) {
          throw new Error("Can't parse next page URL");
        }

        console.log('Results received with next page: ', nextPageUrl);

        const nextPageResult = (await _callPhrase(nextPageUrl, options)) as any;

        return [...result, ...nextPageResult];
      }

      return result;
    } catch (e) {
      console.error('Unable to parse response as JSON', e);
      return response.text();
    }
  });
}

export async function callPhrase<T = any>(
  relativePath: string,
  options: Parameters<typeof fetch>[1] = {},
): Promise<T> {
  const projectId = process.env.PHRASE_PROJECT_ID;

  if (!projectId) {
    throw new Error('Missing PHRASE_PROJECT_ID');
  }
  return _callPhrase(
    `https://api.phrase.com/v2/projects/${projectId}/${relativePath}`,
    options,
  )
    .then((result) => {
      if (Array.isArray(result)) {
        console.log('Result length:', result.length);
      }
      return result;
    })
    .catch((error) => {
      console.error(`Error calling phrase for ${relativePath}:`, error);
      throw Error;
    });
}

export async function pullAllTranslations(
  branch: string,
): Promise<TranslationsByLanguage> {
  const phraseResult = await callPhrase<
    Array<{
      key: { name: string };
      locale: { code: string };
      content: string;
    }>
  >(`translations?branch=${branch}&per_page=100`);

  const translations: TranslationsByLanguage = {};

  for (const r of phraseResult) {
    if (!translations[r.locale.code]) {
      translations[r.locale.code] = {};
    }
    translations[r.locale.code][r.key.name] = { message: r.content };
  }

  return translations;
}

export async function pushTranslations(
  translationsByLanguage: TranslationsByLanguage,
  { devLanguage, branch }: { devLanguage: string; branch: string },
) {
  const formData = new FormData();
  const { csvString, localeMapping, keyIndex, commentIndex, tagColumn } =
    translationsToCsv(translationsByLanguage, devLanguage);
  const fileContents = Buffer.from(csvString);
  formData.append('file', fileContents, {
    contentType: 'text/csv',
    filename: 'translations.csv',
  });

  formData.append('file_format', 'csv');
  formData.append('branch', branch);
  formData.append('update_translations', 'true');
  formData.append('update_descriptions', 'true');

  for (const [locale, index] of Object.entries(localeMapping)) {
    formData.append(`locale_mapping[${locale}]`, index);
  }

  formData.append('format_options[key_index]', keyIndex);
  formData.append('format_options[comment_index]', commentIndex);
  formData.append('format_options[tag_column]', tagColumn);
  formData.append('format_options[enable_pluralization]', 'false');

  log('Uploading translations');

  const result = await callPhrase<
    | {
        id: string;
      }
    | {
        message: string;
        errors: Array<unknown>;
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

  return {
    uploadId: result.id,
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
