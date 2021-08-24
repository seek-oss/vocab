import { resolveConfigSync, validateConfig } from '@vocab/core';
import { UserConfig } from '@vocab/types';
import type { Compiler } from 'webpack';
import { trace } from './logger';

interface UserOptions extends Partial<UserConfig> {
  configFile?: string;
}

export class VocabWebpackPlugin {
  options: UserConfig;

  constructor({ configFile, ...rest }: UserOptions = {}) {
    trace(
      `Creating Vocab plugin${
        configFile ? ` with config file ${configFile}` : ''
      }`,
    );
    this.options = {
      ...resolveConfigSync(configFile),
      ...rest,
    } as UserConfig;

    validateConfig(this.options);
  }

  apply(compiler: Compiler) {
    trace(
      `Applying plugin: ${compiler.options.name} (${compiler.options.target})`,
    );
    if (compiler.options.target && compiler.options.target !== 'web') {
      // eslint-disable-next-line no-console
      console.error(
        `Vocab plugin is only intended to be used on web builds. Received target ${
          compiler.options.target
        } for ${
          compiler.options.name || 'unnamed build'
        }. Did you add Vocab to the correct config?`,
      );
    }
    if (!compiler.options.module) {
      // @ts-expect-error Support for older versions of webpack that may not have module defined at this stage
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
  }
}
