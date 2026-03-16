import path from 'path';
import type { UserConfig } from '../types';
import { defaultTranslationDirSuffix } from '../utils';

export function getNamespaceByFilePath(
  relativePath: string,
  { translationsDirectorySuffix = defaultTranslationDirSuffix }: UserConfig,
) {
  let namespace = path
    .dirname(relativePath)
    .replace(/^src\//, '')
    .replace(/\//g, '_');

  if (namespace.endsWith(translationsDirectorySuffix)) {
    namespace = namespace.slice(0, -translationsDirectorySuffix.length);
  }

  return namespace;
}

export function getUniqueKey(key: string, namespace: string) {
  return `${key}.${namespace}`;
}
