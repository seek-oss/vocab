import {
  type UserConfig,
  resolveConfigSync,
  validateConfig,
  compiledVocabFileFilter as _compiledVocabFileFilter,
} from '@vocab/core';
import type { Compiler } from 'webpack';
import { trace } from './logger';

interface UserOptions extends Partial<UserConfig> {
  configFile?: string;
}

/**
 * @deprecated Import from `@vocab/core` instead
 */
export const compiledVocabFileFilter = _compiledVocabFileFilter;

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
    if (!compiler.options.module) {
      // @ts-expect-error Support for older versions of webpack that may not have module defined at this stage
      compiler.options.module = { rules: [] };
    }
    if (!compiler.options.module.rules) {
      compiler.options.module.rules = [];
    }
    compiler.options.module.rules.splice(0, 0, {
      test: compiledVocabFileFilter,
      loader: require.resolve('@vocab/webpack/loader'),
      options: this.options,
    });
  }
}
