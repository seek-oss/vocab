import { createLanguage } from '@vocab/webpack/web';

export default {
  en: createLanguage(
    require.resolveWeak(
      './client.translationss.ts-en-virtual.json!=!/Users/jhope/dev/vocab/packages/unloader/dist/vocab-unloader.cjs.js?source=e30=!json-loader!',
    ),
    () =>
      import(
        /* webpackChunkName: "en-translations" */
        './client.translationss.ts-en-virtual.json!=!/Users/jhope/dev/vocab/packages/unloader/dist/vocab-unloader.cjs.js?source=e30=!json-loader!'
      ),
    'en',
  ),
  fr: createLanguage(
    require.resolveWeak(
      './client.translationss.ts-fr-virtual.json!=!/Users/jhope/dev/vocab/packages/unloader/dist/vocab-unloader.cjs.js?source=e30=!json-loader!',
    ),
    () =>
      import(
        /* webpackChunkName: "fr-translations" */
        './client.translationss.ts-fr-virtual.json!=!/Users/jhope/dev/vocab/packages/unloader/dist/vocab-unloader.cjs.js?source=e30=!json-loader!'
      ),
    'fr',
  ),
};
