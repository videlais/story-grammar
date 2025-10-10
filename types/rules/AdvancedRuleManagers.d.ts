/**
 * Advanced rule managers for conditional, sequential, range, and template rules
 */
import { ConditionalRule, SequentialRule, RangeRule, TemplateRule } from '../types.js';
import { BaseRuleManager } from './BaseRuleManager.js';
import { SeededRandom } from '../utils/SeededRandom.js';
/**
 * Manager for conditional rules that select values based on context
 */
export declare class ConditionalRuleManager extends BaseRuleManager<ConditionalRule> {
    /**
     * Add a conditional rule
     * @param key - Rule identifier
     * @param rule - Conditional rule configuration
     */
    addRule(key: string, rule: ConditionalRule): void;
    /**
     * Generate a value from a conditional rule
     * @param key - Rule identifier
     * @param context - Current parsing context
     * @param random - Random number generator
     * @returns Context-appropriate value or null if rule doesn't exist
     */
    generateValue(key: string, context: {
        [key: string]: string;
    }, random: SeededRandom): string | null;
}
/**
 * Manager for sequential rules that cycle through values in order
 */
export declare class SequentialRuleManager extends BaseRuleManager<SequentialRule> {
    /**
     * Add a sequential rule
     * @param key - Rule identifier
     * @param values - Array of values to cycle through
     * @param options - Configuration options
     */
    addRule(key: string, values: string[], options?: {
        cycle: boolean;
    }): void;
    /**
     * Generate a value from a sequential rule
     * @param key - Rule identifier
     * @param context - Current parsing context (unused for sequential rules)
     * @param random - Random number generator (unused for sequential rules)
     * @returns Next value in sequence or null if rule doesn't exist
     */
    generateValue(key: string, _context: {
        [key: string]: string;
    }, _random: SeededRandom): string | null;
    /**
     * Reset a sequential rule to start from the beginning
     * @param key - Rule identifier
     * @returns True if rule was reset, false if it doesn't exist
     */
    resetRule(key: string): boolean;
}
/**
 * Manager for range rules that generate numeric values
 */
export declare class RangeRuleManager extends BaseRuleManager<RangeRule> {
    /**
     * Add a range rule
     * @param key - Rule identifier
     * @param config - Range configuration
     */
    addRule(key: string, config: {
        min: number;
        max: number;
        step?: number;
        type: 'integer' | 'float';
    }): void;
    /**
     * Generate a value from a range rule
     * @param key - Rule identifier
     * @param context - Current parsing context (unused for range rules)
     * @param random - Random number generator
     * @returns Generated numeric value as string or null if rule doesn't exist
     */
    generateValue(key: string, _context: {
        [key: string]: string;
    }, random: SeededRandom): string | null;
}
/**
 * Manager for template rules with embedded variables
 */
export declare class TemplateRuleManager extends BaseRuleManager<TemplateRule> {
    /**
     * Add a template rule
     * @param key - Rule identifier
     * @param rule - Template rule configuration
     */
    addRule(key: string, rule: TemplateRule): void;
    /**
     * Generate a value from a template rule
     * @param key - Rule identifier
     * @param context - Current parsing context
     * @param random - Random number generator
     * @returns Generated template value or null if rule doesn't exist
     */
    generateValue(key: string, _context: {
        [key: string]: string;
    }, random: SeededRandom): string | null;
    /**
     * Find all variables in a text string
     * @param text - Text to analyze
     * @returns Array of unique variable names
     */
    private findVariables;
}
//# sourceMappingURL=AdvancedRuleManagers.d.ts.map