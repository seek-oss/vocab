---
'@vocab/cli': patch
'@vocab/core': patch
'@vocab/react': patch
---

Infer `t` return type more intelligently

The translate key function (`t`) will now infer the return type as ReactNode only when the tag syntax is used.  
