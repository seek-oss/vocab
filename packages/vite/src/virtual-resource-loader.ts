import { sourceQueryKey } from './consts';
import { translationRegistryKey } from './translation-registry';

export type VirtualModuleIdentifier = {
  moduleId: string;
  importId: string;
};

export const getVirtualModuleSource = (path: string) => {
  const [resolvedId, encodedMessages] = path.split(sourceQueryKey);
  if (!resolvedId || encodedMessages === undefined) {
    throw new Error(
      `Vocab virtual module is missing a source payload: ${path}`,
    );
  }

  return Buffer.from(encodedMessages, 'base64').toString('utf-8');
};

export const virtualResourceLoader = (path: string) => {
  const messages = getVirtualModuleSource(path);

  return /* js */ `
    const messages = ${messages};
    export default messages;
  `;
};

export const renderPreloadModule = (
  identifiers: Iterable<VirtualModuleIdentifier>,
) => {
  const sortedIdentifiers = [...identifiers].sort((a, b) =>
    a.moduleId.localeCompare(b.moduleId),
  );
  const imports = sortedIdentifiers.map(
    ({ importId }, index) =>
      `import messages${index} from ${JSON.stringify(importId)};`,
  );
  const registrations = sortedIdentifiers.map(
    ({ moduleId }, index) =>
      `registry.set(${JSON.stringify(moduleId)}, messages${index});`,
  );

  return [
    ...imports,
    `const registrySymbol = Symbol.for(${JSON.stringify(
      translationRegistryKey,
    )});`,
    `const registry =
  globalThis[registrySymbol] || (globalThis[registrySymbol] = new Map());`,
    ...registrations,
  ].join('\n');
};
