import type { UserConfig } from './types';
import path from 'path';

import pc from 'picocolors';
import findUp from 'find-up';
import Validator from 'fastest-validator';
import { ValidationError } from './ValidationError';
import { trace } from './logger';

const boldCyan = (s: string) => pc.bold(pc.cyan(s));

const validator = new Validator();
const schema = {
  $$strict: true,
  devLanguage: {
    type: 'string',
  },
  languages: {
    type: 'array',
    items: {
      type: 'object',
      props: {
        name: { type: 'string' },
        extends: { type: 'string', optional: true },
      },
    },
  },
  generatedLanguages: {
    type: 'array',
    items: {
      type: 'object',
      props: {
        name: { type: 'string' },
        extends: { type: 'string', optional: true },
        generator: {
          type: 'object',
          props: {
            transformElement: { type: 'function', optional: true },
            transformMessage: { type: 'function', optional: true },
          },
        },
      },
    },
    optional: true,
  },
  translationsDirectorySuffix: { type: 'string', optional: true },
  projectRoot: { type: 'string', optional: true },
  ignore: {
    type: 'array',
    items: 'string',
    optional: true,
  },
};
const checkConfigFile = validator.compile(schema);

const splitMap = (message: string, callback: (value: string) => string) =>
  message
    .split(' ,')
    .map((v) => callback(v))
    .join(' ,');

export function validateConfig(c: UserConfig) {
  trace('Validating configuration file');
  // Note: checkConfigFile mutates the config file by applying defaults
  const isValid = checkConfigFile(c);
  if (isValid !== true) {
    throw new ValidationError(
      'InvalidStructure',
      (Array.isArray(isValid) ? isValid : [])
        .map((v) => {
          if (v.type === 'objectStrict') {
            return `Invalid key(s) ${splitMap(
              v.actual,
              (m) => `"${pc.cyan(m)}"`,
            )}. Expected one of ${splitMap(v.expected, pc.green)}`;
          }
          if (v.field) {
            return v.message?.replace(v.field, pc.cyan(v.field));
          }
          return v.message;
        })
        .join(' \n'),
    );
  }

  const languageStrings = c.languages.map((v) => v.name);

  // Dev Language should exist in languages
  if (!languageStrings.includes(c.devLanguage)) {
    throw new ValidationError(
      'InvalidDevLanguage',
      `The dev language "${boldCyan(
        c.devLanguage,
      )}" was not found in languages ${languageStrings.join(', ')}.`,
    );
  }

  const foundLanguages: string[] = [];
  for (const lang of c.languages) {
    // Languages must only exist once
    if (foundLanguages.includes(lang.name)) {
      throw new ValidationError(
        'DuplicateLanguage',
        `The language "${boldCyan(lang.name)}" was defined multiple times.`,
      );
    }
    foundLanguages.push(lang.name);

    // Any extends must be in languages
    if (lang.extends && !languageStrings.includes(lang.extends)) {
      throw new ValidationError(
        'InvalidExtends',
        `The language "${boldCyan(lang.name)}"'s extends of ${boldCyan(
          lang.extends,
        )} was not found in languages ${languageStrings.join(', ')}.`,
      );
    }
  }

  const foundGeneratedLanguages: string[] = [];
  for (const generatedLang of c.generatedLanguages || []) {
    // Generated languages must only exist once
    if (foundGeneratedLanguages.includes(generatedLang.name)) {
      throw new ValidationError(
        'DuplicateGeneratedLanguage',
        `The generated language "${boldCyan(
          generatedLang.name,
        )}" was defined multiple times.`,
      );
    }
    foundGeneratedLanguages.push(generatedLang.name);

    // Generated language names must not conflict with language names
    if (languageStrings.includes(generatedLang.name)) {
      throw new ValidationError(
        'InvalidGeneratedLanguage',
        `The generated language "${boldCyan(
          generatedLang.name,
        )}" is already defined as a language.`,
      );
    }

    // Any extends must be in languages
    if (
      generatedLang.extends &&
      !languageStrings.includes(generatedLang.extends)
    ) {
      throw new ValidationError(
        'InvalidExtends',
        `The generated language "${boldCyan(
          generatedLang.name,
        )}"'s extends of ${boldCyan(
          generatedLang.extends,
        )} was not found in languages ${languageStrings.join(', ')}.`,
      );
    }
  }

  trace('Configuration file is valid');

  return true;
}

function createConfig(configFilePath: string) {
  const cwd = path.dirname(configFilePath);

  return {
    projectRoot: cwd,
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    ...(require(configFilePath) as UserConfig),
  };
}

export async function resolveConfig(
  customConfigFilePath?: string,
): Promise<UserConfig | null> {
  const configFilePath = customConfigFilePath
    ? path.resolve(customConfigFilePath)
    : await findUp(['vocab.config.js', 'vocab.config.cjs']);

  if (configFilePath) {
    trace(`Resolved configuration file to ${configFilePath}`);
    return createConfig(configFilePath);
  }
  trace('No configuration file found');
  return null;
}

export function resolveConfigSync(
  customConfigFilePath?: string,
): UserConfig | null {
  const configFilePath = customConfigFilePath
    ? path.resolve(customConfigFilePath)
    : findUp.sync(['vocab.config.js', 'vocab.config.cjs']);

  if (configFilePath) {
    trace(`Resolved configuration file to ${configFilePath}`);
    return createConfig(configFilePath);
  }
  trace('No configuration file found');

  return null;
}
