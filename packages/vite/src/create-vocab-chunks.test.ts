import { describe, it, expect, vi } from 'vitest';
import type { ChunkingContext } from 'rolldown';
import { createVocabChunks } from './create-vocab-chunks';

function createMockContext(
  modules: Record<
    string,
    { isEntry: boolean; dynamicImporters: string[]; importers: string[] }
  >,
): ChunkingContext {
  return {
    getModuleInfo: vi.fn((id: string) => modules[id] ?? null),
  } as unknown as ChunkingContext;
}

describe('createVocabChunks', () => {
  it('should extract a simple locale', () => {
    const ctx = createMockContext({
      'virtual:vocab-en.json?source=abc': {
        isEntry: false,
        dynamicImporters: ['app.ts'],
        importers: [],
      },
      'app.ts': {
        isEntry: true,
        dynamicImporters: [],
        importers: [],
      },
    });

    expect(createVocabChunks('virtual:vocab-en.json?source=abc', ctx)).toBe(
      'en-translations',
    );
  });

  it('should extract a hyphenated locale', () => {
    const ctx = createMockContext({
      'virtual:vocab-en-AU.json?source=abc': {
        isEntry: false,
        dynamicImporters: ['app.ts'],
        importers: [],
      },
      'app.ts': {
        isEntry: true,
        dynamicImporters: [],
        importers: [],
      },
    });

    expect(createVocabChunks('virtual:vocab-en-AU.json?source=abc', ctx)).toBe(
      'en-AU-translations',
    );
  });

  it('should extract a multi-segment locale', () => {
    const ctx = createMockContext({
      'virtual:vocab-fr-FR.json?source=abc': {
        isEntry: false,
        dynamicImporters: ['app.ts'],
        importers: [],
      },
      'app.ts': {
        isEntry: true,
        dynamicImporters: [],
        importers: [],
      },
    });

    expect(createVocabChunks('virtual:vocab-fr-FR.json?source=abc', ctx)).toBe(
      'fr-FR-translations',
    );
  });

  it('should return undefined for non-vocab module IDs', () => {
    const ctx = createMockContext({});

    expect(createVocabChunks('some-other-module.ts', ctx)).toBeUndefined();
  });

  it('should return undefined when no dependent entry points exist', () => {
    const ctx = createMockContext({
      'virtual:vocab-fr.json?source=abc': {
        isEntry: false,
        dynamicImporters: ['intermediate.ts'],
        importers: [],
      },
      'intermediate.ts': {
        isEntry: false,
        dynamicImporters: [],
        importers: [],
      },
    });

    expect(
      createVocabChunks('virtual:vocab-fr.json?source=abc', ctx),
    ).toBeUndefined();
  });
});
