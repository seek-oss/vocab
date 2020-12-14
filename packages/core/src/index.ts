export { compile, watch } from './compile';
export { validate } from './validate';
export { resolveConfig, resolveConfigSync, validateConfig } from './config';
export {
  getAltLanguages,
  getAltLanguageFilePath,
  getDevLanguageFileFromTsFile,
  getUniqueKey,
  loadAllTranslations,
  loadTranslation,
} from './utils';
export type { TranslationFile } from '@vocab/types';
