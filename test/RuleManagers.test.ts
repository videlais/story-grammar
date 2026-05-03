import {
  StaticRuleManager,
  FunctionRuleManager,
  WeightedRuleManager
} from '../src/rules/BaseRuleManager';
import {
  ConditionalRuleManager,
  SequentialRuleManager,
  RangeRuleManager,
  TemplateRuleManager
} from '../src/rules/AdvancedRuleManagers';
import { SeededRandom } from '../src/utils/SeededRandom';

describe('Base and Advanced Rule Managers', () => {
  let random: SeededRandom;

  beforeEach(() => {
    random = new SeededRandom();
    random.setSeed(12345);
  });

  describe('StaticRuleManager', () => {
    it('validates key and values', () => {
      const manager = new StaticRuleManager();
      expect(() => manager.addRule('', ['a'])).toThrow('Rule key must be a non-empty string');
      expect(() => manager.addRule('k', 'not-array' as unknown as string[])).toThrow('Rule values must be an array');
    });

    it('supports addRules and immutable grammar retrieval', () => {
      const manager = new StaticRuleManager();
      manager.addRules({ a: ['x'], b: ['y'] });

      const grammar = manager.getGrammar();
      grammar.a.push('mutated');

      expect(manager.getGrammar().a).toEqual(['x']);
      expect(manager.size()).toBe(2);
      expect(manager.getKeys()).toEqual(expect.arrayContaining(['a', 'b']));
    });

    it('handles generate for missing, empty, and normal static rules', () => {
      const manager = new StaticRuleManager();
      expect(manager.generateValue('missing', {}, random)).toBeNull();

      manager.addRule('empty', []);
      expect(manager.generateValue('empty', {}, random)).toBe('');

      manager.addRule('filled', ['a', 'b']);
      const result = manager.generateValue('filled', {}, random);
      expect(['a', 'b']).toContain(result);
    });
  });

  describe('FunctionRuleManager', () => {
    it('validates key and function type', () => {
      const manager = new FunctionRuleManager();
      expect(() => manager.addRule('', () => ['a'])).toThrow('Rule key must be a non-empty string');
      expect(() => manager.addRule('k', 'not-fn' as unknown as () => string[])).toThrow('Rule function must be a function');
    });

    it('handles missing and empty function outputs', () => {
      const manager = new FunctionRuleManager();
      expect(manager.generateValue('missing', {}, random)).toBeNull();

      manager.addRule('emptyFn', () => []);
      expect(manager.generateValue('emptyFn', {}, random)).toBeNull();
    });

    it('wraps non-array and thrown function failures', () => {
      const manager = new FunctionRuleManager();
      manager.addRule('badType', () => 'not-array' as unknown as string[]);
      manager.addRule('throws', () => {
        throw new Error('boom');
      });

      expect(() => manager.generateValue('badType', {}, random)).toThrow("Error executing function rule 'badType': Function rule 'badType' must return an array");
      expect(() => manager.generateValue('throws', {}, random)).toThrow("Error executing function rule 'throws': boom");
    });
  });

  describe('WeightedRuleManager', () => {
    it('validates weighted rule inputs', () => {
      const manager = new WeightedRuleManager();
      expect(() => manager.addRule('', ['a'], [1])).toThrow('Rule key must be a non-empty string');
      expect(() => manager.addRule('k', 'x' as unknown as string[], [1])).toThrow('Rule values must be an array');
      expect(() => manager.addRule('k', ['a'], 'x' as unknown as number[])).toThrow('Rule weights must be an array');
      expect(() => manager.addRule('k', ['a', 'b'], [1])).toThrow('Values and weights arrays must have the same length');
      expect(() => manager.addRule('k', [], [])).toThrow('Values array cannot be empty');
      expect(() => manager.addRule('k', ['a'], [-1])).toThrow('All weights must be non-negative numbers');
      expect(() => manager.addRule('k', ['a', 'b'], [0.2, 0.2])).toThrow('Weights must sum to 1.0, got 0.4');
    });

    it('handles generate and data retrieval for weighted rules', () => {
      const manager = new WeightedRuleManager();
      expect(manager.generateValue('missing', {}, random)).toBeNull();

      manager.addRule('w', ['a', 'b'], [0.5, 0.5]);
      const generated = manager.generateValue('w', {}, random);
      expect(['a', 'b']).toContain(generated);

      expect(manager.getRuleData('w')).toBeDefined();
      expect(manager.getRuleData('missing')).toBeUndefined();
      expect(manager.hasRule('w')).toBe(true);
      expect(manager.removeRule('w')).toBe(true);
      expect(manager.removeRule('w')).toBe(false);
    });
  });

  describe('ConditionalRuleManager', () => {
    it('validates conditional rule structure', () => {
      const manager = new ConditionalRuleManager();
      expect(() => manager.addRule('', { conditions: [{ default: ['x'] }] })).toThrow('Rule key must be a non-empty string');
      expect(() => manager.addRule('k', null as unknown as { conditions: Array<{ default: string[] }> })).toThrow('Conditional rule must have a conditions array');
      expect(() => manager.addRule('k', { conditions: [] })).toThrow('Conditions array cannot be empty');
      expect(() => manager.addRule('k', { conditions: [{ default: ['x'] }, { default: ['y'] }] })).toThrow('Only one default condition is allowed');
      expect(() => manager.addRule('k', { conditions: [{ default: [] }] })).toThrow('Default condition must have an array of values');
      expect(() => manager.addRule('k', { conditions: [{ if: 'nope' as unknown as (context: { [key: string]: string }) => boolean, then: ['x'] }] })).toThrow('Condition "if" must be a function');
      expect(() => manager.addRule('k', { conditions: [{ if: () => true, then: [] }] })).toThrow('Condition "then" must be an array of values');
      expect(() => manager.addRule('k', { conditions: [{ then: ['x'] } as unknown as { if: (context: { [key: string]: string }) => boolean; then: string[] }] })).toThrow('Each condition must have either "if/then" or "default"');
    });

    it('generates matching conditional values and missing returns null', () => {
      const manager = new ConditionalRuleManager();
      expect(manager.generateValue('missing', { mode: 'x' }, random)).toBeNull();

      manager.addRule('cond', {
        conditions: [
          { if: (ctx) => ctx.mode === 'if', then: ['fromIf'] },
          { default: ['fromDefault'] }
        ]
      });

      expect(manager.generateValue('cond', { mode: 'if' }, random)).toBe('fromIf');
      expect(manager.generateValue('cond', { mode: 'other' }, random)).toBe('fromDefault');
    });

    it('throws when no condition matches and no default exists', () => {
      const manager = new ConditionalRuleManager();
      manager.addRule('cond', {
        conditions: [{ if: () => false, then: ['x'] }]
      });

      expect(() => manager.generateValue('cond', { mode: 'none' }, random)).toThrow('No matching condition found and no default provided');
    });
  });

  describe('SequentialRuleManager', () => {
    it('validates sequential inputs', () => {
      const manager = new SequentialRuleManager();
      expect(() => manager.addRule('', ['a'])).toThrow('Key must be a non-empty string');
      expect(() => manager.addRule('k', [])).toThrow('Values must be a non-empty array');
    });

    it('supports cycling and non-cycling behavior', () => {
      const cycleManager = new SequentialRuleManager();
      cycleManager.addRule('seq', ['a', 'b'], { cycle: true });

      expect(cycleManager.generateValue('seq', {}, random)).toBe('a');
      expect(cycleManager.generateValue('seq', {}, random)).toBe('b');
      expect(cycleManager.generateValue('seq', {}, random)).toBe('a');

      const nonCycleManager = new SequentialRuleManager();
      nonCycleManager.addRule('seq', ['x', 'y'], { cycle: false });

      expect(nonCycleManager.generateValue('seq', {}, random)).toBe('x');
      expect(nonCycleManager.generateValue('seq', {}, random)).toBe('y');
      expect(nonCycleManager.generateValue('seq', {}, random)).toBe('y');
    });

    it('supports reset and missing rule branches', () => {
      const manager = new SequentialRuleManager();
      expect(manager.generateValue('missing', {}, random)).toBeNull();
      expect(manager.resetRule('missing')).toBe(false);

      manager.addRule('seq', ['a', 'b']);
      manager.generateValue('seq', {}, random);
      expect(manager.resetRule('seq')).toBe(true);
      expect(manager.generateValue('seq', {}, random)).toBe('a');
    });
  });

  describe('RangeRuleManager', () => {
    it('validates range inputs', () => {
      const manager = new RangeRuleManager();
      expect(() => manager.addRule('', { min: 1, max: 2, type: 'integer' })).toThrow('Key must be a non-empty string');
      expect(() => manager.addRule('k', { min: '1' as unknown as number, max: 2, type: 'integer' })).toThrow('Min and max must be numbers');
      expect(() => manager.addRule('k', { min: 2, max: 1, type: 'integer' })).toThrow('Min must be less than max');
      expect(() => manager.addRule('k', { min: 1, max: 2, step: 0, type: 'integer' })).toThrow('Step must be a positive number');
      expect(() => manager.addRule('k', { min: 1, max: 2, type: 'invalid' as unknown as 'integer' | 'float' })).toThrow('Type must be "integer" or "float"');
    });

    it('generates stepped and continuous range values and handles missing', () => {
      const manager = new RangeRuleManager();
      expect(manager.generateValue('missing', {}, random)).toBeNull();

      manager.addRule('steppedInt', { min: 1, max: 5, step: 2, type: 'integer' });
      const stepped = Number(manager.generateValue('steppedInt', {}, random));
      expect([1, 3, 5]).toContain(stepped);

      manager.addRule('continuousInt', { min: 1, max: 3, type: 'integer' });
      const continuousInt = Number(manager.generateValue('continuousInt', {}, random));
      expect(continuousInt).toBeGreaterThanOrEqual(1);
      expect(continuousInt).toBeLessThan(3);
      expect(Number.isInteger(continuousInt)).toBe(true);

      manager.addRule('continuousFloat', { min: 1, max: 3, type: 'float' });
      const continuousFloat = Number(manager.generateValue('continuousFloat', {}, random));
      expect(continuousFloat).toBeGreaterThanOrEqual(1);
      expect(continuousFloat).toBeLessThan(3);
    });
  });

  describe('TemplateRuleManager', () => {
    it('validates template inputs', () => {
      const manager = new TemplateRuleManager();
      expect(() => manager.addRule('', { template: '%x%', variables: { x: ['a'] } })).toThrow('Key must be a non-empty string');
      expect(() => manager.addRule('k', { template: '', variables: { x: ['a'] } })).toThrow('Template must be a non-empty string');
      expect(() => manager.addRule('k', { template: '%x%', variables: null as unknown as { [key: string]: string[] } })).toThrow('Variables must be an object');
      expect(() => manager.addRule('k', { template: '%x%', variables: {} })).toThrow("Template variable 'x' not found in variables object");
      expect(() => manager.addRule('k', { template: '%x%', variables: { x: [] } })).toThrow("Variable 'x' must be an array");
    });

    it('generates template output with repeated variable replacement and missing handling', () => {
      const manager = new TemplateRuleManager();
      expect(manager.generateValue('missing', {}, random)).toBeNull();

      manager.addRule('tpl', {
        template: '%word%-%word%',
        variables: {
          word: ['hi']
        }
      });

      expect(manager.generateValue('tpl', {}, random)).toBe('hi-hi');
    });
  });
});
