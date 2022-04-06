import { generateLanguageFromTranslations } from './generate-language';

describe('generateLanguageFromTranslations', () => {
  const generator = {
    transformElement: (element: string) => element.toUpperCase(),
    transformMessage: (message: string) => `[${message}]`,
  };

  it('should generate a new language by applying the message generator to the base translations', () => {
    const baseTranslations = {
      Hello: { message: 'Hello' },
      "Is it name you're looking for": {
        message: "Is it {name} you're looking for",
      },
      'I can see it in your eyes': {
        message:
          'I can see it in your {numberOfEyes, plural, one {eye} other {eyes}}',
      },
      'I can see it in your facialExpression': {
        message:
          'I can see it in your {facialExpression, select, smile {smile} frown {frown} other {smile}}',
      },
      'I have numberOfCats cats': {
        message: 'I have {numberOfCats, number} cats',
      },
      "It's my cat's nth birthday!": {
        message:
          "It's my cat's {year, selectordinal, one {#st} two {#nd} few {#rd} other {#th} } birthday!",
      },
      "My cat's birthday is birthDate": {
        message: "My cat's birthday is {birthDate, date, medium}",
      },
      "My cat's birthday party is at birthdayPartyTime": {
        message: "My cat's birthday is {birthdayPartyTime, time, short}",
      },
      'Please arrive ON TIME!': {
        message: 'Please arrive <strong>ON TIME!</strong>',
      },
    };

    expect(
      generateLanguageFromTranslations({
        baseTranslations,
        generator,
      }),
    ).toMatchInlineSnapshot(`
      Object {
        "Hello": Object {
          "message": "[HELLO]",
        },
        "I can see it in your eyes": Object {
          "message": "[I CAN SEE IT IN YOUR {numberOfEyes,plural,one{EYE} other{EYES}}]",
        },
        "I can see it in your facialExpression": Object {
          "message": "[I CAN SEE IT IN YOUR {facialExpression,select,smile{SMILE} frown{FROWN} other{SMILE}}]",
        },
        "I have numberOfCats cats": Object {
          "message": "[I HAVE {numberOfCats, number} CATS]",
        },
        "Is it name you're looking for": Object {
          "message": "[IS IT {name} YOU'RE LOOKING FOR]",
        },
        "It's my cat's nth birthday!": Object {
          "message": "[IT'S MY CAT'S {year,selectordinal,one{#ST} two{#ND} few{#RD} other{#TH}} BIRTHDAY!]",
        },
        "My cat's birthday is birthDate": Object {
          "message": "[MY CAT'S BIRTHDAY IS {birthDate, date, medium}]",
        },
        "My cat's birthday party is at birthdayPartyTime": Object {
          "message": "[MY CAT'S BIRTHDAY IS {birthdayPartyTime, time, short}]",
        },
        "Please arrive ON TIME!": Object {
          "message": "[PLEASE ARRIVE <strong>ON TIME!</strong>]",
        },
      }
    `);
  });
});
