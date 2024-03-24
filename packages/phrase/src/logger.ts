import pc from 'picocolors';
import debug from 'debug';

export const trace = debug(`vocab:phrase`);

export const log = (...params: unknown[]) => {
  // eslint-disable-next-line no-console
  console.log(pc.yellow('Vocab'), ...params);
};
