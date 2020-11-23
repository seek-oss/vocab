import findUp from 'find-up';
import Validator from 'fastest-validator';
import chalk from 'chalk';

interface Config {
  defaultLanguage: string;
  altLanguages: Array<string>;
  translationsDirname: string;
}

let configPromise: Promise<Config> | null = null;

function validationError(message: string) {
  // eslint-disable-next-line no-console
  console.error(chalk.red('Invalid vocab.config.js:'));
  // eslint-disable-next-line no-console
  console.error(message);
  process.exit(1);
}

const validator = new Validator();
const schema = {
  $$strict: true,
  defaultLanguage: { type: 'string' },
  altLanguages: {
    type: 'array',
    items: {
      type: 'string',
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

export async function getConfig(): Promise<Config> {
  if (!configPromise) {
    configPromise = findUp('vocab.config.js').then((configFilePath) => {
      if (!configFilePath) {
        validationError('Unable to find a project vocab.config.js');
      }
      const result: Config = require(configFilePath!);
      const isValid = checkConfigFile(result);
      if (isValid !== true) {
        validationError(
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
      if (result.altLanguages.includes(result.defaultLanguage)) {
        validationError(
          `The default language "${chalk.bold.cyan(
            result.defaultLanguage,
          )}" should not be included in altLanguages.`,
        );
      }
      return result;
    });
  }
  return configPromise;
}
