---
'@vocab/core': patch
---

Fix type for `select` parameter

Vocab uses [`intl-messageformat`][intl-messageformat] to parse ICU translation messages.
By default this parser enforces that `select` (and `plural`) arguments _must_ contain an `other`
match case as a fallthrough.
Vocab does not deviate from this default, but it was previously parsing the type of [select type
arguments] as a string literal union of all possible match cases:

```json
{
  "My message": {
    "message": "{foo, select, bar {bar} other {baz}}"
  }
}
```

```ts
// typeof `foo` -> "bar" | "other"
t("My message", { foo: "bar" })
```

This is incorrect, as the `other` match is a fallthrough for values other than `bar`.
Vocab now correctly parses the input type for all `select` arguments as `string`:

```ts
// typeof `foo` -> string
t("My message", { foo: "bar" })
```

[intl-messageformat]: https://www.npmjs.com/package/intl-messageformat
[select type arguments]: https://formatjs.io/docs/core-concepts/icu-syntax/#select-format
