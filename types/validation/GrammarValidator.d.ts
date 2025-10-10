/**
 * Grammar validation functionality
 */
import { ValidationResult } from '../types.js';
import { RuleManager } from '../rules/RuleManager.js';
import { VariableExpander } from '../core/VariableExpander.js';
export declare class GrammarValidator {
    private ruleManager;
    private variableExpander;
    constructor(ruleManager: RuleManager, variableExpander: VariableExpander);
    /**
     * Perform comprehensive grammar validation to detect potential issues
     *
     * This method analyzes the entire grammar structure to identify problems that could
     * cause parsing failures or unexpected behavior. It checks for missing references,
     * circular dependencies, empty rules, and provides warnings for potential issues.
     *
     * @returns Comprehensive validation results object
     */
    validate(): ValidationResult;
    /**
     * Check if a rule is empty (has no values or only empty values)
     * @private
     */
    private isRuleEmpty;
    /**
     * Find all variables referenced by a rule
     * @private
     */
    private findRuleReferences;
    /**
     * Check if a rule is likely a root rule (commonly used entry points)
     * @private
     */
    private isRootRule;
    /**
     * Validate a specific text string for missing variables
     * @param text - Text to validate
     * @returns Array of missing variable names
     */
    validateText(text: string): string[];
    /**
     * Quick validation check - returns true if grammar is valid
     * @returns True if grammar passes basic validation
     */
    isValid(): boolean;
    /**
     * Get validation summary as a readable string
     * @returns Human-readable validation summary
     */
    getValidationSummary(): string;
}
//# sourceMappingURL=GrammarValidator.d.ts.map