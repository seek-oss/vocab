import * as z from 'zod';

/**
 * File-level metadata for the main `translations.json` (see `_meta` on the file root).
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
    .describe(
      'Tags for this key (included when loading with `includeTranslationMetadata: true`).',
    ),
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
 * Root shape for the main `translations.json`: reserved keys plus arbitrary translation keys.
 *
 * Defined separately from {@link vocabAltTranslationFileSchema} so the two may diverge.
 */
export const vocabTranslationFileSchema = translationFileRootKnownKeys
  .catchall(translationEntrySchema)
  .describe(
    'Vocab main translation file (`translations.json`). Other top-level keys are translation IDs.',
  );

/**
 * Root shape for `{lang}.translations.json`. Today this matches the main file; it is a distinct schema so validation and JSON Schema can evolve independently.
 *
 * When loading, `$namespace` and `_meta` are dropped after a console warning (see {@link altTranslationFileToKeysSchema}).
 */
export const vocabAltTranslationFileSchema = translationFileRootKnownKeys
  .catchall(translationEntrySchema)
  .describe(
    'Vocab language file (`{lang}.translations.json`). Entries use the same shape as the main file. At runtime, `$namespace` and `_meta` are ignored with a warning.',
  );

/**
 * Parse an alt-language file, warn if main-file-only root keys are present, and return only translation entries.
 */
export function altTranslationFileToKeysSchema(
  filePath: string,
  warn: (message: string) => void,
) {
  return vocabAltTranslationFileSchema.transform((data) => {
    if (data.$namespace !== undefined) {
      warn(
        `Found $namespace in alt language file in ${filePath}. $namespace is only used in the main translation file and will be ignored.`,
      );
    }
    if (data._meta !== undefined) {
      warn(
        `Found _meta in alt language file in ${filePath}. _meta is only used in the main translation file and will be ignored.`,
      );
    }

    const { $namespace: _ignoredNamespace, _meta: _ignoredMeta, ...keys } =
      data;
    return keys;
  });
}

export type TranslationFileMetadata = z.infer<
  typeof translationFileMetadataSchema
>;
export type TranslationData = z.infer<typeof translationEntrySchema>;
export type TranslationFileContents = z.infer<
  typeof vocabTranslationFileSchema
>;

/**
 * Parse the main `translations.json` and normalize loaded shape using `includeTranslationMetadata`.
 */
export function vocabTranslationFileToLoadedSchema(
  includeTranslationMetadata: boolean | undefined,
) {
  return vocabTranslationFileSchema.transform((data) => {
    const { $namespace, _meta, ...keys } = data;
    const validKeys: Record<string, TranslationData> = {};

    for (const [translationKey, rawValue] of Object.entries(keys)) {
      if (includeTranslationMetadata) {
        validKeys[translationKey] = { ...rawValue };
      } else {
        validKeys[translationKey] = {
          message: rawValue.message,
          ...(rawValue.globalKey !== undefined
            ? { globalKey: rawValue.globalKey }
            : {}),
        };
      }
    }

    const metadata: TranslationFileMetadata = {
      tags: includeTranslationMetadata ? _meta?.tags : undefined,
    };

    return { $namespace, keys: validKeys, metadata };
  });
}
