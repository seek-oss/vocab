const { pseudoLocalize, padString } = require('@vocab/pseudo-localize');

module.exports = {
  devLanguage: 'en',
  languages: [{ name: 'en' }, { name: 'fr' }],
  generatedLanguages: [
    {
      name: 'pseudo',
      extends: 'en',
      generator: {
        transformElement: pseudoLocalize,
        transformMessage: padString,
      },
    },
  ],
};
