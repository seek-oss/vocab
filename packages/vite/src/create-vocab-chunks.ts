import type { Rollup } from 'vite';

export const createVocabChunks = (
  id: string,
  { getModuleInfo }: Rollup.ManualChunkMeta,
) => {
  const match = /(\w+)-vocab-virtual-module/.exec(id);
  if (match) {
    const language = match[1];
    const dependentEntryPoints: string[] = [];

    const idsToHandle = new Set<string>(getModuleInfo(id)?.dynamicImporters);

    for (const moduleId of idsToHandle) {
      const moduleInfo = getModuleInfo(moduleId);
      if (!moduleInfo) {
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
  }
};

export const createDefaultChunks = (
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
