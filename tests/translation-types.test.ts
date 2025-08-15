import { compileFixtureTranslations } from '@vocab-private/test-helpers';
import { readFile } from 'fs/promises';

describe('Translation types', () => {
  describe('all message types', () => {
    it('should generate types for translations', async () => {
      await compileFixtureTranslations('translation-types');

      const compiledTranslations = require.resolve(
        '@vocab-fixtures/translation-types/src/all-message-types/.vocab/index.ts',
      );

      expect(await readFile(compiledTranslations, 'utf8')).toMatchSnapshot();
    });
  });

  describe('a single message', () => {
    it('should generate types for translations with no type import from @vocab/core', async () => {
      await compileFixtureTranslations('translation-types');

      const compiledTranslations = require.resolve(
        '@vocab-fixtures/translation-types/src/no-vocab-types-import/.vocab/index.ts',
      );

      expect(await readFile(compiledTranslations, 'utf8')).toMatchSnapshot();
    });
  });
});
