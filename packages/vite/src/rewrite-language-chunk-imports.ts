/** e.g. `import { t as e } from "./client.js";` */
const namedImportStatement = /import\s*\{([^}]+)\}\s*from\s*["'][^"']+["'];?/g;

/** Turns one binding (`t as e`, or just `t`) into its local name. */
const getLocalName = (binding: string) =>
  binding
    .trim()
    .split(/\s+as\s+/)
    .pop();

/**
 * Language chunks must not static-import the client entry. Rolldown may put
 * `__exportAll` there; replace those named imports with local identity stubs
 * so calls to the helper still work once the import is gone.
 */
export const rewriteLanguageChunkImports = (code: string) =>
  code.replace(namedImportStatement, (_statement, bindings: string) =>
    bindings
      .split(',')
      .map(getLocalName)
      .map((local) => (local ? `const ${local}=(value)=>value;` : ''))
      .join(''),
  );
