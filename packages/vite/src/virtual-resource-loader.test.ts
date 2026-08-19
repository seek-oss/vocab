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

  it('emits a module that exports its messages', async () => {
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

    const module = await import(dataUrl);

    expect(module.default).toEqual(messages);
    expect(getTranslationRegistry()).toEqual(new Map());
  });

  it('renders a stable module that installs every translation file', () => {
    expect(
      renderPreloadModule([
        {
          moduleId: 'virtual:vocab-en-bbbbbbbb.js',
          importId: 'virtual:vocab-en-bbbbbbbb.js?source=second',
        },
        {
          moduleId: 'virtual:vocab-en-aaaaaaaa.js',
          importId: 'virtual:vocab-en-aaaaaaaa.js?source=first',
        },
      ]),
    ).toMatchInlineSnapshot(`
      "import messages0 from "virtual:vocab-en-aaaaaaaa.js?source=first";
      import messages1 from "virtual:vocab-en-bbbbbbbb.js?source=second";
      const registrySymbol = Symbol.for("@vocab/vite/translation-registry");
      const registry =
        globalThis[registrySymbol] || (globalThis[registrySymbol] = new Map());
      registry.set("virtual:vocab-en-aaaaaaaa.js", messages0);
      registry.set("virtual:vocab-en-bbbbbbbb.js", messages1);"
    `);
  });
});
