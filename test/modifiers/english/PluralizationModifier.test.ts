/**
 * Tests for PluralizationModifier
 */

import { PluralizationModifier } from '../../../src/modifiers/english/PluralizationModifier';

describe('PluralizationModifier', () => {
  test('should have correct name', () => {
    expect(PluralizationModifier.name).toBe('englishPluralization');
  });

  test('should have correct priority', () => {
    expect(PluralizationModifier.priority).toBe(4);
  });

  describe('condition', () => {
    test('should return true for quantity words with singular nouns', () => {
      expect(PluralizationModifier.condition('many cat')).toBe(true);
      expect(PluralizationModifier.condition('several dog')).toBe(true);
      expect(PluralizationModifier.condition('few house')).toBe(true);
      expect(PluralizationModifier.condition('some book')).toBe(true);
      expect(PluralizationModifier.condition('multiple item')).toBe(true);
      expect(PluralizationModifier.condition('various thing')).toBe(true);
    });

    test('should still return true for plural nouns (modifier will process them)', () => {
      expect(PluralizationModifier.condition('many cats')).toBe(true);
      expect(PluralizationModifier.condition('several dogs')).toBe(true);
      expect(PluralizationModifier.condition('few houses')).toBe(true);
    });

    test('should return false for text without quantity words', () => {
      expect(PluralizationModifier.condition('a cat')).toBe(false);
      expect(PluralizationModifier.condition('the dog')).toBe(false);
      expect(PluralizationModifier.condition('hello world')).toBe(false);
      expect(PluralizationModifier.condition('')).toBe(false);
    });

    test('should handle case insensitive matching', () => {
      expect(PluralizationModifier.condition('Many cat')).toBe(true);
      expect(PluralizationModifier.condition('SEVERAL dog')).toBe(true);
    });
  });

  describe('transform', () => {
    test('should pluralize regular nouns', () => {
      expect(PluralizationModifier.transform('many cat')).toBe('many cats');
      expect(PluralizationModifier.transform('several dog')).toBe('several dogs');
      expect(PluralizationModifier.transform('few book')).toBe('few books');
      expect(PluralizationModifier.transform('some table')).toBe('some tables');
    });

    test('should handle nouns ending in -s, -x, -z, -ch, -sh', () => {
      expect(PluralizationModifier.transform('many class')).toBe('many classes');
      expect(PluralizationModifier.transform('several box')).toBe('several boxes');
      expect(PluralizationModifier.transform('few quiz')).toBe('few quizzes');
      expect(PluralizationModifier.transform('some church')).toBe('some churches');
      expect(PluralizationModifier.transform('multiple dish')).toBe('multiple dishes');
    });

    test('should handle nouns ending in consonant + y', () => {
      expect(PluralizationModifier.transform('many city')).toBe('many cities');
      expect(PluralizationModifier.transform('several party')).toBe('several parties');
      expect(PluralizationModifier.transform('few penny')).toBe('few pennies');
    });

    test('should handle nouns ending in vowel + y', () => {
      expect(PluralizationModifier.transform('many key')).toBe('many keys');
      expect(PluralizationModifier.transform('several day')).toBe('several days');
      expect(PluralizationModifier.transform('few toy')).toBe('few toys');
    });

    test('should handle nouns ending in -f or -fe', () => {
      expect(PluralizationModifier.transform('many leaf')).toBe('many leaves');
      expect(PluralizationModifier.transform('several knife')).toBe('several knives');
      expect(PluralizationModifier.transform('few life')).toBe('few lives');
      expect(PluralizationModifier.transform('some wife')).toBe('some wives');
    });

    test('should handle nouns ending in consonant + o', () => {
      expect(PluralizationModifier.transform('many tomato')).toBe('many tomatoes');
      expect(PluralizationModifier.transform('several hero')).toBe('several heroes');
      expect(PluralizationModifier.transform('few potato')).toBe('few potatoes');
    });

    test('should handle irregular plurals', () => {
      expect(PluralizationModifier.transform('many child')).toBe('many children');
      expect(PluralizationModifier.transform('several mouse')).toBe('several mice');
      expect(PluralizationModifier.transform('few person')).toBe('few people');
      expect(PluralizationModifier.transform('some man')).toBe('some men');
      expect(PluralizationModifier.transform('multiple woman')).toBe('multiple women');
      expect(PluralizationModifier.transform('various foot')).toBe('various feet');
      expect(PluralizationModifier.transform('many tooth')).toBe('many teeth');
      expect(PluralizationModifier.transform('several goose')).toBe('several geese');
    });

    test('should handle multiple instances in one text', () => {
      expect(PluralizationModifier.transform('many cat and several dog')).toBe('many cats and several dogs');
      expect(PluralizationModifier.transform('few child and some mouse')).toBe('few children and some mice');
    });

    test('should preserve text without quantity words', () => {
      expect(PluralizationModifier.transform('a cat')).toBe('a cat');
      expect(PluralizationModifier.transform('the dog')).toBe('the dog');
      expect(PluralizationModifier.transform('hello world')).toBe('hello world');
      expect(PluralizationModifier.transform('')).toBe('');
    });

    test('should handle case preservation', () => {
      expect(PluralizationModifier.transform('Many cat')).toBe('Many cats');
      expect(PluralizationModifier.transform('SEVERAL dog')).toBe('SEVERAL dogs');
    });
  });
});