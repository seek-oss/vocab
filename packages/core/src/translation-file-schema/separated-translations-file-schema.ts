import * as z from 'zod';
import { TranslationMessage, Validated } from './common-schemas';
import type { TranslationFileMetadata, UserConfig } from '../types';
import { getAltLanguageFilePath, getAltLanguages } from '../utils';
import { UnifiedTranslationFileSchema } from './unified-translations-file-schema';

const TranslationEntry = z.object({
  message: TranslationMessage,
  validated: Validated,
});

type TranslationEntry = z.infer<typeof TranslationEntry>;

function normalizeLanguageValue(
  val: string | { message: string; validated?: boolean },
): TranslationEntry {
  if (typeof val === 'string') {
    return { message: val };
  }
  return { message: val.message, validated: val.validated };
}

function getDevLanguageValue(
  entry: Record<string, unknown>,
  devLanguage: string,
): TranslationEntry | null {
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

export function getTranslationEntrySchema(userConfig: UserConfig) {
  const altLanguages = getAltLanguages(userConfig);
  const LanguageName = z.enum(altLanguages as [string, ...string[]]);
  const AlternativeLanguageFile = z.record(
    z.string(),
    z.union([
      TranslationMessage,
      z.object({ message: TranslationMessage, validated: Validated }),
    ]),
  );
  return { AlternativeLanguageFile, LanguageName };
}

export type AlternativeLanguageFileSchema = ReturnType<
  typeof getTranslationEntrySchema
>['AlternativeLanguageFile'];

/** Normalized content shape used internally by TranslationFile (dev language resolved). */
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
    const parsed = UnifiedTranslationFileSchema.parse(raw);
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
      const translations = (obj.translations as Record<string, unknown>) || {};
      normalized[key] = {
        ...obj,
        message: devVal.message,
        validated: devVal.validated,
        translations: { [devLanguage]: devVal, ...translations },
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

  // private loadGeneratedLanguages() {
  //   for (const { name, generator } of this.userConfig.generatedLanguages ||
  //     []) {
  //     for (const key of this.getKeyNames()) {
  //       const translation = generateTranslation({
  //         message: this.content[key].message,
  //         generator,
  //       });
  //       this.addTranslationEntry(key, name, {
  //         message: translation,
  //       });
  //     }
  //   }
  // }

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
