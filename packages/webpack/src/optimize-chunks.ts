/* eslint-disable no-console */
import type { Chunk, Module, Compilation, ChunkGraph } from 'webpack';

import { trace as _trace } from './logger';

type Block = Module['blocks'][number];
type ChunkGroup = ReturnType<Compilation['addChunkInGroup']>;

const trace = _trace.extend('optimize-chunks');

const isVocabModule = (m: Module) =>
  // This is a pretty hacky check, probably worth doing something better
  m.identifier().endsWith('.vocab/index.ts');

const getLangFromTranslationRequest = (request?: string) => {
  const result = request?.match(/lang=([\w_-]+)&/);

  if (!result || !result[1]) {
    throw new Error(`Can't find language for translation module: ${request}`);
  }

  return result[1];
};

const getTranslationModulesFromVocabModule = (
  compilation: Compilation,
  m: Module,
) => {
  const result: {
    [lang: string]: {
      module: Module;
      block: Module['blocks'][number];
    };
  } = {};

  for (const block of m.blocks) {
    const lang = getLangFromTranslationRequest(block.request);

    trace('Found', lang, 'translation module');

    result[lang] = {
      module: compilation.moduleGraph.getModule(block.dependencies[0]),
      block,
    };
  }

  return result;
};

const assignModuleToChunkGroup = (
  compilation: Compilation,
  chunkGraph: ChunkGraph,
  module: Module,
  block: Block,
  id: string,
  chunkGroupCache: { [id: string]: ChunkGroup },
  translationChunks: Set<Chunk>,
) => {
  const assignModule = (chunkGroup: ChunkGroup, chunk: Chunk) => {
    chunkGraph.connectBlockAndChunkGroup(block, chunkGroup);

    if (module.addChunk(chunk)) {
      chunk.addModule(module);
    }
  };

  if (chunkGroupCache[id]) {
    const chunkGroup = chunkGroupCache[id];
    trace('Using pre-existing chunk/chunkgroup with cache id:', id);

    chunkGroup.addOrigin(module, block.loc!, block.request!);

    assignModule(chunkGroup, chunkGroup.chunks[0]);

    return chunkGroup;
  }

  trace('Create chunk/chunkgroup with cache id:', id);
  const chunkGroup = compilation.addChunkInGroup(
    {},
    module,
    block.loc!,
    block.request!,
  );

  // Name the chunkgroup (mostly for loadable compatibility)
  chunkGroup.name = id;
  chunkGroup.addOptions({ name: id });
  compilation.namedChunkGroups.set(id, chunkGroup);

  // Chunk group will only contain a single chunk holding out translations
  const chunk = chunkGroup.chunks[0];
  chunk.runtime = 'runtime';

  translationChunks.add(chunk);

  assignModule(chunkGroup, chunk);

  chunkGroupCache[id] = chunkGroup;

  return chunkGroup;
};

export function optimizeTranslationChunks(
  compilation: Compilation,
  chunks: Iterable<Chunk>,
) {
  const chunkGroupCache: { [id: string]: ChunkGroup } = {};
  const translationChunks = new Set<Chunk>();

  const chunkGraph = compilation.chunkGraph;
  if (!chunkGraph) {
    throw new Error('Missing ChunkGraph');
  }

  for (const chunk of chunks) {
    const chunkModules = compilation.chunkGraph?.getChunkModules(chunk) ?? [];
    const vocabModules = chunkModules.filter(isVocabModule);

    for (const vocabModule of vocabModules) {
      const translationModules = getTranslationModulesFromVocabModule(
        compilation,
        vocabModule,
      );

      for (const lang of Object.keys(translationModules)) {
        const { module, block } = translationModules[lang];

        // Clean up existing translation chunks
        for (const moduleChunk of chunkGraph.getModuleChunks(module)) {
          if (!translationChunks.has(moduleChunk)) {
            trace('Removing module from chunk');
            moduleChunk.removeModule(module);

            if (moduleChunk.getNumberOfModules() === 0) {
              trace('Disconnecting chunk as no remaining modules');

              chunkGraph.disconnectChunk(moduleChunk);
            }
          }
        }

        assignModuleToChunkGroup(
          compilation,
          chunkGraph,
          module,
          block,
          `${chunk.debugId}-${lang}`,
          chunkGroupCache,
          translationChunks,
        );
      }
    }

    // TODO: Clean up old translation chunks
  }
}
