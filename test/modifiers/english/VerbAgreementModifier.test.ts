/**
 * Tests for VerbAgreementModifier
 */

import { VerbAgreementModifier } from '../../../src/modifiers/english/VerbAgreementModifier';

describe('VerbAgreementModifier', () => {
  test('should have correct name', () => {
    expect(VerbAgreementModifier.name).toBe('englishVerbAgreement');
  });

  test('should have correct priority', () => {
    expect(VerbAgreementModifier.priority).toBe(5);
  });

  describe('condition', () => {
    test('should return true for singular subjects with "are"', () => {
      expect(VerbAgreementModifier.condition('he are happy')).toBe(true);
      expect(VerbAgreementModifier.condition('she are coming')).toBe(true);
      expect(VerbAgreementModifier.condition('it are working')).toBe(true);
      expect(VerbAgreementModifier.condition('He are happy')).toBe(true);
      expect(VerbAgreementModifier.condition('She are coming')).toBe(true);
      expect(VerbAgreementModifier.condition('It are working')).toBe(true);
    });

    test('should return true for plural subjects with "is"', () => {
      expect(VerbAgreementModifier.condition('they is happy')).toBe(true);
      expect(VerbAgreementModifier.condition('we is coming')).toBe(true);
      expect(VerbAgreementModifier.condition('you is working')).toBe(true);
      expect(VerbAgreementModifier.condition('They is happy')).toBe(true);
      expect(VerbAgreementModifier.condition('We is coming')).toBe(true);
      expect(VerbAgreementModifier.condition('You is working')).toBe(true);
    });

    test('should return true for words ending with "ing" + "are"', () => {
      expect(VerbAgreementModifier.condition('running are fun')).toBe(true);
      expect(VerbAgreementModifier.condition('swimming are great')).toBe(true);
    });

    test('should return true for words ending with "ed" + "are"', () => {
      expect(VerbAgreementModifier.condition('finished are good')).toBe(true);
      expect(VerbAgreementModifier.condition('completed are nice')).toBe(true);
    });

    test('should return false for correct verb agreement', () => {
      expect(VerbAgreementModifier.condition('he is happy')).toBe(false);
      expect(VerbAgreementModifier.condition('she is coming')).toBe(false);
      expect(VerbAgreementModifier.condition('they are happy')).toBe(false);
      expect(VerbAgreementModifier.condition('we are coming')).toBe(false);
    });

    test('should return false for text without problematic patterns', () => {
      expect(VerbAgreementModifier.condition('hello world')).toBe(false);
      expect(VerbAgreementModifier.condition('the cat runs')).toBe(false);
      expect(VerbAgreementModifier.condition('')).toBe(false);
    });

    test('should handle mixed case', () => {
      expect(VerbAgreementModifier.condition('HE ARE happy')).toBe(true);
      expect(VerbAgreementModifier.condition('THEY IS coming')).toBe(true);
    });
  });

  describe('transform', () => {
    test('should change "he are" to "he is"', () => {
      expect(VerbAgreementModifier.transform('he are happy')).toBe('he is happy');
      expect(VerbAgreementModifier.transform('He are coming')).toBe('He is coming');
      expect(VerbAgreementModifier.transform('HE ARE working')).toBe('HE is working');
    });

    test('should change "she are" to "she is"', () => {
      expect(VerbAgreementModifier.transform('she are happy')).toBe('she is happy');
      expect(VerbAgreementModifier.transform('She are coming')).toBe('She is coming');
      expect(VerbAgreementModifier.transform('SHE ARE working')).toBe('SHE is working');
    });

    test('should change "it are" to "it is"', () => {
      expect(VerbAgreementModifier.transform('it are happy')).toBe('it is happy');
      expect(VerbAgreementModifier.transform('It are coming')).toBe('It is coming');
      expect(VerbAgreementModifier.transform('IT ARE working')).toBe('IT is working');
    });

    test('should change "they is" to "they are"', () => {
      expect(VerbAgreementModifier.transform('they is happy')).toBe('they are happy');
      expect(VerbAgreementModifier.transform('They is coming')).toBe('They are coming');
      expect(VerbAgreementModifier.transform('THEY IS working')).toBe('THEY are working');
    });

    test('should change "we is" to "we are"', () => {
      expect(VerbAgreementModifier.transform('we is happy')).toBe('we are happy');
      expect(VerbAgreementModifier.transform('We is coming')).toBe('We are coming');
      expect(VerbAgreementModifier.transform('WE IS working')).toBe('WE are working');
    });

    test('should change "you is" to "you are"', () => {
      expect(VerbAgreementModifier.transform('you is happy')).toBe('you are happy');
      expect(VerbAgreementModifier.transform('You is coming')).toBe('You are coming');
      expect(VerbAgreementModifier.transform('YOU IS working')).toBe('YOU are working');
    });

    test('should handle multiple corrections in one text', () => {
      expect(VerbAgreementModifier.transform('he are happy and they is sad'))
        .toBe('he is happy and they are sad');
      expect(VerbAgreementModifier.transform('She are coming but we is staying'))
        .toBe('She is coming but we are staying');
    });

    test('should preserve correct verb agreement', () => {
      expect(VerbAgreementModifier.transform('he is happy')).toBe('he is happy');
      expect(VerbAgreementModifier.transform('they are coming')).toBe('they are coming');
      expect(VerbAgreementModifier.transform('she is working')).toBe('she is working');
      expect(VerbAgreementModifier.transform('we are learning')).toBe('we are learning');
    });

    test('should preserve text without verb agreement issues', () => {
      expect(VerbAgreementModifier.transform('hello world')).toBe('hello world');
      expect(VerbAgreementModifier.transform('the cat runs')).toBe('the cat runs');
      expect(VerbAgreementModifier.transform('')).toBe('');
    });

    test('should handle sentences with punctuation', () => {
      expect(VerbAgreementModifier.transform('He are happy.')).toBe('He is happy.');
      expect(VerbAgreementModifier.transform('They is coming!')).toBe('They are coming!');
      expect(VerbAgreementModifier.transform('Are you sure we is ready?')).toBe('Are you sure we are ready?');
    });

    test('should handle contractions context', () => {
      expect(VerbAgreementModifier.transform("he are happy, but they is sad"))
        .toBe("he is happy, but they are sad");
      expect(VerbAgreementModifier.transform("She are here and we is there"))
        .toBe("She is here and we are there");
    });

    test('should not affect other uses of "is" and "are"', () => {
      expect(VerbAgreementModifier.transform('The book is on the table')).toBe('The book is on the table');
      expect(VerbAgreementModifier.transform('Cars are expensive')).toBe('Cars are expensive');
      expect(VerbAgreementModifier.transform('What is your name?')).toBe('What is your name?');
    });

    test('should handle edge cases at word boundaries', () => {
      expect(VerbAgreementModifier.transform('he are')).toBe('he is');
      expect(VerbAgreementModifier.transform('they is')).toBe('they are');
      expect(VerbAgreementModifier.transform('He are.')).toBe('He is.');
      expect(VerbAgreementModifier.transform('They is!')).toBe('They are!');
    });
  });
});