import type { Plugin as VitePlugin } from 'vite';
import { type UserConfig, compiledVocabFileFilter } from '@vocab/core';

import { transformVocabFile } from './transform-vocab-file';
import {
  type MessagesByModuleId,
  renderPreloadModule,
} from './render-preload-module';

import { trace } from './logger';

import { getChunkName, getLanguageFromChunkName } from './get-chunk-name';

export type VocabPluginOptions = {
  vocabConfig: UserConfig;
};

const virtualModulePrefix = '\0';
const preloadModuleIdPattern = /^\/@vocab\/preload\/([^/?]+)\.js$/;

const getPreloadModuleId = (lang: string) =>
  `/@vocab/preload/${getChunkName(lang)}.js`;

const getPreloadLanguage = (id: string) =>
  getLanguageFromChunkName(preloadModuleIdPattern.exec(id)?.[1]);

const getLanguageNames = ({ languages, generatedLanguages = [] }: UserConfig) =>
  [...languages, ...generatedLanguages].map(({ name }) => name);

export const vitePluginVocab = ({
  vocabConfig,
}: VocabPluginOptions): VitePlugin => {
  let projectRoot = process.cwd();
  const messagesByLang = new Map<string, MessagesByModuleId>();
  const preloadReferencesByLang = new Map<string, string>();

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
    buildStart() {
      messagesByLang.clear();
      preloadReferencesByLang.clear();

      // Each language is emitted as its own entry so that its chunk can be
      // loaded as a standalone module script, letting it install its messages
      // before the client entry hydrates.
      for (const lang of getLanguageNames(vocabConfig)) {
        preloadReferencesByLang.set(
          lang,
          this.emitFile({
            type: 'chunk',
            id: getPreloadModuleId(lang),
            name: getChunkName(lang),
          }),
        );
      }
    },
    resolveId(id) {
      return getPreloadLanguage(id) ? `${virtualModulePrefix}${id}` : null;
    },
    load(id) {
      const lang = getPreloadLanguage(id.slice(virtualModulePrefix.length));
      if (!lang) {
        return;
      }

      // Messages are collected as `.vocab` files are transformed, which can
      // happen after this module is loaded. `renderChunk` fills in the final
      // set once every file has been seen.
      return {
        code: renderPreloadModule(new Map()),
        moduleType: 'js',
        moduleSideEffects: true,
      };
    },
    async transform(code, id) {
      if (!compiledVocabFileFilter.test(id)) {
        return;
      }

      const getPreloadReference = (language: string) => {
        const reference = preloadReferencesByLang.get(language);

        if (!reference) {
          return this.error(
            `Vocab file ${id} has translations for language "${language}", which is missing from your Vocab config.`,
          );
        }

        return reference;
      };

      const transformedCode = await transformVocabFile(
        code,
        id,
        vocabConfig,
        projectRoot,
        messagesByLang,
        getPreloadReference,
      );

      return {
        code: transformedCode,
        map: null, // provide source map if available
      };
    },
    renderChunk(_, chunk) {
      const id = chunk.facadeModuleId;
      if (!id?.startsWith(virtualModulePrefix)) {
        return;
      }

      const language = getPreloadLanguage(id.slice(virtualModulePrefix.length));
      if (!language) {
        return;
      }

      return {
        code: renderPreloadModule(messagesByLang.get(language) ?? new Map()),
        map: null,
      };
    },
  };
};
