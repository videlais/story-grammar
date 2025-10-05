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
export declare class Parser {
    private grammar;
    private functionRules;
    private weightedRules;
    private modifiers;
    private variablePattern;
    private maxDepth;
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
     * @returns Parsed text with variables expanded
     */
    parse(text: string): string;
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
     * Check if a rule exists (static, function, or weighted rule)
     * @param key - The key to check
     * @returns True if the rule exists, false otherwise
     */
    hasRule(key: string): boolean;
    /**
     * Remove a rule (static, function, or weighted rule)
     * @param key - The key to remove
     * @returns True if rule was removed, false if it didn't exist
     */
    removeRule(key: string): boolean;
    /**
     * Clear all rules (static, function, and weighted rules)
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
}
//# sourceMappingURL=Parser.d.ts.map