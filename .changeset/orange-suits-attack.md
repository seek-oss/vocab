---
'@vocab/cli': patch
---

Fix missing --branch option as string for push and pull commands.

Since v2.1.11, CLI commands to push and pull translations only accepted `--branch` as a boolean flag due to a bug. `--branch` can now be used with a string as intended.

**Example Usage**

```sh
vocab push --branch my-branch
vocab pull --branch my-branch
```

Fixes error "error: too many arguments for 'push'. Expected 0 arguments but got 1." and "error: too many arguments for 'pull'. Expected 0 arguments but got 1."
