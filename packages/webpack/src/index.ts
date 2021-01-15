import path from 'path';
import { promises as fs } from 'fs';

import { resolveConfigSync, validateConfig } from '@vocab/core';
import { UserConfig } from '@vocab/types';
import type { Compiler } from 'webpack';
import { trace } from './logger';
import { optimizeTranslationChunks } from './optimize-chunks';

const PLUGIN_NAME = 'VocabWebpackPlugin';
interface UserOptions extends Partial<UserConfig> {
  configFile?: string;
  vocabChunkMapDir?: string;
}

export default class VocabWebpackPlugin {
  options: UserConfig;
  vocabChunkMapDir?: string;

  constructor({ configFile, vocabChunkMapDir, ...rest }: UserOptions = {}) {
    trace(
      `Creating Vocab plugin${
        configFile ? ` with config file ${configFile}` : ''
      }`,
    );
    this.options = {
      ...resolveConfigSync(configFile),
      ...rest,
    } as UserConfig;
    this.vocabChunkMapDir = vocabChunkMapDir;

    validateConfig(this.options);
  }

  apply(compiler: Compiler) {
    trace(
      `Applying plugin: ${compiler.options.name} (${compiler.options.target})`,
    );
    if (compiler.options.target && compiler.options.target !== 'web') {
      // eslint-disable-next-line no-console
      console.error(
        'Vocab plugin is only intended to be used on web builds. Did you add Vocab to the correct config?',
      );
    }
    if (!compiler.options.module) {
      compiler.options.module = { rules: [] };
    }
    if (!compiler.options.module.rules) {
      compiler.options.module.rules = [];
    }
    compiler.options.module.rules.splice(0, 0, {
      test: /\.vocab[\\\/]index\.ts$/,
      loader: require.resolve('@vocab/webpack/loader'),
      options: this.options,
    });

    compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
      let alreadyOptimized = false;

      compilation.hooks.unseal.tap(PLUGIN_NAME, () => {
        alreadyOptimized = false;
      });

      compilation.hooks.optimizeChunks.tap(
        {
          name: PLUGIN_NAME,
          stage: 10,
        },
        (chunks) => {
          if (alreadyOptimized) {
            return;
          }
          alreadyOptimized = true;

          optimizeTranslationChunks(compilation, chunks);
        },
      );
    });

    if (this.vocabChunkMapDir) {
      compiler.hooks.afterEmit.tapPromise(PLUGIN_NAME, async (compilation) => {
        const moduleIdsToChunks: { [moduleId: string]: string } = {};

        for (const module of compilation.modules) {
          if (module.identifier().includes('vocab-unloader')) {
            trace('Found vocab transaltion module', module.identifier());
            const result = module.identifier().match(/moduleId=([^!&]+)/);

            const chunkGroup = compilation.chunkGroups.find((cg) =>
              compilation.chunkGraph?.isModuleInChunkGroup(module, cg),
            );

            if (result && typeof result[1] === 'string' && chunkGroup) {
              trace(
                'Assign module id:',
                result[1],
                'to chunk group:',
                chunkGroup.name,
              );

              // @ts-expect-error Make TS happy...
              moduleIdsToChunks[result[1]] = chunkGroup.name;
            }
          }
        }

        await fs.writeFile(
          path.join(this.vocabChunkMapDir!, 'vocabChunkMap.json'),
          JSON.stringify(moduleIdsToChunks, null, 2),
        );
      });
    }
  }
}
