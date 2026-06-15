const { generator } = require('@vocab/pseudo-localize');

module.exports = {
  devLanguage: 'en',
  languages: [{ name: 'en' }, { name: 'fr' }, { name: 'fr-FR', extends: 'fr' }],
  generatedLanguages: [
    {
      name: 'pseudo',
      extends: 'en',
      generator,
    },
  ],
};
