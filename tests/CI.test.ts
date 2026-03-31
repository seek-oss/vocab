import { test } from 'vitest';
import { readdir, readFile } from 'fs/promises';

test('bundles the rolldown runtime correctly', async ({ skip }) => {
  skip(!process.env.CI);

  const vocabCoreDistPath = 'packages/core/dist';
  const distContents = await readdir(vocabCoreDistPath);
  const filteredDistContents = distContents.filter((file) =>
    /^rolldown-runtime.*\.(cjs|mjs)$/.test(file),
  );

  expect(filteredDistContents).toHaveLength(2);

  const icuHandlerCjsEntrypoint = 'packages/core/dist/icu-handler.cjs';
  const icuHandlerCjsContent = await readFile(icuHandlerCjsEntrypoint, 'utf8');

  expect(icuHandlerCjsContent).toMatch(
    /require\("\.\/rolldown-runtime-.*\.cjs"\)/,
  );
});
