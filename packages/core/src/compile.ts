import { promises as fs, existsSync } from 'fs';
import path from 'path';

import type { LoadedTranslation, UserConfig } from './types';
import {
  isArgumentElement,
  isDateElement,
  isNumberElement,
  isPluralElement,
  isSelectElement,
  isTagElement,
  isTimeElement,
  type MessageFormatElement,
  parse,
} from '@formatjs/icu-messageformat-parser';
import prettier from 'prettier';
import chokidar from 'chokidar';

import {
  getTranslationMessages,
  getDevTranslationFileGlob,
  getTSFileFromDevLanguageFile,
  getDevLanguageFileFromAltLanguageFile,
  getAltTranslationFileGlob,
  isDevLanguageFile,
  isAltLanguageFile,
  getTranslationFolderGlob,
  devTranslationFileName,
  isTranslationDirectory,
} from './utils';
import { trace } from './logger';
import { loadAllTranslations, loadTranslation } from './load-translations';

type ICUParams = { [key: string]: string };

interface TranslationTypeInfo {
  params: ICUParams;
  message: string;
  hasTags: boolean;
}

function extractHasTags(ast: MessageFormatElement[]): boolean {
  return ast.some((element) => {
    if (isSelectElement(element) || isPluralElement(element)) {
      const children = Object.values(element.options).map((o) => o.value);
      return children.some((child) => extractHasTags(child));
    }

    return isTagElement(element);
  });
}

function extractParamTypes(
  ast: MessageFormatElement[],
  currentParams: ICUParams,
): [params: ICUParams, vocabTypesImports: Set<string>] {
  let params = { ...currentParams };
  let vocabTypesImports = new Set<string>();

  for (const element of ast) {
    if (isArgumentElement(element)) {
      if (!(element.value in params)) {
        // Preserve existing types for parameters that we've already parsed
        // This applies to self-referential parameters, for example `{foo, plural, 1 {{foo} thing} other {{foo} things}}`
        params[element.value] = 'string';
      }
    } else if (isNumberElement(element)) {
      params[element.value] = 'number';
    } else if (isPluralElement(element)) {
      params[element.value] = 'number';

      const children = Object.values(element.options).map((o) => o.value);

      for (const child of children) {
        const [newParams, subImports] = extractParamTypes(child, params);

        vocabTypesImports = new Set([...vocabTypesImports, ...subImports]);
        params = newParams;
      }
    } else if (isDateElement(element) || isTimeElement(element)) {
      params[element.value] = 'Date | number';
    } else if (isTagElement(element)) {
      params[element.value] = 'FormatXMLElementFn<T>';
      vocabTypesImports.add('FormatXMLElementFn');

      const [newParams, subImports] = extractParamTypes(
        element.children,
        params,
      );

      vocabTypesImports = new Set([...vocabTypesImports, ...subImports]);
      params = newParams;
    } else if (isSelectElement(element)) {
      const options = Object.keys(element.options);

      // `other` will always be an option as the parser enforces this by default
      const nonOtherOptions = options.filter((o) => o !== 'other');
      const nonOtherOptionsUnion = nonOtherOptions
        .map((o) => `'${o}'`)
        .join(' | ');

      params[element.value] = `StringWithSuggestions<${nonOtherOptionsUnion}>`;
      vocabTypesImports.add('StringWithSuggestions');

      const children = Object.values(element.options).map((o) => o.value);

      for (const child of children) {
        const [newParams, subImports] = extractParamTypes(child, params);

        vocabTypesImports = new Set([...vocabTypesImports, ...subImports]);
        params = newParams;
      }
    }
  }

  return [params, vocabTypesImports];
}

function serialiseObjectToType(v: any) {
  let result = '';

  for (const [key, value] of Object.entries(v)) {
    result += `${JSON.stringify(key)}: ${
      value && typeof value === 'object' ? serialiseObjectToType(value) : value
    },`;
  }

  return `{ ${result} }`;
}

const serializeTypeImports = (imports: Set<string>, moduleName: string) => {
  if (imports.size === 0) {
    return '';
  }

  const importNames = Array.from(imports);
  return `import type { ${importNames.join(', ')} } from '${moduleName}';`;
};

function serialiseTranslationRuntime(
  value: Map<string, TranslationTypeInfo>,
  imports: Set<string>,
  loadedTranslation: LoadedTranslation,
) {
  trace('Serialising translations:', loadedTranslation);
  const translationsType: any = {};

  for (const [key, { params, message, hasTags }] of value.entries()) {
    let translationFunctionString = `() => ${message}`;

    if (Object.keys(params).length > 0) {
      const formatGeneric = hasTags ? '<T = string>' : '';
      const formatReturn =
        hasTags && imports.has('FormatXMLElementFn')
          ? 'ReturnType<FormatXMLElementFn<T>>'
          : 'string';
      translationFunctionString = `${formatGeneric}(values: ${serialiseObjectToType(
        params,
      )}) => ${formatReturn}`;
    }

    translationsType[key] = translationFunctionString;
  }

  const languagesUnionAsString = Object.keys(loadedTranslation.languages)
    .map((l) => `'${l}'`)
    .join(' | ');
  const languageEntries = Object.entries(loadedTranslation.languages)
    .map(
      ([languageName, translations]) =>
        `${JSON.stringify(languageName)}: createLanguage(${JSON.stringify(
          getTranslationMessages(translations),
        )})`,
    )
    .join(',');

  return /* ts */ `
    // This file is automatically generated by Vocab.
    // To make changes update translation.json files directly.

    ${serializeTypeImports(imports, '@vocab/core')}
    import { createLanguage, createTranslationFile } from '@vocab/core/runtime';

    const translations = createTranslationFile<
      ${languagesUnionAsString},
      ${serialiseObjectToType(translationsType)}
    >({
      ${languageEntries}
    });

    export default translations;
  `;
}

