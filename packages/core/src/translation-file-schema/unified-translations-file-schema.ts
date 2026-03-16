import * as z from 'zod';
import {
  AllowUnvalidated,
  GlobalKey,
  KeyDescription,
  KeyTags,
  MetaDataSchema,
  TranslationMessage,
  Validated,
} from './common-schemas';

/**
 * Value for a single language: either a plain message string or
 * { message, validated? }. Prefer the string form when no validated flag is needed.
 */
export const LanguageValueSchema = z.union([
  TranslationMessage,
  z.object({
    message: TranslationMessage,
    validated: Validated,
  }),
]);

/**
 * Unified translation entry. Dev language may be supplied via the reserved
 * key `message` or the dev language code (e.g. `en`). Other languages may be
 * added via optional `translations` and/or top-level language keys (e.g. `fr`).
 * At load time the loader requires at least one of `message` or
 * entry[devLanguage] per entry.
 */
const UnifiedEntrySchema = z
  .object({
    allowUnvalidated: AllowUnvalidated,
    description: KeyDescription,
    globalKey: GlobalKey,
    /** Dev language when present; same value shape as language keys. */
    message: LanguageValueSchema.optional(),
    tags: KeyTags,
    /** Optional record of lang code → language value. */
    translations: z.record(z.string(), LanguageValueSchema).optional(),
  })
  .catchall(LanguageValueSchema);

/**
 * Root translation file: optional _meta and $namespace, then key → unified entry.
 */
export const UnifiedTranslationFileSchema = z
  .object({
    $namespace: z.string().optional(),
    _meta: MetaDataSchema.optional(),
  })
  .catchall(UnifiedEntrySchema);

export type LanguageValue = z.infer<typeof LanguageValueSchema>;
export type UnifiedEntry = z.infer<typeof UnifiedEntrySchema>;
export type UnifiedTranslationFileParsed = z.infer<
  typeof UnifiedTranslationFileSchema
>;
