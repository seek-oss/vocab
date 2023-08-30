/* eslint-disable no-console */
import { exec as _exec } from 'node:child_process';
import { cp, readFile, writeFile } from 'node:fs/promises';
import path, { dirname, join } from 'node:path';
import { promisify } from 'node:util';

const exec = promisify(_exec);

/**
 * Enable to show DEBUG logging for the CLI.
 */
const VERBOSE_LOGGING = true;

describe('CSV File', () => {
  it('update messages from a CSV file', async () => {
    const vocabPath = require.resolve('@vocab-fixtures/file/vocab.config.js');
    const testRoot = dirname(vocabPath);

    const runScript = async (script: string) => {
      const result = await exec(`pnpm run ${script} -- --integration file`, {
        cwd: testRoot,
        env: { ...process.env, DEBUG: VERBOSE_LOGGING ? 'vocab.*' : undefined },
      });
      if (VERBOSE_LOGGING) {
        console.log(
          `-- stdout --\n${result.stdout}\n\n-- stderr --\n${result.stderr}`,
        );
      }
      return result;
    };

    await cp(join(__dirname, 'templates', 'basic-translations'), testRoot, {
      recursive: true,
    });
    const pushResult = await runScript('push.csv');

    const translationExportPath = path.join(testRoot, 'translations.csv');
    const contents = await readFile(translationExportPath, 'utf-8');

    const newContents = contents.replace('Bonjour', 'Bonjours');

    await writeFile(translationExportPath, newContents);

    expect(pushResult.stdout).toEqual(
      expect.stringContaining('Writing 2 keys to CSV file'),
    );

    const pullResult = await runScript('pull.csv');

    expect(pullResult.stderr).toEqual(
      expect.stringContaining('Updated 1 message(s)'),
    );

    const frFilePath = join(
      testRoot,
      ...'src/mytranslations.vocab/fr.translations.json'.split('/'),
    );

    const frContents = await readFile(frFilePath, 'utf-8');
    const frContentsJson = JSON.parse(frContents);

    expect(frContentsJson.hello.message).toEqual('Bonjours');
  });
});

describe('JSON File', () => {
  it('update messages from a JSON file', async () => {
    const vocabPath = require.resolve('@vocab-fixtures/file/vocab.config.js');
    const testRoot = dirname(vocabPath);

    const runScript = async (script: string) => {
      const result = await exec(`pnpm run ${script} -- --integration file`, {
        cwd: testRoot,
        env: { ...process.env, DEBUG: VERBOSE_LOGGING ? 'vocab.*' : undefined },
      });
      if (VERBOSE_LOGGING) {
        console.log(
          `-- stdout --\n${result.stdout}\n\n-- stderr --\n${result.stderr}`,
        );
      }
      return result;
    };
    await cp(join(__dirname, 'templates', 'basic-translations'), testRoot, {
      recursive: true,
    });

    const pushResult = await runScript('push.json');
    const translationExportPath = path.join(testRoot, 'translations.json');
    const contents = await readFile(translationExportPath, 'utf-8');

    const newContents = contents.replace('Bonjour', 'Bonjours');

    await writeFile(translationExportPath, newContents);

    expect(pushResult.stdout).toEqual(
      expect.stringContaining('Writing 2 keys to JSON file'),
    );

    const pullResult = await runScript('pull.json');

    expect(pullResult.stderr).toEqual(
      expect.stringContaining('Updated 1 message(s)'),
    );

    const frFilePath = join(
      testRoot,
      ...'src/mytranslations.vocab/fr.translations.json'.split('/'),
    );

    const frContents = await readFile(frFilePath, 'utf-8');
    const frContentsJson = JSON.parse(frContents);

    expect(frContentsJson.hello.message).toEqual('Bonjours');
  });
});
