import { RuleManager } from '../src/rules/RuleManager';
import { SeededRandom } from '../src/utils/SeededRandom';

describe('RuleManager', () => {
  let manager: RuleManager;
  let random: SeededRandom;

  beforeEach(() => {
    manager = new RuleManager();
    random = new SeededRandom();
    random.setSeed(12345);
  });

  it('resolves generateValue using priority order', () => {
    manager.addRule('shared', ['static']);
    manager.addWeightedRule('shared', ['weighted'], [1]);
    manager.addFunctionRule('shared', () => ['function']);

    const generated = manager.generateValue('shared', {}, random);

    expect(generated).toBe('function');
    expect(manager.getRuleType('shared')).toBe('function');
  });

  it('returns null and null type for unknown keys', () => {
    expect(manager.generateValue('missing', {}, random)).toBeNull();
    expect(manager.getRuleType('missing')).toBeNull();
  });

  it('collects unique keys across rule managers', () => {
    manager.addRule('dup', ['static']);
    manager.addWeightedRule('dup', ['weighted'], [1]);
    manager.addFunctionRule('onlyFunction', () => ['f']);

    const keys = manager.getAllKeys();

    expect(keys).toContain('dup');
    expect(keys).toContain('onlyFunction');
    expect(keys.filter(k => k === 'dup')).toHaveLength(1);
  });

  it('removes a key from all matching rule types', () => {
    manager.addRule('shared', ['static']);
    manager.addWeightedRule('shared', ['weighted'], [1]);

    const removed = manager.removeRule('shared');

    expect(removed).toBe(true);
    expect(manager.hasRule('shared')).toBe(false);
    expect(manager.hasWeightedRule('shared')).toBe(false);
  });

  it('returns false when removing a missing key', () => {
    expect(manager.removeRule('missing')).toBe(false);
  });

  it('provides rule statistics and total counts', () => {
    manager.addRule('staticRule', ['a']);
    manager.addFunctionRule('functionRule', () => ['f']);
    manager.addWeightedRule('weightedRule', ['w'], [1]);
    manager.addConditionalRule('conditionalRule', {
      conditions: [{ default: ['c'] }]
    });
    manager.addSequentialRule('sequentialRule', ['s']);
    manager.addRangeRule('rangeRule', { min: 1, max: 2, type: 'integer' });
    manager.addTemplateRule('templateRule', {
      template: '%slot%',
      variables: {
        slot: ['t']
      }
    });

    const stats = manager.getStats();

    expect(stats.static).toBe(1);
    expect(stats.function).toBe(1);
    expect(stats.weighted).toBe(1);
    expect(stats.conditional).toBe(1);
    expect(stats.sequential).toBe(1);
    expect(stats.range).toBe(1);
    expect(stats.template).toBe(1);
    expect(stats.total).toBe(7);
  });

  it('supports type-specific has/remove/clear operations', () => {
    manager.addFunctionRule('f', () => ['f']);
    manager.addWeightedRule('w', ['w'], [1]);
    manager.addConditionalRule('c', { conditions: [{ default: ['c'] }] });
    manager.addSequentialRule('s', ['s']);
    manager.addRangeRule('r', { min: 1, max: 2, type: 'integer' });
    manager.addTemplateRule('t', { template: '%slot%', variables: { slot: ['t'] } });

    expect(manager.hasFunctionRule('f')).toBe(true);
    expect(manager.removeFunctionRule('f')).toBe(true);
    expect(manager.hasFunctionRule('f')).toBe(false);
    expect(manager.removeFunctionRule('f')).toBe(false);

    expect(manager.hasWeightedRule('w')).toBe(true);
    expect(manager.removeWeightedRule('w')).toBe(true);
    expect(manager.hasWeightedRule('w')).toBe(false);
    expect(manager.removeWeightedRule('w')).toBe(false);

    expect(manager.hasConditionalRule('c')).toBe(true);
    expect(manager.removeConditionalRule('c')).toBe(true);
    expect(manager.hasConditionalRule('c')).toBe(false);
    expect(manager.removeConditionalRule('c')).toBe(false);

    expect(manager.hasSequentialRule('s')).toBe(true);
    expect(manager.removeSequentialRule('s')).toBe(true);
    expect(manager.hasSequentialRule('s')).toBe(false);
    expect(manager.removeSequentialRule('s')).toBe(false);

    expect(manager.hasRangeRule('r')).toBe(true);
    expect(manager.removeRangeRule('r')).toBe(true);
    expect(manager.hasRangeRule('r')).toBe(false);
    expect(manager.removeRangeRule('r')).toBe(false);

    expect(manager.hasTemplateRule('t')).toBe(true);
    expect(manager.removeTemplateRule('t')).toBe(true);
    expect(manager.hasTemplateRule('t')).toBe(false);
    expect(manager.removeTemplateRule('t')).toBe(false);

    manager.addFunctionRule('f2', () => ['f']);
    manager.addWeightedRule('w2', ['w'], [1]);
    manager.addConditionalRule('c2', { conditions: [{ default: ['c'] }] });
    manager.addSequentialRule('s2', ['s']);
    manager.addRangeRule('r2', { min: 1, max: 2, type: 'integer' });
    manager.addTemplateRule('t2', { template: '%slot%', variables: { slot: ['t'] } });

    manager.clearFunctionRules();
    manager.clearWeightedRules();
    manager.clearConditionalRules();
    manager.clearSequentialRules();
    manager.clearRangeRules();
    manager.clearTemplateRules();

    expect(manager.hasFunctionRule('f2')).toBe(false);
    expect(manager.hasWeightedRule('w2')).toBe(false);
    expect(manager.hasConditionalRule('c2')).toBe(false);
    expect(manager.hasSequentialRule('s2')).toBe(false);
    expect(manager.hasRangeRule('r2')).toBe(false);
    expect(manager.hasTemplateRule('t2')).toBe(false);
  });

  it('clears all rules at once', () => {
    manager.addRule('a', ['a']);
    manager.addFunctionRule('b', () => ['b']);

    manager.clear();

    expect(manager.hasRule('a')).toBe(false);
    expect(manager.hasRule('b')).toBe(false);
    expect(manager.getAllKeys()).toEqual([]);
  });

  it('resets sequential rule and returns false for unknown sequential key', () => {
    manager.addSequentialRule('seq', ['first', 'second']);
    manager.generateValue('seq', {}, random);

    expect(manager.resetSequentialRule('seq')).toBe(true);
    expect(manager.resetSequentialRule('missing-seq')).toBe(false);
  });

  it('returns rule data objects and undefined for missing data', () => {
    manager.addWeightedRule('w', ['a', 'b'], [0.4, 0.6]);
    manager.addConditionalRule('c', { conditions: [{ default: ['x'] }] });
    manager.addSequentialRule('s', ['x', 'y']);
    manager.addRangeRule('r', { min: 1, max: 2, type: 'integer' });
    manager.addTemplateRule('t', { template: '%slot%', variables: { slot: ['z'] } });

    expect(manager.getWeightedRuleData('w')).toBeDefined();
    expect(manager.getConditionalRuleData('c')).toBeDefined();
    expect(manager.getSequentialRuleData('s')).toBeDefined();
    expect(manager.getRangeRuleData('r')).toBeDefined();
    expect(manager.getTemplateRuleData('t')).toBeDefined();

    expect(manager.getWeightedRuleData('missing')).toBeUndefined();
    expect(manager.getConditionalRuleData('missing')).toBeUndefined();
    expect(manager.getSequentialRuleData('missing')).toBeUndefined();
    expect(manager.getRangeRuleData('missing')).toBeUndefined();
    expect(manager.getTemplateRuleData('missing')).toBeUndefined();
  });

  it('returns static grammar data', () => {
    manager.addRule('greet', ['hello']);

    const grammar = manager.getGrammar();

    expect(grammar.greet).toEqual(['hello']);
  });
});
