import * as z from 'zod';

/**
 * Schema for translation tags
 */
const TagsSchema = z.array(z.string()).optional();

export const AllowUnvalidated = z
  .boolean()
  .optional()
  .describe(
    'If true, this key will be skipped during validation checks for this key',
  );

export const Validated = z
  .boolean()
  .optional()
  .describe('Whether this key has been validated for this specific language');

export const KeyTags = TagsSchema.describe(
  'Tags to apply to this translation key',
);

export const FileTags = TagsSchema.describe(
  'Tags to apply to all keys in this file',
);

export const TranslationMessage = z
  .string()
  .describe(
    'The translation message for this language, supports ICU MessageFormat syntax',
  );

export const MetaDataSchema = z
  .object({
    tags: TagsSchema.describe('Tags to apply to all keys in this file'),
  })
  .strict();

export const GlobalKey = z
  .string()
  .optional()
  .describe('An explicit global key to be used in place of a generated value');

export const KeyDescription = z
  .string()
  .optional()
  .describe('An optional description to help when translating');

export const LanguageName = z
  .string()
  .min(1)
  .describe('The name of a language or locale. E.g. "en-US", "en"');
