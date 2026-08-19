import { sourceQueryKey } from './consts';
import { languageRegistryKey } from './language-registry';

export const virtualResourceLoader = (path: string) => {
  const [, encodedMessages] = path.split(sourceQueryKey);
  const moduleId = path.replace(/^\0+/, '');
  const messages = Buffer.from(encodedMessages as string, 'base64').toString(
    'utf-8',
  );

  // The registry is written inline rather than imported from the runtime so
  // each language chunk stays self-contained. A shared import would be hoisted
  // into one language's chunk, making every other language depend on it.
  return /* js */ `
    const messages = JSON.parse(${JSON.stringify(messages)});

    (globalThis[Symbol.for(${JSON.stringify(languageRegistryKey)})] ??= new Map())
      .set(${JSON.stringify(moduleId)}, messages);

    export default messages;
  `;
};
