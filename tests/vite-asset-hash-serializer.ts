import type { SnapshotSerializer } from 'vitest';

// Vite asset content hashes differ across platforms (e.g. darwin vs linux).
const hashedAssetImport = /\.\/assets\/index-[A-Za-z0-9_-]+\.js/g;

export default {
  test(val) {
    return typeof val === 'string' && val.match(hashedAssetImport) != null;
  },
  serialize(val, config, indentation, depth, refs, printer) {
    return printer(
      val.replaceAll(hashedAssetImport, './assets/index-[hash].js'),
      config,
      indentation,
      depth,
      refs,
    );
  },
} satisfies SnapshotSerializer;
