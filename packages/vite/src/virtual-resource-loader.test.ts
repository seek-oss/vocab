import { beforeEach, describe, expect, it } from 'vitest';
import { sourceQueryKey } from './consts';
import { getTranslationRegistry } from './translation-registry';
import {
  renderPreloadModule,
  virtualResourceLoader,
} from './virtual-resource-loader';

describe('virtualResourceLoader', () => {
  beforeEach(() => {
    getTranslationRegistry().clear();
  });

  it('emits a module that registers its messages', async () => {
    const messages = { greeting: 'Hello' };
    const encodedMessages = Buffer.from(JSON.stringify(messages)).toString(
      'base64',
    );
    const moduleId = 'virtual:vocab-en-1a2b3c4d.js';
    const importId = `${moduleId}${sourceQueryKey}${encodedMessages}`;
    const code = virtualResourceLoader(`\0${importId}`);
    const dataUrl = `data:text/javascript;base64,${Buffer.from(code).toString(
      'base64',
    )}`;

    await import(dataUrl);

    // The registry key excludes the `?source=` query so the encoded payload
    // isn't duplicated in the production language chunk.
    expect(getTranslationRegistry().get(moduleId)).toEqual(messages);
  });

  it('renders a stable module that installs every translation file', () => {
    expect(
      renderPreloadModule([
        'virtual:vocab-en-bbbbbbbb.js?source=second',
        'virtual:vocab-en-aaaaaaaa.js?source=first',
      ]),
    ).toBe(
      [
        'import "virtual:vocab-en-aaaaaaaa.js?source=first";',
        'import "virtual:vocab-en-bbbbbbbb.js?source=second";',
      ].join('\n'),
    );
  });
});
