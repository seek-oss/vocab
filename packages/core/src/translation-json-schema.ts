import * as z from 'zod';

/**
 * File-level metadata for a dev `translations.json` (see `_meta` on the file root).
 */
export const translationFileMetadataSchema = z.strictObject({
  tags: z
    .array(z.string())
    .optional()
    .describe('Tags applied to all keys in this file (e.g. for Phrase).'),
});

/**
 * One translation key entry. Output type is {@link TranslationData}.
 */
export const translationEntrySchema = z.strictObject({
  message: z
    .string()
    .describe('ICU MessageFormat string for this key in this file’s language.'),
  description: z
    .string()
    .optional()
    .describe('Developer-facing description of the message.'),
  globalKey: z
    .string()
    .optional()
    .describe('Stable key for external translation tools (e.g. Phrase).'),
  tags: z
    .array(z.string())
    .optional()
    .describe('Tags for this key (dev file only when loading with tags).'),
});

const translationFileRootKnownKeys = z.object({
  $namespace: z
    .string()
    .optional()
    .describe(
      'Optional namespace override. If omitted, the namespace is derived from the `.vocab` directory path.',
    ),
  _meta: translationFileMetadataSchema.optional(),
});

/**
 * Root shape for dev `translations.json`: reserved keys plus arbitrary translation keys.
 */
export const vocabDevTranslationFileSchema = translationFileRootKnownKeys
  .catchall(translationEntrySchema)
  .describe(
    'Vocab dev language translation file (`translations.json`). Other top-level keys are translation IDs.',
  );

/**
 * Same structure as the dev file; runtime ignores `$namespace` and `_meta.tags` on alt files.
 */
export const vocabAltTranslationFileSchema = z
  .record(z.string(), translationEntrySchema)
  .describe(
    'Vocab language file (`{lang}.translations.json`). Entries use the same shape as the dev file. At runtime, `$namespace` and `_meta.tags` are ignored with a warning.',
  );

export type TranslationFileMetadata = z.infer<
  typeof translationFileMetadataSchema
>;
export type TranslationData = z.infer<typeof translationEntrySchema>;
export type TranslationFileContents = z.infer<
  typeof vocabDevTranslationFileSchema
>;
