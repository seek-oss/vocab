// Based off https://github.com/seek-oss/crackle/blob/ea226ae49853ca5531bb436334bc4e8d8ec1c49b/packages/core/src/plugins/rollup/vocab-translations.ts
import fs from 'fs/promises';
import path from 'path';

import { compiledVocabFileFilter } from '@vocab/core';
import type { Plugin, PluginContext } from 'rollup';

const isVocabFile = (id: string) => compiledVocabFileFilter.test(id);

const promiseMap = async <T, K>(
  items: T[],
  fn: (item: T) => Promise<K>,
): Promise<K[]> => Promise.all(items.map(fn));

type PluginOptions = {
  /**
   * The root of the library that all paths are resolved relative to.
   * Typically this should be the root of your source code, e.g. `"./src"`,
   * _not_ the root of your library.
   */
  root: string;
};

export const vocabTranslations = async ({
  root,
}: PluginOptions): Promise<Plugin> => {
  const { default: memoize } = await import('memoize');

  // Because this is called for every generated Vocab translation file, we don't want to emit assets
  // multiple times. The function is memoized so that it only emits assets once per `vocab` directory,
  // because the translation file can be imported from multiple places.
  const handleVocabTranslations = memoize(async function (
    this: PluginContext,
    vocabDir: string,
  ) {
    await promiseMap(await fs.readdir(vocabDir), async (name) => {
      if (name.endsWith('translations.json')) {
        const json = await fs.readFile(path.join(vocabDir, name), 'utf-8');
        const originalFileName = path.join(vocabDir, name);

        this.emitFile({
          type: 'asset',
          fileName: path.relative(root, originalFileName),
          source: json,
        });
      }
    });

    // return value is important for memoize
    return null;
  });

  return {
    name: 'vocab:translations-files',

    resolveId: {
      order: 'pre',
      async handler(id, importer, options) {
        const resolved = await this.resolve(id, importer, {
          skipSelf: true,
          ...options,
        });

        if (resolved && isVocabFile(resolved.id)) {
          const vocabDir = path.dirname(resolved.id);
          await handleVocabTranslations.call(this, vocabDir);
        }
      },
    },
    async renderChunk(_code, chunk, outputOptions) {
      if (!outputOptions.preserveModules) {
        this.warn(
          '@vocab/rollup-plugin can only bundle translations.json files if `preserveModules` is enabled',
        );
      }
      const outDir = outputOptions.dir;
      if (!outDir) {
        // Should never happen as rollup validates that `dir` is provided if `preserveModules` is
        // true
        this.error(
          'Output directory not specified. Please set the `dir` option in your Rollup configuration.',
        );
      }

      for (const moduleId of chunk.moduleIds) {
        if (isVocabFile(moduleId)) {
          const vocabDir = path.dirname(moduleId);
          if (outDir) {
            await handleVocabTranslations.call(this, vocabDir);
          }
        }
      }
    },
  };
};
