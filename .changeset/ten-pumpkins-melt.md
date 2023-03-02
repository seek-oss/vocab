---
'@vocab/core': patch
---

Deeply parse nested arguments inside `plural` arguments

ICU [plural type arguments] can contain arguments in their matches:

```json
{
  "My message": {
    "message": "{numThings, plural, one {{foo} singular} other {{bar} plural}}"
  }
}
```

These were being parsed incorrectly, resulting in only the top-level plural argument being output in the compiled message type:

```ts
// Type error: `foo` and `bar` are not valid arguments
t('My message', { numThings: 1, foo: 'foo', bar: 'bar' })
```

These arguments are now correctly parsed resulting in a correctly typed message:

```ts
// Works!
t('My message', { numThings: 1, foo: 'foo', bar: 'bar' })
```

[plural type arguments]: https://formatjs.io/docs/core-concepts/icu-syntax/#plural-format
