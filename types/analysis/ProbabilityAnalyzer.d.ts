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
    private calculateWeightedRuleProbabilities;
    private calculateRangeRuleProbabilities;
    private calculateTemplateRuleProbabilities;
    private calculateSequentialRuleProbabilities;
    private calculateConditionalRuleProbabilities;
    /**
     * Expand variables in a value with probability calculations
     * @private
     */
    private expandVariablesWithProbabilities;
}
//# sourceMappingURL=ProbabilityAnalyzer.d.ts.map