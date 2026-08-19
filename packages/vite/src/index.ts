import type { Plugin as VitePlugin } from 'vite';
import type { UserConfig } from '@vocab/core';

import { transformVocabFile } from './transform-vocab-file';
import {
  renderPreloadModule,
  renderVirtualMessageModule,
} from './virtual-modules';

import { trace } from './logger';

import {
  compiledVocabFileFilter,
  getPreloadLanguage,
  getPreloadModuleId,
  virtualModuleId,
} from './consts';

export type VocabPluginOptions = {
  vocabConfig: UserConfig;
};

const invalidatePreloadModule = (pluginContext: unknown, lang: string) => {
  const moduleGraph = (
    pluginContext as {
      environment?: {
        moduleGraph?: {
          getModuleById: (id: string) => unknown;
          invalidateModule: (mod: unknown) => void;
        };
      };
    }
  ).environment?.moduleGraph;
  if (!moduleGraph) {
    return;
  }

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
  trace(
    `Creating Vocab plugin${
      vocabConfig ? ` with config file ${vocabConfig}` : ''
    }`,
  );

  const identifiersByLang = new Map<string, Set<string>>();

  return {
    name: 'vite-plugin-vocab',
    apply: 'build',
    enforce: 'pre',
    applyToEnvironment(env) {
      return env.name === 'client';
    },
    resolveId(id) {
      if (!id.includes(virtualModuleId)) {
        return;
      }
      if (id.startsWith('\0')) {
        return id;
      }
      return `\0${id}`;
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
        code: renderVirtualMessageModule(id),
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
          identifiersByLang,
        );

        for (const lang of identifiersByLang.keys()) {
          invalidatePreloadModule(this, lang);
        }

        return {
          code: transformedCode,
          map: null, // provide source map if available
        };
      }
    },
    renderChunk(code, chunk) {
      // Language chunks must be executable as their own module script.
      // Importing the client entry would run getLoadedMessages before register().
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
              return local ? `const ${local}=(o)=>o;` : '';
            })
            .join(''),
      );

      if (rewritten === code) {
        return;
      }

      return {
        code: rewritten,
        map: null,
      };
    },
  };
};
