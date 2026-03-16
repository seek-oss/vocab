// Claude, I'm still working on this file. Ignore it for your current work.

type TranslationContent = unknown;
type EntryId = {
  path: string;
  localKey: string;
  globalKey: string;
};

type LocalOnly = {
  type: 'local-only';
  local: TranslationContent;
} & EntryId;

type RemoteOnly = {
  type: 'remote-only';
  remote: TranslationContent;
} & Omit<EntryId, 'localKey'>;

type Diff = {
  type: 'diff';
  local: TranslationContent;
  remote: TranslationContent;
} & EntryId;

export type Change = LocalOnly | RemoteOnly | Diff;
