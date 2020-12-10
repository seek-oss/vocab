export { generateTypes, generateAllTypes } from './compile';
export { validate } from './validate';
export { resolveConfig, resolveConfigSync, validateConfig } from './config';
export {
  getUniqueKey,
  getAltLanguages,
  loadTranslation,
  loadAllTranslations,
  getAltLanguageFilePath,
} from './utils';
export type { TranslationFile } from '@vocab/types';
