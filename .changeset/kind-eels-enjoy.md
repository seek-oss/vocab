---
'@vocab/core': patch
---

Fix compiled type for self-referential parameters

`plural`, `select` and `selectOrdinal` parameters can reference themselves in their own match clauses.
In most cases, it's recommended to use the special `#` token to reference the input parameter.
Using the `#` token can enhance readability in long messages, and it makes renaming a parameter much quicker, since you only need to change the parameter name in one place.

For example:

```jsonc
{
  "I have numCats cats": {
    "message": "I have {numCats, plural, one {# cat} other {# cats}}"
  }
}
```

You can however use the parameter name directly if you want to:

```jsonc
{
  "I have numCats cats": {
    // This message is equivalent to the message in the previous example
    "message": "I have {numCats, plural, one {{numCats} cat} other {{numCats} cats}}"
  }
}
```

In the above example, a bug in Vocab caused an incorrect type to be assigned to the `numCats` parameter:

```ts
// Type Error: Type 'number' is not assignable to type 'string'
// `numCats` should be of type `number`, but is instead of type `string`
t('I have numCats cats', { numCats: 3 });
```

Vocab now generates the correct type in this case.
