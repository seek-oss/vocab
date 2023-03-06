---
'@vocab/core': patch
---

Fix compiled type for `select` parameter

Vocab uses [`intl-messageformat`][intl-messageformat] to parse and derive types for ICU translation messages.
By default this parser enforces that `select` (and `plural`) arguments _must_ contain an `other` clause as a fallthrough.
Vocab does not deviate from this default, but it was previously deriving the type of [select type arguments] as a string literal union of all possible match cases:

```json
{
  "My message": {
    "message": "{param, select, foo {foo} bar {bar} other {baz}}"
  }
}
```

```ts
// Type Error: `param` is not of type 'foo' | 'bar' | 'other'
t("My message", { param: "something else" })
```

This is incorrect, as the `other` clause is a fallthrough for values other than `foo` or `bar`.
Vocab will now derive the type of these arguments as `StringWithSuggestions<Suggestions>`.
This type is equivalent to `string`, but it enables your IDE to provide suggestions for explicit matches.

```ts
// `param` can be any string, but "foo" and "bar" will be suggested
t("My message", { param: "" })
```

[intl-messageformat]: https://www.npmjs.com/package/intl-messageformat
[select type arguments]: https://formatjs.io/docs/core-concepts/icu-syntax/#select-format
