import { compileFixtureTranslations } from '@vocab-private/test-helpers';
import { promises } from 'fs';

describe('Translation types', () => {
  describe('all message types', () => {
    it('should generate types for translations', async () => {
      await compileFixtureTranslations('all-message-types');
      const compiledTranslations = require.resolve(
        '@vocab-fixtures/all-message-types/src/.vocab/index.ts',
      );

      expect(
        await promises.readFile(compiledTranslations, 'utf8'),
      ).toMatchSnapshot();
    });
  });
});
