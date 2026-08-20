import { sourceQueryKey } from './consts';
import { languageRegistryKey } from './language-registry';

export const getVirtualModuleSource = (path: string) => {
  const [, encodedMessages] = path.split(sourceQueryKey);
  if (encodedMessages === undefined) {
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

  // Must match the `moduleId` passed to createLanguage: no `\0`, no `?source=`.
  return resolvedId.replace(/^\0/, '');
};

export const virtualResourceLoader = (path: string) => {
  const moduleId = getVirtualModuleRegistryId(path);
  const messages = getVirtualModuleSource(path);

  // The registry is written inline rather than imported from the runtime so
  // each language chunk stays self-contained. A shared import would be hoisted
  // into one language's chunk, making every other language depend on it.
  // There is no export: createLanguage.load() imports a preload aggregator
  // whose static imports evaluate these modules for their side effects.
  return /* js */ `
    const messages = JSON.parse(${JSON.stringify(messages)});

    (globalThis[Symbol.for(${JSON.stringify(languageRegistryKey)})] ??= new Map())
      .set(${JSON.stringify(moduleId)}, messages);
  `;
};

export const renderPreloadModule = (identifiers: Iterable<string>) =>
  [...identifiers]
    .sort()
    .map((identifier) => `import ${JSON.stringify(identifier)};`)
    .join('\n');
