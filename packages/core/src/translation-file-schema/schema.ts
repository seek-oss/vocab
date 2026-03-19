import * as z from 'zod';
import type { TranslationFileMetadata, UserConfig } from '../types';
import { getAltLanguageFilePath, getAltLanguages } from '../utils';
import {
  AllowUnvalidated,
  GlobalKey,
  KeyDescription,
  KeyTags,
  MetaDataSchema,
  TranslationMessage,
  Validated,
} from './common-schemas';

// --- Schemas ---

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

/** Normalized { message, validated } shape used when parsing entries. */
const TranslationEntrySchema = z.object({
  message: TranslationMessage,
  validated: Validated,
});

/**
 * Translation entry. Dev language may be supplied via the reserved key `message`
 * or the dev language code (e.g. `en`). Other languages via optional `translations`
 * and/or top-level language keys. Preferred multi-language syntax is `messages`: lang → value.
 */
const EntrySchema = z
  .object({
    allowUnvalidated: AllowUnvalidated,
    description: KeyDescription,
    globalKey: GlobalKey,
    /** All languages in one object. Preferred when multiple languages in one file. */
    messages: z.record(z.string(), LanguageValueSchema).optional(),
    /** Dev language when present. */
    message: LanguageValueSchema.optional(),
    tags: KeyTags,
    /** Optional record of lang code → language value. */
    translations: z.record(z.string(), LanguageValueSchema).optional(),
  })
  .catchall(LanguageValueSchema);

/**
 * Root translation file: optional _meta and $namespace, then key → entry.
 */
export const TranslationFileSchema = z
  .object({
    $namespace: z.string().optional(),
    _meta: MetaDataSchema.optional(),
  })
  .catchall(EntrySchema);

// --- Types ---

export type LanguageValue = z.infer<typeof LanguageValueSchema>;
type TranslationEntry = z.infer<typeof TranslationEntrySchema>;
export type TranslationFileParsed = z.infer<typeof TranslationFileSchema>;

// --- Helpers (for TranslationFile and validation) ---

function normalizeLanguageValue(
  val: string | { message: string; validated?: boolean },
): TranslationEntry {
  if (typeof val === 'string') {
    return { message: val };
  }
  return { message: val.message, validated: val.validated };
}

function getMessagesRecord(
  entry: Record<string, unknown>,
): Record<string, unknown> | null {
  const messages = entry.messages;
  if (
    messages !== null &&
    typeof messages === 'object' &&
    !Array.isArray(messages)
  ) {
    return messages as Record<string, unknown>;
  }
  return null;
}

function getDevLanguageValue(
  entry: Record<string, unknown>,
  devLanguage: string,
): TranslationEntry | null {
  const messagesRecord = getMessagesRecord(entry);
  if (messagesRecord !== null) {
    const raw = messagesRecord[devLanguage];
    if (raw === null || raw === undefined) {
      return null;
    }
    return normalizeLanguageValue(
      raw as string | { message: string; validated?: boolean },
    );
  }
  const fromMessage = entry.message;
  const fromDevKey = entry[devLanguage];
  let raw: unknown = null;
  if (fromMessage !== undefined && fromMessage !== null) {
    raw = fromMessage;
  } else if (fromDevKey !== undefined && fromDevKey !== null) {
    raw = fromDevKey;
  }
  if (raw === null || raw === undefined) {
    return null;
  }
  return normalizeLanguageValue(
    raw as string | { message: string; validated?: boolean },
  );
}

// --- Alternative language file schema (per config) ---

export function getTranslationEntrySchema(userConfig: UserConfig) {
  const altLanguages = getAltLanguages(userConfig);
  const LanguageName = z.enum(altLanguages as [string, ...string[]]);
  const AlternativeLanguageFile = z.record(
    z.string(),
    z.union([TranslationMessage, TranslationEntrySchema]),
  );
  return { AlternativeLanguageFile, LanguageName };
}

export type AlternativeLanguageFileSchema = ReturnType<
  typeof getTranslationEntrySchema
>['AlternativeLanguageFile'];

// --- TranslationFile (loads root + per-language files, normalizes to single content) ---

type NormalizedEntry = {
  message: string;
  validated?: boolean;
  description?: string;
  globalKey?: string;
  tags?: string[];
  translations?: Record<string, TranslationEntry>;
};

