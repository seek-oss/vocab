import { describe, expect, it } from 'vitest';
import {
  type MessagesByModuleId,
  renderPreloadModule,
} from './render-preload-module';

describe('renderPreloadModule', () => {
  it('installs every translation file for the language, sorted by module id', () => {
    expect(
      renderPreloadModule(
        new Map<string, Record<string, string>>([
          ['virtual:vocab-en-bbbbbbbb.js', { farewell: 'Goodbye' }],
          ['virtual:vocab-en-aaaaaaaa.js', { greeting: 'Hello' }],
        ]),
      ),
    ).toMatchInlineSnapshot(`
      "const registrySymbol = Symbol.for("@vocab/vite/translation-registry");
      const registry = globalThis[registrySymbol] || (globalThis[registrySymbol] = new Map());
      registry.set("virtual:vocab-en-aaaaaaaa.js", {"greeting":"Hello"});
      registry.set("virtual:vocab-en-bbbbbbbb.js", {"farewell":"Goodbye"});"
    `);
  });

  it('emits no imports, so the language chunk stays a single module', () => {
    const code = renderPreloadModule(
      new Map([['virtual:vocab-en-aaaaaaaa.js', { greeting: 'Hello' }]]),
    );

    expect(code).not.toMatch(/\bimport\b/);
  });

  it('still installs a registry when a language has no translations', () => {
    const empty: MessagesByModuleId = new Map();

    expect(renderPreloadModule(empty)).toMatchInlineSnapshot(`
      "const registrySymbol = Symbol.for("@vocab/vite/translation-registry");
      const registry = globalThis[registrySymbol] || (globalThis[registrySymbol] = new Map());"
    `);
  });
});
