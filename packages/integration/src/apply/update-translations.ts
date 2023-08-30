import type { TranslationsByKey } from '@vocab/core';
import { log } from 'debug';
import { readFile, mkdir, writeFile } from 'fs/promises';
import path from 'path';
import type { MessageChange } from './get-changes';
import { trace } from '../logger';

export async function updateAllTranslations(
  changesByFile: Record<string, MessageChange[]>,
) {
  const arr = Object.entries(changesByFile);
  const count = arr.reduce((acc, [, changes]) => acc + changes.length, 0);

  log(`Updated ${count} message(s) across ${arr.length} files(s)`);

  for (const [filePath, changes] of Object.entries(changesByFile)) {
    await updateTranslationFileMessages({
      filePath,
      changes,
    });
  }
}

/**
 * Updates the messages in the given translation file on disk with the given changes.
 *
 * Only messages are updated, not metadata, descriptions, or tags.
 */
async function updateTranslationFileMessages({
  filePath,
  changes,
}: {
  filePath: string;
  changes: MessageChange[];
}) {
  if (changes.length === 0) {
    trace(`No changes in file ${filePath}`);
    return;
  }

  log(
    `Updating ${
      changes.length
    } translations in ${filePath}. Including keys: ${changes
      .slice(0, 3)
      .map(({ key }) => `"${key}"`)
      .join(', ')}`,
  );

  let existingContent: TranslationsByKey;
  try {
    existingContent = JSON.parse(await readFile(filePath, 'utf-8'));
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      existingContent = {};
    } else {
      // eslint-disable-next-line no-console
      console.error(error);
      throw error;
    }
  }

  changes.forEach(({ key, newValue }) => {
    if (existingContent[key]) {
      existingContent[key].message = newValue;
    } else {
      existingContent[key] = { message: newValue };
    }
  });

  await mkdir(path.dirname(filePath), {
    recursive: true,
  });
  await writeFile(filePath, `${JSON.stringify(existingContent, null, 2)}\n`);
}
