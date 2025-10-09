/**
 * Tests for ArticleModifier
 */

import { ArticleModifier } from '../../../src/modifiers/english/ArticleModifier';

describe('ArticleModifier', () => {
  test('should have correct name', () => {
    expect(ArticleModifier.name).toBe('englishArticles');
  });

  test('should have correct priority', () => {
    expect(ArticleModifier.priority).toBe(10);
  });

  describe('condition', () => {
    test('should return true for "a" before vowel sounds', () => {
      expect(ArticleModifier.condition('a elephant')).toBe(true);
      expect(ArticleModifier.condition('a umbrella')).toBe(true);
      expect(ArticleModifier.condition('a owl')).toBe(true);
      expect(ArticleModifier.condition('a apple')).toBe(true);
      expect(ArticleModifier.condition('a hour')).toBe(false); // 'h' is consonant, not vowel
    });

    test('should return false for "an" before consonant sounds (not detected by this modifier)', () => {
      expect(ArticleModifier.condition('an cat')).toBe(false);
      expect(ArticleModifier.condition('an dog')).toBe(false);
      expect(ArticleModifier.condition('an house')).toBe(false);
      expect(ArticleModifier.condition('an unicorn')).toBe(false);
    });

    test('should return false for correct usage', () => {
      expect(ArticleModifier.condition('an elephant')).toBe(false);
      expect(ArticleModifier.condition('a cat')).toBe(false);
      expect(ArticleModifier.condition('the house')).toBe(false);
      expect(ArticleModifier.condition('some dogs')).toBe(false);
    });

    test('should return false for text without articles', () => {
      expect(ArticleModifier.condition('hello world')).toBe(false);
      expect(ArticleModifier.condition('cats are nice')).toBe(false);
      expect(ArticleModifier.condition('')).toBe(false);
    });

    test('should handle case sensitivity', () => {
      expect(ArticleModifier.condition('A elephant')).toBe(false); // Regex looks for lowercase 'a'
      expect(ArticleModifier.condition('An cat')).toBe(false); // Only detects 'a' before vowels
    });
  });

  describe('transform', () => {
    test('should change "a" to "an" before vowel sounds', () => {
      expect(ArticleModifier.transform('a elephant')).toBe('an elephant');
      expect(ArticleModifier.transform('a umbrella')).toBe('an umbrella');
      expect(ArticleModifier.transform('a owl')).toBe('an owl');
      expect(ArticleModifier.transform('a apple')).toBe('an apple');
      expect(ArticleModifier.transform('a hour')).toBe('a hour'); // Only handles written vowels, not silent h
    });

    test('should not change "an" before consonants (outside scope)', () => {
      expect(ArticleModifier.transform('an cat')).toBe('an cat');
      expect(ArticleModifier.transform('an dog')).toBe('an dog');
      expect(ArticleModifier.transform('an house')).toBe('an house');
      expect(ArticleModifier.transform('an unicorn')).toBe('an unicorn');
    });

    test('should handle uppercase articles', () => {
      expect(ArticleModifier.transform('A elephant')).toBe('an elephant'); // Case is not preserved in this implementation
      expect(ArticleModifier.transform('An cat')).toBe('An cat'); // Outside scope
    });

    test('should handle multiple corrections in one text', () => {
      expect(ArticleModifier.transform('a elephant and an cat')).toBe('an elephant and an cat');
      expect(ArticleModifier.transform('A owl, an dog, a umbrella')).toBe('an owl, an dog, an umbrella');
    });

    test('should leave correct articles unchanged', () => {
      expect(ArticleModifier.transform('an elephant')).toBe('an elephant');
      expect(ArticleModifier.transform('a cat')).toBe('a cat');
      expect(ArticleModifier.transform('the house')).toBe('the house');
    });

    test('should handle edge cases', () => {
      expect(ArticleModifier.transform('a honest man')).toBe('a honest man'); // Only checks written vowels
      expect(ArticleModifier.transform('an university')).toBe('an university'); // Outside scope
      expect(ArticleModifier.transform('a European')).toBe('an European'); // Changes to 'an' due to 'E'
      expect(ArticleModifier.transform('an heir')).toBe('an heir'); // Outside scope
    });

    test('should preserve text without articles', () => {
      expect(ArticleModifier.transform('hello world')).toBe('hello world');
      expect(ArticleModifier.transform('cats are nice')).toBe('cats are nice');
      expect(ArticleModifier.transform('')).toBe('');
    });
  });
});