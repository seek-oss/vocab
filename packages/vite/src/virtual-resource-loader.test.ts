import { beforeEach, describe, expect, it } from 'vitest';
import { sourceQueryKey } from './consts';
import { getTranslationRegistry } from './translation-registry';
import { virtualResourceLoader } from './virtual-resource-loader';

describe('virtualResourceLoader', () => {
  beforeEach(() => {
    getTranslationRegistry().clear();
  });

  it('emits a module that registers and exports its messages', async () => {
    const messages = { greeting: 'Hello' };
    const encodedMessages = Buffer.from(JSON.stringify(messages)).toString(
      'base64',
    );
    const moduleId = `virtual:vocab-en.js${sourceQueryKey}${encodedMessages}`;
    const code = virtualResourceLoader(`\0${moduleId}`);
    const dataUrl = `data:text/javascript;base64,${Buffer.from(code).toString(
      'base64',
    )}`;

    const translationModule = await import(dataUrl);

    expect(translationModule.default).toEqual(messages);
    expect(getTranslationRegistry().get(moduleId)).toEqual(messages);
  });
});
