import { describe, expect, it } from 'vitest';

import { virtualResourceLoader } from './virtual-resource-loader';

const messages = { hello: 'Hello' };
const encoded = Buffer.from(JSON.stringify(messages)).toString('base64');
const moduleId = `virtual:vocab-en.json?source=${encoded}`;

describe('virtualResourceLoader', () => {
  it('registers messages against the resolved module id', () => {
    const code = virtualResourceLoader(`\0${moduleId}`);

    expect(code).toContain(JSON.stringify(moduleId));
    expect(code).toContain(JSON.stringify(JSON.stringify(messages)));
    expect(code).toContain('export default messages');
  });

  it('does not import shared code, so language chunks stay independent', () => {
    const code = virtualResourceLoader(`\0${moduleId}`);

    expect(code).not.toContain('import');
  });
});
