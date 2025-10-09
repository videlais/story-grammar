/**
 * Tests for CapitalizationModifier
 */

import { CapitalizationModifier } from '../../../src/modifiers/english/CapitalizationModifier';

describe('CapitalizationModifier', () => {
  test('should have correct name', () => {
    expect(CapitalizationModifier.name).toBe('englishCapitalization');
  });

  test('should have correct priority', () => {
    expect(CapitalizationModifier.priority).toBe(7);
  });

  describe('condition', () => {
    test('should return true for lowercase letters after sentence endings', () => {
      expect(CapitalizationModifier.condition('Hello. world')).toBe(true);
      expect(CapitalizationModifier.condition('Great! now we start')).toBe(true);
      expect(CapitalizationModifier.condition('Really? yes indeed')).toBe(true);
      expect(CapitalizationModifier.condition('First sentence. second sentence')).toBe(true);
    });

    test('should return true for multiple instances', () => {
      expect(CapitalizationModifier.condition('One. two. three')).toBe(true);
      expect(CapitalizationModifier.condition('Stop! go now. wait here')).toBe(true);
    });

    test('should return false for properly capitalized text', () => {
      expect(CapitalizationModifier.condition('Hello. World')).toBe(false);
      expect(CapitalizationModifier.condition('Great! Now we start')).toBe(false);
      expect(CapitalizationModifier.condition('Really? Yes indeed')).toBe(false);
    });

    test('should return false for text without sentence endings', () => {
      expect(CapitalizationModifier.condition('hello world')).toBe(false);
      expect(CapitalizationModifier.condition('no punctuation here')).toBe(false);
      expect(CapitalizationModifier.condition('')).toBe(false);
    });

    test('should return false for sentence endings at end of text', () => {
      expect(CapitalizationModifier.condition('Hello world.')).toBe(false);
      expect(CapitalizationModifier.condition('Great job!')).toBe(false);
      expect(CapitalizationModifier.condition('Is this right?')).toBe(false);
    });

    test('should handle multiple spaces after punctuation', () => {
      expect(CapitalizationModifier.condition('Hello.  world')).toBe(true);
      expect(CapitalizationModifier.condition('Great!   now we start')).toBe(true);
      expect(CapitalizationModifier.condition('Really?    yes indeed')).toBe(true);
    });
  });

  describe('transform', () => {
    test('should capitalize letters after periods', () => {
      expect(CapitalizationModifier.transform('Hello. world')).toBe('Hello. World');
      expect(CapitalizationModifier.transform('First sentence. second sentence')).toBe('First sentence. Second sentence');
      expect(CapitalizationModifier.transform('End here. start again')).toBe('End here. Start again');
    });

    test('should capitalize letters after exclamation marks', () => {
      expect(CapitalizationModifier.transform('Great! now we start')).toBe('Great! Now we start');
      expect(CapitalizationModifier.transform('Stop! go immediately')).toBe('Stop! Go immediately');
      expect(CapitalizationModifier.transform('Wow! amazing work')).toBe('Wow! Amazing work');
    });

    test('should capitalize letters after question marks', () => {
      expect(CapitalizationModifier.transform('Really? yes indeed')).toBe('Really? Yes indeed');
      expect(CapitalizationModifier.transform('Are you sure? i think so')).toBe('Are you sure? I think so');
      expect(CapitalizationModifier.transform('What now? we continue')).toBe('What now? We continue');
    });

    test('should handle multiple instances in one text', () => {
      expect(CapitalizationModifier.transform('One. two. three')).toBe('One. Two. Three');
      expect(CapitalizationModifier.transform('Stop! go now. wait here')).toBe('Stop! Go now. Wait here');
      expect(CapitalizationModifier.transform('First. second! third? fourth')).toBe('First. Second! Third? Fourth');
    });

    test('should handle multiple spaces after punctuation', () => {
      expect(CapitalizationModifier.transform('Hello.  world')).toBe('Hello.  World');
      expect(CapitalizationModifier.transform('Great!   now we start')).toBe('Great!   Now we start');
      expect(CapitalizationModifier.transform('Really?    yes indeed')).toBe('Really?    Yes indeed');
    });

    test('should preserve already capitalized letters', () => {
      expect(CapitalizationModifier.transform('Hello. World')).toBe('Hello. World');
      expect(CapitalizationModifier.transform('Great! Now we start')).toBe('Great! Now we start');
      expect(CapitalizationModifier.transform('Really? Yes indeed')).toBe('Really? Yes indeed');
    });

    test('should not affect punctuation at end of text', () => {
      expect(CapitalizationModifier.transform('Hello world.')).toBe('Hello world.');
      expect(CapitalizationModifier.transform('Great job!')).toBe('Great job!');
      expect(CapitalizationModifier.transform('Is this right?')).toBe('Is this right?');
    });

    test('should preserve text without sentence endings', () => {
      expect(CapitalizationModifier.transform('hello world')).toBe('hello world');
      expect(CapitalizationModifier.transform('no punctuation here')).toBe('no punctuation here');
      expect(CapitalizationModifier.transform('')).toBe('');
    });

    test('should handle complex sentences', () => {
      expect(CapitalizationModifier.transform('The meeting starts at 9 A.M. we should arrive early.'))
        .toBe('The meeting starts at 9 A.M. We should arrive early.');
      expect(CapitalizationModifier.transform('Dr. Smith will speak. then we break for lunch.'))
        .toBe('Dr. Smith will speak. Then we break for lunch.');
    });

    test('should handle edge cases', () => {
      expect(CapitalizationModifier.transform('. start with period')).toBe('. Start with period');
      expect(CapitalizationModifier.transform('! start with exclamation')).toBe('! Start with exclamation');
      expect(CapitalizationModifier.transform('? start with question')).toBe('? Start with question');
    });
  });
});