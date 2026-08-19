import type { Environment, Plugin as VitePlugin } from 'vite';
import { type UserConfig, compiledVocabFileFilter } from '@vocab/core';

import { transformVocabFile } from './transform-vocab-file';
import {
  renderPreloadModule,
  type VirtualModuleIdentifier,
  virtualResourceLoader,
} from './virtual-resource-loader';

import { trace } from './logger';

import {
  getPreloadLanguage,
  getPreloadModuleId,
  virtualModuleId,
} from './consts';

export type VocabPluginOptions = {
  vocabConfig: UserConfig;
};

const invalidatePreloadModule = (environment: Environment, lang: string) => {
  // Only the dev environment exposes a module graph
  if (environment.mode !== 'dev') {
    return;
  }

  const { moduleGraph } = environment;
  const preloadModule = moduleGraph.getModuleById(
    `\0${getPreloadModuleId(lang)}`,
  );

  if (preloadModule) {
    moduleGraph.invalidateModule(preloadModule);
  }
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

        for (const lang of identifiersByLang.keys()) {
          invalidatePreloadModule(this.environment, lang);
        }

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
      if (!chunk.name?.endsWith('-translations')) {
        return;
      }

      const rewritten = code.replace(
        /import\s*\{([^}]+)\}\s*from\s*["'][^"']+["'];?/g,
        (_match, bindings: string) =>
          bindings
            .split(',')
            .map((binding) => {
              const local = binding
                .trim()
                .split(/\s+as\s+/)
                .pop()
                ?.trim();
              return local ? `const ${local}=(value)=>value;` : '';
            })
            .join(''),
      );

      if (rewritten !== code) {
        return { code: rewritten, map: null };
      }
    },
  };
};
