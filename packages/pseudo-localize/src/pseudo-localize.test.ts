import {
  extendVowels,
  pseudoLocalize,
  substituteCharacters,
} from './pseudo-localize';

const testString =
  'the quick brown fox jumps over the lazy dog. THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG.';

describe('pseudo localize', () => {
  describe('substituteCharacters', () => {
    it('should do the thing', () => {
      expect(substituteCharacters(testString)).toMatchInlineSnapshot(
        `"ṯḩẽ q̇ǚìçķ ßřöŵกี้ ƒöꭕ ĵǚm̂ƥš öṽẽř ṯḩẽ ƚăƶý ƌöģ. ṮḨË Q̇ǙÏÇḰ ẞŘÖŴÑ ƑÖX̂ ĴǙṂƤŠ ÖṼËŘ ṮḨË ŁẬƵÝ ḊÖǦ."`,
      );
    });
  });

  describe('extendVowels', () => {
    it('should do the thing', () => {
      expect(extendVowels(testString)).toMatchInlineSnapshot(
        `"theeee quuuuiiiick broooown foooox juuuumps ooooveeeer theeee laaaazyyyy doooog. THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG."`,
      );
    });
  });

  describe('pseudoLocalize', () => {
    it('should do the thing', () => {
      expect(pseudoLocalize(testString)).toMatchInlineSnapshot(
        `"ṯḩẽẽẽẽ q̇ǚǚǚǚììììçķ ßřööööŵกี้ ƒööööꭕ ĵǚǚǚǚm̂ƥš ööööṽẽẽẽẽř ṯḩẽẽẽẽ ƚăăăăƶýýýý ƌööööģ. ṮḨË Q̇ǙÏÇḰ ẞŘÖŴÑ ƑÖX̂ ĴǙṂƤŠ ÖṼËŘ ṮḨË ŁẬƵÝ ḊÖǦ."`,
      );
    });
  });
});
