export { compile, watch } from './compile';
export {
  validate,
  validateTranslationStatus,
  formatValidationResults,
} from './validate';
export { resolveConfig, resolveConfigSync, validateConfig } from './config';
export {
  getAltLanguages,
  getAltLanguageFilePath,
  getDevLanguageFileFromTsFile,
  compiledVocabFileFilter,
} from './utils';
export {
  getUniqueKey,
  loadAllTranslations,
  loadTranslation,
} from './load-translations';
export type * from './types';
