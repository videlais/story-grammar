/**
 * Error handling and helpful error message generation
 */
import { ErrorContext } from '../types.js';
import { RuleManager } from '../rules/RuleManager.js';
import { GrammarValidator } from '../validation/GrammarValidator.js';
export declare class ErrorHandler {
    private ruleManager;
    private validator;
    constructor(ruleManager: RuleManager, validator: GrammarValidator);
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
    getHelpfulError(error: Error, context?: ErrorContext): string;
    /**
     * Check if error is related to recursion depth
     * @private
     */
    private isRecursionError;
    /**
     * Check if error is related to function rules
     * @private
     */
    private isFunctionRuleError;
    /**
     * Check if error is related to weighted rule weights
     * @private
     */
    private isWeightError;
    /**
     * Check if error is related to missing rules
     * @private
     */
    private isMissingRuleError;
    /**
     * Create a standardized error for missing rules
     */
    createMissingRuleError(ruleName: string): Error;
    /**
     * Create a standardized error for circular references
     */
    createCircularReferenceError(ruleName: string): Error;
    /**
     * Create a standardized error for function rule failures
     */
    createFunctionRuleError(ruleName: string, originalError: Error): Error;
    /**
     * Create a standardized error for weight validation
     */
    createWeightValidationError(message: string): Error;
    /**
     * Create a standardized error for recursion depth
     */
    createRecursionDepthError(maxDepth: number): Error;
}
//# sourceMappingURL=ErrorHandler.d.ts.map