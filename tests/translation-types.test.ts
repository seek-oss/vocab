import { compileFixtureTranslations } from '@vocab-private/test-helpers';
import { promises } from 'fs';

describe('Translation types', () => {
  it('should generate types for translations', async () => {
    await compileFixtureTranslations('translation-types');
    const compiledTranslations = require.resolve(
      '@fixtures/translation-types/src/.vocab/index.ts',
    );

    expect(
      await promises.readFile(compiledTranslations, 'utf8'),
    ).toMatchSnapshot();
  });
});
