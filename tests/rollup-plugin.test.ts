import { exec as nodeExec } from 'node:child_process';
import { resolve, join } from 'node:path';
import { readdir } from 'node:fs/promises';
import { promisify } from 'node:util';

describe('rollup plugin', () => {
  it('should generate the expected build output', async () => {
    const cwd = resolve(import.meta.dirname, '../fixtures/package');
    await exec('pnpm build', { cwd });

    const distContents = await getDirContents(resolve(cwd, 'dist'));
    const cleansedDistContents = distContents.map((entry) =>
      entry.replaceAll(cwd, ''),
    );

    expect(cleansedDistContents).toMatchInlineSnapshot(`
      [
        "/dist/.vocab/fr.translations.json",
        "/dist/.vocab/index.cjs",
        "/dist/.vocab/index.d.cts",
        "/dist/.vocab/index.d.mts",
        "/dist/.vocab/index.mjs",
        "/dist/.vocab/translations.json",
        "/dist/index.cjs",
        "/dist/index.d.cts",
        "/dist/index.d.mts",
        "/dist/index.mjs",
        "/dist/nested/index.cjs",
        "/dist/nested/index.d.cts",
        "/dist/nested/index.d.mts",
        "/dist/nested/index.mjs",
        "/dist/nested/nested.vocab/fr.translations.json",
        "/dist/nested/nested.vocab/index.cjs",
        "/dist/nested/nested.vocab/index.mjs",
        "/dist/nested/nested.vocab/translations.json",
      ]
    `);
  });
});

const exec = promisify(nodeExec);

async function getDirContents(dir: string) {
  const results: string[] = [];
  const list = await readdir(dir, { withFileTypes: true });

  for (const dirent of list) {
    const fullPath = join(dir, dirent.name);
    if (dirent.isDirectory()) {
      const subDirContents = await getDirContents(fullPath);
      results.push(...subDirContents);
    } else {
      results.push(fullPath);
    }
  }

  return results;
}
