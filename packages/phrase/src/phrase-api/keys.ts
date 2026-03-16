import { trace } from '../logger';
import { callPhrase } from './call-phrase';

function getKeyPayload(
  keyName: string,
  keyData: { description?: string; tags?: string[] },
  branch: string,
) {
  return {
    name: keyName,
    branch,
    description: keyData.description,
    tags: keyData.tags,
  };
}

export async function addKey(
  keyName: string,
  keyData: { description?: string; tags?: string[] },
  branch: string,
): Promise<{ id: string; name: string }> {
  const result = callPhrase<{ id: string; name: string }>('keys', {
    method: 'POST',
    body: JSON.stringify(getKeyPayload(keyName, keyData, branch)),
  });

  trace(`Created key: ${keyName}`);
  return result;
}

export async function updateKey(
  keyId: string,
  keyName: string,
  keyData: { description?: string; tags?: string[] },
  branch: string,
): Promise<{ id: string; name: string }> {
  const result = callPhrase(`keys/${keyId}`, {
    method: 'PATCH',
    body: JSON.stringify(getKeyPayload(keyName, keyData, branch)),
  });

  trace(`Updated key: ${keyName}`);
  return result;
}

export async function addTranslation(
  branch: string,
  locale: string,
  phraseKeyId: string,
  content: string,
) {
  return callPhrase('translations', {
    method: 'POST',
    body: JSON.stringify({
      branch,
      locale_id: locale,
      key_id: phraseKeyId,
      content,
    }),
  });
}

export async function updateTranslation(
  branch: string,
  phraseTranslationId: string,
  content: string,
) {
  return callPhrase(`translations/${phraseTranslationId}`, {
    method: 'POST',
    body: JSON.stringify({
      branch,
      content,
    }),
  });
}
