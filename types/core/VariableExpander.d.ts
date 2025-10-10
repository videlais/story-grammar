/**
 * Variable expansion engine for processing %variable% placeholders
 */
import { RuleManager } from '../rules/RuleManager.js';
import { SeededRandom } from '../utils/SeededRandom.js';
export declare class VariableExpander {
    private ruleManager;
    private random;
    private variablePattern;
    private referenceValues;
    private currentContext;
    private maxDepth;
    constructor(ruleManager: RuleManager, random: SeededRandom);
    /**
     * Set maximum recursion depth
     */
    setMaxDepth(depth: number): void;
    /**
     * Get maximum recursion depth
     */
    getMaxDepth(): number;
    /**
     * Clear context and reference values
     */
    clearContext(): void;
    /**
     * Get current context
     */
    getContext(): {
        [key: string]: string;
    };
    /**
     * Clear reference values and context
     */
    clearReferences(): void;
    /**
     * Expand variables in text with recursive processing
     * @param text - Text containing %variable% placeholders
     * @param preserveContext - Whether to maintain context from previous expansions
     * @returns Fully expanded text
     */
    expandVariables(text: string, preserveContext?: boolean): string;
    /**
     * Recursively expand variables with depth protection
     * @private
     */
    private expandVariablesRecursive;
    /**
     * Find all variable names in text
     * @param text - Text to analyze
     * @returns Array of unique variable names
     */
    findVariables(text: string): string[];
    /**
     * Validate that all variables in text have corresponding rules
     * @param text - Text to validate
     * @returns Array of missing variable names
     */
    findMissingVariables(text: string): string[];
    /**
     * Check for circular references in grammar rules
     * @param startRule - Rule to start checking from
     * @param visited - Set of already visited rules
     * @returns Array of circular reference chains found
     */
    findCircularReferences(startRule?: string, visited?: Set<string>): string[];
    /**
     * Check a specific rule for circular references
     * @private
     */
    private checkRuleForCircularReferences;
}
//# sourceMappingURL=VariableExpander.d.ts.map