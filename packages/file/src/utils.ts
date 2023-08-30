import type { PullOptions } from './pull';
import type { PushOptions } from './push';

export const getFileFromOptions = (options: PullOptions | PushOptions) => {
  const fileFormat =
    options.file && options.file.endsWith('.json') ? 'json' : 'csv';
  return {
    fileFormat,
    filePath: options.file || `translations.${fileFormat}`,
  };
};
