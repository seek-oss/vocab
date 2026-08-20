import { describe, expect, it } from 'vitest';

import {
  renderPreloadModule,
  virtualResourceLoader,
} from './virtual-resource-loader';

const messages = { hello: 'Hello' };
const encoded = Buffer.from(JSON.stringify(messages)).toString('base64');
const moduleId = 'virtual:vocab-en-1a2b3c4d.js';
const importId = `${moduleId}?source=${encoded}`;

describe('virtualResourceLoader', () => {
  it('registers messages against the resolved module id', () => {
    const code = virtualResourceLoader(`\0${importId}`);

    expect(code).toContain(JSON.stringify(moduleId));
    expect(code).not.toContain('?source=');
    expect(code).toContain(JSON.stringify(JSON.stringify(messages)));
    expect(code).not.toContain('export');
  });

  it('does not import shared code, so language chunks stay independent', () => {
    const code = virtualResourceLoader(`\0${importId}`);

    expect(code).not.toContain('import');
  });

  it('throws when the virtual module is missing a source payload', () => {
    expect(() => virtualResourceLoader('\0virtual:vocab-en.js')).toThrow(
      'missing a source payload',
    );
  });

  it('renders a stable module that installs every translation file', () => {
    expect(
      renderPreloadModule([
        'virtual:vocab-en-bbbbbbbb.js?source=second',
        'virtual:vocab-en-aaaaaaaa.js?source=first',
      ]),
    ).toBe(
      [
        'import "virtual:vocab-en-aaaaaaaa.js?source=first";',
        'import "virtual:vocab-en-bbbbbbbb.js?source=second";',
      ].join('\n'),
    );
  });
});
