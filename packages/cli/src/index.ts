import { config } from 'dotenv';
import yargs from 'yargs';

config();

import generateTypes from './generate-types';
import pull from './pull-translations';
import push from './push-translations';

const branchDefinition = {
  type: 'string',
  describe: 'The Phrase branch to target',
  default: process.env.VCS_BRANCH || 'local-development',
} as const;

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
yargs(process.argv.slice(2))
  .scriptName('vocab')
  .command({
    command: 'push',
    builder: () => yargs.options({ branch: branchDefinition }),
    handler: async (options) => {
      await push(options);
    },
  })
  .command({
    command: 'pull',
    builder: () => yargs.options({ branch: branchDefinition }),
    handler: async (options) => {
      await pull(options);
    },
  })
  .command({
    command: 'generate-types',
    handler: async () => {
      await generateTypes();
    },
  })
  .help()
  .wrap(72).argv;
