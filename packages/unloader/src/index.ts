import { getOptions } from 'loader-utils';

export default function unloader(this: any) {
  const { source } = getOptions(this);

  return Buffer.from(source as string, 'base64').toString('utf-8');
}