export async function generateRuntime(loadedTranslation: LoadedTranslation) {
  const { languages: loadedLanguages, filePath } = loadedTranslation;

  trace('Generating types for', filePath);
  const translationTypes = new Map<string, TranslationTypeInfo>();

  let imports = new Set<string>();

  for (const key of loadedTranslation.keys) {
    let params: ICUParams = {};
    const messages = new Set();
    let hasTags = false;

    for (const translatedLanguage of Object.values(loadedLanguages)) {
      if (translatedLanguage[key]) {
        const ast = parse(translatedLanguage[key].message);

        hasTags = hasTags || extractHasTags(ast);

        const [parsedParams, vocabTypesImports] = extractParamTypes(
          ast,
          params,
        );

        imports = new Set([...imports, ...vocabTypesImports]);
        params = parsedParams;

        messages.add(JSON.stringify(translatedLanguage[key].message));
      }
    }

    translationTypes.set(key, {
      params,
      hasTags,
      message: Array.from(messages).join(' | '),
    });
  }

  const prettierConfig = await prettier.resolveConfig(filePath);
  const serializedTranslationType = serialiseTranslationRuntime(
    translationTypes,
    imports,
    loadedTranslation,
  );
  const declaration = prettier.format(serializedTranslationType, {
    ...prettierConfig,
    parser: 'typescript',
  });
  const outputFilePath = getTSFileFromDevLanguageFile(filePath);
  trace(`Writing translation types to ${outputFilePath}`);
  await writeIfChanged(outputFilePath, declaration);
}

export function watch(config: UserConfig) {
  const cwd = config.projectRoot || process.cwd();

  const watcher = chokidar.watch(
    [
      getDevTranslationFileGlob(config),
      getAltTranslationFileGlob(config),
      getTranslationFolderGlob(config),
    ],
    {
      cwd,
      ignored: config.ignore
        ? [...config.ignore, '**/node_modules/**']
        : ['**/node_modules/**'],
      ignoreInitial: true,
    },
  );

  const onTranslationChange = async (relativePath: string) => {
    trace(`Detected change for file ${relativePath}`);

    let targetFile;

    if (isDevLanguageFile(relativePath)) {
      targetFile = path.resolve(cwd, relativePath);
    } else if (isAltLanguageFile(relativePath)) {
      targetFile = getDevLanguageFileFromAltLanguageFile(
        path.resolve(cwd, relativePath),
      );
    }

    if (targetFile) {
      try {
        const loadedTranslation = loadTranslation(
          { filePath: targetFile, fallbacks: 'all' },
          config,
        );

        await generateRuntime(loadedTranslation);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log('Failed to generate types for', relativePath);
        // eslint-disable-next-line no-console
        console.error(e);
      }
    }
  };

  const onNewDirectory = async (relativePath: string) => {
    trace('Detected new directory', relativePath);
    if (!isTranslationDirectory(relativePath, config)) {
      trace('Ignoring non-translation directory:', relativePath);
      return;
    }
    const newFilePath = path.join(relativePath, devTranslationFileName);
    if (!existsSync(newFilePath)) {
      await fs.writeFile(newFilePath, JSON.stringify({}, null, 2));
      trace('Created new empty translation file:', newFilePath);
    } else {
      trace(
        `New directory already contains translation file. Skipping creation. Existing file ${newFilePath}`,
      );
    }
  };

  watcher.on('addDir', onNewDirectory);
  watcher.on('add', onTranslationChange).on('change', onTranslationChange);

  return () => watcher.close();
}

export async function compile(
  { watch: shouldWatch = false } = {},
  config: UserConfig,
) {
  const translations = await loadAllTranslations(
    { fallbacks: 'all', includeNodeModules: false },
    config,
  );

  for (const loadedTranslation of translations) {
    await generateRuntime(loadedTranslation);
  }

  if (shouldWatch) {
    trace('Listening for changes to files...');
    return watch(config);
  }
}

async function writeIfChanged(filepath: string, contents: string) {
  let hasChanged = true;

  try {
    const existingContents = await fs.readFile(filepath, { encoding: 'utf-8' });

    hasChanged = existingContents !== contents;
  } catch (e) {
    // ignore error, likely a file doesn't exist error so we want to write anyway
  }

  if (hasChanged) {
    await fs.writeFile(filepath, contents, { encoding: 'utf-8' });
  }
}
