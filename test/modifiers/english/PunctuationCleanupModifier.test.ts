/**
 * Tests for PunctuationCleanupModifier
 */

import { PunctuationCleanupModifier } from '../../../src/modifiers/english/PunctuationCleanupModifier';

describe('PunctuationCleanupModifier', () => {
  test('should have correct name', () => {
    expect(PunctuationCleanupModifier.name).toBe('englishPunctuationCleanup');
  });

  test('should have correct priority', () => {
    expect(PunctuationCleanupModifier.priority).toBe(9);
  });

  describe('condition', () => {
    test('should return true for spaces before punctuation', () => {
      expect(PunctuationCleanupModifier.condition('Hello , world')).toBe(true);
      expect(PunctuationCleanupModifier.condition('Great .')).toBe(true);
      expect(PunctuationCleanupModifier.condition('Really ?')).toBe(true);
      expect(PunctuationCleanupModifier.condition('Wow !')).toBe(true);
      expect(PunctuationCleanupModifier.condition('Stop ;')).toBe(true);
      expect(PunctuationCleanupModifier.condition('Items :')).toBe(true);
    });

    test('should return true for multiple spaces', () => {
      expect(PunctuationCleanupModifier.condition('Hello  world')).toBe(true);
      expect(PunctuationCleanupModifier.condition('Great   work')).toBe(true);
      expect(PunctuationCleanupModifier.condition('Really    good')).toBe(true);
    });

    test('should return true for multiple spaces before punctuation', () => {
      expect(PunctuationCleanupModifier.condition('Hello  , world')).toBe(true);
      expect(PunctuationCleanupModifier.condition('Great   .')).toBe(true);
      expect(PunctuationCleanupModifier.condition('Really    ?')).toBe(true);
    });

    test('should return false for properly formatted text', () => {
      expect(PunctuationCleanupModifier.condition('Hello, world')).toBe(false);
      expect(PunctuationCleanupModifier.condition('Great.')).toBe(false);
      expect(PunctuationCleanupModifier.condition('Really?')).toBe(false);
      expect(PunctuationCleanupModifier.condition('Hello world')).toBe(false);
    });

    test('should return false for empty or simple text', () => {
      expect(PunctuationCleanupModifier.condition('')).toBe(false);
      expect(PunctuationCleanupModifier.condition('hello')).toBe(false);
      expect(PunctuationCleanupModifier.condition('world')).toBe(false);
    });
  });

  describe('transform', () => {
    test('should remove spaces before commas', () => {
      expect(PunctuationCleanupModifier.transform('Hello , world')).toBe('Hello, world');
      expect(PunctuationCleanupModifier.transform('One , two , three')).toBe('One, two, three');
      expect(PunctuationCleanupModifier.transform('Red  ,  green  ,  blue')).toBe('Red, green, blue');
    });

    test('should remove spaces before periods', () => {
      expect(PunctuationCleanupModifier.transform('Hello world .')).toBe('Hello world.');
      expect(PunctuationCleanupModifier.transform('End here  .')).toBe('End here.');
      expect(PunctuationCleanupModifier.transform('Dr . Smith')).toBe('Dr. Smith');
    });

    test('should remove spaces before exclamation marks', () => {
      expect(PunctuationCleanupModifier.transform('Wow !')).toBe('Wow!');
      expect(PunctuationCleanupModifier.transform('Great job  !')).toBe('Great job!');
      expect(PunctuationCleanupModifier.transform('Stop   !')).toBe('Stop!');
    });

    test('should remove spaces before question marks', () => {
      expect(PunctuationCleanupModifier.transform('Really ?')).toBe('Really?');
      expect(PunctuationCleanupModifier.transform('Are you sure  ?')).toBe('Are you sure?');
      expect(PunctuationCleanupModifier.transform('What   ?')).toBe('What?');
    });

    test('should remove spaces before semicolons', () => {
      expect(PunctuationCleanupModifier.transform('First part ; second part')).toBe('First part; second part');
      expect(PunctuationCleanupModifier.transform('One  ; two  ; three')).toBe('One; two; three');
    });

    test('should remove spaces before colons', () => {
      expect(PunctuationCleanupModifier.transform('Items :')).toBe('Items:');
      expect(PunctuationCleanupModifier.transform('Note  : important')).toBe('Note: important');
      expect(PunctuationCleanupModifier.transform('Time   : 3:00 PM')).toBe('Time: 3:00 PM');
    });

    test('should fix multiple spaces between words', () => {
      expect(PunctuationCleanupModifier.transform('Hello  world')).toBe('Hello world');
      expect(PunctuationCleanupModifier.transform('Great   work')).toBe('Great work');
      expect(PunctuationCleanupModifier.transform('Really    good    job')).toBe('Really good job');
    });

    test('should ensure space after sentence-ending punctuation', () => {
      expect(PunctuationCleanupModifier.transform('Hello.World')).toBe('Hello. World');
      expect(PunctuationCleanupModifier.transform('Great!Now we start')).toBe('Great! Now we start');
      expect(PunctuationCleanupModifier.transform('Really?Yes indeed')).toBe('Really? Yes indeed');
    });

    test('should handle complex combinations', () => {
      expect(PunctuationCleanupModifier.transform('Hello  ,  world  .  Great  !'))
        .toBe('Hello, world. Great!');
      expect(PunctuationCleanupModifier.transform('One , two   ; three  : four  .'))
        .toBe('One, two; three: four.');
    });

    test('should handle sentences with spacing and punctuation issues', () => {
      expect(PunctuationCleanupModifier.transform('Hello  ,  world  .Great!Now   we   start  ?'))
        .toBe('Hello, world. Great! Now we start?');
      expect(PunctuationCleanupModifier.transform('First   sentence  .Second  sentence  !'))
        .toBe('First sentence. Second sentence!');
    });

    test('should preserve properly formatted text', () => {
      expect(PunctuationCleanupModifier.transform('Hello, world')).toBe('Hello, world');
      expect(PunctuationCleanupModifier.transform('Great work!')).toBe('Great work!');
      expect(PunctuationCleanupModifier.transform('Really? Yes indeed.')).toBe('Really? Yes indeed.');
    });

    test('should preserve text without punctuation issues', () => {
      expect(PunctuationCleanupModifier.transform('hello world')).toBe('hello world');
      expect(PunctuationCleanupModifier.transform('no issues here')).toBe('no issues here');
      expect(PunctuationCleanupModifier.transform('')).toBe('');
    });

    test('should handle edge cases', () => {
      expect(PunctuationCleanupModifier.transform(' , ')).toBe(', '); // Preserves some spaces
      expect(PunctuationCleanupModifier.transform('   .   ')).toBe('. '); // Collapses leading spaces, preserves one trailing
      expect(PunctuationCleanupModifier.transform('a  ,  b  .  c')).toBe('a, b. c');
    });

    test('should handle punctuation at start and end', () => {
      expect(PunctuationCleanupModifier.transform(' , hello')).toBe(', hello');
      expect(PunctuationCleanupModifier.transform('hello , ')).toBe('hello, '); // Preserves trailing space
      expect(PunctuationCleanupModifier.transform(' . world .')).toBe('. world.'); // Leading spaces collapsed
    });

    test('should handle multiple consecutive punctuation', () => {
      expect(PunctuationCleanupModifier.transform('Hello  ...  world')).toBe('Hello... world');
      expect(PunctuationCleanupModifier.transform('What  ??  Really')).toBe('What?? Really');
      expect(PunctuationCleanupModifier.transform('Wow  !!!  Amazing')).toBe('Wow!!! Amazing');
    });
  });
});