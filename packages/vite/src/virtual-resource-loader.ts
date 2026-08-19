import { registryIdQueryKey, sourceQueryKey } from './consts';

const getQueryValue = (path: string, key: string) => {
  const match = new RegExp(`[?&]${key}([^&]*)`).exec(path);
  return match?.[1];
};

export const getVirtualModuleSource = (path: string) => {
  const encodedSource = getQueryValue(path, sourceQueryKey);
  if (encodedSource === undefined) {
    throw new Error(
      `Vocab virtual module is missing a source payload: ${path}`,
    );
  }

  return Buffer.from(encodedSource, 'base64').toString('utf-8');
};

export const getVirtualModuleRegistryId = (path: string) => {
  const encodedId = getQueryValue(path, registryIdQueryKey);
  if (encodedId === undefined) {
    throw new Error(`Vocab virtual module is missing a registry id: ${path}`);
  }

  return decodeURIComponent(encodedId);
};
