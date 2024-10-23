import type { UserConfig as ViteUserConfig } from 'vite';
import { createChunks } from './create-vocab-chunks';

export const createConfig = (config: ViteUserConfig): ViteUserConfig => {
  const baseOutputs = config.build?.rollupOptions?.output;

  const outputs = Array.isArray(baseOutputs)
    ? baseOutputs
    : [baseOutputs || {}];

  outputs.forEach(createChunks);

  return {
    ...config,
    build: {
      ...config.build,
      rollupOptions: {
        ...config.build?.rollupOptions,
        output: outputs,
      },
    },
  };
};

export default createConfig;
