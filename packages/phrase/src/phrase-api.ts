/* eslint-disable no-console */
import fetch from 'node-fetch';

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
    console.log(
      `Rate Limit: ${response.headers.get(
        'X-Rate-Limit-Remaining',
      )} of ${response.headers.get(
        'X-Rate-Limit-Limit',
      )} remaining. (${response.headers.get(
        'X-Rate-Limit-Reset',
      )} seconds remaining})`,
    );
    console.log('\nLink:', response.headers.get('Link'), '\n');
    // Print All Headers:
    // console.log(Array.from(r.headers.entries()));

    try {
      const result = await response.json();

      console.log(`Internal Result (Length: ${result.length})\n`);

      if (
        (!options.method || options.method === 'GET') &&
        response.headers.get('Link')?.includes('rel=next')
      ) {
        const [, nextPageUrl] =
          response.headers.get('Link')?.match(/<([^>]*)>; rel=next/) ?? [];

        if (!nextPageUrl) {
          throw new Error('Cant parse next page URL');
        }

        console.log('Results recieved with next page: ', nextPageUrl);

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

export async function callPhrase(
  relativePath: string,
  options: Parameters<typeof fetch>[1] = {},
) {
  const projectId = process.env.PHRASE_PROJECT_ID;

  if (!projectId) {
    throw new Error('Missing PHRASE_PROJECT_ID');
  }
  return _callPhrase(
    `https://api.phrase.com/v2/projects/${projectId}/${relativePath}`,
    options,
  )
    .then((result) => {
      // console.log('Result:', result);
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

export function getUniqueNameForFile(relativePath: string) {
  return relativePath
    .replace(/^src\//, '')
    .replace(/\.translations\.json$/, '')
    .replace(/\//g, '_');
}
