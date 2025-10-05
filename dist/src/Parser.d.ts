/**
 * Parser for combinatorial grammar with variable expansion
 */
export interface Grammar {
    [key: string]: string[];
}
export interface ModifierFunction {
    (text: string, context?: ModifierContext): string;
}
export interface ModifierContext {
    ruleName?: string;
    originalText?: string;
    variables?: {
        [key: string]: string;
    };
}
export interface Modifier {
    name: string;
    condition: (text: string, context?: ModifierContext) => boolean;
    transform: ModifierFunction;
    priority?: number;
}
export interface FunctionRule {
    (): string[];
}
export interface WeightedRule {
    values: string[];
    weights: number[];
    cumulativeWeights: number[];
}
export interface ConditionalRule {
    conditions: Array<{
        if?: (context: {
            [key: string]: string;
        }) => boolean;
        then: string[];
        default?: never;
    } | {
        if?: never;
        then?: never;
        default: string[];
    }>;
}
export interface SequentialRule {
    values: string[];
    index: number;
    cycle: boolean;
}
export interface RangeRule {
    min: number;
    max: number;
    step?: number;
    type: 'integer' | 'float';
}
export interface TemplateRule {
    template: string;
    variables: {
        [key: string]: string[];
    };
}
export declare class Parser {
    private grammar;
    private functionRules;
    private weightedRules;
    private conditionalRules;
    private sequentialRules;
    private rangeRules;
    private templateRules;
    private referenceValues;
    private modifiers;
    private variablePattern;
    private maxDepth;
    private randomSeed;
    private currentSeed;
    private currentContext;
    /**
     * Add a rule to the grammar
     * @param key - The key to define
     * @param values - Array of possible values for this key
     */
    addRule(key: string, values: string[]): void;
    /**
     * Add multiple rules to the grammar
     * @param rules - Object containing key-value pairs of rules
     */
    addRules(rules: Grammar): void;
    /**
     * Add a function rule to the grammar
     * @param key - The key to define
     * @param fn - Function that returns an array of possible values
     */
    addFunctionRule(key: string, fn: FunctionRule): void;
    /**
     * Remove a function rule
     * @param key - Rule key to remove
     * @returns True if the rule was removed, false if it didn't exist
     */
    removeFunctionRule(key: string): boolean;
    /**
     * Check if a function rule exists
     * @param key - Rule key to check
     * @returns True if the function rule exists
     */
    hasFunctionRule(key: string): boolean;
    /**
     * Clear all function rules
     */
    clearFunctionRules(): void;
    /**
     * Add a weighted rule to the grammar
     * @param key - The key to define
     * @param values - Array of possible values for this key
     * @param weights - Array of weights corresponding to each value (must sum to 1.0)
     */
    addWeightedRule(key: string, values: string[], weights: number[]): void;
    /**
     * Remove a weighted rule
     * @param key - Rule key to remove
     * @returns True if the rule was removed, false if it didn't exist
     */
    removeWeightedRule(key: string): boolean;
    /**
     * Check if a weighted rule exists
     * @param key - Rule key to check
     * @returns True if the weighted rule exists
     */
    hasWeightedRule(key: string): boolean;
    /**
     * Clear all weighted rules
     */
    clearWeightedRules(): void;
    /**
     * Add a conditional rule that selects values based on context
     * @param key - The key to define
     * @param rule - Conditional rule configuration with conditions and values
     */
    addConditionalRule(key: string, rule: ConditionalRule): void;
    /**
     * Add a sequential rule that cycles through values in order
     * @param key - The key to define
     * @param values - Array of values to cycle through
     * @param options - Configuration options
     */
    addSequentialRule(key: string, values: string[], options?: {
        cycle: boolean;
    }): void;
    /**
     * Add a range rule that generates numeric values within a range
     * @param key - The key to define
     * @param config - Range configuration
     */
    addRangeRule(key: string, config: {
        min: number;
        max: number;
        step?: number;
        type: 'integer' | 'float';
    }): void;
    /**
     * Add a template rule that combines multiple variables into a structured format
     * @param key - The key to define
     * @param rule - Template rule configuration
     */
    addTemplateRule(key: string, rule: TemplateRule): void;
    /**
     * Remove a conditional rule
     */
    removeConditionalRule(key: string): boolean;
    /**
     * Remove a sequential rule
     */
    removeSequentialRule(key: string): boolean;
    /**
     * Remove a range rule
     */
    removeRangeRule(key: string): boolean;
    /**
     * Remove a template rule
     */
    removeTemplateRule(key: string): boolean;
    /**
     * Check if a conditional rule exists
     */
    hasConditionalRule(key: string): boolean;
    /**
     * Check if a sequential rule exists
     */
    hasSequentialRule(key: string): boolean;
    /**
     * Check if a range rule exists
     */
    hasRangeRule(key: string): boolean;
    /**
     * Check if a template rule exists
     */
    hasTemplateRule(key: string): boolean;
    /**
     * Clear all conditional rules
     */
    clearConditionalRules(): void;
    /**
     * Clear all sequential rules
     */
    clearSequentialRules(): void;
    /**
     * Clear all range rules
     */
    clearRangeRules(): void;
    /**
     * Clear all template rules
     */
    clearTemplateRules(): void;
    /**
     * Reset a sequential rule to start from the beginning
     * @param key - The sequential rule key to reset
     * @returns True if rule was reset, false if it doesn't exist
     */
    resetSequentialRule(key: string): boolean;
    /**
     * Add a modifier to the grammar
     * @param modifier - The modifier to add
     */
    addModifier(modifier: Modifier): void;
    /**
     * Remove a modifier from the grammar
     * @param name - The name of the modifier to remove
     * @returns True if the modifier was removed, false if it didn't exist
     */
    removeModifier(name: string): boolean;
    /**
     * Check if a modifier exists
     * @param name - The name of the modifier to check
     * @returns True if the modifier exists, false otherwise
     */
    hasModifier(name: string): boolean;
    /**
     * Get all modifiers
     * @returns Array of all modifiers sorted by priority
     */
    getModifiers(): Modifier[];
    /**
     * Add built-in English article modifier (a/an)
     */
    addEnglishArticleModifier(): void;
    /**
     * Add built-in English pluralization modifier
     * Handles common pluralization patterns and irregular forms
     */
    addEnglishPluralizationModifier(): void;
    /**
     * Add built-in English ordinal modifier
     * Converts cardinal numbers to ordinal format (1 -> 1st, 2 -> 2nd, etc.)
     */
    addEnglishOrdinalModifier(): void;
    /**
     * Get all grammar rules
     * @returns Copy of all grammar rules
     */
    getGrammar(): Grammar;
    /**
     * Parse a text string and expand all variables
     * @param text - The text to parse
     * @param preserveContext - Whether to preserve context from previous parse calls
     * @returns Parsed text with variables expanded
     */
    parse(text: string, preserveContext?: boolean): string;
    /**
     * Recursively expand variables in text
     * @param text - The text to expand
     * @param depth - Current recursion depth
     * @returns Text with variables expanded
     */
    private expandVariables;
    /**
     * Apply all applicable modifiers to text
     * @param text - The text to modify
     * @param context - Optional context for modifier application
     * @returns Modified text
     */
    private applyModifiers;
    /**
     * Get a value from a conditional rule based on current context
     * @param conditionalRule - The conditional rule to evaluate
     * @returns A value based on matching condition
     */
    private getConditionalValue;
    /**
     * Get the next value from a sequential rule
     * @param sequentialRule - The sequential rule to get value from
     * @returns The next value in sequence
     */
    private getSequentialValue;
    /**
     * Generate a value from a range rule
     * @param rangeRule - The range rule configuration
     * @returns A value within the specified range
     */
    private getRangeValue;
    /**
     * Generate a value from a template rule
     * @param templateRule - The template rule configuration
     * @returns A value with template variables expanded
     */
    private getTemplateValue;
    /**
     * Generate a seeded random number between 0 and 1
     * Uses Linear Congruential Generator (LCG) when seed is set
     * @returns Random number between 0 and 1
     */
    private getSeededRandom;
    /**
     * Get a random value from an array
     * @param values - Array of values to choose from
     * @returns A random value from the array
     */
    private getRandomValue;
    /**
     * Get a weighted random value from a weighted rule
     * @param weightedRule - Weighted rule containing values and cumulative weights
     * @returns A weighted random value
     */
    private getWeightedRandomValue;
    /**
     * Check if a rule exists (any rule type)
     * @param key - The key to check
     * @returns True if the rule exists, false otherwise
     */
    hasRule(key: string): boolean;
    /**
     * Remove a rule (any rule type)
     * @param key - The key to remove
     * @returns True if rule was removed, false if it didn't exist
     */
    removeRule(key: string): boolean;
    /**
     * Clear all rules (all rule types)
     */
    clear(): void;
    /**
     * Clear all modifiers
     */
    clearModifiers(): void;
    /**
     * Clear all rules and modifiers
     */
    clearAll(): void;
    /**
     * Get all variable names found in a text string
     * @param text - The text to analyze
     * @returns Array of unique variable names found
     */
    findVariables(text: string): string[];
    /**
     * Validate that all variables in the grammar can be resolved
     * @returns Object containing validation results
     */
    validate(): {
        isValid: boolean;
        missingRules: string[];
        circularReferences: string[];
    };
    /**
     * Set the maximum recursion depth for variable expansion
     * @param depth - Maximum depth (default: 100)
     */
    setMaxDepth(depth: number): void;
    /**
     * Get the current maximum recursion depth
     * @returns Current maximum depth
     */
    getMaxDepth(): number;
    /**
     * Set a random seed for deterministic random number generation
     * This makes the parser produce consistent, reproducible results for testing
     * @param seed - Integer seed value (will be converted to 32-bit unsigned integer)
     */
    setRandomSeed(seed: number): void;
    /**
     * Clear the random seed and return to using Math.random()
     */
    clearRandomSeed(): void;
    /**
     * Get the current random seed, if any
     * @returns Current seed or null if using Math.random()
     */
    getRandomSeed(): number | null;
    /**
     * Clear all reference values and reset context
     * Useful for starting fresh generation without clearing rules
     */
    clearReferences(): void;
    /**
     * Get the current context of generated values
     * @returns Copy of current context
     */
    getContext(): {
        [key: string]: string;
    };
}
//# sourceMappingURL=Parser.d.ts.map