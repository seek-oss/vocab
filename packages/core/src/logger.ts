import debug from 'debug';

export default debug(`vocab:core`);

export const trace = (...params: unknown[]) => {
  // eslint-disable-next-line no-console
  console.log(...params);
};

export const logError = (...params: unknown[]) => {
  // eslint-disable-next-line no-console
  console.error(...params);
};
