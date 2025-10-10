/**
 * Complexity analysis for grammar rules
 */
import { ComplexityResult, TotalComplexityResult } from '../types.js';
import { RuleManager } from '../rules/RuleManager.js';
import { VariableExpander } from '../core/VariableExpander.js';
export declare class ComplexityAnalyzer {
    private ruleManager;
    private variableExpander;
    constructor(ruleManager: RuleManager, variableExpander: VariableExpander);
    /**
     * Calculate the complexity (number of possible outcomes) for a specific rule
     *
     * This method analyzes a single rule and calculates how many different possible
     * values it can generate, taking into account nested variables and rule dependencies.
     *
     * @param ruleKey - The name of the rule to analyze
     * @param visited - Internal set to track visited rules (prevents infinite recursion)
     * @param maxDepth - Maximum recursion depth to prevent stack overflow (default: 50)
     *
     * @returns ComplexityResult containing detailed analysis of the rule's complexity
     *
     * @throws {Error} If the rule does not exist
     */
    calculateRuleComplexity(ruleKey: string, visited?: Set<string>, maxDepth?: number): ComplexityResult;
    /**
     * Calculate total complexity across all rules in the grammar
     */
    calculateTotalComplexity(maxDepth?: number): TotalComplexityResult;
    /**
     * Calculate complexity for static grammar rules
     */
    private calculateStaticRuleComplexity;
    /**
     * Calculate complexity for weighted rules
     */
    private calculateWeightedRuleComplexity;
    /**
   * Calculate complexity for conditional rules
   */
    private calculateConditionalRuleComplexity;
    /**
   * Calculate complexity for sequential rules
   */
    private calculateSequentialRuleComplexity;
    /**
     * Calculate complexity for range rules
     */
    private calculateRangeRuleComplexity;
    /**
     * Calculate complexity for template rules
     */
    private calculateTemplateRuleComplexity;
}
//# sourceMappingURL=ComplexityAnalyzer.d.ts.map