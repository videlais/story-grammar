import { ErrorHandler } from '../src/core/ErrorHandler';
import { GrammarValidator } from '../src/validation/GrammarValidator';
import { VariableExpander } from '../src/core/VariableExpander';
import { RuleManager } from '../src/rules/RuleManager';
import { SeededRandom } from '../src/utils/SeededRandom';

describe('ErrorHandler', () => {
  let ruleManager: RuleManager;
  let errorHandler: ErrorHandler;

  beforeEach(() => {
    ruleManager = new RuleManager();
    const expander = new VariableExpander(ruleManager, new SeededRandom());
    const validator = new GrammarValidator(ruleManager, expander);
    errorHandler = new ErrorHandler(ruleManager, validator);
  });

  it('adds general suggestions for unknown errors', () => {
    const helpful = errorHandler.getHelpfulError(new Error('unexpected failure'));

    expect(helpful).toContain('Suggestions:');
    expect(helpful).toContain('Run validate() method to check for grammar issues');
  });

  it('includes context rule details when provided', () => {
    ruleManager.addRule('greet', ['hello']);

    const helpful = errorHandler.getHelpfulError(new Error('parse failure'), { ruleName: 'greet' });

    expect(helpful).toContain('Rule name: greet');
    expect(helpful).toContain('Rule type: static');
  });

  it('includes validation issues for invalid grammars', () => {
    ruleManager.addRule('loopA', ['%loopB%']);
    ruleManager.addRule('loopB', ['%loopA%']);
    ruleManager.addRule('empty', []);

    const helpful = errorHandler.getHelpfulError(new Error('parse failure'));

    expect(helpful).toContain('Validation Issues:');
    expect(helpful).toContain('Empty rules: empty');
    expect(helpful).toContain('Circular references:');
  });

  it('uses text context to list missing rules', () => {
    const helpful = errorHandler.getHelpfulError(new Error('rule not found'), { text: '%known% %missing%' });

    expect(helpful).toContain('Missing rules detected: known, missing');
  });

  it('creates standardized missing-rule errors', () => {
    const error = errorHandler.createMissingRuleError('target');

    expect(error.message).toBe("Rule 'target' does not exist. Use addRule() to define it first.");
  });

  it('creates standardized circular-reference errors', () => {
    const error = errorHandler.createCircularReferenceError('a');

    expect(error.message).toBe("Circular reference detected in rule 'a'. This creates infinite recursion.");
  });

  it('creates standardized function-rule errors', () => {
    const error = errorHandler.createFunctionRuleError('fnRule', new Error('must return array'));

    expect(error.message).toBe("Function rule 'fnRule' failed: must return array");
  });

  it('creates standardized weight validation errors', () => {
    const error = errorHandler.createWeightValidationError('weights must sum to 1');

    expect(error.message).toBe('Weight validation failed: weights must sum to 1');
  });

  it('creates standardized recursion-depth errors', () => {
    const error = errorHandler.createRecursionDepthError(10);

    expect(error.message).toBe('Maximum recursion depth of 10 exceeded. This may indicate circular references in your grammar rules.');
  });
});
