import { Parser } from '../src/Parser';

describe('Complexity Calculation', () => {
  let parser: Parser;

  beforeEach(() => {
    parser = new Parser();
  });

  describe('calculateRuleComplexity', () => {
    it('should calculate complexity for simple static rules', () => {
      parser.addRule('colors', ['red', 'blue', 'green']);
      
      const result = parser.calculateRuleComplexity('colors');
      
      expect(result.complexity).toBe(3);
      expect(result.ruleType).toBe('static');
      expect(result.isFinite).toBe(true);
      expect(result.variables).toEqual([]);
      expect(result.warnings).toEqual([]);
    });

    it('should calculate complexity for rules with variables', () => {
      parser.addRule('colors', ['red', 'blue']);
      parser.addRule('animals', ['cat', 'dog', 'bird']);
      parser.addRule('description', ['The %colors% %animals%']);
      
      const result = parser.calculateRuleComplexity('description');
      
      expect(result.complexity).toBe(6); // 2 colors × 3 animals
      expect(result.ruleType).toBe('static');
      expect(result.isFinite).toBe(true);
      expect(result.variables).toEqual(['colors', 'animals']);
      expect(result.warnings).toEqual([]);
    });

    it('should calculate complexity for mixed literal and variable rules', () => {
      parser.addRule('colors', ['red', 'blue']);
      parser.addRule('items', ['apple', '%colors% flower']);
      
      const result = parser.calculateRuleComplexity('items');
      
      expect(result.complexity).toBe(3); // 1 literal + 2 colored flowers
      expect(result.ruleType).toBe('static');
      expect(result.isFinite).toBe(true);
      expect(result.variables).toEqual(['colors']);
    });

    it('should calculate complexity for nested variables', () => {
      parser.addRule('colors', ['red', 'blue']);
      parser.addRule('colored_items', ['%colors% flower']);
      parser.addRule('garden', ['I see %colored_items%']);
      
      const result = parser.calculateRuleComplexity('garden');
      
      expect(result.complexity).toBe(2); // red flower, blue flower
      expect(result.variables).toEqual(['colored_items']);
    });

    it('should calculate complexity for weighted rules', () => {
      parser.addWeightedRule('rarity', 
        ['common', 'rare', 'legendary'], 
        [0.7, 0.25, 0.05]
      );
      
      const result = parser.calculateRuleComplexity('rarity');
      
      expect(result.complexity).toBe(3);
      expect(result.ruleType).toBe('weighted');
      expect(result.isFinite).toBe(true);
    });

    it('should calculate complexity for range rules', () => {
      parser.addRangeRule('age', { min: 18, max: 65, step: 1, type: 'integer' });
      
      const result = parser.calculateRuleComplexity('age');
      
      expect(result.complexity).toBe(48); // (65-18)/1 + 1
      expect(result.ruleType).toBe('range');
      expect(result.isFinite).toBe(true);
    });

    it('should calculate complexity for range rules with custom step', () => {
      parser.addRangeRule('decades', { min: 1900, max: 2000, step: 10, type: 'integer' });
      
      const result = parser.calculateRuleComplexity('decades');
      
      expect(result.complexity).toBe(11); // (2000-1900)/10 + 1
      expect(result.ruleType).toBe('range');
    });

    it('should calculate complexity for template rules', () => {
      parser.addTemplateRule('address', {
        template: '%number% %street% %type%',
        variables: {
          number: ['123', '456'],
          street: ['Oak', 'Pine', 'Maple'],
          type: ['St', 'Ave']
        }
      });
      
      const result = parser.calculateRuleComplexity('address');
      
      expect(result.complexity).toBe(12); // 2 × 3 × 2
      expect(result.ruleType).toBe('template');
      expect(result.variables).toEqual(['number', 'street', 'type']);
    });

    it('should calculate complexity for sequential rules', () => {
      parser.addSequentialRule('weekdays', ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
      
      const result = parser.calculateRuleComplexity('weekdays');
      
      expect(result.complexity).toBe(5);
      expect(result.ruleType).toBe('sequential');
    });

    it('should calculate complexity for conditional rules', () => {
      parser.addConditionalRule('greeting', {
        conditions: [
          {
            if: (ctx) => ctx.time === 'morning',
            then: ['Good morning', 'Morning!']
          },
          {
            default: ['Hello', 'Hi', 'Hey']
          }
        ]
      });
      
      const result = parser.calculateRuleComplexity('greeting');
      
      expect(result.complexity).toBe(5); // 2 morning + 3 default
      expect(result.ruleType).toBe('conditional');
    });

    it('should handle function rules with infinite complexity', () => {
      parser.addFunctionRule('dynamic', () => ['value']);
      
      const result = parser.calculateRuleComplexity('dynamic');
      
      expect(result.complexity).toBe(Number.POSITIVE_INFINITY);
      expect(result.ruleType).toBe('function');
      expect(result.isFinite).toBe(false);
      expect(result.warnings).toContain("Function rule 'dynamic' has infinite complexity (cannot be calculated)");
    });

    it('should detect circular references', () => {
      parser.addRule('a', ['%b%']);
      parser.addRule('b', ['%a%']);
      
      const result = parser.calculateRuleComplexity('a');
      
      expect(result.complexity).toBe(1);
      expect(result.ruleType).toBe('static'); // The rule type is still static, but it has circular warnings
      expect(result.warnings).toContain("Circular reference detected for rule 'a'");
    });

    it('should handle missing rule references', () => {
      parser.addRule('broken', ['%missing% item']);
      
      const result = parser.calculateRuleComplexity('broken');
      
      expect(result.complexity).toBe(1); // Treats missing as 1 possibility
      expect(result.warnings).toContain("Missing rule 'missing' referenced in 'broken'");
    });

    it('should respect maximum depth', () => {
      parser.addRule('deep1', ['%deep2%']);
      parser.addRule('deep2', ['%deep3%']);
      parser.addRule('deep3', ['%deep4%']);
      parser.addRule('deep4', ['%deep5%']);
      parser.addRule('deep5', ['value']);
      
      const result = parser.calculateRuleComplexity('deep1', new Set(), 2);
      
      expect(result.ruleType).toBe('static'); // Will still be static but with warnings
      expect(result.warnings.some(w => w.includes('Maximum depth'))).toBe(true);
    });

    it('should throw error for non-existent rules', () => {
      expect(() => {
        parser.calculateRuleComplexity('nonexistent');
      }).toThrow("Rule 'nonexistent' does not exist");
    });
  });

  describe('calculateTotalComplexity', () => {
    it('should calculate total complexity for simple grammar', () => {
      parser.addRule('colors', ['red', 'blue']);
      parser.addRule('animals', ['cat', 'dog', 'bird']);
      
      const result = parser.calculateTotalComplexity();
      
      expect(result.totalComplexity).toBe(5); // 2 + 3
      expect(result.isFinite).toBe(true);
      expect(result.ruleCount).toBe(2);
      expect(result.averageComplexity).toBe(2.5);
      expect(result.warnings).toEqual([]);
    });

    it('should calculate total complexity with interconnected rules', () => {
      parser.addRule('colors', ['red', 'blue']);
      parser.addRule('animals', ['cat', 'dog']);
      parser.addRule('description', ['%colors% %animals%']);
      
      const result = parser.calculateTotalComplexity();
      
      expect(result.totalComplexity).toBe(8); // 2 + 2 + 4
      expect(result.ruleCount).toBe(3);
      expect(result.mostComplexRules[0].ruleName).toBe('description');
      expect(result.mostComplexRules[0].complexity).toBe(4);
    });

    it('should handle infinite complexity rules', () => {
      parser.addRule('colors', ['red', 'blue']);
      parser.addFunctionRule('dynamic', () => ['value']);
      
      const result = parser.calculateTotalComplexity();
      
      expect(result.totalComplexity).toBe(Number.POSITIVE_INFINITY);
      expect(result.isFinite).toBe(false);
      expect(result.ruleCount).toBe(2);
    });

    it('should detect circular references in total complexity', () => {
      parser.addRule('a', ['%b%']);
      parser.addRule('b', ['%a%']);
      parser.addRule('normal', ['value']);
      
      const result = parser.calculateTotalComplexity();
      
      expect(result.circularReferences).toContain('a');
      expect(result.circularReferences).toContain('b');
      expect(result.ruleCount).toBe(3);
    });

    it('should provide meaningful statistics', () => {
      parser.addRule('simple', ['a']);
      parser.addRule('medium', ['a', 'b', 'c']);
      parser.addRule('complex', ['%simple%', '%medium%']);
      parser.addRangeRule('numbers', { min: 1, max: 10, type: 'integer' });
      
      const result = parser.calculateTotalComplexity();
      
      expect(result.ruleCount).toBe(4);
      expect(result.averageComplexity).toBeGreaterThan(0);
      expect(result.mostComplexRules.length).toBeGreaterThan(0);
      expect(result.complexityByRule.length).toBe(4);
      
      // Check that each rule has proper analysis
      const complexityByName = result.complexityByRule.reduce((acc, rule) => {
        acc[rule.ruleName] = rule;
        return acc;
      }, {} as any);
      
      expect(complexityByName['simple'].complexity).toBe(1);
      expect(complexityByName['medium'].complexity).toBe(3);
      expect(complexityByName['complex'].complexity).toBe(4); // 1 + 3
      expect(complexityByName['numbers'].complexity).toBe(10);
    });

    it('should handle empty grammar', () => {
      const result = parser.calculateTotalComplexity();
      
      expect(result.totalComplexity).toBe(0);
      expect(result.isFinite).toBe(true);
      expect(result.ruleCount).toBe(0);
      expect(result.averageComplexity).toBe(0);
      expect(result.mostComplexRules).toEqual([]);
    });

    it('should handle template rules with local variables only', () => {
      parser.addTemplateRule('item', {
        template: '%color% %type%',
        variables: {
          color: ['red', 'blue'],
          type: ['flower', 'car']
        }
      });
      
      const result = parser.calculateTotalComplexity();
      
      const itemRule = result.complexityByRule.find(r => r.ruleName === 'item');
      expect(itemRule?.complexity).toBe(4); // 2 colors × 2 types
      expect(itemRule?.variables).toContain('color');
      expect(itemRule?.variables).toContain('type');
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle rules with empty arrays', () => {
      parser.addRule('empty', []);
      
      const result = parser.calculateRuleComplexity('empty');
      
      expect(result.complexity).toBe(0);
      expect(result.ruleType).toBe('static');
    });

    it('should handle complex nested structures', () => {
      parser.addRule('adjectives', ['big', 'small']);
      parser.addRule('colors', ['red', 'blue']);
      parser.addRule('nouns', ['cat', 'dog']);
      parser.addRule('phrase', ['%adjectives% %colors% %nouns%']);
      parser.addRule('sentence', ['I see a %phrase%.']);
      
      const result = parser.calculateRuleComplexity('sentence');
      
      expect(result.complexity).toBe(8); // 2 × 2 × 2
      expect(result.variables).toEqual(['phrase']);
    });

    it('should provide unique warnings', () => {
      parser.addRule('broken1', ['%missing% item']);
      parser.addRule('broken2', ['%missing% thing']);
      
      const result = parser.calculateTotalComplexity();
      
      const missingWarnings = result.warnings.filter(w => w.includes('missing'));
      expect(missingWarnings.length).toBe(2); // One for each broken rule
    });
  });
});