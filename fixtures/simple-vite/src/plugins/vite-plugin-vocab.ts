import type { Plugin as VitePlugin } from 'vite';
import {
  createVocabChunks,
  createDefaultChunk,
} from './helpers/createVocabChunks';
import { transformVocabFile } from './helpers/transformVocabFile';
import type { UserConfig } from '@vocab/core';

export const compiledVocabFileFilter = /\.vocab[\\/]index\.(?:ts|js|cjs|mjs)$/;

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
      // TODO: Handle output.manualChunks for OutputOptions[] type.
      let manualChunks =
        config.build?.rollupOptions?.output?.manualChunks || {};

      if (manualChunks) {
        if (typeof manualChunks === 'function') {
          const originalManualChunks = manualChunks;
          manualChunks = (id: string, ctx: unknown) =>
            originalManualChunks(id, ctx) || createVocabChunks(id, ctx) || null;
        }

        type ManualChunksObjectType = Record<string, string[] | string>;
        if (typeof manualChunks === 'object') {
          const oldManualChunks = manualChunks;

          manualChunks = (id: string, ctx: unknown) => {
            let returnVal = null;
            Object.entries(oldManualChunks as ManualChunksObjectType).forEach(
              ([chunkAlias, modules]) => {
                returnVal = createDefaultChunk(chunkAlias, modules, id);
              },
            );
            return returnVal || createVocabChunks(id, ctx) || null;
          };
        }
      }

      return {
        ...config,
        build: {
          ...config.build,
          rollupOptions: {
            ...config.build?.rollupOptions,
            output: {
              ...config.build?.rollupOptions?.output,
              manualChunks,
            },
          },
        },
      };
    },
  };
}
