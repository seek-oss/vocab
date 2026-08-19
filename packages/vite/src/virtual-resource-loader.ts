import { sourceQueryKey } from './consts';
import { translationRegistryKey } from './translation-registry';

export const virtualResourceLoader = (path: string) => {
  const [, encodedMessages] = path.split(sourceQueryKey);
  const moduleId = path.replace(/^\0/, '');
  const messages = Buffer.from(encodedMessages as string, 'base64').toString(
    'utf-8',
  );

  return /* js */ `
    const messages = ${messages};
    const registrySymbol = Symbol.for(${JSON.stringify(translationRegistryKey)});
    const registry = globalThis[registrySymbol] ??= new Map();
    registry.set(${JSON.stringify(moduleId)}, messages);
    export default messages;
  `;
};
