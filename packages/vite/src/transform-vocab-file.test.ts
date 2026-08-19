import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { hashFilePath } from './transform-vocab-file';

describe('hashFilePath', () => {
  const localRoot = resolve('local/project');
  const ciRoot = resolve('ci/project');

  it('is stable across project locations', () => {
    expect(
      hashFilePath(resolve(localRoot, 'src/App.vocab/index.ts'), localRoot),
    ).toBe(hashFilePath(resolve(ciRoot, 'src/App.vocab/index.ts'), ciRoot));
  });

  it('is stable for translation files in node_modules', () => {
    const dependencyPath = 'node_modules/example/App.vocab/index.ts';

    expect(hashFilePath(resolve(localRoot, dependencyPath), localRoot)).toBe(
      hashFilePath(resolve(ciRoot, dependencyPath), ciRoot),
    );
  });

  it('distinguishes different project-relative paths', () => {
    expect(
      hashFilePath(resolve(localRoot, 'src/App.vocab/index.ts'), localRoot),
    ).not.toBe(
      hashFilePath(resolve(localRoot, 'src/Header.vocab/index.ts'), localRoot),
    );
  });
});
