import { vocabMessagesRegistryKey } from './registry-key';
import {
  getVirtualModuleRegistryId,
  getVirtualModuleSource,
} from './virtual-resource-loader';

export const renderVirtualMessageModule = (resolvedId: string) => {
  const registryId = getVirtualModuleRegistryId(resolvedId);
  const messagesJson = getVirtualModuleSource(resolvedId);

  return /* js */ `
    const messages = ${messagesJson};
    const registryKey = Symbol.for(${JSON.stringify(vocabMessagesRegistryKey)});
    const registry = globalThis[registryKey] ??= new Map();
    registry.set(${JSON.stringify(registryId)}, messages);
  `;
};

export const renderPreloadModule = (identifiers: Iterable<string>) =>
  [...identifiers]
    .sort()
    .map((identifier) => `import ${JSON.stringify(identifier)};`)
    .join('\n');
