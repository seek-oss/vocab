import { describe, it, expect, vi } from 'vitest';
import type { ChunkingContext } from 'rolldown';
import { createVocabChunks } from './create-vocab-chunks';

describe('createVocabChunks', () => {
  it.each(['app.js', 'chunk-a.js', 'virtual:vocab-en.json?source=abc'])(
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
      moduleId: 'virtual:vocab-en.json?source=abc',
      expected: 'en-translations',
    },
    {
      locale: 'en-AU',
      moduleId: 'virtual:vocab-en-AU.json?source=abc',
      expected: 'en-AU-translations',
    },
    {
      locale: 'fr-FR',
      moduleId: 'virtual:vocab-fr-FR.json?source=abc',
      expected: 'fr-FR-translations',
    },
    {
      locale: 'zh-Hans-CN',
      moduleId: 'virtual:vocab-zh-Hans-CN.json?source=abc',
      expected: 'zh-Hans-CN-translations',
    },
    {
      locale: 'en',
      moduleId: 'virtual:vocab-preload-en',
      expected: 'en-translations',
    },
    {
      locale: 'en-AU',
      moduleId: 'virtual:vocab-preload-en-AU',
      expected: 'en-AU-translations',
    },
    {
      locale: 'zh-Hans-CN',
      moduleId: 'virtual:vocab-preload-zh-Hans-CN',
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
