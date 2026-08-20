import { createHash } from 'node:crypto';
import { relative, sep } from 'node:path';

import { virtualModuleId } from './consts';

/**
 * Produces a short, stable id for a translation file so that language modules
 * sharing a language (but originating from different `.vocab` files) don't
 * collide in the runtime translation registry.
 */
export const hashFilePath = (filePath: string, projectRoot: string) => {
  const projectRelativePath = relative(projectRoot, filePath)
    .split(sep)
    .join('/');

  return createHash('sha256')
    .update(projectRelativePath)
    .digest('hex')
    .slice(0, 8);
};

/**
 * The key a translation file's messages are registered under at runtime.
 *
 * Derived from the dev translation file path so that the plugin can compute the
 * same key while discovering translations up front and while transforming a
 * compiled `.vocab` file.
 */
export const getRegistryModuleId = (
  language: string,
  devTranslationFilePath: string,
  projectRoot: string,
) =>
  `${virtualModuleId}-${language}-${hashFilePath(
    devTranslationFilePath,
    projectRoot,
  )}.js`;
