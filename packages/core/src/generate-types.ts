import { promises as fs } from 'fs';

import { getTranslationKeys, loadAllTranslations } from './utils';
import {
  isArgumentElement,
  isDateElement,
  isNumberElement,
  isPluralElement,
  isSelectElement,
  isTagElement,
  isTimeElement,
  MessageFormatElement,
  parse,
} from 'intl-messageformat-parser';
import prettier from 'prettier';

import { trace } from './logger';
import { LanguageTarget } from './config';

type ICUParams = { [key: string]: string };

function extractParamTypes(
  ast: MessageFormatElement[],
): [params: ICUParams, imports: Set<string>] {
  let params: ICUParams = {};
  let imports = new Set<string>();

  for (const element of ast) {
    if (isArgumentElement(element)) {
      params[element.value] = 'string';
    } else if (isNumberElement(element)) {
      params[element.value] = 'number';
    } else if (isPluralElement(element)) {
      params[element.value] = 'number';
    } else if (isDateElement(element) || isTimeElement(element)) {
      params[element.value] = 'Date | number';
    } else if (isTagElement(element)) {
      params[element.value] = '(v: ReactNode) => ReactNode';
      imports.add(`import { ReactNode } from 'react';`);

      const [subParams, subImports] = extractParamTypes(element.children);

      imports = new Set([...imports, ...subImports]);
      params = { ...params, ...subParams };
    } else if (isSelectElement(element)) {
      params[element.value] = Object.keys(element.options)
        .map((o) => `'${o}'`)
        .join(' | ');

      const children = Object.values(element.options).map((o) => o.value);

      for (const child of children) {
        const [subParams, subImports] = extractParamTypes(child);

        imports = new Set([...imports, ...subImports]);
        params = { ...params, ...subParams };
      }
    }
  }

  return [params, imports];
}

function parseParamType(icuString: string) {
  const ast = parse(icuString);

  return extractParamTypes(ast);
}

function serialiseObjectToType(v: any) {
  let result = '';

  for (const [key, value] of Object.entries(v)) {
    if (value && typeof value === 'object') {
      result += `'${key}': ${serialiseObjectToType(value)},`;
    } else {
      result += `'${key}': ${value},`;
    }
  }

  return `{ ${result} }`;
}

function serialiseTranslationTypes(
  value: Map<string, { params: ICUParams; message: string }>,
  imports: Set<string>,
) {
  const translationsType: any = {};

  for (const [key, { params }] of value.entries()) {
    const translationKeyType: any = {};

    if (Object.keys(params).length > 0) {
      translationKeyType.params = params;
    }

    translationKeyType.message = 'string';

    translationsType[key] = translationKeyType;
  }

  return `
  ${Array.from(imports).join('\n')}
  import { TranslationFile } from '@vocab/cli';

  declare const translations: TranslationFile<${serialiseObjectToType(
    translationsType,
  )}>;

  export default translations;`;
}

export async function generateTypes({
  projectRoot,
  devLanguage,
  languages,
  translationsDirname,
}: {
  projectRoot?: string;
  devLanguage: string;
  languages: Array<LanguageTarget>;
  translationsDirname: string;
}) {
  const translations = await loadAllTranslations({
    projectRoot,
    devLanguage,
    languages,
    translationsDirname,
  });

  for (const loadedTranslation of translations) {
    const { languages: loadedLanguages, filePath } = loadedTranslation;

    trace('Generating types for', loadedTranslation.filePath);
    const translationTypes = new Map<
      string,
      { params: ICUParams; message: string }
    >();

    const translationFileKeys = getTranslationKeys(loadedTranslation, {
      devLanguage,
    });
    let imports = new Set<string>();

    for (const key of translationFileKeys) {
      let params: ICUParams = {};
      const messages = [];

      for (const translatedLanguage of loadedLanguages.values()) {
        if (translatedLanguage[key]) {
          const [parsedParams, parsedImports] = parseParamType(
            translatedLanguage[key].message,
          );
          imports = new Set([...imports, ...parsedImports]);

          params = {
            ...params,
            ...parsedParams,
          };
          messages.push(`'${translatedLanguage[key].message}'`);
        }
      }

      translationTypes.set(key, { params, message: messages.join(' | ') });
    }

    const prettierConfig = await prettier.resolveConfig(filePath);
    const declaration = prettier.format(
      serialiseTranslationTypes(translationTypes, imports),
      { ...prettierConfig, parser: 'typescript' },
    );

    await fs.writeFile(`${filePath}.d.ts`, declaration);
  }
}
