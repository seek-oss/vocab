/* eslint-disable no-console */
import { pull, push } from '@vocab/phrase';
import { type UserConfig, resolveConfig, compile, validate } from '@vocab/core';
import { getGitBranch } from './getGitBranch.js';
import { Command, Option } from 'commander';
import {
  description,
  version,
} from '@vocab/cli/package.json' with { type: 'json' };

const branch = getGitBranch();
const DEFAULT_BRANCH = branch || 'local-development';

const program = new Command();

program
  .name('vocab')
  .version(version)
  .description(description)
  .option('--config <path>', 'Path to config file')
  .hook('preAction', async (thisCommand, actionCommand) => {
    const options = thisCommand.optsWithGlobals<{ config?: string }>();

    console.log('Loading configuration from', options.config || process.cwd());
    const userConfig = await resolveConfig(options.config);

    if (!userConfig) {
      throw new Error('No configuration file found');
    }

    console.log('Successfully loaded configuration');
    actionCommand.setOptionValue('userConfig', userConfig);
  });

const branchOption = new Option(
  '--branch <name>',
  'The Phrase branch to target',
).default(DEFAULT_BRANCH);

const pushAction = async (options: {
  branch: string;
  deleteUnusedKeys?: boolean;
  ignore?: string[];
  userConfig: UserConfig;
}) => {
  await push(
    {
      branch: options.branch,
      deleteUnusedKeys: options.deleteUnusedKeys,
      ignore: options.ignore,
    },
    options.userConfig,
  );
};

program
  .command('push')
  .description('Push translations to Phrase')
  .addOption(branchOption)
  .option(
    '--delete-unused-keys',
    'Whether or not to delete unused keys after pushing',
    false,
  )
  .option(
    '--ignore <paths...>',
    'Array of glob paths to ignore when searching for keys to push',
    [],
  )
  .action(pushAction);

const pullAction = async (options: {
  branch: string;
  errorOnNoGlobalKeyTranslation: boolean;
  userConfig: UserConfig;
}) => {
  await pull(
    {
      branch: options.branch,
      errorOnNoGlobalKeyTranslation:
        options.errorOnNoGlobalKeyTranslation || false,
    },
    options.userConfig,
  );
};

program
  .command('pull')
  .description('Pull translations from Phrase')
  .addOption(branchOption)
  .option(
    '--error-on-no-global-key-translation',
    'Throw an error when there is no translation for a global key',
    false,
  )
  .action(pullAction);

const compileAction = async (options: {
  watch: boolean;
  userConfig: UserConfig;
}) => {
  await compile({ watch: options.watch }, options.userConfig);
};

program
  .command('compile')
  .description('Compile translations')
  .option('--watch', 'Watch for changes', false)
  .action(compileAction);

const validateAction = async (options: { userConfig: UserConfig }) => {
  console.log('Validating project');
  const valid = await validate(options.userConfig);

  if (!valid) {
    throw new Error('Project is invalid');
  }

  console.log('Project is valid');
};

program
  .command('validate')
  .description('Validate translations')
  .action(validateAction);

program.parseAsync();
