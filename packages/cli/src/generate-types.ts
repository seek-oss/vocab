import { promises as fs } from 'fs';

import { getTranslationKeys, loadAllTranslations } from '@vocab/utils';
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

type ICUParams = { [key: string]: string };

function extractParamTypes(ast: MessageFormatElement[]) {
  let params: ICUParams = {};

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
      params[element.value] = '(v: string) => any';

      params = { ...params, ...extractParamTypes(element.children) };
    } else if (isSelectElement(element)) {
      params[element.value] = Object.keys(element.options)
        .map((o) => `'${o}'`)
        .join(' | ');

      const children = Object.values(element.options).map((o) => o.value);

      for (const child of children) {
        params = { ...params, ...extractParamTypes(child) };
      }
    }
  }

  return params;
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
) {
  const translationsType: any = {};

  for (const [key, { params }] of Array.from(value.entries())) {
    const translationKeyType: any = {};

    if (Object.keys(params).length > 0) {
      translationKeyType.params = params;
    }

    translationKeyType.message = 'string';

    translationsType[key] = translationKeyType;
  }

  return `
  import { TranslationFile } from '@vocab/cli';

  declare const translations: TranslationFile<${serialiseObjectToType(
    translationsType,
  )}>;

  export default translations;`;
}

export default async function main() {
  const translations = await loadAllTranslations();

  for (const loadedTranslation of translations) {
    const { languages, filePath } = loadedTranslation;

    trace('Generating types for', loadedTranslation.filePath);
    const translationTypes = new Map<
      string,
      { params: ICUParams; message: string }
    >();

    const translationFileKeys = getTranslationKeys(loadedTranslation);

    for (const key of translationFileKeys) {
      let params: ICUParams = {};
      const messages = [];

      for (const translatedLanguage of Array.from(languages.values())) {
        if (translatedLanguage[key]) {
          params = {
            ...params,
            ...parseParamType(translatedLanguage[key].message),
          };
          messages.push(`'${translatedLanguage[key].message}'`);
        }
      }

      translationTypes.set(key, { params, message: messages.join(' | ') });
    }

    const prettierConfig = await prettier.resolveConfig(filePath);
    const declaration = prettier.format(
      serialiseTranslationTypes(translationTypes),
      { ...prettierConfig, parser: 'typescript' },
    );

    await fs.writeFile(`${filePath}.d.ts`, declaration);
  }
}
