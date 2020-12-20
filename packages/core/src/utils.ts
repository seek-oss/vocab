import path from 'path';

import type {
  LanguageName,
  LanguageTarget,
  TranslationsByKey,
  TranslationMessagesByKey,
  UserConfig,
} from '@vocab/types';
import { trace } from './logger';

export const defaultTranslationDirSuffix = '.vocab';
export const devTranslationFileName = 'translations.json';

export type Fallback = 'none' | 'valid' | 'all';

export function isDevLanguageFile(filePath: string) {
  return (
    filePath.endsWith(`/${devTranslationFileName}`) ||
    filePath === devTranslationFileName
  );
}
export function isAltLanguageFile(filePath: string) {
  return filePath.endsWith('.translations.json');
}
export function isTranslationDirectory(
  filePath: string,
  {
    translationsDirectorySuffix = defaultTranslationDirSuffix,
  }: {
    translationsDirectorySuffix?: string;
  },
) {
  return filePath.endsWith(translationsDirectorySuffix);
}

export function getTranslationFolderGlob({
  translationsDirectorySuffix = defaultTranslationDirSuffix,
}: {
  translationsDirectorySuffix?: string;
}) {
  const result = `**/*${translationsDirectorySuffix}`;

  trace('getTranslationFolderGlob', result);

  return result;
}

export function getDevTranslationFileGlob({
  translationsDirectorySuffix = defaultTranslationDirSuffix,
}: {
  translationsDirectorySuffix?: string;
}) {
  const result = `**/*${translationsDirectorySuffix}/${devTranslationFileName}`;

  trace('getDevTranslationFileGlob', result);

  return result;
}

export function getAltTranslationFileGlob(config: UserConfig) {
  const altLanguages = getAltLanguages(config);
  const langMatch =
    altLanguages.length === 1 ? altLanguages[0] : `{${altLanguages.join(',')}}`;

  const { translationsDirectorySuffix = defaultTranslationDirSuffix } = config;
  const result = `**/*${translationsDirectorySuffix}/${langMatch}.translations.json`;

  trace('getAltTranslationFileGlob', result);

  return result;
}

export function getAltLanguages({
  devLanguage,
  languages,
}: {
  devLanguage: LanguageName;
  languages: Array<LanguageTarget>;
}) {
  return languages.map((v) => v.name).filter((lang) => lang !== devLanguage);
}

export function getDevLanguageFileFromTsFile(tsFilePath: string) {
  const directory = path.dirname(tsFilePath);
  const result = path.normalize(path.join(directory, devTranslationFileName));

  trace(`Returning dev language path ${result} for path ${tsFilePath}`);
  return result;
}

export function getDevLanguageFileFromAltLanguageFile(
  altLanguageFilePath: string,
) {
  const directory = path.dirname(altLanguageFilePath);
  const result = path.normalize(path.join(directory, devTranslationFileName));
  trace(
    `Returning dev language path ${result} for path ${altLanguageFilePath}`,
  );
  return result;
}

export function getTSFileFromDevLanguageFile(devLanguageFilePath: string) {
  const directory = path.dirname(devLanguageFilePath);
  const result = path.normalize(path.join(directory, 'index.ts'));

  trace(`Returning TS path ${result} for path ${devLanguageFilePath}`);
  return result;
}

export function getAltLanguageFilePath(
  devLanguageFilePath: string,
  language: string,
) {
  const directory = path.dirname(devLanguageFilePath);
  const result = path.normalize(
    path.join(directory, `${language}.translations.json`),
  );
  trace(
    `Returning alt language path ${result} for path ${devLanguageFilePath}`,
  );
  return path.normalize(result);
}

export function mapValues<Key extends string, OriginalValue, ReturnValue>(
  obj: Record<Key, OriginalValue>,
  func: (val: OriginalValue) => ReturnValue,
): TranslationMessagesByKey<Key> {
  const newObj: any = {};
  const keys = Object.keys(obj) as Key[];
  for (const key of keys) {
    newObj[key] = func(obj[key]);
  }
  return newObj;
}

export function getTranslationMessages<Key extends string>(
  translations: TranslationsByKey<Key>,
): TranslationMessagesByKey<Key> {
  return mapValues(translations, (v) => v.message);
}
