import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { getRegistryModuleId, hashFilePath } from './registry-module-id';

describe('hashFilePath', () => {
  const localRoot = resolve('local/project');
  const ciRoot = resolve('ci/project');

  it('is stable across project locations', () => {
    expect(
      hashFilePath(
        resolve(localRoot, 'src/App.vocab/translations.json'),
        localRoot,
      ),
    ).toBe(
      hashFilePath(resolve(ciRoot, 'src/App.vocab/translations.json'), ciRoot),
    );
  });

  it('is stable for translation files in node_modules', () => {
    const dependencyPath = 'node_modules/example/App.vocab/translations.json';

    expect(hashFilePath(resolve(localRoot, dependencyPath), localRoot)).toBe(
      hashFilePath(resolve(ciRoot, dependencyPath), ciRoot),
    );
  });

  it('distinguishes different project-relative paths', () => {
    expect(
      hashFilePath(
        resolve(localRoot, 'src/App.vocab/translations.json'),
        localRoot,
      ),
    ).not.toBe(
      hashFilePath(
        resolve(localRoot, 'src/Header.vocab/translations.json'),
        localRoot,
      ),
    );
  });
});

describe('getRegistryModuleId', () => {
  const projectRoot = resolve('project');
  const translationFile = resolve(
    projectRoot,
    'src/App.vocab/translations.json',
  );

  it('namespaces the id by language', () => {
    expect(getRegistryModuleId('en', translationFile, projectRoot)).not.toBe(
      getRegistryModuleId('fr', translationFile, projectRoot),
    );
  });

  it('derives the same id from a dev translation file path', () => {
    expect(
      getRegistryModuleId('en', translationFile, projectRoot),
    ).toMatchInlineSnapshot(`"virtual:vocab-en-f782fec1.js"`);
  });
});
