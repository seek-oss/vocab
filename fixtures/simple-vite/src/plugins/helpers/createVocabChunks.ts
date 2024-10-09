// TODO: fix types for getModuleInfo
export const createVocabChunks = (id: string, { getModuleInfo }: unknown) => {
  const match = /(\w+)-vocab-virtual-module/.exec(id);
  if (match) {
    const language = match[1];
    const dependentEntryPoints: string[] = [];

    const idsToHandle = new Set<string>(getModuleInfo(id).dynamicImporters);

    for (const moduleId of idsToHandle) {
      const { isEntry, dynamicImporters, importers } = getModuleInfo(moduleId);
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

// TODO: look at other plugins to see how we handle rollupOptions.output merging with a plugin.
export const createDefaultChunk = (
  chunkAlias: string,
  modules: string[] | string,
  id: string,
) => {
  if (typeof modules === 'string' && modules === id) {
    return chunkAlias;
  }
  if (Array.isArray(modules)) {
    if (modules.some((module) => id.includes(module))) {
      return chunkAlias;
    }
  }
  return null;
};
