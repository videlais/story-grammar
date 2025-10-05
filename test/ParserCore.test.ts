import { Parser } from '../src/Parser';
import {
  Grammar,
  ConditionalRule,
  SequentialRule,
  RangeRule,
  TemplateRule,
  WeightedRule,
  FunctionRule,
  Modifier,
  ParseOptions
} from '../src/types';

describe('ParserCore Comprehensive Coverage', () => {
  let parser: Parser;

  beforeEach(() => {
    parser = new Parser();
  });

  describe('WeightedRule Tests', () => {
    it('should handle weighted rules correctly', () => {
      parser.addWeightedRule('colors', ['red', 'blue', 'green'], [0.5, 0.3, 0.2]);
      parser.setRandomSeed(12345); // For deterministic testing
      
      const result = parser.parse('%colors%');
      expect(['red', 'blue', 'green']).toContain(result);
    });

    it('should validate weighted rule parameters', () => {
      // Test mismatched array lengths
      expect(() => {
        parser.addWeightedRule('test', ['a', 'b'], [0.5]);
      }).toThrow('Values and weights arrays must have the same length');

      // Test empty arrays
      expect(() => {
        parser.addWeightedRule('test', [], []);
      }).toThrow('Values array cannot be empty');

      // Test negative weights
      expect(() => {
        parser.addWeightedRule('test', ['a'], [-0.5]);
      }).toThrow('All weights must be non-negative numbers');

      // Test weights not summing to 1.0
      expect(() => {
        parser.addWeightedRule('test', ['a', 'b'], [0.3, 0.5]);
      }).toThrow('Weights must sum to 1.0');

      // Test non-number weights
      expect(() => {
        parser.addWeightedRule('test', ['a'], ['invalid' as any]);
      }).toThrow('All weights must be non-negative numbers');
    });

    it('should handle weighted rule management', () => {
      parser.addWeightedRule('test', ['a'], [1.0]);
      expect(parser.hasWeightedRule('test')).toBe(true);
      expect(parser.removeWeightedRule('test')).toBe(true);
      expect(parser.hasWeightedRule('test')).toBe(false);
      expect(parser.removeWeightedRule('nonexistent')).toBe(false);
    });

    it('should clear all weighted rules', () => {
      parser.addWeightedRule('test1', ['a'], [1.0]);
      parser.addWeightedRule('test2', ['b'], [1.0]);
      parser.clearWeightedRules();
      expect(parser.hasWeightedRule('test1')).toBe(false);
      expect(parser.hasWeightedRule('test2')).toBe(false);
    });
  });

  describe('ConditionalRule Tests', () => {
    it('should handle conditional rules with context', () => {
      const conditionalRule: ConditionalRule = {
        conditions: [
          {
            if: (context) => context.mood === 'happy',
            then: ['joyful', 'excited', 'cheerful']
          },
          {
            if: (context) => context.mood === 'sad',
            then: ['melancholy', 'somber', 'glum']
          },
          {
            default: ['neutral', 'calm']
          }
        ]
      };

      parser.addConditionalRule('feeling', conditionalRule);
      parser.addRule('mood', ['happy', 'sad', 'unknown']);
      
      // Test with different moods
      const result = parser.parse('%mood% %feeling%');
      expect(result).toMatch(/^(happy|sad|unknown) (joyful|excited|cheerful|melancholy|somber|glum|neutral|calm)$/);
    });

    it('should validate conditional rule parameters', () => {
      // Test empty conditions array
      expect(() => {
        parser.addConditionalRule('test', { conditions: [] });
      }).toThrow('Conditions array cannot be empty');

      // Test multiple default conditions
      expect(() => {
        parser.addConditionalRule('test', {
          conditions: [
            { default: ['a'] },
            { default: ['b'] }
          ]
        });
      }).toThrow('Only one default condition is allowed');

      // Test invalid condition structure
      expect(() => {
        parser.addConditionalRule('test', {
          conditions: [
            { if: 'invalid' as any, then: ['a'] }
          ]
        });
      }).toThrow('Condition "if" must be a function');

      // Test invalid then array
      expect(() => {
        parser.addConditionalRule('test', {
          conditions: [
            { if: () => true, then: 'invalid' as any }
          ]
        });
      }).toThrow('Condition "then" must be an array of values');

      // Test invalid default array
      expect(() => {
        parser.addConditionalRule('test', {
          conditions: [
            { default: 'invalid' as any }
          ]
        });
      }).toThrow('Default condition must have an array of values');

      // Test condition without if/then or default
      expect(() => {
        parser.addConditionalRule('test', {
          conditions: [
            {} as any
          ]
        });
      }).toThrow('Each condition must have either "if/then" or "default"');
    });

    it('should handle conditional rule management', () => {
      const rule: ConditionalRule = {
        conditions: [{ default: ['test'] }]
      };
      
      parser.addConditionalRule('test', rule);
      expect(parser.hasConditionalRule('test')).toBe(true);
      expect(parser.removeConditionalRule('test')).toBe(true);
      expect(parser.hasConditionalRule('test')).toBe(false);
      expect(parser.removeConditionalRule('nonexistent')).toBe(false);
    });

    it('should clear all conditional rules', () => {
      const rule: ConditionalRule = {
        conditions: [{ default: ['test'] }]
      };
      
      parser.addConditionalRule('test1', rule);
      parser.addConditionalRule('test2', rule);
      parser.clearConditionalRules();
      expect(parser.hasConditionalRule('test1')).toBe(false);
      expect(parser.hasConditionalRule('test2')).toBe(false);
    });

    it('should handle conditional rule without matching condition', () => {
      const conditionalRule: ConditionalRule = {
        conditions: [
          {
            if: (context) => context.nonexistent === 'value',
            then: ['should not match']
          }
        ]
      };

      parser.addConditionalRule('test', conditionalRule);
      
      expect(() => {
        parser.parse('%test%');
      }).toThrow('No matching condition found and no default provided');
    });
  });

  describe('SequentialRule Tests', () => {
    it('should cycle through values in order', () => {
      parser.addSequentialRule('sequence', ['first', 'second', 'third'], { cycle: true });
      
      expect(parser.parse('%sequence%')).toBe('first');
      expect(parser.parse('%sequence%')).toBe('second');
      expect(parser.parse('%sequence%')).toBe('third');
      expect(parser.parse('%sequence%')).toBe('first'); // Should cycle back
    });

    it('should handle non-cycling sequential rules', () => {
      parser.addSequentialRule('sequence', ['first', 'second'], { cycle: false });
      
      expect(parser.parse('%sequence%')).toBe('first');
      expect(parser.parse('%sequence%')).toBe('second');
      expect(parser.parse('%sequence%')).toBe('second'); // Should stick to last value
    });

    it('should reset sequential rules', () => {
      parser.addSequentialRule('sequence', ['first', 'second', 'third']);
      
      parser.parse('%sequence%'); // first
      parser.parse('%sequence%'); // second
      
      expect(parser.resetSequentialRule('sequence')).toBe(true);
      expect(parser.parse('%sequence%')).toBe('first'); // Back to start
      
      expect(parser.resetSequentialRule('nonexistent')).toBe(false);
    });

    it('should validate sequential rule parameters', () => {
      expect(() => {
        parser.addSequentialRule('test', []);
      }).toThrow('Values must be a non-empty array');

      expect(() => {
        parser.addSequentialRule('', ['test']);
      }).toThrow('Key must be a non-empty string');
    });

    it('should handle sequential rule management', () => {
      parser.addSequentialRule('test', ['a', 'b']);
      expect(parser.hasSequentialRule('test')).toBe(true);
      expect(parser.removeSequentialRule('test')).toBe(true);
      expect(parser.hasSequentialRule('test')).toBe(false);
      expect(parser.removeSequentialRule('nonexistent')).toBe(false);
    });

    it('should clear all sequential rules', () => {
      parser.addSequentialRule('test1', ['a']);
      parser.addSequentialRule('test2', ['b']);
      parser.clearSequentialRules();
      expect(parser.hasSequentialRule('test1')).toBe(false);
      expect(parser.hasSequentialRule('test2')).toBe(false);
    });
  });

  describe('RangeRule Tests', () => {
    it('should generate integer values in range', () => {
      parser.addRangeRule('number', { min: 1, max: 10, type: 'integer' });
      parser.setRandomSeed(12345);
      
      const result = parseInt(parser.parse('%number%'));
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThan(10);
      expect(Number.isInteger(result)).toBe(true);
    });

    it('should generate float values in range', () => {
      parser.addRangeRule('decimal', { min: 0, max: 1, type: 'float' });
      parser.setRandomSeed(12345);
      
      const result = parseFloat(parser.parse('%decimal%'));
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThan(1);
    });

    it('should handle stepped ranges', () => {
      parser.addRangeRule('stepped', { min: 0, max: 10, step: 2, type: 'integer' });
      parser.setRandomSeed(12345);
      
      const result = parseInt(parser.parse('%stepped%'));
      expect([0, 2, 4, 6, 8, 10]).toContain(result);
    });

    it('should handle float stepped ranges', () => {
      parser.addRangeRule('floatStepped', { min: 0, max: 1, step: 0.25, type: 'float' });
      parser.setRandomSeed(12345);
      
      const result = parseFloat(parser.parse('%floatStepped%'));
      expect([0, 0.25, 0.5, 0.75, 1].some(val => Math.abs(val - result) < 0.001)).toBe(true);
    });

    it('should validate range rule parameters', () => {
      expect(() => {
        parser.addRangeRule('test', { min: 10, max: 5, type: 'integer' });
      }).toThrow('Min must be less than max');

      expect(() => {
        parser.addRangeRule('test', { min: 'invalid' as any, max: 5, type: 'integer' });
      }).toThrow('Min and max must be numbers');

      expect(() => {
        parser.addRangeRule('test', { min: 0, max: 5, step: -1, type: 'integer' });
      }).toThrow('Step must be a positive number');

      expect(() => {
        parser.addRangeRule('test', { min: 0, max: 5, type: 'invalid' as any });
      }).toThrow('Type must be "integer" or "float"');

      expect(() => {
        parser.addRangeRule('', { min: 0, max: 5, type: 'integer' });
      }).toThrow('Key must be a non-empty string');
    });

    it('should handle range rule management', () => {
      parser.addRangeRule('test', { min: 0, max: 5, type: 'integer' });
      expect(parser.hasRangeRule('test')).toBe(true);
      expect(parser.removeRangeRule('test')).toBe(true);
      expect(parser.hasRangeRule('test')).toBe(false);
      expect(parser.removeRangeRule('nonexistent')).toBe(false);
    });

    it('should clear all range rules', () => {
      parser.addRangeRule('test1', { min: 0, max: 5, type: 'integer' });
      parser.addRangeRule('test2', { min: 0, max: 10, type: 'float' });
      parser.clearRangeRules();
      expect(parser.hasRangeRule('test1')).toBe(false);
      expect(parser.hasRangeRule('test2')).toBe(false);
    });
  });

  describe('TemplateRule Tests', () => {
    it('should expand template variables', () => {
      const templateRule: TemplateRule = {
        template: 'Hello %name%, you are %age% years old',
        variables: {
          name: ['Alice', 'Bob'],
          age: ['25', '30']
        }
      };

      parser.addTemplateRule('greeting', templateRule);
      const result = parser.parse('%greeting%');
      
      expect(result).toMatch(/^Hello (Alice|Bob), you are (25|30) years old$/);
    });

    it('should validate template rule parameters', () => {
      expect(() => {
        parser.addTemplateRule('', { template: 'test', variables: {} });
      }).toThrow('Key must be a non-empty string');

      expect(() => {
        parser.addTemplateRule('test', { template: '', variables: {} });
      }).toThrow('Template must be a non-empty string');

      expect(() => {
        parser.addTemplateRule('test', { template: 'test', variables: null as any });
      }).toThrow('Variables must be an object');

      expect(() => {
        parser.addTemplateRule('test', {
          template: '%missing% template',
          variables: { existing: ['value'] }
        });
      }).toThrow('Template variable \'missing\' not found in variables object');

      expect(() => {
        parser.addTemplateRule('test', {
          template: '%name% template',
          variables: { name: 'not_array' as any }
        });
      }).toThrow('Variable \'name\' must be an array');
    });

    it('should handle template rule management', () => {
      const rule: TemplateRule = {
        template: 'test %var%',
        variables: { var: ['value'] }
      };
      
      parser.addTemplateRule('test', rule);
      expect(parser.hasTemplateRule('test')).toBe(true);
      expect(parser.removeTemplateRule('test')).toBe(true);
      expect(parser.hasTemplateRule('test')).toBe(false);
      expect(parser.removeTemplateRule('nonexistent')).toBe(false);
    });

    it('should clear all template rules', () => {
      const rule: TemplateRule = {
        template: 'test %var%',
        variables: { var: ['value'] }
      };
      
      parser.addTemplateRule('test1', rule);
      parser.addTemplateRule('test2', rule);
      parser.clearTemplateRules();
      expect(parser.hasTemplateRule('test1')).toBe(false);
      expect(parser.hasTemplateRule('test2')).toBe(false);
    });
  });

  describe('FunctionRule Error Handling', () => {
    it('should handle function rule errors', () => {
      parser.addFunctionRule('errorRule', () => {
        throw new Error('Function rule error');
      });

      expect(() => {
        parser.parse('%errorRule%');
      }).toThrow('Error executing function rule \'errorRule\': Function rule error');
    });

    it('should handle function rule returning non-array', () => {
      parser.addFunctionRule('invalidRule', () => 'not an array' as any);

      expect(() => {
        parser.parse('%invalidRule%');
      }).toThrow('Function rule \'invalidRule\' must return an array');
    });

    it('should handle function rule returning empty array', () => {
      parser.addFunctionRule('emptyRule', () => []);

      const result = parser.parse('%emptyRule%');
      expect(result).toBe('%emptyRule%'); // Should return original variable
    });
  });

  describe('Advanced Parsing Features', () => {
    it('should handle safeParse with validation errors', () => {
      parser.addRule('test', ['%missing%']);
      
      const result = parser.safeParse('%test%', { validateFirst: true });
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Validation failed');
      expect(result.validation).toBeDefined();
      expect(result.validation!.missingRules).toContain('missing');
    });

    it('should handle safeParse with validation errors', () => {
      parser.addRules({ test: ['%missing%'] });  // Reference non-existent rule
      
      const result = parser.safeParse('test', { maxAttempts: 2 });
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('missing rules');
      expect(result.validation).toBeDefined();  // Validation result should be included
    });

    it('should handle safeParse without validation', () => {
      parser.addRule('test', ['value']);
      
      const result = parser.safeParse('%test%', { validateFirst: false });
      
      expect(result.success).toBe(true);
      expect(result.result).toBe('value');
      expect(result.attempts).toBe(1);
    });

    it('should handle parseWithTiming', () => {
      parser.addRule('test', ['value']);
      
      const result = parser.parseWithTiming('%test%');
      
      expect(result.result).toBe('value');
      expect(result.timing.totalMs).toBeGreaterThanOrEqual(0);
      expect(result.timing.expansionMs).toBeGreaterThanOrEqual(0);
      expect(result.timing.modifierMs).toBeGreaterThanOrEqual(0);
    });

    it('should handle generateVariations', () => {
      parser.addRule('colors', ['red', 'blue', 'green']);
      
      const variations = parser.generateVariations('%colors%', 5, 12345);
      
      expect(variations).toHaveLength(5);
      variations.forEach(variation => {
        expect(['red', 'blue', 'green']).toContain(variation);
      });

      // Should be reproducible with same seed
      const variations2 = parser.generateVariations('%colors%', 5, 12345);
      expect(variations).toEqual(variations2);
    });

    it('should handle generateVariations input validation', () => {
      expect(() => {
        parser.generateVariations(123 as any, 3);
      }).toThrow('Text must be a string');

      expect(() => {
        parser.generateVariations('%test%', -1);
      }).toThrow('Count must be a positive integer');

      expect(() => {
        parser.generateVariations('%test%', 1.5);
      }).toThrow('Count must be a positive integer');
    });

    it('should handle parseBatch', () => {
      parser.addRule('items', ['apple', 'banana']);
      
      const texts = ['I like %items%', 'The %items% is good'];
      const results = parser.parseBatch(texts, false);
      
      expect(results).toHaveLength(2);
      results.forEach(result => {
        expect(result).toMatch(/(apple|banana)/);
      });
    });

    it('should handle parseBatch input validation', () => {
      expect(() => {
        parser.parseBatch('not an array' as any);
      }).toThrow('Texts must be an array');
    });
  });

  describe('Analysis and Optimization', () => {
    it('should analyze rule complexity with specific rule', () => {
      parser.addRule('simple', ['test']);
      parser.addRule('complex', ['%simple% with %simple% and more %simple%']);
      
      const analysis = parser.analyzeRules('complex');
      
      expect(analysis.ruleDetails).toBeDefined();
      expect(analysis.ruleDetails!.name).toBe('complex');
      expect(analysis.ruleDetails!.type).toBe('static');
      expect(analysis.ruleDetails!.complexity).toBeGreaterThan(0);
      expect(analysis.ruleDetails!.variables).toContain('simple');
    });

    it('should analyze all rule types complexity', () => {
      parser.addRule('static', ['test']);
      parser.addFunctionRule('func', () => ['test']);
      parser.addWeightedRule('weighted', ['test'], [1.0]);
      parser.addConditionalRule('conditional', { conditions: [{ default: ['test'] }] });
      parser.addTemplateRule('template', { template: '%var%', variables: { var: ['test'] } });
      
      const analysis = parser.analyzeRules();
      
      expect(analysis.totalComplexity).toBeGreaterThan(0);
      expect(analysis.mostComplex.length).toBeGreaterThan(0);
    });

    it('should provide optimization suggestions for large numbers', () => {
      // Create many rules to trigger warnings
      for (let i = 0; i < 60; i++) {
        parser.addRule(`rule${i}`, [`value${i}`]);
      }
      
      const analysis = parser.analyzeRules();
      expect(analysis.suggestions).toContain('Large number of rules - consider organizing into groups');
    });

    it('should provide optimization warnings', () => {
      // Create many modifiers to trigger warnings
      for (let i = 0; i < 15; i++) {
        parser.addModifier({
          name: `modifier${i}`,
          condition: () => true,
          transform: (text) => text,
          priority: i
        });
      }
      
      const optimization = parser.optimize();
      
      expect(optimization.warnings).toContain('Many modifiers (15). High-priority modifiers run first.');
      expect(optimization.optimized).toBe(false);
    });

    it('should detect high complexity rules', () => {
      // Create enough rules to exceed complexity threshold of 100
      const rules: { [key: string]: string[] } = {};
      
      // Create many simple rules with complexity > 100
      for (let i = 1; i <= 50; i++) {
        rules[`rule${i}`] = [
          `%var1% %var2% %var3%`,  // Each has 3 variables = complexity 3
          `simple text ${i}`,
          `%var4% with %var5%`     // Additional complexity 2
        ];
      }
      
      // Add the referenced variables as simple rules
      for (let i = 1; i <= 5; i++) {
        rules[`var${i}`] = [`value${i}`];
      }
      
      parser.addRules(rules);
      
      const analysis = parser.analyzeRules();
      expect(analysis.suggestions).toContain('High total complexity - consider simplifying rules');
    });

    it('should suggest reducing max depth for performance', () => {
      parser.setMaxDepth(25);
      
      const optimization = parser.optimize();
      expect(optimization.suggestions).toContain('Consider reducing max depth for better performance.');
    });
  });

  describe('Error Handling and Validation', () => {
    it('should provide helpful error messages for recursion', () => {
      const error = new Error('Maximum recursion depth exceeded');
      const helpfulError = parser.getHelpfulError(error, { ruleName: 'testRule' });
      
      expect(helpfulError).toContain('Suggestions:');
      expect(helpfulError).toContain('Try reducing the maxDepth with setMaxDepth()');
      expect(helpfulError).toContain('Check for circular references in your grammar rules');
      expect(helpfulError).toContain('The rule \'testRule\' may be causing infinite recursion');
    });

    it('should provide helpful error messages for function rules', () => {
      const error = new Error('Function must return an array');
      const helpfulError = parser.getHelpfulError(error);
      
      expect(helpfulError).toContain('Function rules must return string arrays');
      expect(helpfulError).toContain('Check your function rule implementation');
    });

    it('should provide helpful error messages for weights', () => {
      const error = new Error('Weights must sum to 1.0');
      const helpfulError = parser.getHelpfulError(error);
      
      expect(helpfulError).toContain('Ensure all weights in weighted rules add up to exactly 1.0');
      expect(helpfulError).toContain('Use helper: weights = [0.5, 0.3, 0.2] for three items');
    });

    it('should provide helpful error messages for missing rules', () => {
      const error = new Error('Rule not found');
      parser.addRule('existing', ['%missing%']);
      
      const helpfulError = parser.getHelpfulError(error, { text: '%missing%' });
      
      expect(helpfulError).toContain('Check that all referenced rules are defined');
      expect(helpfulError).toContain('Use validate() method to find missing rules');
      expect(helpfulError).toContain('Missing rules: missing');
    });

    it('should provide validation info in error messages', () => {
      const error = new Error('Parsing failed');
      parser.addRule('empty', []);
      parser.addRule('circular', ['%circular%']);
      
      const helpfulError = parser.getHelpfulError(error, { text: '%empty%' });
      
      expect(helpfulError).toContain('Validation Issues:');
    });
  });

  describe('Utility Methods', () => {
    it('should handle clearReferences', () => {
      parser.addRule('test', ['value']);
      parser.parse('%test%'); // This sets references
      
      parser.clearReferences();
      const context = parser.getContext();
      expect(Object.keys(context)).toHaveLength(0);
    });

    it('should handle setMaxDepth validation', () => {
      expect(() => {
        parser.setMaxDepth(0);
      }).toThrow('Max depth must be at least 1');
    });

    it('should handle setRandomSeed validation', () => {
      expect(() => {
        parser.setRandomSeed('invalid' as any);
      }).toThrow('Seed must be an integer');

      expect(() => {
        parser.setRandomSeed(1.5);
      }).toThrow('Seed must be an integer');
    });

    it('should handle clone with function rules and complex rules', () => {
      parser.addRule('static', ['value']);
      parser.addFunctionRule('func', () => ['test']);
      parser.addWeightedRule('weighted', ['a'], [1.0]);
      parser.setMaxDepth(50);
      parser.setRandomSeed(12345);
      
      const cloned = parser.clone();
      
      // Only static rules should be cloned
      expect(cloned.hasRule('static')).toBe(true);
      expect(cloned.hasFunctionRule('func')).toBe(false);
      expect(cloned.hasWeightedRule('weighted')).toBe(false);
      expect(cloned.getMaxDepth()).toBe(50);
      expect(cloned.getRandomSeed()).toBe(12345);
    });

    it('should handle exportConfig', () => {
      parser.addRule('test', ['value']);
      parser.addModifier({
        name: 'testModifier',
        condition: () => true,
        transform: (text) => text
      });
      parser.setRandomSeed(12345);
      
      const config = parser.exportConfig();
      
      expect(config.grammar).toHaveProperty('test');
      expect(config.modifiers).toContain('testModifier');
      expect(config.settings.randomSeed).toBe(12345);
    });
  });

  describe('Edge Cases and Integration', () => {
    it('should handle complex nested rules with all types', () => {
      parser.addRule('base', ['hello']);
      parser.addSequentialRule('seq', ['first', 'second']);
      parser.addRangeRule('num', { min: 1, max: 3, type: 'integer' });
      parser.addTemplateRule('greeting', {
        template: '%base% %seq% time: %num%',
        variables: { base: ['hi'], seq: ['once'], num: ['1'] }
      });
      
      const result = parser.parse('Generated: %greeting%');
      expect(result).toMatch(/^Generated: hi once time: 1$/);
    });

    it('should handle reference variables correctly', () => {
      parser.addRule('name', ['Alice']);
      parser.addRule('greeting', ['Hello %name%, nice to see you again %@name%!']);
      
      const result = parser.parse('%greeting%');
      expect(result).toBe('Hello Alice, nice to see you again Alice!');
    });

    it('should handle reference to non-existent variable', () => {
      parser.addRule('test', ['Reference: %@nonexistent%']);
      
      const result = parser.parse('%test%');
      expect(result).toBe('Reference: %@nonexistent%'); // Should return original
    });

    it('should maintain comprehensive stats', () => {
      parser.addRule('static', ['value']);
      parser.addFunctionRule('func', () => ['test']);
      parser.addWeightedRule('weighted', ['a'], [1.0]);
      parser.addConditionalRule('conditional', { conditions: [{ default: ['test'] }] });
      parser.addSequentialRule('sequential', ['a', 'b']);
      parser.addRangeRule('range', { min: 0, max: 5, type: 'integer' });
      parser.addTemplateRule('template', { template: '%var%', variables: { var: ['test'] } });
      
      const stats = parser.getStats();
      
      expect(stats.totalRules).toBe(7);
      expect(stats.rulesByType.static).toBe(1);
      expect(stats.rulesByType.function).toBe(1);
      expect(stats.rulesByType.weighted).toBe(1);
      expect(stats.rulesByType.conditional).toBe(1);
      expect(stats.rulesByType.sequential).toBe(1);
      expect(stats.rulesByType.range).toBe(1);
      expect(stats.rulesByType.template).toBe(1);
    });
  });
});