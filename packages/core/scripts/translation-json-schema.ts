import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import prettier from 'prettier';
import * as z from 'zod';

import {
  vocabAltTranslationFileSchema,
  vocabDevTranslationFileSchema,
} from '../src/translation-json-schema';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemasDir = path.resolve(__dirname, '../schemas');

/** Draft-07 document from `z.toJSONSchema` (single schema, not registry output). */
type JsonSchemaDocument = Record<string, unknown>;

function withMeta(
  schema: JsonSchemaDocument,
  meta: { $id: string; title: string; description: string },
): JsonSchemaDocument {
  const { $schema: _ignored, ...rest } = schema;
  return {
    ...rest,
    $schema: schema.$schema,
    $id: meta.$id,
    title: meta.title,
    description: meta.description,
  };
}

async function formatDocument(doc: JsonSchemaDocument): Promise<string> {
  return prettier.format(JSON.stringify(doc), { parser: 'json' });
}

async function main() {
  const dev = z.toJSONSchema(vocabDevTranslationFileSchema, {
    target: 'draft-07',
  }) as JsonSchemaDocument;
  const alt = z.toJSONSchema(vocabAltTranslationFileSchema, {
    target: 'draft-07',
  }) as JsonSchemaDocument;

  const devExpected = withMeta(dev, {
    $id: 'https://vocab.dev/schema/translations.json',
    title: 'Vocab dev translation file',
    description:
      'Dev language file (`translations.json`). Top-level keys (other than `$namespace` and `_meta`) are translation IDs. Each value must include `message` (ICU MessageFormat). Optional per-key: `description`, `globalKey`, `tags`. File-level `_meta.tags` applies when using tooling that reads tags.',
  });
  const altExpected = withMeta(alt, {
    $id: 'https://vocab.dev/schema/translations.alt.json',
    title: 'Vocab alternate-language translation file',
    description:
      'Per-language file (`{lang}.translations.json`). Same entry shape as the dev file: required `message`, optional `description`, `globalKey`, `tags`. Vocab ignores `$namespace` and `_meta.tags` on these files at runtime (with a console warning).',
  });

  const devPath = path.join(schemasDir, 'translations.schema.json');
  const altPath = path.join(schemasDir, 'translations.alt.schema.json');

  await fs.mkdir(schemasDir, { recursive: true });
  await fs.writeFile(devPath, await formatDocument(devExpected), 'utf8');
  await fs.writeFile(altPath, await formatDocument(altExpected), 'utf8');
}

main().catch((err: unknown) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});
