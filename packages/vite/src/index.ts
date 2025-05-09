import type { Plugin as VitePlugin } from 'vite';
import type { UserConfig } from '@vocab/core';

import { transformVocabFile } from './transform-vocab-file';
import { virtualResourceLoader } from './virtual-resource-loader';

import { trace } from './logger';

import { compiledVocabFileFilter, virtualModuleId } from './consts';

export type VocabPluginOptions = {
  vocabConfig: UserConfig;
};

export default function vitePluginVocab({
  vocabConfig,
}: VocabPluginOptions): VitePlugin {
  let isSSR = false;

  trace(
    `Creating Vocab plugin${
      vocabConfig ? ` with config file ${vocabConfig}` : ''
    }`,
  );

  return {
    name: 'vite-plugin-vocab',
    apply: 'build',
    configResolved(config) {
      // Check if the build is for SSR. This plugin should not run for SSR builds.
      isSSR = Boolean(config.build.ssr);
    },
    load(id) {
      if (isSSR) return null;

      if (id.includes(`\0${virtualModuleId}`)) {
        return virtualResourceLoader(id);
      }
    },
    async transform(code, id) {
      if (isSSR) return null;

      if (compiledVocabFileFilter.test(id)) {
        const transformedCode = await transformVocabFile(code, id, vocabConfig);

        return {
          code: transformedCode,
          map: null, // provide source map if available
        };
      }
    },
  };
}
