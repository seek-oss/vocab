import type { Plugin as VitePlugin } from 'vite';
import type { UserConfig } from '@vocab/core';

import { transformVocabFile } from './transform-vocab-file';
import { virtualResourceLoader } from './virtual-resource-loader';

import { trace } from './logger';

import { compiledVocabFileFilter, virtualModuleId } from './consts';

export type VocabPluginOptions = {
  vocabConfig: UserConfig;
};

export const vitePluginVocab = ({
  vocabConfig,
}: VocabPluginOptions): VitePlugin => {
  trace(
    `Creating Vocab plugin${
      vocabConfig ? ` with config file ${vocabConfig}` : ''
    }`,
  );

  return {
    name: 'vite-plugin-vocab',
    apply: 'build',
    enforce: 'pre',
    applyToEnvironment(env) {
      return env.name === 'client';
    },
    resolveId(id) {
      if (id.includes(virtualModuleId)) {
        return `\0${id}`;
      }
    },
    load(id) {
      if (id.includes(`\0${virtualModuleId}`)) {
        return {
          code: virtualResourceLoader(id),
          moduleType: 'json',
        };
      }
    },
    async transform(code, id) {
      if (compiledVocabFileFilter.test(id)) {
        const transformedCode = await transformVocabFile(code, id, vocabConfig);

        return {
          code: transformedCode,
          map: null, // provide source map if available
        };
      }
    },
  };
};
