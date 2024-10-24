import type { Rollup } from 'vite';
import { trace as _trace } from './logger';

const trace = _trace.extend('create-vocab-chunks');

const handleChunkCollision = (id: string) => {
  trace(`create-vocab-chunks and your vite config manualChunks option both try to chunk the following module: ${id}.
  Please remove or alter the manualChunks option from your vite config or disable combineLanguageChunks in your plugin config.`);
  // TODO: throw error or provide more context?
};

export const createChunks = (output: Rollup.OutputOptions) => {
  const originalManualChunks = output.manualChunks;
  output.manualChunks = (id: string, ctx: Rollup.ManualChunkMeta) => {
    if (typeof originalManualChunks === 'function') {
      const originalChunks = originalManualChunks(id, ctx);
      const vocabChunks = createVocabChunks(id, ctx);
      if (originalChunks && vocabChunks) {
        handleChunkCollision(id);
      }
      return originalChunks ?? vocabChunks ?? null;
    }
    if (typeof originalManualChunks === 'object') {
      const originalChunks = createDefaultChunks(originalManualChunks, id);
      const vocabChunks = createVocabChunks(id, ctx);
      if (originalChunks && vocabChunks) {
        handleChunkCollision(id);
      }
      return originalChunks ?? vocabChunks ?? null;
    }
  };
};

export const createVocabChunks = (
  id: string,
  { getModuleInfo }: Rollup.ManualChunkMeta,
) => {
  const match = /(\w+)-vocab-virtual-module/.exec(id);
  if (!match) {
    return;
  }

  const language = match[1];
  const dependentEntryPoints: string[] = [];

  const rootModuleInfo = getModuleInfo(id);

  if (!rootModuleInfo) {
    trace(`No module info found for ${id}`);
  }

  const idsToHandle = new Set<string>(getModuleInfo(id)?.dynamicImporters);

  for (const moduleId of idsToHandle) {
    const moduleInfo = getModuleInfo(moduleId);
    if (!moduleInfo) {
      trace(`No module info found for ${moduleId}`);
      continue;
    }

    const { isEntry, dynamicImporters, importers } = moduleInfo;

    if (isEntry || dynamicImporters.length > 0) {
      dependentEntryPoints.push(moduleId);
    }

    for (const importerId of importers) idsToHandle.add(importerId);
  }

  if (dependentEntryPoints.length > 0) {
    return `${language}-translations`;
  }
};

const createDefaultChunks = (
  manualChunks: Record<string, string[]>,
  id: string,
) => {
  for (const [chunkAlias, modules] of Object.entries(manualChunks)) {
    if (modules.some((module) => id.includes(module))) {
      return chunkAlias;
    }
  }

  return null;
};
