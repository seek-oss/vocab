import { promises as fs } from 'fs';
import path from 'path';

import glob from 'fast-glob';

const ignore = ['packages/virtual-resource-loader', 'packages/rollup-plugin'];

(async () => {
  const packages = await glob('packages/*', {
    ignore,
    onlyDirectories: true,
    absolute: true,
  });

  for (const packageDir of packages) {
    await fs.copyFile(
      path.join(__dirname, '../README.md'),
      path.join(packageDir, 'README.md'),
    );
  }
})();
