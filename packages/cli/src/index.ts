/* eslint-disable no-console */
import { pull, push } from '@vocab/phrase';
import {
  type UserConfig,
  resolveConfig,
  compile,
  validate,
  validateTranslationStatus,
  formatValidationResults,
} from '@vocab/core';
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
  autoTranslate?: boolean;
  branch: string;
  deleteUnusedKeys?: boolean;
  dryRun?: boolean;
  force?: boolean;
  ignore?: string[];
  userConfig: UserConfig;
}) => {
  await push(
    {
      branch: options.branch,
      deleteUnusedKeys: options.deleteUnusedKeys,
      ignore: options.ignore,
      autoTranslate: options.autoTranslate,
      dryRun: options.dryRun,
      force: options.force,
    },
    options.userConfig,
  );
};

program
  .command('push')
  .description('Push translations to Phrase')
  .addOption(branchOption)
  .option(
    '--auto-translate',
    'Enable automatic translation for missing translations',
    false,
  )
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
  .option(
    '--dry-run',
    'Show what would be changed without actually pushing',
    false,
  )
  .option(
    '--force',
    'Skip confirmation prompt and push changes automatically',
    false,
  )
  .option(
    '--non-interactive',
    'Disable interactive prompts and detailed diff output',
    false,
  )
  .action(pushAction);

const pullAction = async (options: {
  branch: string;
  dryRun?: boolean;
  errorOnNoGlobalKeyTranslation: boolean;
  force?: boolean;
  nonInteractive?: boolean;
  userConfig: UserConfig;
}) => {
  await pull(
    {
      branch: options.branch,
      errorOnNoGlobalKeyTranslation:
        options.errorOnNoGlobalKeyTranslation || false,
      dryRun: options.dryRun,
      force: options.force,
      interactive: !options.nonInteractive,
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
  .option(
    '--dry-run',
    'Show what would be changed without actually pulling',
    false,
  )
  .option(
    '--force',
    'Skip confirmation prompt and pull changes automatically',
    false,
  )
  .option(
    '--non-interactive',
    'Disable interactive prompts and detailed diff output',
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

const validateStatusAction = async (options: { userConfig: UserConfig }) => {
  const result = await validateTranslationStatus(options.userConfig);

  console.log(formatValidationResults(result));

  if (!result.success) {
    throw new Error('Translation validation failed');
  }
};

program
  .command('validate-status')
  .description('Check that all translations are validated')
  .action(validateStatusAction);

program.parseAsync();
