import type { Plugin as VitePlugin } from 'vite';
import { type UserConfig, compiledVocabFileFilter } from '@vocab/core';

import { transformVocabFile } from './transform-vocab-file';
import {
  renderPreloadModule,
  type VirtualModuleIdentifier,
  virtualResourceLoader,
} from './virtual-resource-loader';

import { trace } from './logger';

import { getPreloadLanguage, virtualModuleId } from './consts';
import { isVocabChunkName } from './get-chunk-name';
import { rewriteLanguageChunkImports } from './rewrite-language-chunk-imports';

export type VocabPluginOptions = {
  vocabConfig: UserConfig;
};

export const vitePluginVocab = ({
  vocabConfig,
}: VocabPluginOptions): VitePlugin => {
  let projectRoot = process.cwd();
  const identifiersByLang = new Map<
    string,
    Map<string, VirtualModuleIdentifier>
  >();

  trace(
    `Creating Vocab plugin${
      vocabConfig ? ` with config file ${vocabConfig}` : ''
    }`,
  );

  return {
    name: 'vite-plugin-vocab',
    apply: 'build',
    enforce: 'pre',
    configResolved(config) {
      projectRoot = config.root;
    },
    applyToEnvironment(env) {
      return env.name === 'client';
    },
    resolveId(id) {
      if (!id.includes(virtualModuleId)) {
        return;
      }
      return id.startsWith('\0') ? id : `\0${id}`;
    },
    load(id) {
      if (!id.includes(`\0${virtualModuleId}`)) {
        return;
      }

      const preloadLanguage = getPreloadLanguage(id);
      if (preloadLanguage) {
        return {
          code: renderPreloadModule(
            identifiersByLang.get(preloadLanguage)?.values() ?? [],
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
    renderChunk(code, chunk) {
      // Vite may place its generated ESM namespace helper in the client entry.
      // A language chunk injected as a module script must not import that entry,
      // because doing so would hydrate before this chunk registers its messages.
      if (!isVocabChunkName(chunk.name)) {
        return;
      }

      const rewritten = rewriteLanguageChunkImports(code);
      if (rewritten !== code) {
        return { code: rewritten, map: null };
      }
    },
  };
};
