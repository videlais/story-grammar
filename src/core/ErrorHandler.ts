/**
 * Error handling and helpful error message generation
 */
import { ErrorContext } from '../types.js';
import { RuleManager } from '../rules/RuleManager.js';
import { GrammarValidator } from '../validation/GrammarValidator.js';

export class ErrorHandler {
  constructor(
    private ruleManager: RuleManager,
    private validator: GrammarValidator
  ) {}

  /**
   * Generate helpful error messages with contextual suggestions and debugging information
   * 
   * This method analyzes parsing errors and provides intelligent suggestions for resolving
   * common issues. It examines the error type, parsing context, and grammar state to offer
   * specific, actionable advice for fixing problems.
   * 
   * @param error - The error object that was thrown during parsing
   * @param context - Optional additional context for better error analysis
   * @returns Enhanced error message with suggestions, validation info, and debugging tips
   */
  public getHelpfulError(error: Error, context?: ErrorContext): string {
    const lines: string[] = [];
    
    // Start with the original error message
    lines.push(error.message);
    lines.push('');
    
    // Analyze error type and provide specific suggestions
    if (this.isRecursionError(error)) {
      lines.push('Suggestions:');
      lines.push('• Check for circular references in your grammar rules');
      lines.push('• Use validate() method to detect circular dependencies');
      lines.push('• Consider increasing maxDepth if your grammar is legitimately deep');
      lines.push('• Try reducing the maxDepth with setMaxDepth()');
      lines.push('• Use @variable syntax to reference previously generated values');
      
      // Add rule-specific context if available
      if (context?.ruleName) {
        lines.push('');
        lines.push(`Rule name: ${context.ruleName}`);
        lines.push(`The rule '${context.ruleName}' may be causing infinite recursion`);
      }
    } else if (this.isFunctionRuleError(error)) {
      lines.push('Suggestions:');
      lines.push('• Function rules must return string arrays');
      lines.push('• Check that your function rule returns an array of strings');
      lines.push('• Check your function rule implementation');
      lines.push('• Ensure function doesn\'t throw exceptions');
      lines.push('• Add error handling within your function rule');
      lines.push('• Test function rule independently before adding to parser');
    } else if (this.isWeightError(error)) {
      lines.push('Suggestions:');
      lines.push('• Ensure all weights are positive numbers');
      lines.push('• Verify that weights sum to exactly 1.0');
      lines.push('• Ensure all weights in weighted rules add up to exactly 1.0');
      lines.push('• Check that values and weights arrays have the same length');
      lines.push('• Use helper: weights = [0.5, 0.3, 0.2] for three items');
    } else if (this.isMissingRuleError(error)) {
      lines.push('Suggestions:');
      lines.push('• Check that all referenced rules are defined');
      lines.push('• Use validate() method to find missing rules');
      
      // Try to identify missing rules
      if (context?.text) {
        const missingRules = this.validator.validateText(context.text);
        if (missingRules.length > 0) {
          lines.push(`• Missing rules detected: ${missingRules.join(', ')}`);
        }
      }
    } else {
      // General suggestions for unknown errors
      lines.push('Suggestions:');
      lines.push('• Run validate() method to check for grammar issues');
      lines.push('• Check that all referenced rules exist');
      lines.push('• Ensure rule values are properly formatted');
      lines.push('• Review recent changes to grammar rules');
    }
    
    lines.push('');
    
    // Add validation information if available
    const validation = this.validator.validate();
    if (!validation.isValid) {
      lines.push('Validation Issues:');
      
      if (validation.missingRules.length > 0) {
        lines.push(`• Missing rules: ${validation.missingRules.join(', ')}`);
      }
      
      if (validation.circularReferences.length > 0) {
        lines.push(`• Circular references: ${validation.circularReferences.join(', ')}`);
      }
      
      if (validation.emptyRules.length > 0) {
        lines.push(`• Empty rules: ${validation.emptyRules.join(', ')}`);
      }
      
      lines.push('');
    }
    
    // Add context information if provided
    if (context) {
      if (context.text) {
        lines.push(`Text being parsed: "${context.text}"`);
      }
      
      if (context.ruleName) {
        lines.push(`Rule name: ${context.ruleName}`);
        const ruleType = this.ruleManager.getRuleType(context.ruleName);
        if (ruleType) {
          lines.push(`Rule type: ${ruleType}`);
        }
      }
    }
    
    return lines.join('\n');
  }

  /**
   * Check if error is related to recursion depth
   * @private
   */
  private isRecursionError(error: Error): boolean {
    const message = error.message.toLowerCase();
    return message.includes('recursion') || 
           message.includes('circular') || 
           message.includes('depth') ||
           message.includes('maximum call stack');
  }

  /**
   * Check if error is related to function rules
   * @private
   */
  private isFunctionRuleError(error: Error): boolean {
    const message = error.message.toLowerCase();
    return message.includes('function rule') || 
           message.includes('function') && message.includes('failed') ||
           message.includes('function must return');
  }

  /**
   * Check if error is related to weighted rule weights
   * @private
   */
  private isWeightError(error: Error): boolean {
    const message = error.message.toLowerCase();
    return message.includes('weight') || 
           message.includes('sum to 1') ||
           message.includes('probability');
  }

  /**
   * Check if error is related to missing rules
   * @private
   */
  private isMissingRuleError(error: Error): boolean {
    const message = error.message.toLowerCase();
    return message.includes('rule') && message.includes('not found') ||
           message.includes('rule') && message.includes('does not exist') ||
           message.includes('missing rule') ||
           message.includes('undefined rule');
  }

  /**
   * Create a standardized error for missing rules
   */
  public createMissingRuleError(ruleName: string): Error {
    return new Error(`Rule '${ruleName}' does not exist. Use addRule() to define it first.`);
  }

  /**
   * Create a standardized error for circular references
   */
  public createCircularReferenceError(ruleName: string): Error {
    return new Error(`Circular reference detected in rule '${ruleName}'. This creates infinite recursion.`);
  }

  /**
   * Create a standardized error for function rule failures
   */
  public createFunctionRuleError(ruleName: string, originalError: Error): Error {
    return new Error(`Function rule '${ruleName}' failed: ${originalError.message}`);
  }

  /**
   * Create a standardized error for weight validation
   */
  public createWeightValidationError(message: string): Error {
    return new Error(`Weight validation failed: ${message}`);
  }

  /**
   * Create a standardized error for recursion depth
   */
  public createRecursionDepthError(maxDepth: number): Error {
    return new Error(`Maximum recursion depth of ${maxDepth} exceeded. This may indicate circular references in your grammar rules.`);
  }
}