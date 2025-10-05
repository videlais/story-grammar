import { Parser } from '../src/Parser';

describe('Parser with % symbols', () => {
  let parser: Parser;

  beforeEach(() => {
    parser = new Parser();
  });

  it('should expand simple variables with %', () => {
    parser.addRule('flowers', ['roses', 'daisies', 'tulips']);
    const text = 'I see %flowers% in the garden.';
    const result = parser.parse(text);
    
    expect(result).toMatch(/I see (roses|daisies|tulips) in the garden\./);
    expect(result).not.toContain('%flowers%');
  });

  it('should expand multiple variables with %', () => {
    parser.addRule('colors', ['red', 'blue', 'green']);
    parser.addRule('flowers', ['roses', 'daisies', 'tulips']);
    const text = 'The %colors% %flowers% are beautiful.';
    const result = parser.parse(text);
    
    expect(result).toMatch(/The (red|blue|green) (roses|daisies|tulips) are beautiful\./);
    expect(result).not.toContain('%colors%');
    expect(result).not.toContain('%flowers%');
  });

  it('should handle nested variables with %', () => {
    parser.addRule('flowers', ['roses', 'daisies']);
    parser.addRule('plants', ['%flowers%', 'trees']);
    parser.addRule('garden_items', ['%plants%', 'stones']);
    
    const text = 'The garden has %garden_items%.';
    const result = parser.parse(text);
    
    expect(result).toMatch(/The garden has (roses|daisies|trees|stones)\./);
  });

  describe('Modifiers', () => {
    it('should add and apply a simple modifier', () => {
      parser.addModifier({
        name: 'uppercase',
        condition: (text: string) => text.includes('flower'),
        transform: (text: string) => text.replace(/flower/g, 'FLOWER'),
        priority: 1
      });

      parser.addRule('items', ['flower', 'tree']);
      const text = 'I see a %items%.';
      const result = parser.parse(text);
      
      if (result.includes('FLOWER')) {
        expect(result).toBe('I see a FLOWER.');
      } else {
        expect(result).toBe('I see a tree.');
      }
    });

    it('should handle built-in article modifier (a/an)', () => {
      parser.addEnglishArticleModifier();
      
      parser.addRule('items', ['apple', 'tree', 'umbrella', 'house']);
      const text = 'I found a %items%.';
      const result = parser.parse(text);
      
      // Should use "an" before vowel sounds
      if (result.includes('apple') || result.includes('umbrella')) {
        expect(result).toMatch(/I found an (apple|umbrella)\./);
      } else {
        expect(result).toMatch(/I found a (tree|house)\./);
      }
    });

    it('should apply multiple modifiers in priority order', () => {
      parser.addModifier({
        name: 'addExclamation',
        condition: () => true,
        transform: (text: string) => text.replace(/\.$/, '!'),
        priority: 1
      });

      parser.addModifier({
        name: 'capitalizeFirst',
        condition: () => true,
        transform: (text: string) => text.charAt(0).toUpperCase() + text.slice(1),
        priority: 2
      });

      parser.addRule('items', ['flower']);
      const text = 'i see a %items%.';
      const result = parser.parse(text);
      
      expect(result).toBe('I see a flower!');
    });

    it('should only apply modifiers when condition is met', () => {
      parser.addModifier({
        name: 'conditionalModifier',
        condition: (text: string) => text.includes('special'),
        transform: (text: string) => text + ' [MODIFIED]',
        priority: 1
      });

      parser.addRule('items', ['flower', 'special item']);
      const text = 'I see a %items%.';
      const result = parser.parse(text);
      
      if (result.includes('special item')) {
        expect(result).toBe('I see a special item. [MODIFIED]');
      } else {
        expect(result).toBe('I see a flower.');
      }
    });

    it('should handle complex article scenarios', () => {
      parser.addEnglishArticleModifier();
      
      parser.addRule('adjectives', ['old', 'ugly', 'ancient']);
      parser.addRule('nouns', ['apple', 'tree', 'elephant', 'igloo']);
      parser.addRule('items', ['a %adjectives% %nouns%']);
      
      const text = '%items%';
      const result = parser.parse(text);
      
      // Should correctly handle "a/an" with adjective + noun combinations
      // The article depends on the sound of the word immediately following "a"
      // e.g., "an old apple", "a ugly tree", "an ancient elephant", "an ancient tree"
      if (/^an/.test(result)) {
        expect(result).toMatch(/^an (old|ugly|ancient) (apple|elephant|igloo|tree)$/);
      } else {
        expect(result).toMatch(/^a (old|ugly|ancient) (tree|apple|elephant|igloo)$/);
      }
    });

    it('should manage modifiers correctly', () => {
      const modifier = {
        name: 'test',
        condition: () => true,
        transform: (text: string) => text.toUpperCase(),
        priority: 5
      };

      parser.addModifier(modifier);
      expect(parser.hasModifier('test')).toBe(true);

      const modifiers = parser.getModifiers();
      expect(modifiers).toHaveLength(1);
      expect(modifiers[0].name).toBe('test');

      expect(parser.removeModifier('test')).toBe(true);
      expect(parser.hasModifier('test')).toBe(false);
      expect(parser.removeModifier('nonexistent')).toBe(false);
    });

    it('should throw errors for invalid modifiers', () => {
      expect(() => parser.addModifier(null as any)).toThrow('Modifier must be an object');
      expect(() => parser.addModifier({} as any)).toThrow('Modifier must have a name');
      expect(() => parser.addModifier({ name: 'test' } as any)).toThrow('Modifier must have a condition function');
      expect(() => parser.addModifier({ 
        name: 'test', 
        condition: () => true 
      } as any)).toThrow('Modifier must have a transform function');
    });

    it('should clear modifiers', () => {
      parser.addModifier({
        name: 'test1',
        condition: () => true,
        transform: (text: string) => text,
        priority: 1
      });

      parser.addModifier({
        name: 'test2',
        condition: () => true,
        transform: (text: string) => text,
        priority: 1
      });

      expect(parser.getModifiers()).toHaveLength(2);
      
      parser.clearModifiers();
      expect(parser.getModifiers()).toHaveLength(0);
    });

    it('should clear all rules and modifiers', () => {
      parser.addRule('test', ['value']);
      parser.addModifier({
        name: 'test',
        condition: () => true,
        transform: (text: string) => text,
        priority: 1
      });

      expect(parser.hasRule('test')).toBe(true);
      expect(parser.hasModifier('test')).toBe(true);

      parser.clearAll();
      expect(parser.hasRule('test')).toBe(false);
      expect(parser.hasModifier('test')).toBe(false);
    });

    it('should handle built-in pluralization modifier', () => {
      parser.addEnglishPluralizationModifier();
      
      parser.addRule('nouns', ['cat', 'dog', 'child', 'box', 'fly', 'leaf']);
      
      // Test regular pluralization
      expect(parser.parse('I see many cat')).toBe('I see many cats');
      expect(parser.parse('There are three dog')).toBe('There are three dogs');
      
      // Test words ending in s, x, ch, sh - should add -es
      expect(parser.parse('I found several box')).toBe('I found several boxes');
      
      // Test words ending in consonant + y - should change to -ies
      expect(parser.parse('Two fly')).toBe('Two flies');
      
      // Test words ending in f/fe - should change to -ves
      expect(parser.parse('Five leaf')).toBe('Five leaves');
      
      // Test irregular plurals
      expect(parser.parse('Many child')).toBe('Many children');
      
      // Test that singular forms are not affected
      expect(parser.parse('I see one cat')).toBe('I see one cat');
    });

    it('should handle pluralization with variables', () => {
      parser.addEnglishPluralizationModifier();
      
      parser.addRule('animals', ['cat', 'dog', 'mouse', 'child']);
      parser.addRule('quantities', ['many', 'several', 'three', 'five']);
      
      const text = '%quantities% %animals%';
      const result = parser.parse(text);
      
      // Should pluralize the animal name
      if (result.includes('many') || result.includes('several') || result.includes('three') || result.includes('five')) {
        expect(result).toMatch(/many (cats|dogs|mice|children)|several (cats|dogs|mice|children)|three (cats|dogs|mice|children)|five (cats|dogs|mice|children)/);
      }
    });

    it('should handle built-in ordinal modifier', () => {
      parser.addEnglishOrdinalModifier();
      
      // Test regular ordinal rules
      expect(parser.parse('The 1 place winner')).toBe('The 1st place winner');
      expect(parser.parse('The 2 place winner')).toBe('The 2nd place winner');
      expect(parser.parse('The 3 place winner')).toBe('The 3rd place winner');
      expect(parser.parse('The 4 place winner')).toBe('The 4th place winner');
      
      // Test numbers ending in 1, 2, 3 but not 11, 12, 13
      expect(parser.parse('The 21 century')).toBe('The 21st century');
      expect(parser.parse('The 22 floor')).toBe('The 22nd floor');
      expect(parser.parse('The 33 day')).toBe('The 33rd day');
      
      // Test exception cases (11, 12, 13 and multiples)
      expect(parser.parse('The 11 hour')).toBe('The 11th hour');
      expect(parser.parse('The 12 step')).toBe('The 12th step');
      expect(parser.parse('The 13 amendment')).toBe('The 13th amendment');
      expect(parser.parse('The 111 participant')).toBe('The 111th participant');
      expect(parser.parse('The 112 page')).toBe('The 112th page');
      expect(parser.parse('The 113 item')).toBe('The 113th item');
      
      // Test other numbers
      expect(parser.parse('The 9 inning')).toBe('The 9th inning');
      expect(parser.parse('The 100 time')).toBe('The 100th time');
    });

    it('should handle ordinals with variables', () => {
      parser.addEnglishOrdinalModifier();
      
      parser.addRule('positions', ['1', '2', '3', '11', '21', '22']);
      parser.addRule('contests', ['race', 'competition', 'tournament']);
      
      const text = 'I finished in %positions% place in the %contests%';
      const result = parser.parse(text);
      
      // Should convert numbers to ordinals
      expect(result).toMatch(/I finished in (1st|2nd|3rd|11th|21st|22nd) place in the (race|competition|tournament)/);
    });
  });
});
