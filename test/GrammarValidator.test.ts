import { GrammarValidator } from '../src/validation/GrammarValidator';
import { VariableExpander } from '../src/core/VariableExpander';
import { RuleManager } from '../src/rules/RuleManager';
import { SeededRandom } from '../src/utils/SeededRandom';

describe('GrammarValidator', () => {
  let ruleManager: RuleManager;
  let validator: GrammarValidator;
  let expander: VariableExpander;

  beforeEach(() => {
    ruleManager = new RuleManager();
    expander = new VariableExpander(ruleManager, new SeededRandom());
    validator = new GrammarValidator(ruleManager, expander);
  });

  it('returns a passing summary for a valid grammar', () => {
    ruleManager.addRule('start', ['hello world']);

    const result = validator.validate();
    const summary = validator.getValidationSummary();

    expect(result.isValid).toBe(true);
    expect(summary).toContain('Grammar validation passed');
  });

  it('detects sequential cycles without consuming sequential values', () => {
    ruleManager.addSequentialRule('sequence', ['first', 'second']);
    ruleManager.addSequentialRule('loop', ['%loop%']);

    const result = validator.validate();

    expect(result.circularReferences).toContain('loop');
    expect(ruleManager.generateValue('sequence', {}, new SeededRandom())).toBe('first');
  });

  it('does not execute function rules while checking for circular references', () => {
    const rule = jest.fn(() => ['value']);
    ruleManager.addFunctionRule('dynamic', rule);

    validator.validate();

    expect(rule).not.toHaveBeenCalled();
  });

  it('checks all statically known values for circular references', () => {
    ruleManager.addWeightedRule('weighted', ['safe', '%weighted%'], [0.5, 0.5]);
    ruleManager.addConditionalRule('conditional', {
      conditions: [
        { if: () => false, then: ['safe'] },
        { default: ['%conditional%'] }
      ]
    });

    const result = validator.validate();

    expect(result.circularReferences).toContain('weighted');
    expect(result.circularReferences).toContain('conditional');
  });

  it('does not report zero-weight alternatives as cycles', () => {
    ruleManager.addWeightedRule('weighted', ['ok', '%weighted%'], [1, 0]);

    expect(validator.validate().circularReferences).not.toContain('weighted');
  });

  it('analyzes templates after substituting only referenced slots', () => {
    ruleManager.addTemplateRule('unusedTemplate', {
      template: 'ok',
      variables: { unused: ['%unusedLoop%'] }
    });
    ruleManager.addRule('unusedLoop', ['ok']);
    ruleManager.addTemplateRule('wrappedTemplate', {
      template: '%%slot%%',
      variables: { slot: ['loop'] }
    });
    ruleManager.addRule('loop', ['%wrappedTemplate%']);

    const result = validator.validate();

    expect(result.circularReferences).not.toContain('unusedLoop');
    expect(result.circularReferences).toContain('wrappedTemplate');
    expect(result.circularReferences).toContain('loop');
  });

  it('checks each shared dependency once when building the cycle graph', () => {
    for (let index = 0; index < 24; index++) {
      const next = `r${index + 1}`;
      ruleManager.addRule(`r${index}`, [`%${next}%`, `%${next}%`]);
    }
    ruleManager.addRule('r24', ['done']);
    const getPossibleValues = jest.spyOn(ruleManager, 'getPossibleValues');

    expect(expander.findCircularReferences()).toEqual([]);
    expect(getPossibleValues).toHaveBeenCalledTimes(25);
  });

  it('reports every rule in a cyclic dependency component', () => {
    ruleManager.addRule('a', ['%b%']);
    ruleManager.addRule('b', ['%c%', '%d%']);
    ruleManager.addRule('c', ['%a%', '%b%']);
    ruleManager.addRule('d', ['%c%']);

    expect(new Set(expander.findCircularReferences())).toEqual(new Set(['a', 'b', 'c', 'd']));
  });

  it('limits scoped cycle analysis to rules reachable from the start rule', () => {
    ruleManager.addRule('parent', ['%leaf%']);
    ruleManager.addRule('leaf', ['done']);

    expect(expander.findCircularReferences('leaf')).toEqual([]);
  });

  it('handles long dependency paths without recursive traversal', () => {
    const depth = 12_000;
    for (let index = 0; index < depth; index++) {
      ruleManager.addRule(`r${index}`, [`%r${index + 1}%`]);
    }
    ruleManager.addRule(`r${depth}`, ['done']);

    expect(expander.findCircularReferences()).toEqual([]);
  });

  it('reports invalid grammar details and truncates long unreachable lists', () => {
    ruleManager.addRule('start', ['%missing%']);
    ruleManager.addRule('loopA', ['%loopB%']);
    ruleManager.addRule('loopB', ['%loopA%']);
    ruleManager.addRule('empty', []);

    for (let i = 0; i < 7; i++) {
      ruleManager.addRule(`orphan${i}`, ['value']);
    }

    const result = validator.validate();
    const summary = validator.getValidationSummary();

    expect(result.isValid).toBe(false);
    expect(summary).toContain('Missing rules: missing');
    expect(summary).toContain('Circular references:');
    expect(summary).toContain('Empty rules: empty');
    expect(summary).toContain('Unreachable rules:');
    expect(summary).toContain('...');
    expect(summary).toContain('Warnings:');
  });

  it('formats short unreachable lists without truncation', () => {
    ruleManager.addRule('start', ['ok']);
    ruleManager.addRule('orphanA', ['value']);
    ruleManager.addRule('orphanB', ['value']);

    const result = validator.validate();
    const summary = validator.getValidationSummary();

    expect(result.unreachableRules).toEqual(expect.arrayContaining(['orphanA', 'orphanB']));
    expect(summary).toContain('Unreachable rules: orphanA, orphanB');
    expect(summary.includes('... and')).toBe(false);
  });

  it('detects missing variables in free text validation', () => {
    ruleManager.addRule('known', ['x']);

    const textResult = validator.validateText('%known% %unknown%');

    expect(textResult).toEqual(['unknown']);
  });

  it('exposes quick boolean validity checks', () => {
    ruleManager.addRule('start', ['ok']);
    expect(validator.isValid()).toBe(true);

    ruleManager.addRule('empty', []);
    expect(validator.isValid()).toBe(false);
  });
});
