/**
 * Simplified Parser class that coordinates between all the specialized modules
 */
import {
  Grammar,
  Modifier,
  ModifierContext,
  FunctionRule,
  ConditionalRule,
  SequentialRule,
  RangeRule,
  TemplateRule,
  ParseOptions,
  ParseResult,
  ValidationResult,  
  ParseTimingResult,
  ParserStats,
  ParserConfig,
  OptimizationReport,
  RuleAnalysis,
  ErrorContext,
  ComplexityResult,
  TotalComplexityResult,
  ProbabilityAnalysis,
  ProbabilityResult
} from './types.js';

// Import all the specialized modules
import { SeededRandom } from './utils/SeededRandom.js';
import { RuleManager } from './rules/RuleManager.js';
import { VariableExpander } from './core/VariableExpander.js';
import { ComplexityAnalyzer } from './analysis/ComplexityAnalyzer.js';
import { ProbabilityAnalyzer } from './analysis/ProbabilityAnalyzer.js';
import { GrammarValidator } from './validation/GrammarValidator.js';
import { ErrorHandler } from './core/ErrorHandler.js';

export class Parser {
  // Core modules
  private random: SeededRandom;
  private ruleManager: RuleManager;
  private variableExpander: VariableExpander;
  private complexityAnalyzer: ComplexityAnalyzer;
  private probabilityAnalyzer: ProbabilityAnalyzer;
  private validator: GrammarValidator;
  private errorHandler: ErrorHandler;
  
  // Modifiers
  private modifiers: Map<string, Modifier> = new Map();

