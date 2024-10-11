import type { Rollup, UserConfig as ViteUserConfig } from 'vite';
import { createDefaultChunks, createVocabChunks } from './create-vocab-chunks';

export const createConfig = (config: ViteUserConfig): ViteUserConfig => {
  const baseOutputs = config.build?.rollupOptions?.output;

  const outputs = Array.isArray(baseOutputs)
    ? baseOutputs
    : [baseOutputs || {}];

  outputs.forEach((output) => {
    const originalManualChunks = output.manualChunks;
    output.manualChunks = (id: string, ctx: Rollup.ManualChunkMeta) => {
      if (typeof originalManualChunks === 'function') {
        return (
          originalManualChunks(id, ctx) ?? createVocabChunks(id, ctx) ?? null
        );
      }
      if (typeof originalManualChunks === 'object') {
        return (
          createDefaultChunks(originalManualChunks, id) ??
          createVocabChunks(id, ctx) ??
          null
        );
      }
    };
  });

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
