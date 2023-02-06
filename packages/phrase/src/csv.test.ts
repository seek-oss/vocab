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
    };

    const { csvString, localeMapping, keyIndex, commentIndex, tagColumn } =
      translationsToCsv(translations, devLanguage);

    expect(csvString).toMatchInlineSnapshot(`
      "Hello,Bonjour,Hello,,"greeting,hello,word"
      World,Monde,World,Some description,
      Hello,Au revoir,Goodbye,,"greeting,hello,word"
      Foo,,Foo,,
      "
    `);

    expect(localeMapping).toMatchInlineSnapshot(`
      {
        "en": 1,
        "fr": 2,
      }
    `);
    expect(keyIndex).toEqual(3);
    expect(commentIndex).toEqual(4);
    expect(tagColumn).toEqual(5);
  });
});
