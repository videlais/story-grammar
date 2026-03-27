/**
 * Probability analysis for grammar rules
 */
import { ProbabilityAnalysis, ProbabilityResult } from '../types.js';
import { RuleManager } from '../rules/RuleManager.js';
import { VariableExpander } from '../core/VariableExpander.js';
export declare class ProbabilityAnalyzer {
    private ruleManager;
    private variableExpander;
    constructor(ruleManager: RuleManager, variableExpander: VariableExpander);
    /**
     * Create a proper ProbabilityResult object
     * @private
     */
    private createProbabilityResult;
    /**
     * Calculate probability analysis for a specific rule
     *
     * This method analyzes all possible outcomes of a rule and calculates the probability
     * of each outcome occurring. It considers weighted rules, nested variables, and
     * rule dependencies to provide accurate probability distributions.
     *
     * @param ruleKey - The name of the rule to analyze
     * @param maxDepth - Maximum recursion depth to prevent stack overflow (default: 50)
     * @param maxOutcomes - Maximum number of outcomes to calculate (default: 1000)
     *
     * @returns ProbabilityAnalysis with detailed probability information
     *
     * @throws {Error} If the rule does not exist
     */
    calculateProbabilities(ruleKey: string, maxDepth?: number, maxOutcomes?: number): ProbabilityAnalysis;
    /**
     * Get the most probable outcome for a rule
     */
    getMostProbableOutcome(ruleKey: string, maxDepth?: number, maxOutcomes?: number): ProbabilityResult | null;
    /**
     * Get the least probable outcome for a rule
     */
    getLeastProbableOutcome(ruleKey: string, maxDepth?: number, maxOutcomes?: number): ProbabilityResult | null;
    /**
     * Calculate probabilities for a specific rule (recursive helper)
     * @private
     */
    private calculateRuleProbabilities;
    /**
     * Calculate probabilities for static rules
     * @private
     */
    private calculateStaticRuleProbabilities;
    /**
     * Calculate probabilities for weighted rules.
     * Each value's probability is its weight divided by the total weight sum.
     * Nested variables within values are recursively expanded.
     * @param ruleKey - The weighted rule key to analyze
     * @param visited - Set of already-visited rule keys (for circular reference detection)
     * @param maxDepth - Maximum recursion depth
     * @param maxOutcomes - Maximum number of outcomes to generate
     * @param warnings - Accumulator for warning messages
     * @returns Array of probability results for all possible outcomes
     * @private
     */
    private calculateWeightedRuleProbabilities;
    /**
     * Calculate probabilities for range rules.
     * Enumerates all discrete values in the range; each has equal probability.
     * @param ruleKey - The range rule key to analyze
     * @returns Array of probability results for each value in the range
     * @private
     */
    private calculateRangeRuleProbabilities;
    /**
     * Calculate probabilities for template rules.
     * Expands each template variable slot independently, computing the
     * Cartesian product of all slot values and their combined probabilities.
     * @param ruleKey - The template rule key to analyze
     * @param visited - Set of already-visited rule keys (for circular reference detection)
     * @param maxDepth - Maximum recursion depth
     * @param maxOutcomes - Maximum number of outcomes to generate
     * @param warnings - Accumulator for warning messages
     * @returns Array of probability results for all template expansions
     * @private
     */
    private calculateTemplateRuleProbabilities;
    /**
     * Calculate probabilities for sequential rules.
     * Sequential rules cycle through values in order; for probability analysis
     * each value is assumed equally likely (uniform distribution).
     * @param ruleKey - The sequential rule key to analyze
     * @param visited - Set of already-visited rule keys (for circular reference detection)
     * @param maxDepth - Maximum recursion depth
     * @param maxOutcomes - Maximum number of outcomes to generate
     * @param warnings - Accumulator for warning messages
     * @returns Array of probability results for each sequential value
     * @private
     */
    private calculateSequentialRuleProbabilities;
    /**
     * Calculate probabilities for conditional rules.
     * Without runtime context, each condition branch is assumed equally likely.
     * Within each branch, values are uniformly distributed.
     * @param ruleKey - The conditional rule key to analyze
     * @param visited - Set of already-visited rule keys (for circular reference detection)
     * @param maxDepth - Maximum recursion depth
     * @param maxOutcomes - Maximum number of outcomes to generate
     * @param warnings - Accumulator for warning messages
     * @returns Array of probability results across all condition branches
     * @private
     */
    private calculateConditionalRuleProbabilities;
    /**
     * Expand variables in a value with probability calculations
     * @private
     */
    private expandVariablesWithProbabilities;
}
//# sourceMappingURL=ProbabilityAnalyzer.d.ts.map