import { exec as nodeExec } from 'node:child_process';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { promisify } from 'node:util';

import type { Rollup } from 'vite';

import { vitePluginVocab } from '../packages/vite/src';

const fixtureDir = resolve(import.meta.dirname, '../fixtures/vite');

const buildFixture = async (entry: string) => {
  const fixtureRequire = createRequire(resolve(fixtureDir, 'package.json'));
  // Use the fixture's own version of Vite rather than the one Vitest depends on
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const { build }: typeof import('vite') = await import(
    pathToFileURL(fixtureRequire.resolve('vite')).href
  );
  const vocabConfig = fixtureRequire('./vocab.config.cjs');

  const result = await build({
    root: fixtureDir,
    configFile: false,
    logLevel: 'silent',
    plugins: [vitePluginVocab({ vocabConfig })],
    resolve: { conditions: ['@vocab-private/monorepo'] },
    build: {
      write: false,
      rollupOptions: { input: resolve(fixtureDir, entry) },
    },
  });

  const outputs = (Array.isArray(result) ? result : [result]).flatMap((item) =>
    'output' in item ? item.output : [],
  );

  return outputs.filter(
    (output): output is Rollup.OutputChunk => output.type === 'chunk',
  );
};

describe('vite plugin', () => {
  beforeAll(async () => {
    await promisify(nodeExec)('pnpm compile', { cwd: fixtureDir });
  }, 60_000);

  it('should not include tree-shaken translations in language chunks', async () => {
    const chunks = await buildFixture('src/tree-shaking/entry.ts');

    const languageChunks = chunks.filter((chunk) =>
      chunk.fileName.includes('-translations'),
    );
    expect(languageChunks.map((chunk) => chunk.name).sort()).toEqual([
      'en-translations',
      'fr-FR-translations',
      'fr-translations',
      'pseudo-translations',
    ]);

    const code = (name: string) =>
      languageChunks.find((chunk) => chunk.name === name)?.code;

    expect(code('en-translations')).toContain('USED_MESSAGE_EN');
    expect(code('fr-translations')).toContain('USED_MESSAGE_FR');
    expect(code('fr-FR-translations')).toContain('USED_MESSAGE_FR');

    for (const chunk of chunks) {
      expect(chunk.code).not.toContain('UNUSED_MESSAGE');
    }
  }, 60_000);
});
