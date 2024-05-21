/* eslint-disable no-console */
import { pull, push } from '@vocab/phrase';
import { type UserConfig, resolveConfig, compile, validate } from '@vocab/core';
import yargsCli from 'yargs';

import envCi from 'env-ci';

const { branch } = envCi();

const branchDefinition = {
  type: 'string',
  describe: 'The Phrase branch to target',
  default: branch || 'local-development',
} as const;

let config: UserConfig | null = null;

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
yargsCli(process.argv.slice(2))
  .scriptName('vocab')
  .option('config', {
    type: 'string',
    describe: 'Path to config file',
  })
  .middleware(async ({ config: configPath }) => {
    config = await resolveConfig(configPath);
    console.log('Loaded config from', configPath || process.cwd());
  })
  .command({
    command: 'push',
    builder: (yargs) =>
      yargs.options({
        branch: branchDefinition,
        'delete-unused-keys': {
          type: 'boolean',
          describe: 'Whether or not to delete unused keys after pushing',
          default: false,
        },
      }),
    handler: async (options) => {
      await push(options, config!);
    },
  })
  .command({
    command: 'pull',
    builder: (yargs) =>
      yargs.options({
        branch: branchDefinition,
        'error-on-no-global-key-translation': {
          type: 'boolean',
          describe:
            'Throw an error when there is no translation for a global key',
          default: false,
        },
      }),
    handler: async (options) => {
      await pull(options, config!);
    },
  })
  .command({
    command: 'compile',
    builder: (yargs) =>
      yargs.options({
        watch: { type: 'boolean', default: false },
      }),
    handler: async ({ watch }) => {
      await compile({ watch }, config!);
    },
  })
  .command({
    command: 'validate',
    handler: async () => {
      const valid = await validate(config!);

      if (!valid) {
        throw new Error('Project invalid');
      }
    },
  })
  .help()
  .wrap(72).argv;
