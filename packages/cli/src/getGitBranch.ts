import { execSync } from 'node:child_process';

// Modified from `env-ci` to use `execSync`
// https://github.com/semantic-release/env-ci/blob/e11b2965aa82cd7366511635d9bc4ae3d0144f64/lib/git.js#L11C24-L35
export function getGitBranch() {
  try {
    const headRef = execSync('git rev-parse --abbrev-ref HEAD', {
      encoding: 'utf8',
    }).trim();

    if (headRef === 'HEAD') {
      const branch = execSync('git show -s --pretty=%d HEAD', {
        encoding: 'utf8',
      })
        .trim()
        .replace(/^\(|\)$/g, '')
        .split(', ')
        .find((b) => b.startsWith('origin/'));

      return branch ? branch.match(/^origin\/(?<branch>.+)/)?.[1] : undefined;
    }

    return headRef;
  } catch {
    return undefined;
  }
}
