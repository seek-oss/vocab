import chalk from 'chalk';
import debug from 'debug';

export const trace = debug(`vocab:integration`);

export const log = (...params: unknown[]) => {
  // eslint-disable-next-line no-console
  console.log(chalk.yellow('Vocab'), ...params);
};
