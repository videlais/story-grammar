/**
 * Simplified Parser class that coordinates between all the specialized modules
 */
import { Grammar, Modifier, FunctionRule, ConditionalRule, TemplateRule, ParseOptions, ParseResult, ValidationResult, ParseTimingResult, ParserStats, ParserConfig, OptimizationReport, RuleAnalysis, ErrorContext, ComplexityResult, TotalComplexityResult, ProbabilityAnalysis, ProbabilityResult } from './types.js';
export declare class Parser {
    private random;
    private ruleManager;
    private variableExpander;
    private complexityAnalyzer;
    private probabilityAnalyzer;
    private validator;
    private errorHandler;
    private modifiers;
    constructor();
    /**
     * Add a static rule to the grammar
     */
    addRule(key: string, values: string[]): void;
    /**
     * Add multiple rules to the grammar
     */
    addRules(rules: Grammar): void;
    /**
     * Add a function rule to the grammar
     */
    addFunctionRule(key: string, fn: FunctionRule): void;
    /**
     * Add a weighted rule for probability-controlled random selection
     */
    addWeightedRule(key: string, values: string[], weights: number[]): void;
    /**
     * Add a context-aware conditional rule for dynamic value selection
     */
    addConditionalRule(key: string, rule: ConditionalRule): void;
    /**
     * Add a sequential rule for ordered value progression
     */
    addSequentialRule(key: string, values: string[], options?: {
        cycle: boolean;
    }): void;
    /**
     * Add a numeric range rule for generating values within specified bounds
     */
    addRangeRule(key: string, config: {
        min: number;
        max: number;
        step?: number;
        type: 'integer' | 'float';
    }): void;
    /**
     * Add a template rule for structured text generation with embedded variables
     */
    addTemplateRule(key: string, rule: TemplateRule): void;
    hasRule(key: string): boolean;
    removeRule(key: string): boolean;
    clear(): void;
    hasFunctionRule(key: string): boolean;
    hasWeightedRule(key: string): boolean;
    hasConditionalRule(key: string): boolean;
    hasSequentialRule(key: string): boolean;
    hasRangeRule(key: string): boolean;
    hasTemplateRule(key: string): boolean;
    removeFunctionRule(key: string): boolean;
    removeWeightedRule(key: string): boolean;
    removeConditionalRule(key: string): boolean;
    removeSequentialRule(key: string): boolean;
    removeRangeRule(key: string): boolean;
    removeTemplateRule(key: string): boolean;
    clearFunctionRules(): void;
    clearWeightedRules(): void;
    clearConditionalRules(): void;
    clearSequentialRules(): void;
    clearRangeRules(): void;
    clearTemplateRules(): void;
    resetSequentialRule(key: string): boolean;
    getGrammar(): Grammar;
    /**
     * Add a modifier to the grammar
     */
    addModifier(modifier: Modifier): void;
    /**
     * Remove a modifier from the grammar
     */
    removeModifier(name: string): boolean;
    /**
     * Check if a modifier exists
     */
    hasModifier(name: string): boolean;
    /**
     * Get all modifiers sorted by priority
     */
    getModifiers(): Modifier[];
    /**
     * Load a modifier into the parser
     */
    loadModifier(modifier: Modifier): void;
    /**
     * Load multiple modifiers into the parser
     */
    loadModifiers(modifiers: Modifier[]): void;
    /**
     * Clear all modifiers
     */
    clearModifiers(): void;
    /**
     * Clear all rules and modifiers
     */
    clearAll(): void;
    /**
     * Parse and expand variables in text using the configured grammar rules
     *
     * This is the core parsing method that processes text containing %variable% placeholders,
     * replacing them with generated values according to the defined grammar rules.
     *
     * @param text - Input text containing %variable% placeholders to expand
     * @param preserveContext - If true, maintains variable values from previous parse calls
     * @returns Fully expanded text with all variables replaced and modifiers applied
     */
    parse(text: string, preserveContext?: boolean): string;
    /**
     * Parse text with performance timing
     */
    parseWithTiming(text: string, preserveContext?: boolean): ParseTimingResult;
    /**
     * Parse text with comprehensive error handling and retry logic
     */
    safeParse(text: string, options?: ParseOptions): ParseResult;
    /**
     * Apply all applicable modifiers to text
     * @private
     */
    private applyModifiers;
    /**
     * Efficiently process multiple texts with optimized context management
     */
    parseBatch(texts: string[], preserveContext?: boolean): string[];
    /**
     * Generate multiple unique variations of text for testing and content creation
     */
    generateVariations(text: string, count: number, seed?: number): string[];
    /**
     * Set maximum recursion depth for variable expansion
     */
    setMaxDepth(depth: number): void;
    /**
     * Get the current maximum recursion depth
     */
    getMaxDepth(): number;
    /**
     * Configure deterministic random number generation for reproducible results
     */
    setRandomSeed(seed: number): void;
    /**
     * Clear the random seed and return to using Math.random()
     */
    clearRandomSeed(): void;
    /**
     * Get the current random seed, if any
     */
    getRandomSeed(): number | null;
    /**
     * Clear all reference values and reset context
     */
    clearReferences(): void;
    /**
     * Get the current context of generated values
     */
    getContext(): {
        [key: string]: string;
    };
    /**
     * Calculate the complexity (number of possible outcomes) for a specific rule
     */
    calculateRuleComplexity(ruleKey: string, visited?: Set<string>, maxDepth?: number): ComplexityResult;
    /**
     * Calculate total complexity across all rules in the grammar
     */
    calculateTotalComplexity(maxDepth?: number): TotalComplexityResult;
    /**
     * Calculate probability analysis for a specific rule
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
     * Perform comprehensive grammar validation to detect potential issues
     */
    validate(): ValidationResult;
    /**
     * Get all variable names found in a text string
     */
    findVariables(text: string): string[];
    /**
     * Generate helpful error messages with contextual suggestions
     */
    getHelpfulError(error: Error, context?: ErrorContext): string;
    /**
     * Get comprehensive performance statistics and configuration metrics
     */
    getStats(): ParserStats;
    /**
     * Create a lightweight copy of the parser for parallel processing or experimentation
     */
    clone(): Parser;
    /**
     * Export the parser configuration as JSON
     */
    exportConfig(): ParserConfig;
    /**
     * Optimize the parser for better performance
     */
    optimize(): OptimizationReport;
    /**
     * Analyze grammar complexity, performance characteristics, and usage patterns
     */
    analyzeRules(ruleName?: string): RuleAnalysis;
}
//# sourceMappingURL=ParserCore.d.ts.map