// Not used by the fixture app.
// Used by `tests/vite-plugin.test.ts` to check that unused translations are
// tree-shaken. `unusedTranslations` is imported but never referenced.
import usedTranslations from './used.vocab';
import unusedTranslations from './unused.vocab';

export const usedMessages = usedTranslations.getLoadedMessages('en');

export { unusedTranslations };
