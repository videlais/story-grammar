import { GrammarValidator } from '../src/validation/GrammarValidator';
import { VariableExpander } from '../src/core/VariableExpander';
import { RuleManager } from '../src/rules/RuleManager';
import { SeededRandom } from '../src/utils/SeededRandom';

describe('GrammarValidator', () => {
  let ruleManager: RuleManager;
  let validator: GrammarValidator;

  beforeEach(() => {
    ruleManager = new RuleManager();
    const expander = new VariableExpander(ruleManager, new SeededRandom());
    validator = new GrammarValidator(ruleManager, expander);
  });

  it('returns a passing summary for a valid grammar', () => {
    ruleManager.addRule('start', ['hello world']);

    const result = validator.validate();
    const summary = validator.getValidationSummary();

    expect(result.isValid).toBe(true);
    expect(summary).toContain('Grammar validation passed');
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
