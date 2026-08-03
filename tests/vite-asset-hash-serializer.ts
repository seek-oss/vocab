import type { SnapshotSerializer } from 'vitest';

// Vite asset content hashes differ across platforms (e.g. darwin vs linux).
const hashedAssetImport = /\.\/assets\/index-[A-Za-z0-9_-]+\.js/;

export default {
  test(val) {
    return typeof val === 'string' && hashedAssetImport.test(val);
  },
  serialize(val, config, indentation, depth, refs, printer) {
    return printer(
      val.replace(
        new RegExp(hashedAssetImport, 'g'),
        './assets/index-[hash].js',
      ),
      config,
      indentation,
      depth,
      refs,
    );
  },
} satisfies SnapshotSerializer;
