import { sourceQueryKey } from './consts';
import { translationRegistryKey } from './translation-registry';

export const getVirtualModuleSource = (path: string) => {
  const [resolvedId, encodedMessages] = path.split(sourceQueryKey);
  if (!resolvedId || encodedMessages === undefined) {
    throw new Error(
      `Vocab virtual module is missing a source payload: ${path}`,
    );
  }

  return Buffer.from(encodedMessages, 'base64').toString('utf-8');
};

export const getVirtualModuleRegistryId = (path: string) => {
  const [resolvedId] = path.split(sourceQueryKey);
  if (!resolvedId) {
    throw new Error(`Vocab virtual module has an invalid id: ${path}`);
  }

  // The registry key must match the `moduleId` embedded by the transform, which
  // excludes the encoded messages query and the virtual module `\0` prefix.
  return resolvedId.replace(/^\0/, '');
};

export const virtualResourceLoader = (path: string) => {
  const moduleId = getVirtualModuleRegistryId(path);
  const messages = getVirtualModuleSource(path);

  return /* js */ `
    const messages = ${messages};
    const registrySymbol = Symbol.for(${JSON.stringify(translationRegistryKey)});
    const registry =
      globalThis[registrySymbol] || (globalThis[registrySymbol] = new Map());
    registry.set(${JSON.stringify(moduleId)}, messages);
  `;
};

export const renderPreloadModule = (identifiers: Iterable<string>) =>
  [...identifiers]
    .sort()
    .map((identifier) => `import ${JSON.stringify(identifier)};`)
    .join('\n');
