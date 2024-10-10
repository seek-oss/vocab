import type {
  Plugin as VitePlugin,
  Rollup,
  UserConfig as ViteUserConfig,
} from 'vite';
import { createVocabChunks, createDefaultChunks } from './create-vocab-chunks';
import { transformVocabFile } from './transform-vocab-file';
import type { UserConfig } from '@vocab/core';
import { compiledVocabFileFilter } from './consts';

// Maybe improve implementation here. Allow the plugin to find the nearest vocab.config.js file.
export type VocabPluginOptions = {
  configFile: UserConfig;
};

function virtualResourceLoader(path: string) {
  const source = path.split('?source=')[1];

  return Buffer.from(decodeURIComponent(source) as string, 'base64').toString(
    'utf-8',
  );
}

export default function vitePluginVocab({
  configFile,
}: VocabPluginOptions): VitePlugin {
  return {
    name: 'vite-plugin-vocab',
    resolveId(id) {
      if (id.includes('vocab-virtual-module')) {
        return id;
      }
    },
    load(id) {
      if (id.includes('vocab-virtual-module')) {
        return virtualResourceLoader(id);
      }
    },
    transform(code, id) {
      if (compiledVocabFileFilter.test(id)) {
        const transformedCode = transformVocabFile(code, id, configFile);
        return {
          code: transformedCode,
          map: null, // provide source map if available
        };
      }
    },
    config(config) {
      const baseOutputs = config.build?.rollupOptions?.output;

      const outputs = Array.isArray(baseOutputs)
        ? baseOutputs
        : [baseOutputs || {}];

      outputs.forEach((output) => {
        const originalManualChunks = output.manualChunks;
        output.manualChunks = (id: string, ctx: Rollup.ManualChunkMeta) => {
          if (typeof originalManualChunks === 'function') {
            return (
              originalManualChunks(id, ctx) ??
              createVocabChunks(id, ctx) ??
              null
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

      return createConfig(config, outputs);
    },
  };
}

const createConfig = (
  config: ViteUserConfig,
  outputs: Rollup.OutputOptions[],
) => ({
  ...config,
  build: {
    ...config.build,
    rollupOptions: {
      ...config.build?.rollupOptions,
      output: outputs,
    },
  },
});
