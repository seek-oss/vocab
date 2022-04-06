import {
  extendVowels,
  padString,
  pseudoLocalize,
  substituteCharacters,
} from './pseudo-localize';

const testString =
  'the quick brown fox jumps over the lazy dog. THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG.';

describe('pseudo localize', () => {
  describe('substituteCharacters', () => {
    it('substitute each character of the input string', () => {
      expect(substituteCharacters(testString)).toMatchInlineSnapshot(
        `"ṯḩẽ q̇ǚìçķ ßřöŵกี้ ƒöꭕ ĵǚm̂ƥš öṽẽř ṯḩẽ ƚăƶý ƌöģ. ṮḨË Q̇ǙÏÇḰ ẞŘÖŴÑ ƑÖX̂ ĴǙṂƤŠ ÖṼËŘ ṮḨË ŁẬƵÝ ḊÖǦ."`,
      );
    });
  });

  describe('extendVowels', () => {
    it('extend the input string by repeating vowels', () => {
      expect(extendVowels(testString)).toMatchInlineSnapshot(
        `"theeee quuuuiiiick broooown foooox juuuumps ooooveeeer theeee laaaazyyyy doooog. THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG."`,
      );
    });
  });

  describe('padString', () => {
    it('should pad the input string with square brackets', () => {
      expect(padString(testString)).toMatchInlineSnapshot(
        `"[the quick brown fox jumps over the lazy dog. THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG.]"`,
      );
    });
  });

  describe('pseudoLocalize', () => {
    it('extend the input string and then subsitute characters', () => {
      expect(pseudoLocalize(testString)).toMatchInlineSnapshot(
        `"ṯḩẽẽẽẽ q̇ǚǚǚǚììììçķ ßřööööŵกี้ ƒööööꭕ ĵǚǚǚǚm̂ƥš ööööṽẽẽẽẽř ṯḩẽẽẽẽ ƚăăăăƶýýýý ƌööööģ. ṮḨË Q̇ǙÏÇḰ ẞŘÖŴÑ ƑÖX̂ ĴǙṂƤŠ ÖṼËŘ ṮḨË ŁẬƵÝ ḊÖǦ."`,
      );
    });
  });
});
