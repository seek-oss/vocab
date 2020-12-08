import { resolveConfigSync, validateConfig } from '@vocab/core';
import { UserConfig } from '@vocab/types';
import type { Compiler } from 'webpack';
import { trace } from './logger';

interface UserOptions extends Partial<UserConfig> {
  configFile?: string;
}

export default class VocabWebpackPlugin {
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
    compiler.options.module.rules?.splice(0, 0, {
      test: /translations\.json$/,
      type: 'javascript/auto',
      loader: require.resolve('@vocab/webpack/loader'),
      options: this.options,
    });
  }
}
