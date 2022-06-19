---
'@vocab/react': patch
---

The `t` function returned from `useTranslations` is now memoized. `t` should now only change after the initial loading of translations, and when the language changes, making it more useful inside a hook's dependency array.
