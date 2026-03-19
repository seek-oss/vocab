import {
  TranslationFile as TranslationFileClass,
  type TranslationFileParsed,
  TranslationFileSchema,
} from './schema';

export { TranslationFileClass };
export type { TranslationFileParsed } from './schema';

/** Parsed shape of a translation file (single format for all layouts). */
export type ValidatedTranslationFile = TranslationFileParsed;

export function validateTranslationFile(
  data: unknown,
): ValidatedTranslationFile {
  if (data === null || typeof data !== 'object') {
    throw new Error('Invalid translation file: must be an object');
  }
  return TranslationFileSchema.parse(data) as ValidatedTranslationFile;
}

export function validateAlternativeTranslationFile(
  data: unknown,
): Record<string, { message: string }> {
  if (data !== null && typeof data === 'object') {
    return data as Record<string, { message: string }>;
  }
  throw new Error('Invalid alternative language file: must be an object');
}