type NormalizedContent = Record<
  string,
  NormalizedEntry | TranslationFileMetadata | string | undefined
>;

export class TranslationFile {
  private AlternativeLanguageFileSchema: AlternativeLanguageFileSchema;
  private content: NormalizedContent;

  constructor(
    private filePath: string,
    private userConfig: UserConfig,
  ) {
    const { AlternativeLanguageFile } = getTranslationEntrySchema(
      this.userConfig,
    );

    this.AlternativeLanguageFileSchema = AlternativeLanguageFile;
    this.content = this.loadRootLanguageFile();

    this.loadAltLanguageFiles();
  }

  loadAltLanguageFiles() {
    const altLanguages = getAltLanguages(this.userConfig);

    for (const altLanguage of altLanguages) {
      this.loadAltLanguageFile(altLanguage);
    }
  }

  keys() {
    Object.fromEntries(
      this.getKeyNames().map((key) => [key, this.getKey(key)]),
    );
  }

  private normalizeTranslationEntry(entry: TranslationEntry) {
    if (typeof entry === 'string') {
      return { message: entry };
    }
    return entry;
  }

  private getKey(key: string) {
    const entry = this.content[key];
    if (typeof entry === 'string' || entry == null) {
      return undefined;
    }
    const normalizedEntry = entry as NormalizedEntry;
    return {
      ...normalizedEntry,
      tags: [...(normalizedEntry.tags || []), ...this.getFileTags()],
    };
  }

  private getFileTags() {
    return (
      (this.content._meta as TranslationFileMetadata | undefined)?.tags || []
    );
  }

  private getKeyNames() {
    return Object.keys(this.content).filter(
      (key) => !['$namespace', '_meta'].includes(key),
    );
  }

  private loadRootLanguageFile(): NormalizedContent {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const raw = require(this.filePath);
    const parsed = TranslationFileSchema.parse(raw);
    const devLanguage = this.userConfig.devLanguage;
    const normalized: Record<string, unknown> = { ...parsed };

    for (const key of Object.keys(parsed)) {
      if (key === '_meta' || key === '$namespace') {
        continue;
      }
      const entry = parsed[key];
      const obj =
        entry !== null && typeof entry === 'object'
          ? (entry as Record<string, unknown>)
          : {};
      const devVal = getDevLanguageValue(obj, devLanguage);
      if (!devVal) {
        delete normalized[key];
        continue;
      }
      const messagesRecord = getMessagesRecord(obj);
      let translations: Record<string, TranslationEntry>;
      if (messagesRecord !== null) {
        translations = {};
        for (const [lang, val] of Object.entries(messagesRecord)) {
          translations[lang] = normalizeLanguageValue(
            val as string | { message: string; validated?: boolean },
          );
        }
      } else {
        const legacyTranslations =
          (obj.translations as Record<string, unknown>) || {};
        translations = { [devLanguage]: devVal };
        for (const [lang, val] of Object.entries(legacyTranslations)) {
          translations[lang] = normalizeLanguageValue(
            val as string | { message: string; validated?: boolean },
          );
        }
      }
      normalized[key] = {
        ...obj,
        message: devVal.message,
        validated: devVal.validated,
        translations,
      };
    }
    return normalized as NormalizedContent;
  }

  private loadAltLanguageFile(altLanguage: string) {
    const altFilePath = getAltLanguageFilePath(this.filePath, altLanguage);
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const content = require(altFilePath);
    const alternativeLanguageFileContent =
      this.AlternativeLanguageFileSchema.parse(content) as Record<
        string,
        string | { message: string; validated?: boolean }
      >;

    for (const key of this.getKeyNames()) {
      const raw = alternativeLanguageFileContent[key];
      if (raw == null) {
        continue;
      }
      const entry = normalizeLanguageValue(raw);
      this.addTranslationEntry(key, altLanguage, entry);
    }
  }

  private addTranslationEntry(
    key: string,
    altLanguage: string,
    entry: TranslationEntry,
  ) {
    if (!entry) {
      return;
    }
    const contentEntry = this.content[key];
    if (contentEntry == null || typeof contentEntry === 'string') {
      return;
    }
    const normalized = contentEntry as NormalizedEntry;
    normalized.translations ||= {};
    normalized.translations[altLanguage] ||= entry;
  }
}
