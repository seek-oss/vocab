import { sourceQueryKey } from './consts';

export const virtualResourceLoader = (path: string) =>
  Buffer.from(path.split(sourceQueryKey)[1] as string, 'base64').toString(
    'utf-8',
  );
