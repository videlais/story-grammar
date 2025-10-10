// Import all the specialized modules
import { SeededRandom } from './utils/SeededRandom.js';
import { RuleManager } from './rules/RuleManager.js';
import { VariableExpander } from './core/VariableExpander.js';
import { ComplexityAnalyzer } from './analysis/ComplexityAnalyzer.js';
import { ProbabilityAnalyzer } from './analysis/ProbabilityAnalyzer.js';
import { GrammarValidator } from './validation/GrammarValidator.js';
import { ErrorHandler } from './core/ErrorHandler.js';
export class Parser {
    constructor() {
        // Modifiers
        this.modifiers = new Map();
        // Initialize all modules
        this.random = new SeededRandom();
        this.ruleManager = new RuleManager();
        this.variableExpander = new VariableExpander(this.ruleManager, this.random);
        this.complexityAnalyzer = new ComplexityAnalyzer(this.ruleManager, this.variableExpander);
        this.probabilityAnalyzer = new ProbabilityAnalyzer(this.ruleManager, this.variableExpander);
        this.validator = new GrammarValidator(this.ruleManager, this.variableExpander);
        this.errorHandler = new ErrorHandler(this.ruleManager, this.validator);
    }
    // ==================== RULE MANAGEMENT ====================
    /**
     * Add a static rule to the grammar
     */
    addRule(key, values) {
        this.ruleManager.addRule(key, values);
    }
    /**
     * Add multiple rules to the grammar
     */
    addRules(rules) {
        this.ruleManager.addRules(rules);
    }
    /**
     * Add a function rule to the grammar
     */
    addFunctionRule(key, fn) {
        this.ruleManager.addFunctionRule(key, fn);
    }
    /**
     * Add a weighted rule for probability-controlled random selection
     */
    addWeightedRule(key, values, weights) {
        this.ruleManager.addWeightedRule(key, values, weights);
    }
    /**
     * Add a context-aware conditional rule for dynamic value selection
     */
    addConditionalRule(key, rule) {
        this.ruleManager.addConditionalRule(key, rule);
    }
    /**
     * Add a sequential rule for ordered value progression
     */
    addSequentialRule(key, values, options = { cycle: true }) {
        this.ruleManager.addSequentialRule(key, values, options);
    }
    /**
     * Add a numeric range rule for generating values within specified bounds
     */
    addRangeRule(key, config) {
        this.ruleManager.addRangeRule(key, config);
    }
    /**
     * Add a template rule for structured text generation with embedded variables
     */
    addTemplateRule(key, rule) {
        this.ruleManager.addTemplateRule(key, rule);
    }
    // Rule checking and removal methods
    hasRule(key) { return this.ruleManager.hasRule(key); }
    removeRule(key) { return this.ruleManager.removeRule(key); }
    clear() { this.ruleManager.clear(); }
    // Specific rule type checks
    hasFunctionRule(key) { return this.ruleManager.hasFunctionRule(key); }
    hasWeightedRule(key) { return this.ruleManager.hasWeightedRule(key); }
    hasConditionalRule(key) { return this.ruleManager.hasConditionalRule(key); }
    hasSequentialRule(key) { return this.ruleManager.hasSequentialRule(key); }
    hasRangeRule(key) { return this.ruleManager.hasRangeRule(key); }
    hasTemplateRule(key) { return this.ruleManager.hasTemplateRule(key); }
    // Specific rule type removal
    removeFunctionRule(key) { return this.ruleManager.removeFunctionRule(key); }
    removeWeightedRule(key) { return this.ruleManager.removeWeightedRule(key); }
    removeConditionalRule(key) { return this.ruleManager.removeConditionalRule(key); }
    removeSequentialRule(key) { return this.ruleManager.removeSequentialRule(key); }
    removeRangeRule(key) { return this.ruleManager.removeRangeRule(key); }
    removeTemplateRule(key) { return this.ruleManager.removeTemplateRule(key); }
    // Clear specific rule types
    clearFunctionRules() { this.ruleManager.clearFunctionRules(); }
    clearWeightedRules() { this.ruleManager.clearWeightedRules(); }
    clearConditionalRules() { this.ruleManager.clearConditionalRules(); }
    clearSequentialRules() { this.ruleManager.clearSequentialRules(); }
    clearRangeRules() { this.ruleManager.clearRangeRules(); }
    clearTemplateRules() { this.ruleManager.clearTemplateRules(); }
    // Special operations
    resetSequentialRule(key) { return this.ruleManager.resetSequentialRule(key); }
    getGrammar() { return this.ruleManager.getGrammar(); }
    // ==================== MODIFIER MANAGEMENT ====================
    /**
     * Add a modifier to the grammar
     */
    addModifier(modifier) {
        if (!modifier || typeof modifier !== 'object') {
            throw new Error('Modifier must be an object');
        }
        if (!modifier.name || typeof modifier.name !== 'string') {
            throw new Error('Modifier must have a name');
        }
        if (typeof modifier.condition !== 'function') {
            throw new Error('Modifier must have a condition function');
        }
        if (typeof modifier.transform !== 'function') {
            throw new Error('Modifier must have a transform function');
        }
        this.modifiers.set(modifier.name, {
            ...modifier,
            priority: modifier.priority ?? 0
        });
    }
    /**
     * Remove a modifier from the grammar
     */
    removeModifier(name) {
        return this.modifiers.delete(name);
    }
    /**
     * Check if a modifier exists
     */
    hasModifier(name) {
        return this.modifiers.has(name);
    }
    /**
     * Get all modifiers sorted by priority
     */
    getModifiers() {
        return Array.from(this.modifiers.values()).sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
    }
    /**
     * Load a modifier into the parser
     */
    loadModifier(modifier) {
        this.addModifier(modifier);
    }
    /**
     * Load multiple modifiers into the parser
     */
    loadModifiers(modifiers) {
        for (const modifier of modifiers) {
            this.addModifier(modifier);
        }
    }
    /**
     * Clear all modifiers
     */
    clearModifiers() {
        this.modifiers.clear();
    }
    /**
     * Clear all rules and modifiers
     */
    clearAll() {
        this.clear();
        this.clearModifiers();
    }
    // ==================== PARSING ====================
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
    parse(text, preserveContext = false) {
        if (typeof text !== 'string') {
            throw new Error('Text must be a string');
        }
        const expanded = this.variableExpander.expandVariables(text, preserveContext);
        return this.applyModifiers(expanded, { originalText: text });
    }
    /**
     * Parse text with performance timing
     */
    parseWithTiming(text, preserveContext = false) {
        const startTime = Date.now();
        if (typeof text !== 'string') {
            throw new Error('Text must be a string');
        }
        const expansionStart = Date.now();
        const expanded = this.variableExpander.expandVariables(text, preserveContext);
        const expansionEnd = Date.now();
        const modifierStart = Date.now();
        const result = this.applyModifiers(expanded, { originalText: text });
        const modifierEnd = Date.now();
        const totalEnd = Date.now();
        return {
            result,
            timing: {
                totalMs: totalEnd - startTime,
                expansionMs: expansionEnd - expansionStart,
                modifierMs: modifierEnd - modifierStart
            }
        };
    }
    /**
     * Parse text with comprehensive error handling and retry logic
     */
    safeParse(text, options = {}) {
        const { preserveContext = false, validateFirst = true, maxAttempts = 3 } = options;
        let attempts = 0;
        while (attempts < maxAttempts) {
            attempts++;
            try {
                // Validate grammar first if requested
                if (validateFirst && attempts === 1) {
                    const validation = this.validate();
                    if (!validation.isValid) {
                        let error = 'Validation failed';
                        if (validation.missingRules.length > 0) {
                            error = `Validation failed - missing rules: ${validation.missingRules.join(', ')}`;
                        }
                        return {
                            success: false,
                            error,
                            attempts,
                            validation
                        };
                    }
                }
                const result = this.parse(text, preserveContext);
                return {
                    success: true,
                    result,
                    attempts
                };
            }
            catch (error) {
                if (attempts >= maxAttempts) {
                    return {
                        success: false,
                        error: this.errorHandler.getHelpfulError(error, { text }),
                        attempts
                    };
                }
                // For recursion errors, try reducing max depth
                if (this.errorHandler['isRecursionError'](error)) {
                    const currentDepth = this.variableExpander.getMaxDepth();
                    this.variableExpander.setMaxDepth(Math.max(10, Math.floor(currentDepth * 0.7)));
                }
            }
        }
        return {
            success: false,
            error: 'Maximum attempts exceeded',
            attempts
        };
    }
    /**
     * Apply all applicable modifiers to text
     * @private
     */
    applyModifiers(text, context) {
        let modifiedText = text;
        // Get modifiers sorted by priority (higher priority first)
        const sortedModifiers = this.getModifiers();
        for (const modifier of sortedModifiers) {
            if (modifier.condition(modifiedText, context)) {
                modifiedText = modifier.transform(modifiedText, context);
            }
        }
        return modifiedText;
    }
    // ==================== BATCH PROCESSING ====================
    /**
     * Efficiently process multiple texts with optimized context management
     */
    parseBatch(texts, preserveContext = true) {
        if (!Array.isArray(texts)) {
            throw new Error('Texts must be an array');
        }
        const results = [];
        for (let i = 0; i < texts.length; i++) {
            const shouldPreserve = preserveContext && i > 0;
            results.push(this.parse(texts[i], shouldPreserve));
        }
        return results;
    }
    /**
     * Generate multiple unique variations of text for testing and content creation
     */
    generateVariations(text, count, seed) {
        if (typeof text !== 'string') {
            throw new Error('Text must be a string');
        }
        if (!Number.isInteger(count) || count <= 0) {
            throw new Error('Count must be a positive integer');
        }
        const variations = [];
        const originalSeed = this.random.getSeed();
        try {
            for (let i = 0; i < count; i++) {
                if (seed !== undefined) {
                    this.random.setSeed(seed + i);
                }
                variations.push(this.parse(text, false));
            }
            return variations;
        }
        finally {
            // Restore original seed state
            if (originalSeed !== null) {
                this.random.setSeed(originalSeed);
            }
            else {
                this.random.clearSeed();
            }
        }
    }
    // ==================== CONFIGURATION ====================
    /**
     * Set maximum recursion depth for variable expansion
     */
    setMaxDepth(depth) {
        this.variableExpander.setMaxDepth(depth);
    }
    /**
     * Get the current maximum recursion depth
     */
    getMaxDepth() {
        return this.variableExpander.getMaxDepth();
    }
    /**
     * Configure deterministic random number generation for reproducible results
     */
    setRandomSeed(seed) {
        this.random.setSeed(seed);
    }
    /**
     * Clear the random seed and return to using Math.random()
     */
    clearRandomSeed() {
        this.random.clearSeed();
    }
    /**
     * Get the current random seed, if any
     */
    getRandomSeed() {
        return this.random.getSeed();
    }
    /**
     * Clear all reference values and reset context
     */
    clearReferences() {
        this.variableExpander.clearReferences();
    }
    /**
     * Get the current context of generated values
     */
    getContext() {
        return this.variableExpander.getContext();
    }
    // ==================== ANALYSIS ====================
    /**
     * Calculate the complexity (number of possible outcomes) for a specific rule
     */
    calculateRuleComplexity(ruleKey, visited = new Set(), maxDepth = 50) {
        return this.complexityAnalyzer.calculateRuleComplexity(ruleKey, visited, maxDepth);
    }
    /**
     * Calculate total complexity across all rules in the grammar
     */
    calculateTotalComplexity(maxDepth = 50) {
        return this.complexityAnalyzer.calculateTotalComplexity(maxDepth);
    }
    /**
     * Calculate probability analysis for a specific rule
     */
    calculateProbabilities(ruleKey, maxDepth = 50, maxOutcomes = 1000) {
        return this.probabilityAnalyzer.calculateProbabilities(ruleKey, maxDepth, maxOutcomes);
    }
    /**
     * Get the most probable outcome for a rule
     */
    getMostProbableOutcome(ruleKey, maxDepth = 50, maxOutcomes = 1000) {
        return this.probabilityAnalyzer.getMostProbableOutcome(ruleKey, maxDepth, maxOutcomes);
    }
    /**
     * Get the least probable outcome for a rule
     */
    getLeastProbableOutcome(ruleKey, maxDepth = 50, maxOutcomes = 1000) {
        return this.probabilityAnalyzer.getLeastProbableOutcome(ruleKey, maxDepth, maxOutcomes);
    }
    // ==================== VALIDATION ====================
    /**
     * Perform comprehensive grammar validation to detect potential issues
     */
    validate() {
        return this.validator.validate();
    }
    /**
     * Get all variable names found in a text string
     */
    findVariables(text) {
        return this.variableExpander.findVariables(text);
    }
    /**
     * Generate helpful error messages with contextual suggestions
     */
    getHelpfulError(error, context) {
        return this.errorHandler.getHelpfulError(error, context);
    }
    // ==================== STATISTICS AND UTILITIES ====================
    /**
     * Get comprehensive performance statistics and configuration metrics
     */
    getStats() {
        const ruleStats = this.ruleManager.getStats();
        return {
            totalRules: ruleStats.total,
            rulesByType: {
                static: ruleStats.static,
                function: ruleStats.function,
                weighted: ruleStats.weighted,
                conditional: ruleStats.conditional,
                sequential: ruleStats.sequential,
                range: ruleStats.range,
                template: ruleStats.template
            },
            totalModifiers: this.modifiers.size,
            maxDepth: this.getMaxDepth(),
            hasRandomSeed: this.random.getSeed() !== null
        };
    }
    /**
     * Create a lightweight copy of the parser for parallel processing or experimentation
     */
    clone() {
        const cloned = new Parser();
        // Copy static rules
        const grammar = this.getGrammar();
        cloned.addRules(grammar);
        // Copy settings
        cloned.setMaxDepth(this.getMaxDepth());
        const seed = this.getRandomSeed();
        if (seed !== null) {
            cloned.setRandomSeed(seed);
        }
        // Copy modifiers
        const modifiers = this.getModifiers();
        cloned.loadModifiers(modifiers);
        return cloned;
    }
    // ==================== PLACEHOLDER METHODS ====================
    // These methods are included for compatibility but may not be fully implemented
    /**
     * Export the parser configuration as JSON
     */
    exportConfig() {
        // Placeholder implementation
        return {
            grammar: this.getGrammar(),
            modifiers: this.getModifiers().map(m => m.name),
            settings: {
                maxDepth: this.getMaxDepth(),
                randomSeed: this.getRandomSeed()
            }
        };
    }
    /**
     * Optimize the parser for better performance
     */
    optimize() {
        const validation = this.validate();
        const warnings = [...validation.warnings];
        const suggestions = [];
        // Add optimization-specific warnings and suggestions
        if (this.variableExpander.getMaxDepth() > 20) {
            suggestions.push('Consider reducing max depth for better performance.');
        }
        // Check modifier count
        if (this.modifiers.size >= 15) {
            warnings.push(`Many modifiers (${this.modifiers.size}). High-priority modifiers run first.`);
        }
        suggestions.push(...validation.missingRules.concat(validation.circularReferences));
        return {
            warnings,
            suggestions,
            optimized: false // Always false for now since we don't actually optimize
        };
    }
    /**
     * Analyze grammar complexity, performance characteristics, and usage patterns
     */
    analyzeRules(ruleName) {
        if (ruleName) {
            const complexity = this.calculateRuleComplexity(ruleName);
            return {
                totalComplexity: complexity.complexity,
                averageDepth: complexity.depth,
                mostComplex: [complexity.ruleName],
                suggestions: complexity.warnings,
                ruleDetails: {
                    name: complexity.ruleName,
                    type: complexity.ruleType,
                    complexity: complexity.complexity,
                    variables: complexity.variables,
                    depth: complexity.depth
                }
            };
        }
        else {
            const totalComplexity = this.calculateTotalComplexity();
            const suggestions = [...totalComplexity.warnings];
            // Add analysis-based suggestions
            const totalRules = Object.keys(this.ruleManager.getGrammar()).length;
            if (totalRules > 50) {
                suggestions.push('Large number of rules - consider organizing into groups');
            }
            if (totalComplexity.totalComplexity > 100) {
                suggestions.push('High total complexity - consider simplifying rules');
            }
            return {
                totalComplexity: totalComplexity.totalComplexity,
                averageDepth: totalComplexity.averageComplexity,
                mostComplex: totalComplexity.mostComplexRules.map(r => r.ruleName),
                suggestions
            };
        }
    }
}
//# sourceMappingURL=ParserCore.js.map