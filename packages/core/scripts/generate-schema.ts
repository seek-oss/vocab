#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { TranslationFileSchema } from '../src/translation-file-schema/schema.js';
import * as z from 'zod';

/**
 * Generate JSON Schema for translation files from Zod schemas
 */
async function generateSchema(fileName: string, definition: z.ZodType) {
  const schemaDir = path.join(__dirname, '..', 'schema');

  // Ensure schema directory exists
  await fs.mkdir(schemaDir, { recursive: true });

  // Generate individual schemas
  const schema = z.toJSONSchema(definition, { io: 'input' });

  const destination = path.join(schemaDir, fileName);

  // Write merged translation file schema
  await fs.writeFile(destination, JSON.stringify(schema, null, 2));

  // eslint-disable-next-line no-console
  console.log(`JSON Schemas generated successfully: ${destination}`);
}

async function generateSchemas() {
  await generateSchema('vocab-translation-schema.json', TranslationFileSchema);
}

generateSchemas();
