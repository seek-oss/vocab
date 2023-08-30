import type { ConsolidatedTranslation } from '@vocab/core/src';
import { translationsToCsv } from './csv';

describe('translationsToCsv', () => {
  it('should convert translations to CSV', () => {
    const allLanguages = ['en', 'fr'];
    const translations: ConsolidatedTranslation[] = [
      {
        globalKey: 'Hello',
        key: 'Hello',
        messageByLanguage: { en: 'Hello', fr: 'Bonjour' },
        tags: ['greeting', 'hello', 'word'],
        namespace: 'en',
        relativePath: 'n1',
      },
      {
        globalKey: 'World',
        key: 'World',
        messageByLanguage: { en: 'World', fr: 'Monde' },
        description: 'Some description',
        namespace: 'n1',
        relativePath: 'n1',
      },
      {
        globalKey: 'Goodbye',
        key: 'Goodbye',
        messageByLanguage: { en: 'Goodbye', fr: 'Au revoir' },
        description: '',
        tags: ['greeting', 'hello', 'word'],
        namespace: 'n1',
        relativePath: 'n1',
      },
      {
        globalKey: 'Foo',
        key: 'Foo',
        messageByLanguage: { en: 'Foo' },
        namespace: 'n1',
        relativePath: 'n1',
      },
    ];

    const { csvFileStrings, keyIndex, commentIndex, tagColumn, messageIndex } =
      translationsToCsv(translations, allLanguages);

    expect(csvFileStrings).toMatchInlineSnapshot(`
      {
        "en": "Hello,,"greeting,hello,word",Hello
      World,Some description,,World
      Goodbye,,"greeting,hello,word",Goodbye
      Foo,,,Foo
      ",
        "fr": "Hello,,"greeting,hello,word",Bonjour
      World,Some description,,Monde
      Goodbye,,"greeting,hello,word",Au revoir
      ",
      }
    `);

    expect(keyIndex).toEqual(1);
    expect(commentIndex).toEqual(2);
    expect(tagColumn).toEqual(3);
    expect(messageIndex).toEqual(4);
  });
});
