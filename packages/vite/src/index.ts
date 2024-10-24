import type { Plugin as VitePlugin } from 'vite';
import type { UserConfig } from '@vocab/core';

import { transformVocabFile } from './transform-vocab-file';
import { virtualResourceLoader } from './virtual-resource-loader';

import { trace } from './logger';

import { compiledVocabFileFilter, virtualModuleId } from './consts';

export type VocabPluginOptions = {
  configFile: UserConfig;
};

export default function vitePluginVocab({
  configFile,
}: VocabPluginOptions): VitePlugin {
  trace(
    `Creating Vocab plugin${
      configFile ? ` with config file ${configFile}` : ''
    }`,
  );
  return {
    name: 'vite-plugin-vocab',
    resolveId(id) {
      if (id.includes(virtualModuleId)) {
        return id;
      }
    },
    load(id) {
      if (id.includes(virtualModuleId)) {
        return virtualResourceLoader(id);
      }
    },
    async transform(code, id) {
      if (compiledVocabFileFilter.test(id)) {
        const transformedCode = await transformVocabFile(code, id, configFile);
        return {
          code: transformedCode,
          map: null, // provide source map if available
        };
      }
    },
  };
}
