export declare type Translation = Record<
  string,
  {
    message: string;
  }
>;

export declare type LoadedTranslation = {
  filePath: string;
  languages: Map<
    string,
    Record<
      string,
      {
        message: string;
      }
    >
  >;
};

export declare function getDefaultLanguage(): string;
export declare function getAltLanguages(): string[];
export declare function getAltLanguageFilePath(
  filePath: string,
  language: string,
): string;
export declare function getAllTranslationFiles(): Promise<string[]>;
export declare function loadTranslation(filePath: string): LoadedTranslation;
export declare function loadAllTranslations(): Promise<LoadedTranslation[]>;
export declare function getChunkName(lang: string): string;

export declare function getTranslationKeys(
  translation: LoadedTranslation,
): Array<string>;
