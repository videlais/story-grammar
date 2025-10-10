/**
 * Base class for managing different types of grammar rules
 */
import { Grammar, FunctionRule, WeightedRule } from '../types.js';
import { SeededRandom } from '../utils/SeededRandom.js';
export declare abstract class BaseRuleManager<T> {
    protected rules: Map<string, T>;
    /**
     * Add a rule to the manager
     * @param key - Rule identifier
     * @param ...args - Rule configuration arguments (varies by implementation)
     */
    abstract addRule(key: string, ...args: unknown[]): void;
    /**
     * Remove a rule from the manager
     * @param key - Rule identifier
     * @returns True if rule was removed
     */
    removeRule(key: string): boolean;
    /**
     * Check if a rule exists
     * @param key - Rule identifier
     * @returns True if rule exists
     */
    hasRule(key: string): boolean;
    /**
     * Get a rule by key
     * @param key - Rule identifier
     * @returns Rule or undefined
     */
    getRule(key: string): T | undefined;
    /**
     * Clear all rules
     */
    clear(): void;
    /**
     * Get all rule keys
     * @returns Array of rule keys
     */
    getKeys(): string[];
    /**
     * Get the number of rules
     * @returns Number of rules
     */
    size(): number;
    /**
     * Get rule data for analysis (protected method for analyzers)
     * @param key - Rule identifier
     * @returns Rule data or undefined
     */
    getRuleData(key: string): T | undefined;
    /**
     * Generate a value from the rule
     * @param key - Rule identifier
     * @param context - Current parsing context
     * @param random - Random number generator
     * @returns Generated value or null if rule doesn't exist
     */
    abstract generateValue(key: string, context: {
        [key: string]: string;
    }, random: SeededRandom): string | null;
}
/**
 * Manager for static grammar rules
 */
export declare class StaticRuleManager extends BaseRuleManager<string[]> {
    /**
     * Add a static rule
     * @param key - Rule identifier
     * @param values - Array of possible values
     */
    addRule(key: string, values: string[]): void;
    /**
     * Add multiple static rules
     * @param grammar - Object containing key-value pairs of rules
     */
    addRules(grammar: Grammar): void;
    /**
     * Generate a value from a static rule
     * @param key - Rule identifier
     * @param context - Current parsing context (unused for static rules)
     * @param random - Random number generator
     * @returns Random value from rule or null if rule doesn't exist
     */
    generateValue(key: string, context: {
        [key: string]: string;
    }, random: SeededRandom): string | null;
    /**
     * Get all static rules as a Grammar object
     * @returns Copy of all static rules
     */
    getGrammar(): Grammar;
}
/**
 * Manager for function-based rules
 */
export declare class FunctionRuleManager extends BaseRuleManager<FunctionRule> {
    /**
     * Add a function rule
     * @param key - Rule identifier
     * @param fn - Function that returns an array of possible values
     */
    addRule(key: string, fn: FunctionRule): void;
    /**
     * Generate a value from a function rule
     * @param key - Rule identifier
     * @param context - Current parsing context (unused for function rules)
     * @param random - Random number generator
     * @returns Random value from function result or null if rule doesn't exist
     */
    generateValue(key: string, context: {
        [key: string]: string;
    }, random: SeededRandom): string | null;
}
/**
 * Manager for weighted rules
 */
export declare class WeightedRuleManager extends BaseRuleManager<WeightedRule> {
    /**
     * Add a weighted rule
     * @param key - Rule identifier
     * @param values - Array of possible values
     * @param weights - Array of probability weights (must sum to 1.0)
     */
    addRule(key: string, values: string[], weights: number[]): void;
    /**
     * Generate a value from a weighted rule
     * @param key - Rule identifier
     * @param context - Current parsing context (unused for weighted rules)
     * @param random - Random number generator
     * @returns Weighted random value or null if rule doesn't exist
     */
    generateValue(key: string, context: {
        [key: string]: string;
    }, random: SeededRandom): string | null;
}
//# sourceMappingURL=BaseRuleManager.d.ts.map