  constructor() {
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
  public addRule(key: string, values: string[]): void {
    this.ruleManager.addRule(key, values);
  }

  /**
   * Add multiple rules to the grammar
   */
  public addRules(rules: Grammar): void {
    this.ruleManager.addRules(rules);
  }

  /**
   * Add a function rule to the grammar
   */
  public addFunctionRule(key: string, fn: FunctionRule): void {
    this.ruleManager.addFunctionRule(key, fn);
  }

  /**
   * Add a weighted rule for probability-controlled random selection
   */
  public addWeightedRule(key: string, values: string[], weights: number[]): void {
    this.ruleManager.addWeightedRule(key, values, weights);
  }

  /**
   * Add a context-aware conditional rule for dynamic value selection
   */
  public addConditionalRule(key: string, rule: ConditionalRule): void {
    this.ruleManager.addConditionalRule(key, rule);
  }

  /**
   * Add a sequential rule for ordered value progression
   */
  public addSequentialRule(key: string, values: string[], options: { cycle: boolean } = { cycle: true }): void {
    this.ruleManager.addSequentialRule(key, values, options);
  }

  /**
   * Add a numeric range rule for generating values within specified bounds
   */
  public addRangeRule(key: string, config: { min: number; max: number; step?: number; type: 'integer' | 'float' }): void {
    this.ruleManager.addRangeRule(key, config);
  }

  /**
   * Add a template rule for structured text generation with embedded variables
   */
  public addTemplateRule(key: string, rule: TemplateRule): void {
    this.ruleManager.addTemplateRule(key, rule);
  }

  // Rule checking and removal methods
  public hasRule(key: string): boolean { return this.ruleManager.hasRule(key); }
  public removeRule(key: string): boolean { return this.ruleManager.removeRule(key); }
  public clear(): void { this.ruleManager.clear(); }

  // Specific rule type checks
  public hasFunctionRule(key: string): boolean { return this.ruleManager.hasFunctionRule(key); }
  public hasWeightedRule(key: string): boolean { return this.ruleManager.hasWeightedRule(key); }
  public hasConditionalRule(key: string): boolean { return this.ruleManager.hasConditionalRule(key); }
  public hasSequentialRule(key: string): boolean { return this.ruleManager.hasSequentialRule(key); }
  public hasRangeRule(key: string): boolean { return this.ruleManager.hasRangeRule(key); }
  public hasTemplateRule(key: string): boolean { return this.ruleManager.hasTemplateRule(key); }

  // Specific rule type removal
  public removeFunctionRule(key: string): boolean { return this.ruleManager.removeFunctionRule(key); }
  public removeWeightedRule(key: string): boolean { return this.ruleManager.removeWeightedRule(key); }
  public removeConditionalRule(key: string): boolean { return this.ruleManager.removeConditionalRule(key); }
  public removeSequentialRule(key: string): boolean { return this.ruleManager.removeSequentialRule(key); }
  public removeRangeRule(key: string): boolean { return this.ruleManager.removeRangeRule(key); }
  public removeTemplateRule(key: string): boolean { return this.ruleManager.removeTemplateRule(key); }

  // Clear specific rule types
  public clearFunctionRules(): void { this.ruleManager.clearFunctionRules(); }
  public clearWeightedRules(): void { this.ruleManager.clearWeightedRules(); }
  public clearConditionalRules(): void { this.ruleManager.clearConditionalRules(); }
  public clearSequentialRules(): void { this.ruleManager.clearSequentialRules(); }
  public clearRangeRules(): void { this.ruleManager.clearRangeRules(); }
  public clearTemplateRules(): void { this.ruleManager.clearTemplateRules(); }

  // Special operations
  public resetSequentialRule(key: string): boolean { return this.ruleManager.resetSequentialRule(key); }
  public getGrammar(): Grammar { return this.ruleManager.getGrammar(); }

  // ==================== MODIFIER MANAGEMENT ====================

  /**
   * Add a modifier to the grammar
   */
  public addModifier(modifier: Modifier): void {
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
  public removeModifier(name: string): boolean {
    return this.modifiers.delete(name);
  }

  /**
   * Check if a modifier exists
   */
  public hasModifier(name: string): boolean {
    return this.modifiers.has(name);
  }

  /**
   * Get all modifiers sorted by priority
   */
  public getModifiers(): Modifier[] {
    return Array.from(this.modifiers.values()).sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
  }

  /**
   * Load a modifier into the parser
   */
  public loadModifier(modifier: Modifier): void {
    this.addModifier(modifier);
  }

  /**
   * Load multiple modifiers into the parser
   */
  public loadModifiers(modifiers: Modifier[]): void {
    for (const modifier of modifiers) {
      this.addModifier(modifier);
    }
  }

  /**
   * Clear all modifiers
   */
  public clearModifiers(): void {
    this.modifiers.clear();
  }

  /**
   * Clear all rules and modifiers
   */
  public clearAll(): void {
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
  public parse(text: string, preserveContext: boolean = false): string {
    if (typeof text !== 'string') {
      throw new Error('Text must be a string');
    }
    
    const expanded = this.variableExpander.expandVariables(text, preserveContext);
    return this.applyModifiers(expanded, { originalText: text });
  }

  /**
   * Parse text with performance timing
   */
  public parseWithTiming(text: string, preserveContext: boolean = false): ParseTimingResult {
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
  public safeParse(text: string, options: ParseOptions = {}): ParseResult {
    const {
      preserveContext = false,
      validateFirst = true,
      maxAttempts = 3
    } = options;

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

      } catch (error) {
        if (attempts >= maxAttempts) {
          return {
            success: false,
            error: this.errorHandler.getHelpfulError(error as Error, { text }),
            attempts
          };
        }

        // For recursion errors, try reducing max depth
        if (this.errorHandler['isRecursionError'](error as Error)) {
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
  private applyModifiers(text: string, context?: ModifierContext): string {
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
  public parseBatch(texts: string[], preserveContext: boolean = true): string[] {
    if (!Array.isArray(texts)) {
      throw new Error('Texts must be an array');
    }

    const results: string[] = [];
    
    for (let i = 0; i < texts.length; i++) {
      const shouldPreserve = preserveContext && i > 0;
      results.push(this.parse(texts[i], shouldPreserve));
    }
    
    return results;
  }

  /**
   * Generate multiple unique variations of text for testing and content creation
   */
  public generateVariations(text: string, count: number, seed?: number): string[] {
    if (typeof text !== 'string') {
      throw new Error('Text must be a string');
    }
    if (!Number.isInteger(count) || count <= 0) {
      throw new Error('Count must be a positive integer');
    }

    const variations: string[] = [];
    const originalSeed = this.random.getSeed();

    try {
      for (let i = 0; i < count; i++) {
        if (seed !== undefined) {
          this.random.setSeed(seed + i);
        }
        variations.push(this.parse(text, false));
      }

      return variations;
    } finally {
      // Restore original seed state
      if (originalSeed !== null) {
        this.random.setSeed(originalSeed);
      } else {
        this.random.clearSeed();
      }
    }
  }

  // ==================== CONFIGURATION ====================

  /**
   * Set maximum recursion depth for variable expansion
   */
  public setMaxDepth(depth: number): void {
    this.variableExpander.setMaxDepth(depth);
  }

  /**
   * Get the current maximum recursion depth
   */
  public getMaxDepth(): number {
    return this.variableExpander.getMaxDepth();
  }

  /**
   * Configure deterministic random number generation for reproducible results
   */
  public setRandomSeed(seed: number): void {
    this.random.setSeed(seed);
  }

  /**
   * Clear the random seed and return to using Math.random()
   */
  public clearRandomSeed(): void {
    this.random.clearSeed();
  }

  /**
   * Get the current random seed, if any
   */
  public getRandomSeed(): number | null {
    return this.random.getSeed();
  }

  /**
   * Clear all reference values and reset context
   */
  public clearReferences(): void {
    this.variableExpander.clearReferences();
  }

  /**
   * Get the current context of generated values
   */
  public getContext(): { [key: string]: string } {
    return this.variableExpander.getContext();
  }

  // ==================== ANALYSIS ====================

  /**
   * Calculate the complexity (number of possible outcomes) for a specific rule
   */
  public calculateRuleComplexity(ruleKey: string, visited: Set<string> = new Set(), maxDepth: number = 50): ComplexityResult {
    return this.complexityAnalyzer.calculateRuleComplexity(ruleKey, visited, maxDepth);
  }

  /**
   * Calculate total complexity across all rules in the grammar
   */
  public calculateTotalComplexity(maxDepth: number = 50): TotalComplexityResult {
    return this.complexityAnalyzer.calculateTotalComplexity(maxDepth);
  }

  /**
   * Calculate probability analysis for a specific rule
   */
  public calculateProbabilities(ruleKey: string, maxDepth: number = 50, maxOutcomes: number = 1000): ProbabilityAnalysis {
    return this.probabilityAnalyzer.calculateProbabilities(ruleKey, maxDepth, maxOutcomes);
  }

  /**
   * Get the most probable outcome for a rule
   */
  public getMostProbableOutcome(ruleKey: string, maxDepth: number = 50, maxOutcomes: number = 1000): ProbabilityResult | null {
    return this.probabilityAnalyzer.getMostProbableOutcome(ruleKey, maxDepth, maxOutcomes);
  }

  /**
   * Get the least probable outcome for a rule
   */
  public getLeastProbableOutcome(ruleKey: string, maxDepth: number = 50, maxOutcomes: number = 1000): ProbabilityResult | null {
    return this.probabilityAnalyzer.getLeastProbableOutcome(ruleKey, maxDepth, maxOutcomes);
  }

  // ==================== VALIDATION ====================

  /**
   * Perform comprehensive grammar validation to detect potential issues
   */
  public validate(): ValidationResult {
    return this.validator.validate();
  }

  /**
   * Get all variable names found in a text string
   */
  public findVariables(text: string): string[] {
    return this.variableExpander.findVariables(text);
  }

  /**
   * Generate helpful error messages with contextual suggestions
   */
  public getHelpfulError(error: Error, context?: ErrorContext): string {
    return this.errorHandler.getHelpfulError(error, context);
  }

  // ==================== STATISTICS AND UTILITIES ====================

  /**
   * Get comprehensive performance statistics and configuration metrics
   */
  public getStats(): ParserStats {
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
  public clone(): Parser {
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
  public exportConfig(): ParserConfig {
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
  public optimize(): OptimizationReport {
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
  public analyzeRules(ruleName?: string): RuleAnalysis {
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
    } else {
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