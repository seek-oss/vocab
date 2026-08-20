import { describe, expect, it } from 'vitest';
import {
  getChunkName,
  getLanguageFromChunkName,
  isVocabChunkName,
} from './get-chunk-name';

describe('vocab chunk names', () => {
  it.each(['en', 'en-AU', 'zh-Hans-CN'])(
    'treats getChunkName(%j) as a vocab chunk',
    (lang) => {
      const chunkName = getChunkName(lang);
      expect(isVocabChunkName(chunkName)).toBe(true);
      expect(getLanguageFromChunkName(chunkName)).toBe(lang);
    },
  );

  it.each([undefined, 'index', 'vendor', '-translations'])(
    'does not treat %j as a vocab chunk',
    (name) => {
      expect(isVocabChunkName(name)).toBe(false);
      expect(getLanguageFromChunkName(name)).toBeUndefined();
    },
  );
});
