/**
 * Unified rule manager that coordinates all rule types
 */
import { Grammar, FunctionRule, ConditionalRule, TemplateRule, WeightedRule, SequentialRule, RangeRule } from '../types.js';
import { SeededRandom } from '../utils/SeededRandom.js';
/**
 * Unified manager for all rule types with priority-based resolution
 */
export declare class RuleManager {
    private staticRules;
    private functionRules;
    private weightedRules;
    private conditionalRules;
    private sequentialRules;
    private rangeRules;
    private templateRules;
    private readonly ruleManagers;
    /**
     * Add static rules
     */
    addRule(key: string, values: string[]): void;
    addRules(grammar: Grammar): void;
    /**
     * Add function rule
     */
    addFunctionRule(key: string, fn: FunctionRule): void;
    /**
     * Add weighted rule
     */
    addWeightedRule(key: string, values: string[], weights: number[]): void;
    /**
     * Add conditional rule
     */
    addConditionalRule(key: string, rule: ConditionalRule): void;
    /**
     * Add sequential rule
     */
    addSequentialRule(key: string, values: string[], options?: {
        cycle: boolean;
    }): void;
    /**
     * Add range rule
     */
    addRangeRule(key: string, config: {
        min: number;
        max: number;
        step?: number;
        type: 'integer' | 'float';
    }): void;
    /**
     * Add template rule
     */
    addTemplateRule(key: string, rule: TemplateRule): void;
    /**
     * Check if a rule exists (any type)
     */
    hasRule(key: string): boolean;
    /**
     * Remove a rule (from all managers)
     */
    removeRule(key: string): boolean;
    /**
     * Generate a value from any rule type
     * Uses priority order: function → conditional → sequential → range → template → weighted → static
     */
    generateValue(key: string, context: {
        [key: string]: string;
    }, random: SeededRandom): string | null;
    /**
     * Get rule type for a given key
     */
    getRuleType(key: string): string | null;
    /**
     * Clear all rules
     */
    clear(): void;
    /**
     * Clear specific rule types
     */
    clearStaticRules(): void;
    clearFunctionRules(): void;
    clearWeightedRules(): void;
    clearConditionalRules(): void;
    clearSequentialRules(): void;
    clearRangeRules(): void;
    clearTemplateRules(): void;
    /**
     * Get statistics about rules
     */
    getStats(): {
        [key: string]: number;
    };
    /**
     * Get all rule keys
     */
    getAllKeys(): string[];
    /**
     * Reset sequential rule
     */
    resetSequentialRule(key: string): boolean;
    /**
     * Get static grammar
     */
    getGrammar(): Grammar;
    /**
     * Get rule data for analysis purposes
     */
    getWeightedRuleData(key: string): WeightedRule | undefined;
    getConditionalRuleData(key: string): ConditionalRule | undefined;
    getSequentialRuleData(key: string): SequentialRule | undefined;
    getRangeRuleData(key: string): RangeRule | undefined;
    getTemplateRuleData(key: string): TemplateRule | undefined;
    /**
     * Check specific rule types
     */
    hasFunctionRule(key: string): boolean;
    hasWeightedRule(key: string): boolean;
    hasConditionalRule(key: string): boolean;
    hasSequentialRule(key: string): boolean;
    hasRangeRule(key: string): boolean;
    hasTemplateRule(key: string): boolean;
    /**
     * Remove specific rule types
     */
    removeFunctionRule(key: string): boolean;
    removeWeightedRule(key: string): boolean;
    removeConditionalRule(key: string): boolean;
    removeSequentialRule(key: string): boolean;
    removeRangeRule(key: string): boolean;
    removeTemplateRule(key: string): boolean;
}
//# sourceMappingURL=RuleManager.d.ts.map