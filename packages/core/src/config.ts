import { UserConfig } from '@vocab/types';
import path from 'path';

import chalk from 'chalk';
import findUp from 'find-up';
import Validator from 'fastest-validator';
import { ValidationError } from './ValidationError';

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
  translationsDirname: { type: 'string', optional: true },
  projectRoot: { type: 'string', optional: true },
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

  return true;
}

function createConfig(configFilePath: string) {
  const cwd = path.dirname(configFilePath);

  return {
    projectRoot: cwd,
    ...(require(configFilePath as string) as UserConfig),
  };
}

export async function resolveConfig(
  customConfigFilePath?: string,
): Promise<UserConfig | null> {
  const configFilePath = customConfigFilePath
    ? path.resolve(customConfigFilePath)
    : await findUp('vocab.config.js');

  if (configFilePath) {
    return createConfig(configFilePath);
  }

  return null;
}

export function resolveConfigSync(
  customConfigFilePath?: string,
): UserConfig | null {
  const configFilePath = customConfigFilePath
    ? path.resolve(customConfigFilePath)
    : findUp.sync('vocab.config.js');

  if (configFilePath) {
    if (configFilePath) {
      return createConfig(configFilePath);
    }
  }

  return null;
}
