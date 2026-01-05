import { describe, it } from 'vitest';
import { createFixture } from 'fs-fixture';
import { compile } from './compile';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { UserConfig } from './types';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const DEFAULT_FIXTURE = {
  'src/.vocab/translations.json': JSON.stringify({
    hello: { message: 'Hello', description: 'A greeting' },
    world: { message: 'World' },
  }),
  'src/.vocab/fr.translations.json': JSON.stringify({
    hello: { message: 'Bonjour' },
    world: { message: 'Monde' },
  }),
  'src/client.vocab/translations.json': JSON.stringify({
    title: { message: 'Title' },
  }),
};

const baseConfig: UserConfig = {
  devLanguage: 'en',
  languages: [{ name: 'en' }, { name: 'fr' }],
};

// Wrapper to make fixture compatible with `await using`
async function createVocabFixture(structure: Record<string, string>) {
  const fixture = await createFixture(structure);

  return {
    ...fixture,
    [Symbol.asyncDispose]: async () => {
      await fixture.rm();
    },
  };
}

describe.concurrent('compile', () => {
  describe('initial compilation', () => {
    it('should generate index.ts files with correct content', async ({
      expect,
    }) => {
      await using fixture = await createVocabFixture(DEFAULT_FIXTURE);
      await compile({}, { ...baseConfig, projectRoot: fixture.path });

      const indexContent1 = await fixture.readFile(
        'src/.vocab/index.ts',
        'utf-8',
      );
      const indexContent2 = await fixture.readFile(
        'src/client.vocab/index.ts',
        'utf-8',
      );

      expect(indexContent1).toMatchSnapshot();
      expect(indexContent2).toMatchSnapshot();
    });
  });

  describe('watch mode', () => {
    it('should update index.ts when main translation file is modified', async ({
      expect,
    }) => {
      await using fixture = await createVocabFixture(DEFAULT_FIXTURE);
      const stopWatching = await compile(
        { watch: true },
        { ...baseConfig, projectRoot: fixture.path },
      );
      await wait(500);

      await fixture.writeFile(
        'src/.vocab/translations.json',
        JSON.stringify({
          hello: { message: 'Howdy', description: 'A greeting' },
          world: { message: 'World' },
        }),
      );
      await wait(500);
      const indexContent = await fixture.readFile(
        'src/.vocab/index.ts',
        'utf-8',
      );

      expect(indexContent).toMatchSnapshot();
      await stopWatching?.();
    });

    it('should update index.ts when alt language file is modified', async ({
      expect,
    }) => {
      await using fixture = await createVocabFixture(DEFAULT_FIXTURE);
      const stopWatching = await compile(
        { watch: true },
        { ...baseConfig, projectRoot: fixture.path },
      );
      await wait(500);

      await fixture.writeFile(
        'src/.vocab/fr.translations.json',
        JSON.stringify({
          hello: { message: 'Salut' },
          world: { message: 'Monde' },
        }),
      );
      await wait(500);
      const indexContent = await fixture.readFile(
        'src/.vocab/index.ts',
        'utf-8',
      );

      expect(indexContent).toMatchSnapshot();
      await stopWatching?.();
    });

    it('should not update index.ts if translations file is invalid', async ({
      expect,
    }) => {
      await using fixture = await createVocabFixture(DEFAULT_FIXTURE);
      const stopWatching = await compile(
        { watch: true },
        { ...baseConfig, projectRoot: fixture.path },
      );
      await wait(500);

      const contentBefore = await fixture.readFile(
        'src/.vocab/index.ts',
        'utf-8',
      );
      await fixture.writeFile('src/.vocab/translations.json', 'invalid json{');
      await wait(500);
      const contentAfter = await fixture.readFile(
        'src/.vocab/index.ts',
        'utf-8',
      );

      expect(contentAfter).toBe(contentBefore);
      await stopWatching?.();
    });

    it('should ignore non-translation files', async ({ expect }) => {
      await using fixture = await createVocabFixture(DEFAULT_FIXTURE);
      const stopWatching = await compile(
        { watch: true },
        { ...baseConfig, projectRoot: fixture.path },
      );
      await wait(500);

      const contentBefore = await fixture.readFile(
        'src/.vocab/index.ts',
        'utf-8',
      );

      await fixture.writeFile('src/other-file.ts', 'export const x = 1;');
      await wait(500);

      const contentAfter = await fixture.readFile(
        'src/.vocab/index.ts',
        'utf-8',
      );
      expect(contentAfter).toBe(contentBefore);

      await stopWatching?.();
    });

    it('should respect custom ignore patterns', async ({ expect }) => {
      await using fixture = await createVocabFixture({
        ...DEFAULT_FIXTURE,
        'src/.ignored/.vocab/translations.json': JSON.stringify({
          test: { message: 'Test' },
        }),
      });
      const customConfig = {
        ...baseConfig,
        projectRoot: fixture.path,
        ignore: ['**/.ignored/**'],
      };
      await compile({}, customConfig);

      await expect(
        fixture.readFile('src/.ignored/.vocab/index.ts'),
      ).rejects.toThrow();
    });

    it('should discover new translation directories', async ({ expect }) => {
      await using fixture = await createVocabFixture(DEFAULT_FIXTURE);
      const stopWatching = await compile(
        { watch: true },
        { ...baseConfig, projectRoot: fixture.path },
      );
      await wait(500);

      // Manually create new translation directory and file because fs-fixture doesn't give us
      // methods to do that
      await mkdir(join(fixture.path, 'src/new.vocab/'), {
        recursive: true,
      });
      await writeFile(
        join(fixture.path, 'src/new.vocab/translations.json'),
        JSON.stringify({
          test: { message: 'New file' },
        }),
      );
      await wait(500);

      const newCompiledFile = await fixture.readFile(
        'src/new.vocab/index.ts',
        'utf-8',
      );
      expect(newCompiledFile).toMatchSnapshot();

      await fixture.writeFile(
        'src/new.vocab/translations.json',
        JSON.stringify({
          test: { message: 'Changed new file' },
        }),
      );
      await wait(500);
      const updatedNewCompiledFile = await fixture.readFile(
        'src/new.vocab/index.ts',
        'utf-8',
      );
      expect(updatedNewCompiledFile).toMatchSnapshot();

      await stopWatching?.();
    });

    it('should create and update index.ts when translation file path starts with "."', async ({
      expect,
    }) => {
      await using fixture = await createVocabFixture(DEFAULT_FIXTURE);
      const stopWatching = await compile(
        { watch: true },
        { ...baseConfig, projectRoot: join(fixture.path, 'src') },
      );
      await wait(500);

      await expect(
        fixture.readFile('src/.vocab/index.ts', 'utf-8'),
      ).resolves.toBeTruthy();

      await fixture.writeFile(
        'src/.vocab/translations.json',
        JSON.stringify({
          hello: { message: 'Howdy', description: 'A greeting' },
          world: { message: 'World' },
        }),
      );
      await wait(500);
      const indexContent = await fixture.readFile(
        'src/.vocab/index.ts',
        'utf-8',
      );

      expect(indexContent).toMatchSnapshot();
      await stopWatching?.();
    });
  });

  describe('with custom translation directory suffix', () => {
    it('should compile and watch translations with custom suffix', async ({
      expect,
    }) => {
      await using fixture = await createVocabFixture({
        'src/.translations/translations.json': JSON.stringify({
          hello: { message: 'Hello' },
        }),
      });
      const customConfig = {
        ...baseConfig,
        projectRoot: fixture.path,
        translationsDirectorySuffix: '.translations',
      };
      const stopWatching = await compile({ watch: true }, customConfig);
      await wait(500);

      const initialContent = await fixture.readFile(
        'src/.translations/index.ts',
        'utf-8',
      );

      expect(initialContent).toMatchSnapshot();

      await fixture.writeFile(
        'src/.translations/translations.json',
        JSON.stringify({ hello: { message: 'Howdy' } }),
      );
      await wait(500);
      const updatedContent = await fixture.readFile(
        'src/.translations/index.ts',
        'utf-8',
      );

      expect(updatedContent).toMatchSnapshot();
      await stopWatching?.();
    });
  });
});
