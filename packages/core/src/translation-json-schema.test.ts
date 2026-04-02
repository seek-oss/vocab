import { expect } from 'vitest';

import type { TranslationData, TranslationFileMetadata } from './types';
import * as translationJsonSchema from './translation-json-schema';

describe('translation-json-schema types', () => {
  it('accepts TranslationFileMetadata-shaped _meta', () => {
    const sample: TranslationFileMetadata = { tags: ['a', 'b'] };
    expect(
      translationJsonSchema.translationFileMetadataSchema.safeParse(sample)
        .success,
    ).toBe(true);
  });

  it('accepts TranslationData-shaped values', () => {
    const sample: TranslationData = {
      message: 'Hello {name}',
      description: 'Greeting',
      globalKey: 'greeting',
      tags: ['a'],
    };
    expect(
      translationJsonSchema.translationEntrySchema.safeParse(sample).success,
    ).toBe(true);
  });

  it('rejects unknown properties on entries (strictObject)', () => {
    const sample = {
      message: 'Hi',
      futureToolingField: 'preserved',
    };
    expect(
      translationJsonSchema.translationEntrySchema.safeParse(sample).success,
    ).toBe(false);
  });
});
