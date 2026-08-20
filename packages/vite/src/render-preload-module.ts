import type { TranslationMessagesByKey } from '@vocab/core';
import { translationRegistryKey } from './translation-registry';

export type MessagesByModuleId = Map<string, TranslationMessagesByKey>;

/**
 * Renders the one module that installs every translation file for a language.
 *
 * Messages are inlined rather than imported so that a language chunk contains a
 * single module. A multi-module chunk makes the bundler generate a namespace
 * facade for the dynamic import, and it sources that helper from the client
 * entry — which a language chunk must never import.
 */
export const renderPreloadModule = (messagesByModuleId: MessagesByModuleId) => {
  const registrations = [...messagesByModuleId]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(
      ([moduleId, messages]) =>
        `registry.set(${JSON.stringify(moduleId)}, ${JSON.stringify(messages)});`,
    );

  return [
    `const registrySymbol = Symbol.for(${JSON.stringify(translationRegistryKey)});`,
    `const registry = globalThis[registrySymbol] || (globalThis[registrySymbol] = new Map());`,
    ...registrations,
  ].join('\n');
};
