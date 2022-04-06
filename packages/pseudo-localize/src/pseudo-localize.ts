import { characterSubstitutionMap } from './substitutions';

// Extend strings by 40%
const extensionRatio = 1.4;

// Having 'y' as a vowel accounts for words that don't have any actual vowels
const vowels = ['a', 'e', 'i', 'o', 'u', 'y'];

export const pseudoLocalize = (str: string): string =>
  substituteCharacters(extendVowels(str));

export const padString = (str: string): string => `[${str}]`;

export const extendVowels = (str: string): string => {
  const stringLength = [...str.normalize()].length;

  const numberOfVowels = [...str.normalize('NFKD')].filter((char) =>
    vowels.includes(char),
  ).length;

  const targetLength = stringLength * extensionRatio;
  const lengthDifference = targetLength - stringLength;
  const vowelExtensionAmount = Math.ceil(lengthDifference / numberOfVowels);

  return [...str]
    .map((char) => {
      if (vowels.includes(char)) {
        return char.repeat(vowelExtensionAmount + 1);
      }
      return char;
    })
    .join('');
};

const isAlpha = (str: string) => {
  const characterCode = str.charCodeAt(0);

  if (
    !(characterCode > 64 && characterCode < 91) && // upper alpha (A-Z)
    !(characterCode > 96 && characterCode < 123) // lower alpha (a-z)
  ) {
    return false;
  }

  return true;
};

export const substituteCharacters = (str: string): string =>
  [...str.normalize()]
    .map((char) => {
      const isAlphaCharacter = isAlpha(char);

      if (isAlphaCharacter) {
        return characterSubstitutionMap[char];
      }

      return char;
    })
    .join('');
