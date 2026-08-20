import type { Plugin as VitePlugin } from 'vite';
import type { UserConfig } from '@vocab/core';

import {
  compiledVocabFileFilter,
  getPreloadLanguage,
  virtualModuleId,
} from './consts';
import { trace } from './logger';
import { transformVocabFile } from './transform-vocab-file';
import {
  renderPreloadModule,
  virtualResourceLoader,
} from './virtual-resource-loader';

export type VocabPluginOptions = {
  vocabConfig: UserConfig;
};

export const vitePluginVocab = ({
  vocabConfig,
}: VocabPluginOptions): VitePlugin => {
  let projectRoot = process.cwd();
  const identifiersByLang = new Map<string, Set<string>>();

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
    configResolved(config) {
      projectRoot = config.root;
    },
    resolveId(id) {
      if (!id.includes(virtualModuleId)) {
        return;
      }

      return {
        id: id.startsWith('\0') ? id : `\0${id}`,
        moduleSideEffects: true,
      };
    },
    load(id) {
      if (!id.includes(`\0${virtualModuleId}`)) {
        return;
      }

      const preloadLanguage = getPreloadLanguage(id);
      if (preloadLanguage) {
        return {
          code: renderPreloadModule(
            identifiersByLang.get(preloadLanguage) ?? [],
          ),
          moduleType: 'js',
          moduleSideEffects: true,
        };
      }

      return {
        code: virtualResourceLoader(id),
        moduleType: 'js',
        moduleSideEffects: true,
      };
    },
    async transform(code, id) {
      if (compiledVocabFileFilter.test(id)) {
        const transformedCode = await transformVocabFile(
          code,
          id,
          vocabConfig,
          projectRoot,
          identifiersByLang,
        );

        return {
          code: transformedCode,
          map: null, // provide source map if available
        };
      }
    },
  };
};
