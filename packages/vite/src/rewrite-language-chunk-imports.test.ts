import { describe, expect, it } from 'vitest';
import { rewriteLanguageChunkImports } from './rewrite-language-chunk-imports';

describe('rewriteLanguageChunkImports', () => {
  it('replaces a named helper import with identity stubs', () => {
    const code = `import { t as __exportAll } from "./assets/index.js";
var ns = __exportAll({});
export { ns as t };
`;

    expect(rewriteLanguageChunkImports(code)).toBe(
      `const __exportAll=(value)=>value;
var ns = __exportAll({});
export { ns as t };
`,
    );
  });

  it('handles minified named imports', () => {
    const code = `import{t as e}from"./vite-client.js";var n=e({});export{n as t};`;

    expect(rewriteLanguageChunkImports(code)).toBe(
      `const e=(value)=>value;var n=e({});export{n as t};`,
    );
  });

  it('leaves modules without static named imports unchanged', () => {
    const code = `var registry = new Map();
export { registry };
`;

    expect(rewriteLanguageChunkImports(code)).toBe(code);
  });

  it('does not rewrite dynamic imports', () => {
    const code = `const mod = await import("./assets/index.js");
export { mod };
`;

    expect(rewriteLanguageChunkImports(code)).toBe(code);
  });
});
