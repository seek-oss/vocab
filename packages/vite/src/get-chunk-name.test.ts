import { describe, expect, it } from 'vitest';
import { getChunkName, isVocabChunkName } from './get-chunk-name';

describe('vocab chunk names', () => {
  it.each(['en', 'en-AU', 'zh-Hans-CN'])(
    'treats getChunkName(%j) as a vocab chunk',
    (lang) => {
      expect(isVocabChunkName(getChunkName(lang))).toBe(true);
    },
  );

  it.each([undefined, 'index', 'vendor'])(
    'does not treat %j as a vocab chunk',
    (name) => {
      expect(isVocabChunkName(name)).toBe(false);
    },
  );
});
