export { compile, watch } from './compile';
export { validate } from './validate';
export { resolveConfig, resolveConfigSync, validateConfig } from './config';
export {
  getAltLanguages,
  getAltLanguageFilePath,
  getDevLanguageFileFromTsFile,
  getTranslationModuleId,
} from './utils';
export {
  getUniqueKey,
  loadAllTranslations,
  loadTranslation,
} from './load-translations';
export type { TranslationFile } from '@vocab/types';
