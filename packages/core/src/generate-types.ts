import { promises as fs } from 'fs';
import path from 'path';

import { LoadedTranslation, UserConfig } from '@vocab/types';
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
import chokidar from 'chokidar';

import {
  loadAllTranslations,
  translationFileGlob,
  loadTranslation,
  translationFileExtension,
} from './utils';
import { trace } from './logger';

type ICUParams = { [key: string]: string };

interface TranslationTypeInfo {
  params: ICUParams;
  message: string;
  returnType: string;
}

function extractHasTags(ast: MessageFormatElement[]): boolean {
  return ast.some((element) => {
    if (isSelectElement(element)) {
      const children = Object.values(element.options).map((o) => o.value);
      return children.some((child) => extractHasTags(child));
    }
    return isTagElement(element);
  });
}

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
  value: Map<string, TranslationTypeInfo>,
  imports: Set<string>,
) {
  const translationsType: any = {};

  for (const [key, { params, returnType }] of value.entries()) {
    const translationKeyType: any = {};

    if (Object.keys(params).length > 0) {
      translationKeyType.params = params;
    }
    translationKeyType.returnType = returnType;

    translationKeyType.message = 'string';

    translationsType[key] = translationKeyType;
  }

  return `
  ${Array.from(imports).join('\n')}
  import { TranslationFile } from '@vocab/core';

  declare const translations: TranslationFile<${serialiseObjectToType(
    translationsType,
  )}>;

  export default translations;`;
}

export async function generateTypes(loadedTranslation: LoadedTranslation) {
  const { languages: loadedLanguages, filePath } = loadedTranslation;

  trace('Generating types for', loadedTranslation.filePath);
  const translationTypes = new Map<string, TranslationTypeInfo>();

  let imports = new Set<string>();

  for (const key of loadedTranslation.keys) {
    let params: ICUParams = {};
    const messages = [];
    let hasTags = false;

    for (const translatedLanguage of loadedLanguages.values()) {
      if (translatedLanguage[key]) {
        const ast = parse(translatedLanguage[key].message);

        hasTags = hasTags || extractHasTags(ast);

        const [parsedParams, parsedImports] = extractParamTypes(ast);
        imports = new Set([...imports, ...parsedImports]);

        params = {
          ...params,
          ...parsedParams,
        };
        messages.push(`'${translatedLanguage[key].message}'`);
      }
    }

    const returnType = hasTags ? 'ReactNode' : 'string';

    translationTypes.set(key, {
      params,
      message: messages.join(' | '),
      returnType,
    });
  }

  const prettierConfig = await prettier.resolveConfig(filePath);
  const declaration = prettier.format(
    serialiseTranslationTypes(translationTypes, imports),
    { ...prettierConfig, parser: 'typescript' },
  );
  const outputFilePath = `${filePath}.d.ts`;
  trace(`Writing translation types to ${outputFilePath}`);
  await fs.writeFile(outputFilePath, declaration);
}

export function watchAll(
  config: UserConfig,
  { ignored = ['node_modules'] }: { ignored?: Array<string> } = {},
) {
  const cwd = config.projectRoot || process.cwd();
  const watcher = chokidar.watch(translationFileGlob, {
    cwd,
    ignored,
    ignoreInitial: true,
  });

  const onTranslationChange = async (relativePath: string) => {
    trace(`Detected change for file ${relativePath}`);
    if (relativePath.endsWith(translationFileExtension)) {
      try {
        const loadedTranslation = await loadTranslation(
          { filePath: path.resolve(cwd, relativePath), fallbacks: 'all' },
          config,
        );

        await generateTypes(loadedTranslation);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log('Failed to generate types for', relativePath);
        // eslint-disable-next-line no-console
        console.error(e);
      }
    }
  };

  watcher.on('add', onTranslationChange).on('change', onTranslationChange);

  return () => watcher.close();
}

export async function generateAllTypes(
  { watch = false } = {},
  config: UserConfig,
) {
  const translations = await loadAllTranslations({ fallbacks: 'all' }, config);

  for (const loadedTranslation of translations) {
    await generateTypes(loadedTranslation);
  }

  if (watch) {
    trace('Listening for changes to files...');
    return watchAll(config);
  }
}
