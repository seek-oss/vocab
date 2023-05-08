import { translationsToCsv } from './csv';

describe('translationsToCsv', () => {
  it('should convert translations to CSV', () => {
    const devLanguage = 'en';
    const translations = {
      en: {
        Hello: {
          message: 'Hello',
          tags: ['greeting', 'hello', 'word'],
        },
        World: {
          message: 'World',
          description: 'Some description',
        },
        Goodbye: {
          message: 'Hello',
          description: '',
          tags: ['greeting', 'hello', 'word'],
        },
        Foo: {
          message: 'Foo',
        },
      },
      fr: {
        Hello: {
          message: 'Bonjour',
        },
        World: {
          message: 'Monde',
          description: 'Some description',
        },
        Goodbye: {
          message: 'Au revoir',
          description: 'Hello in English',
        },
      },
      th: {},
    };

    const { csvFileStrings, keyIndex, commentIndex, tagColumn, messageIndex } =
      translationsToCsv(translations, devLanguage);

    expect(csvFileStrings).toMatchInlineSnapshot(`
      {
        "en": "Hello,,"greeting,hello,word",Hello
      World,Some description,,World
      Goodbye,,"greeting,hello,word",Hello
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
