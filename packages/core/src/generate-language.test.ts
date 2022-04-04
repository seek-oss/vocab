import { pseudoLocalize } from '@vocab/pseudo-localize';
import { generateLanguageFromTranslations } from './generate-language';

describe('generateLanguageFromTranslations', () => {
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
        generator: pseudoLocalize,
      }),
    ).toMatchInlineSnapshot(`
      Object {
        "Hello": Object {
          "message": "[Ḩẽẽƚƚöö]",
        },
        "I can see it in your eyes": Object {
          "message": "[Ï çăăăกี้ šẽẽẽẽẽẽ ìììṯ ìììกี้ ýýýöööǚǚǚř {numberOfEyes,plural,one{ẽẽýýẽẽ} other{ẽẽýýẽẽš}}]",
        },
        "I can see it in your facialExpression": Object {
          "message": "[Ï çăăăกี้ šẽẽẽẽẽẽ ìììṯ ìììกี้ ýýýöööǚǚǚř {facialExpression,select,smile{šm̂ììƚẽẽ} frown{ƒřöööŵกี้} other{šm̂ììƚẽẽ}}]",
        },
        "I have numberOfCats cats": Object {
          "message": "[Ï ḩăăăṽẽẽẽ {numberOfCats, number} çăăăṯš]",
        },
        "Is it name you're looking for": Object {
          "message": "[Ïš ììììṯ {name} ýýööǚǚ'řẽẽ ƚööööķììกี้ģ ƒööř]",
        },
        "It's my cat's nth birthday!": Object {
          "message": "[Ïṯ'š m̂ýýýý çăăăăṯ'š {year,selectordinal,one{#šṯ} two{#กี้ƌ} few{#řƌ} other{#ṯḩ}} ßìììřṯḩƌăăăýýý!]",
        },
        "My cat's birthday is birthDate": Object {
          "message": "[Ṃýýý çăăăṯ'š ßìììřṯḩƌăăăýýý ìììš {birthDate, date, medium}]",
        },
        "My cat's birthday party is at birthdayPartyTime": Object {
          "message": "[Ṃýýý çăăăṯ'š ßìììřṯḩƌăăăýýý ìììš {birthdayPartyTime, time, short}]",
        },
        "Please arrive ON TIME!": Object {
          "message": "[Ƥƚẽẽăăšẽẽ ăăřřììṽẽẽ <strong>ÖÑ ṮÏṂË!</strong>]",
        },
      }
    `);
  });
});
