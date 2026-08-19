import { describe, it, expect, vi } from 'vitest';
import type { ChunkingContext } from 'rolldown';
import { getPreloadModuleId } from './consts';
import { createVocabChunks } from './create-vocab-chunks';

describe('createVocabChunks', () => {
  it.each(['app.js', 'chunk-a.js', getPreloadModuleId('en')])(
    'should not chunk entry $0',
    (moduleId) => {
      const ctx = {
        getModuleInfo: vi.fn((_id: string) => ({
          isEntry: true,
          dynamicImporters: [],
          importers: [],
        })),
      } as unknown as ChunkingContext;

      expect(createVocabChunks(moduleId, ctx)).toBeUndefined();
    },
  );

  it.each([
    {
      locale: 'en',
      moduleId: getPreloadModuleId('en'),
      expected: 'en-translations',
    },
    {
      locale: 'en-AU',
      moduleId: getPreloadModuleId('en-AU'),
      expected: 'en-AU-translations',
    },
    {
      locale: 'fr-FR',
      moduleId: getPreloadModuleId('fr-FR'),
      expected: 'fr-FR-translations',
    },
    {
      locale: 'zh-Hans-CN',
      moduleId: getPreloadModuleId('zh-Hans-CN'),
      expected: 'zh-Hans-CN-translations',
    },
  ])('should chunk non-entry into $expected', ({ moduleId, expected }) => {
    const ctx = {
      getModuleInfo: vi.fn((_id: string) => ({
        isEntry: false,
        dynamicImporters: ['app.js'],
        importers: [],
      })),
    } as unknown as ChunkingContext;

    expect(createVocabChunks(moduleId, ctx)).toBe(expected);
  });

  it.each([
    'invalid.js',
    'virtual:en.json',
    'virtual:vocab.js',
    'virtual:vocab-preload',
    // Messages are inlined into the preload module, so per-file virtual
    // modules no longer exist
    'virtual:vocab-en-1a2b3c4d.js',
  ])('should chunk non-vocab virtual file $0', (moduleId) => {
    const ctx = {
      getModuleInfo: vi.fn((_id: string) => ({
        isEntry: false,
        dynamicImporters: ['app.js'],
        importers: [],
      })),
    } as unknown as ChunkingContext;

    expect(createVocabChunks(moduleId, ctx)).toBeUndefined();
  });
});
