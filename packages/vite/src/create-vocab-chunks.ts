import type { ChunkingContext } from 'rolldown';
import { trace as _trace } from './logger';
import { getPreloadLanguage } from './consts';
import { getChunkName } from './get-chunk-name';

const trace = _trace.extend('create-vocab-chunks');

/**
 * Gets vocab virtual module details and creates chunks for each language
 */
export const createVocabChunks = (id: string, ctx: ChunkingContext) => {
  const language = getPreloadLanguage(id);

  if (!language) {
    return;
  }

  const dependentEntryPoints: string[] = [];

  const rootModuleInfo = ctx.getModuleInfo(id);

  if (!rootModuleInfo) {
    trace(`No module info found for ${id}`);
    return;
  }

  const idsToHandle = new Set<string>([
    ...rootModuleInfo.dynamicImporters,
    ...rootModuleInfo.importers,
  ]);

  for (const moduleId of idsToHandle) {
    const moduleInfo = ctx.getModuleInfo(moduleId);
    if (!moduleInfo) {
      trace(`No module info found for ${moduleId}`);
      continue;
    }

    const { isEntry, dynamicImporters, importers } = moduleInfo;

    if (isEntry || dynamicImporters.length > 0) {
      dependentEntryPoints.push(moduleId);
    }

    for (const importerId of importers) {
      idsToHandle.add(importerId);
    }
  }

  if (dependentEntryPoints.length > 0) {
    return getChunkName(language);
  }
};
