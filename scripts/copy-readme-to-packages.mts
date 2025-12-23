/* eslint-disable no-console */
import fs from 'fs/promises';
import path from 'path';

const exclude = ['packages/virtual-resource-loader', 'packages/rollup-plugin'];

const rootReadmePath = path.join(import.meta.dirname, '../README.md');

for await (const entry of fs.glob('packages/*', {
  withFileTypes: true,
  exclude,
})) {
  if (entry.isDirectory()) {
    const to = path.join('packages', entry.name, 'README.md');
    console.log(`Copying README.md to ${to}`);

    await fs.copyFile(rootReadmePath, to);
  }
}
