import { execFile, type ExecFileException } from 'child_process';
import { createRequire } from 'module';
import path from 'path';
import { promisify } from 'util';

import prettier from 'prettier';

import type { Formatter } from './types';

function getOxfmtBinPath() {
  const require = createRequire(import.meta.url);
  const packageJsonPath = require.resolve('oxfmt/package.json');

  return path.join(path.dirname(packageJsonPath), 'bin', 'oxfmt');
}

const execFileAsync = promisify(execFile);

// TODO: Replace when https://github.com/oxc-project/oxc/issues/19922 is fixed
async function formatWithOxfmt(source: string, filePath: string) {
  const execution = execFileAsync(
    process.execPath,
    [getOxfmtBinPath(), `--stdin-filepath=${filePath}`],
    { cwd: path.dirname(filePath), encoding: 'utf-8' },
  );

  execution.child.stdin?.end(source);

  try {
    const { stdout } = await execution;

    return stdout;
  } catch (error) {
    const { code, stderr } = error as ExecFileException ?? {};

    throw new Error(
      `Failed to format ${filePath} with oxfmt (exit code ${code}):\n${stderr ?? ''}`,
      { cause: error },
    );
  }
}

async function formatWithPrettier(source: string, filePath: string) {
  const prettierConfig = await prettier.resolveConfig(filePath);

  return prettier.format(source, {
    ...prettierConfig,
    parser: 'typescript',
  });
}

/**
 * Formats generated TypeScript source. `filePath` should be the path the source will be written to.
 */
export function formatGeneratedSource(
  source: string,
  filePath: string,
  formatter: Formatter = 'prettier',
) {
  return formatter === 'oxfmt'
    ? formatWithOxfmt(source, filePath)
    : formatWithPrettier(source, filePath);
}
