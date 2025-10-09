/**
 * Tests for OrdinalModifier
 */

import { OrdinalModifier } from '../../../src/modifiers/english/OrdinalModifier';

describe('OrdinalModifier', () => {
  test('should have correct name', () => {
    expect(OrdinalModifier.name).toBe('englishOrdinals');
  });

  test('should have correct priority', () => {
    expect(OrdinalModifier.priority).toBe(8);
  });

  describe('condition', () => {
    test('should return true for standalone numbers', () => {
      expect(OrdinalModifier.condition('1')).toBe(true);
      expect(OrdinalModifier.condition('2')).toBe(true);
      expect(OrdinalModifier.condition('3')).toBe(true);
      expect(OrdinalModifier.condition('21')).toBe(true);
      expect(OrdinalModifier.condition('101')).toBe(true);
    });

    test('should return true for text containing numbers', () => {
      expect(OrdinalModifier.condition('The 1 place winner')).toBe(true);
      expect(OrdinalModifier.condition('On the 2 day')).toBe(true);
      expect(OrdinalModifier.condition('His 3 attempt')).toBe(true);
      expect(OrdinalModifier.condition('123 items')).toBe(true);
    });

    test('should return false for text without numbers', () => {
      expect(OrdinalModifier.condition('hello world')).toBe(false);
      expect(OrdinalModifier.condition('first place')).toBe(false);
      expect(OrdinalModifier.condition('')).toBe(false);
    });

    test('should return false for already ordinal numbers', () => {
      expect(OrdinalModifier.condition('1st place')).toBe(false); // No standalone digits
      expect(OrdinalModifier.condition('2nd day')).toBe(false); // No standalone digits
    });
  });

  describe('transform', () => {
    test('should convert numbers ending in 1 to "st" (except 11)', () => {
      expect(OrdinalModifier.transform('1')).toBe('1st');
      expect(OrdinalModifier.transform('21')).toBe('21st');
      expect(OrdinalModifier.transform('31')).toBe('31st');
      expect(OrdinalModifier.transform('101')).toBe('101st');
      expect(OrdinalModifier.transform('121')).toBe('121st');
    });

    test('should convert numbers ending in 2 to "nd" (except 12)', () => {
      expect(OrdinalModifier.transform('2')).toBe('2nd');
      expect(OrdinalModifier.transform('22')).toBe('22nd');
      expect(OrdinalModifier.transform('32')).toBe('32nd');
      expect(OrdinalModifier.transform('102')).toBe('102nd');
      expect(OrdinalModifier.transform('122')).toBe('122nd');
    });

    test('should convert numbers ending in 3 to "rd" (except 13)', () => {
      expect(OrdinalModifier.transform('3')).toBe('3rd');
      expect(OrdinalModifier.transform('23')).toBe('23rd');
      expect(OrdinalModifier.transform('33')).toBe('33rd');
      expect(OrdinalModifier.transform('103')).toBe('103rd');
      expect(OrdinalModifier.transform('123')).toBe('123rd');
    });

    test('should convert teen numbers (11-13) to "th"', () => {
      expect(OrdinalModifier.transform('11')).toBe('11th');
      expect(OrdinalModifier.transform('12')).toBe('12th');
      expect(OrdinalModifier.transform('13')).toBe('13th');
      expect(OrdinalModifier.transform('111')).toBe('111th');
      expect(OrdinalModifier.transform('112')).toBe('112th');
      expect(OrdinalModifier.transform('113')).toBe('113th');
    });

    test('should convert all other numbers to "th"', () => {
      expect(OrdinalModifier.transform('4')).toBe('4th');
      expect(OrdinalModifier.transform('5')).toBe('5th');
      expect(OrdinalModifier.transform('6')).toBe('6th');
      expect(OrdinalModifier.transform('7')).toBe('7th');
      expect(OrdinalModifier.transform('8')).toBe('8th');
      expect(OrdinalModifier.transform('9')).toBe('9th');
      expect(OrdinalModifier.transform('10')).toBe('10th');
      expect(OrdinalModifier.transform('14')).toBe('14th');
      expect(OrdinalModifier.transform('15')).toBe('15th');
      expect(OrdinalModifier.transform('20')).toBe('20th');
      expect(OrdinalModifier.transform('100')).toBe('100th');
    });

    test('should handle multiple ordinals in one text', () => {
      expect(OrdinalModifier.transform('1 place, 2 place, 3 place'))
        .toBe('1st place, 2nd place, 3rd place');
      expect(OrdinalModifier.transform('The 11, 12, and 13 items'))
        .toBe('The 11th, 12th, and 13th items');
    });

    test('should handle ordinals in sentences', () => {
      expect(OrdinalModifier.transform('The 1 place winner gets a prize'))
        .toBe('The 1st place winner gets a prize');
      expect(OrdinalModifier.transform('On the 22 day of the month'))
        .toBe('On the 22nd day of the month');
      expect(OrdinalModifier.transform('His 3 attempt was successful'))
        .toBe('His 3rd attempt was successful');
    });

    test('should preserve text without standalone numbers', () => {
      expect(OrdinalModifier.transform('1st place')).toBe('1st place'); // No standalone digits
      expect(OrdinalModifier.transform('hello world')).toBe('hello world');
      expect(OrdinalModifier.transform('123 items')).toBe('123rd items'); // Contains standalone number
      expect(OrdinalModifier.transform('')).toBe('');
    });

    test('should handle edge cases', () => {
      expect(OrdinalModifier.transform('0')).toBe('0th');
      expect(OrdinalModifier.transform('1000')).toBe('1000th');
      expect(OrdinalModifier.transform('1001')).toBe('1001st');
      expect(OrdinalModifier.transform('1011')).toBe('1011th');
    });
  });
});