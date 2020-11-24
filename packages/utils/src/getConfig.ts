import path from 'path';

import chalk from 'chalk';
import findUp from 'find-up';
import Validator from 'fastest-validator';
import { ValidationError } from './ValidationError';

interface LanguageTarget {
  // The name or tag of a language
  name: string;
  // Translations will be copied from parent language when they don't exist in child. Defaults to first language.
  extends?: string;
}

interface UserConfig {
  // The language contained in translations.json
  devLanguage: string;
  // An array of languages to build for
  languages: Array<LanguageTarget>;
  translationsDirname?: string;
}

interface Config extends UserConfig {
  cwd: string;
  translationsDirname: string;
}

let config: Config | null = null;

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
  translationsDirname: { type: 'string', default: '__translations__' },
};
const checkConfigFile = validator.compile(schema);

const splitMap = (message: string, callback: (value: string) => string) =>
  message
    .split(' ,')
    .map((v) => callback(v))
    .join(' ,');

export function validateConfig(c: UserConfig) {
  // Note: checkConfigFile mutates the config file by applying defaults
  const isValid = checkConfigFile(c);
  if (isValid !== true) {
    throw new ValidationError(
      'InvalidStructure',
      isValid
        .map((v) => {
          if (v.type === 'objectStrict') {
            return `Invalid key(s) ${splitMap(
              v.actual,
              (m) => `"${chalk.cyan(m)}"`,
            )}. Expected one of ${splitMap(v.expected, chalk.green)}`;
          }
          if (v.field) {
            return v.message?.replace(v.field, chalk.cyan(v.field));
          }
          return v.message;
        })
        .join(' \n'),
    );
  }

  // Dev Language should exist in languages
  const languageStrings = c.languages.map((v) => v.name);
  if (!languageStrings.includes(c.devLanguage)) {
    throw new ValidationError(
      'InvalidDevLanguage',
      `InvalidDevLanguage: The dev language "${chalk.bold.cyan(
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
        `The language "${chalk.bold.cyan(
          lang.name,
        )}" was defined multiple times.`,
      );
    }
    foundLanguages.push(lang.name);

    // Any extends must be in languages
    if (lang.extends && !languageStrings.includes(lang.extends)) {
      throw new ValidationError(
        'InvalidExtends',
        `The language "${chalk.bold.cyan(
          lang.name,
        )}"'s extends of ${chalk.bold.cyan(
          lang.extends,
        )} was not found in languages ${languageStrings.join(', ')}.`,
      );
    }
  }
}

export async function loadConfig(customConfigFilePath?: string) {
  const configFilePath = customConfigFilePath
    ? path.resolve(customConfigFilePath)
    : await findUp('vocab.config.js');

  if (!configFilePath) {
    throw new ValidationError(
      'NoConfig',
      'Unable to find a project vocab.config.js',
    );
  }

  const cwd = path.dirname(configFilePath);

  const loadedConfig = require(configFilePath as string) as UserConfig;

  validateConfig(loadedConfig);

  config = {
    ...require(configFilePath as string),
    cwd,
  } as Config;
}

export function getConfig(): Config {
  if (!config) {
    throw new Error('Config not loaded');
  }
  return config;
}
