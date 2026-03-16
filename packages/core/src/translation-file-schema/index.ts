import { TranslationFile as TranslationFileClass } from './separated-translations-file-schema';
import {
  type UnifiedTranslationFileParsed,
  UnifiedTranslationFileSchema,
} from './unified-translations-file-schema';

export { TranslationFileClass };
export type { UnifiedTranslationFileParsed } from './unified-translations-file-schema';

/** Single parsed type for all translation files (unified format). */
export type ValidatedTranslationFile = UnifiedTranslationFileParsed;

export function validateTranslationFile(
  data: unknown,
): ValidatedTranslationFile {
  if (data === null || typeof data !== 'object') {
    throw new Error(
      'Invalid translation file: must be a unified format object',
    );
  }
  return UnifiedTranslationFileSchema.parse(data) as ValidatedTranslationFile;
}

export function validateAlternativeTranslationFile(
  data: unknown,
): Record<string, { message: string }> {
  if (data !== null && typeof data === 'object') {
    return data as Record<string, { message: string }>;
  }
  throw new Error('Invalid alternative language file: must be an object');
}
