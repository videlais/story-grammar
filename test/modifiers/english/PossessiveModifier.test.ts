/**
 * Tests for PossessiveModifier
 */

import { PossessiveModifier } from '../../../src/modifiers/english/PossessiveModifier';

describe('PossessiveModifier', () => {
  test('should have correct name', () => {
    expect(PossessiveModifier.name).toBe('englishPossessive');
  });

  test('should have correct priority', () => {
    expect(PossessiveModifier.priority).toBe(6);
  });

  describe('condition', () => {
    test('should return true for words ending with "POSSESSIVE"', () => {
      expect(PossessiveModifier.condition('JohnPOSSESSIVE car')).toBe(true);
      expect(PossessiveModifier.condition('catPOSSESSIVE toy')).toBe(true);
      expect(PossessiveModifier.condition('dogsPOSSESSIVE food')).toBe(true);
      expect(PossessiveModifier.condition('childrenPOSSESSIVE books')).toBe(true);
    });

    test('should return true for multiple possessives', () => {
      expect(PossessiveModifier.condition('JohnPOSSESSIVE car and MaryPOSSESSIVE house')).toBe(true);
      expect(PossessiveModifier.condition('The catPOSSESSIVE toy and dogPOSSESSIVE bone')).toBe(true);
    });

    test('should return false for text without possessive markers', () => {
      expect(PossessiveModifier.condition("John's car")).toBe(false);
      expect(PossessiveModifier.condition("cats' toys")).toBe(false);
      expect(PossessiveModifier.condition('hello world')).toBe(false);
      expect(PossessiveModifier.condition('')).toBe(false);
    });

    test('should return true for any occurrence of "POSSESSIVE"', () => {
      expect(PossessiveModifier.condition('POSSESSIVE')).toBe(true);
      expect(PossessiveModifier.condition('The POSSESSIVE form')).toBe(true);
    });
  });

  describe('transform', () => {
    test('should add apostrophe-s to words not ending in s', () => {
      expect(PossessiveModifier.transform('JohnPOSSESSIVE car')).toBe("John's car");
      expect(PossessiveModifier.transform('catPOSSESSIVE toy')).toBe("cat's toy");
      expect(PossessiveModifier.transform('childPOSSESSIVE book')).toBe("child's book");
      expect(PossessiveModifier.transform('womanPOSSESSIVE purse')).toBe("woman's purse");
    });

    test('should add only apostrophe to words ending in s', () => {
      expect(PossessiveModifier.transform('dogsPOSSESSIVE food')).toBe("dogs' food");
      expect(PossessiveModifier.transform('catsPOSSESSIVE toys')).toBe("cats' toys");
      expect(PossessiveModifier.transform('JamesPOSSESSIVE car')).toBe("James' car");
      expect(PossessiveModifier.transform('classPOSSESSIVE teacher')).toBe("class' teacher");
    });

    test('should handle multiple possessives in one text', () => {
      expect(PossessiveModifier.transform('JohnPOSSESSIVE car and MaryPOSSESSIVE house'))
        .toBe("John's car and Mary's house");
      expect(PossessiveModifier.transform('The catPOSSESSIVE toy and dogsPOSSESSIVE bone'))
        .toBe("The cat's toy and dogs' bone");
      expect(PossessiveModifier.transform('childPOSSESSIVE book, parentsPOSSESSIVE advice'))
        .toBe("child's book, parents' advice");
    });

    test('should handle proper nouns', () => {
      expect(PossessiveModifier.transform('AmericaPOSSESSIVE flag')).toBe("America's flag");
      expect(PossessiveModifier.transform('LondonPOSSESSIVE weather')).toBe("London's weather");
      expect(PossessiveModifier.transform('MicrosoftPOSSESSIVE products')).toBe("Microsoft's products");
    });

    test('should handle names ending in s', () => {
      expect(PossessiveModifier.transform('CharlesPOSSESSIVE book')).toBe("Charles' book");
      expect(PossessiveModifier.transform('JonesPOSSESSIVE family')).toBe("Jones' family");
      expect(PossessiveModifier.transform('ChrisPOSSESSIVE guitar')).toBe("Chris' guitar");
    });

    test('should handle compound words', () => {
      expect(PossessiveModifier.transform('motherinlawPOSSESSIVE advice')).toBe("motherinlaw's advice");
      expect(PossessiveModifier.transform('editoriinchiefPOSSESSIVE decision')).toBe("editoriinchief's decision");
    });

    test('should preserve text without possessive markers', () => {
      expect(PossessiveModifier.transform("John's car")).toBe("John's car");
      expect(PossessiveModifier.transform("cats' toys")).toBe("cats' toys");
      expect(PossessiveModifier.transform('hello world')).toBe('hello world');
      expect(PossessiveModifier.transform('')).toBe('');
    });

    test('should handle edge cases', () => {
      expect(PossessiveModifier.transform('sPOSSESSIVE thing')).toBe("s' thing");
      expect(PossessiveModifier.transform('xPOSSESSIVE factor')).toBe("x's factor");
      expect(PossessiveModifier.transform('SPOSSESSIVE word')).toBe("S's word"); // S doesn't end with 's'
    });

    test('should handle words with numbers', () => {
      expect(PossessiveModifier.transform('car1POSSESSIVE engine')).toBe("car1's engine");
      expect(PossessiveModifier.transform('rooms5POSSESSIVE keys')).toBe("rooms5's keys"); // '5' is not 's'
    });

    test('should handle multiple words before POSSESSIVE', () => {
      expect(PossessiveModifier.transform('The boy next doorPOSSESSIVE bike')).toBe("The boy next door's bike");
      expect(PossessiveModifier.transform('My best friendsPOSSESSIVE car')).toBe("My best friends' car");
    });
  });
});