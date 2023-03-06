---
'@vocab/types': minor
---

Add `StringWithSuggestions` utility type

This type is equivalent to the `string` type, but it tricks the language server into providing suggestions for string literals passed into the `Suggestions` generic parameter.

**EXAMPLE USAGE**:

```ts
type AnyAnimal = StringWithSuggestions<"cat" | "dog">;
// Suggests cat and dog, but accepts any string
const animal: AnyAnimal = "";
```
