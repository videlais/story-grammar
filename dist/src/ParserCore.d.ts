/**
 * Core Parser class for combinatorial grammar with variable expansion
 *
 * This class provides a comprehensive text generation system using grammar rules
 * with variable substitution, modifiers, and multiple rule types including:
 * - Static rules: Simple string arrays
 * - Function rules: Dynamic generation using functions
 * - Weighted rules: Probability-based selection
 * - Conditional rules: Context-dependent selection
 * - Sequential rules: Ordered cycling through values
 * - Range rules: Numeric value generation
 * - Template rules: Structured text with variable substitution
 *
 * @example
 * ```typescript
 * const parser = new Parser();
 *
 * // Add basic grammar rules
 * parser.addRules({
 *   greeting: ['Hello', 'Hi', 'Hey'],
 *   name: ['Alice', 'Bob', 'Charlie'],
 *   sentence: ['%greeting% there, %name%!']
 * });
 *
 * // Generate text
 * const result = parser.parse('%sentence%');
 * // Possible output: "Hello there, Alice!"
 *
 * // Add weighted rules for probability control
 * parser.addWeightedRule('mood',
 *   ['happy', 'excited', 'calm'],
 *   [0.5, 0.3, 0.2]
 * );
 *
 * // Add conditional rules for context-aware generation
 * parser.addConditionalRule('response', {
 *   conditions: [
 *     {
 *       if: (ctx) => ctx.mood === 'happy',
 *       then: ['Great!', 'Wonderful!', 'Fantastic!']
 *     },
 *     {
 *       default: ['Okay', 'Sure', 'Alright']
 *     }
 *   ]
 * });
 * ```
 *
 * @since 1.0.0
 * @author Story Grammar Parser Team
 */
import { Grammar, Modifier, FunctionRule, ConditionalRule, TemplateRule, ParseOptions, ParseResult, ValidationResult, ParseTimingResult, ParserStats, ParserConfig, OptimizationReport, RuleAnalysis, ErrorContext } from './types';
export declare class Parser {
    /** Core static grammar rules mapping rule names to arrays of possible values */
    private grammar;
    /** Dynamic function-based rules that generate values at runtime */
    private functionRules;
    /** Rules with weighted probability distributions for more control over randomness */
    private weightedRules;
    /** Context-aware rules that select values based on current parsing state */
    private conditionalRules;
    /** Rules that cycle through values in sequential order with optional looping */
    private sequentialRules;
    /** Numeric range rules for generating integer or floating-point values */
    private rangeRules;
    /** Template-based rules for structured text generation with variable substitution */
    private templateRules;
    /** Cache of previously generated values for reference and consistency */
    private referenceValues;
    /** Text transformation modifiers applied after variable expansion */
    private modifiers;
    /** Regular expression pattern for matching variables in %variable% format */
    private variablePattern;
    /** Maximum recursion depth to prevent infinite loops in circular references */
    private maxDepth;
    /** Optional seed for deterministic pseudo-random generation */
    private randomSeed;
    /** Current state of the Linear Congruential Generator for seeded randomness */
    private currentSeed;
    /** Current parsing context containing generated variable values */
    private currentContext;
    /**
     * Add a static rule to the grammar
     *
     * Static rules are the most basic rule type, containing arrays of possible values
     * that can be randomly selected during text generation.
     *
     * @param key - The unique identifier for this rule (must be non-empty string)
     * @param values - Array of possible string values for this rule
     *
     * @throws {Error} If key is not a non-empty string
     * @throws {Error} If values is not an array
     *
     * @example
     * ```typescript
     * parser.addRule('color', ['red', 'blue', 'green']);
     * parser.addRule('animal', ['cat', 'dog', 'bird']);
     * parser.addRule('sentence', ['The %color% %animal% is sleeping.']);
     *
     * const result = parser.parse('%sentence%');
     * // Possible: "The blue cat is sleeping."
     * ```
     *
     * @since 1.0.0
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
     * Add a weighted rule for probability-controlled random selection
     *
     * Weighted rules allow you to control the probability of each value being selected.
     * This is useful for creating more realistic or biased text generation where some
     * options should appear more frequently than others.
     *
     * @param key - The unique identifier for this rule
     * @param values - Array of possible string values
     * @param weights - Array of probability weights (must sum to exactly 1.0)
     *
     * @throws {Error} If key is not a non-empty string
     * @throws {Error} If values or weights are not arrays
     * @throws {Error} If arrays have different lengths
     * @throws {Error} If any weight is negative
     * @throws {Error} If weights don't sum to 1.0 (within 0.0001 tolerance)
     *
     * @example
     * ```typescript
     * // Common colors appear more frequently than rare ones
     * parser.addWeightedRule('rarity',
     *   ['common', 'uncommon', 'rare', 'legendary'],
     *   [0.6, 0.25, 0.12, 0.03]
     * );
     *
     * // Weather patterns with seasonal bias
     * parser.addWeightedRule('weather',
     *   ['sunny', 'cloudy', 'rainy', 'stormy'],
     *   [0.5, 0.3, 0.15, 0.05]
     * );
     * ```
     *
     * @since 1.0.0
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
     * Add a context-aware conditional rule for dynamic value selection
     *
     * Conditional rules evaluate the current parsing context to select appropriate values.
     * This enables sophisticated text generation that adapts based on previously generated
     * content, creating more coherent and contextually appropriate output.
     *
     * @param key - The unique identifier for this rule
     * @param rule - Configuration object containing conditions array
     * @param rule.conditions - Array of condition objects with if/then logic or default values
     *
     * @throws {Error} If key is not a non-empty string
     * @throws {Error} If rule doesn't have a conditions array
     * @throws {Error} If conditions array is empty
     * @throws {Error} If multiple default conditions are provided
     * @throws {Error} If condition structure is invalid
     *
     * @example
     * ```typescript
     * // Character dialogue based on personality
     * parser.addRule('personality', ['brave', 'cautious', 'aggressive']);
     *
     * parser.addConditionalRule('dialogue', {
     *   conditions: [
     *     {
     *       if: (ctx) => ctx.personality === 'brave',
     *       then: ['Let\'s charge ahead!', 'I\'ll lead the way!']
     *     },
     *     {
     *       if: (ctx) => ctx.personality === 'cautious',
     *       then: ['Let\'s think about this...', 'Maybe we should be careful.']
     *     },
     *     {
     *       default: ['What do you think?', 'I\'m not sure.']
     *     }
     *   ]
     * });
     *
     * // Time-based greetings
     * parser.addConditionalRule('greeting', {
     *   conditions: [
     *     {
     *       if: (ctx) => new Date().getHours() < 12,
     *       then: ['Good morning!', 'Morning!']
     *     },
     *     {
     *       if: (ctx) => new Date().getHours() >= 18,
     *       then: ['Good evening!', 'Evening!']
     *     },
     *     {
     *       default: ['Hello!', 'Hi there!']
     *     }
     *   ]
     * });
     * ```
     *
     * @since 1.0.0
     */
    addConditionalRule(key: string, rule: ConditionalRule): void;
    /**
     * Add a sequential rule for ordered value progression
     *
     * Sequential rules provide deterministic, ordered selection of values rather than
     * random selection. They can either cycle back to the beginning (loop) or stick
     * to the last value when reaching the end.
     *
     * @param key - The unique identifier for this rule
     * @param values - Array of values to cycle through in order
     * @param options - Configuration object
     * @param options.cycle - If true, loops back to start; if false, repeats last value
     *
     * @throws {Error} If key is not a non-empty string
     * @throws {Error} If values is not a non-empty array
     *
     * @example
     * ```typescript
     * // Days of the week that cycle
     * parser.addSequentialRule('weekday',
     *   ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
     *   { cycle: true }
     * );
     *
     * // Story progression that doesn't repeat
     * parser.addSequentialRule('chapter',
     *   ['Introduction', 'Rising Action', 'Climax', 'Resolution'],
     *   { cycle: false }
     * );
     *
     * // Usage
     * console.log(parser.parse('%weekday%')); // "Monday"
     * console.log(parser.parse('%weekday%')); // "Tuesday"
     * console.log(parser.parse('%weekday%')); // "Wednesday"
     *
     * // Reset to beginning if needed
     * parser.resetSequentialRule('weekday');
     * ```
     *
     * @since 1.0.0
     */
    addSequentialRule(key: string, values: string[], options?: {
        cycle: boolean;
    }): void;
    /**
     * Add a numeric range rule for generating values within specified bounds
     *
     * Range rules generate numeric values within defined minimum and maximum bounds.
     * They support both continuous (float) and discrete (integer) generation, with
     * optional step sizes for creating specific numeric sequences.
     *
     * @param key - The unique identifier for this rule
     * @param config - Range configuration object
     * @param config.min - Minimum value (inclusive)
     * @param config.max - Maximum value (exclusive for continuous, inclusive for stepped)
     * @param config.step - Optional step size for discrete intervals
     * @param config.type - Number type: 'integer' for whole numbers, 'float' for decimals
     *
     * @throws {Error} If key is not a non-empty string
     * @throws {Error} If min or max are not numbers
     * @throws {Error} If min >= max
     * @throws {Error} If step is not a positive number
     * @throws {Error} If type is not 'integer' or 'float'
     *
     * @example
     * ```typescript
     * // Random ages for characters
     * parser.addRangeRule('age', {
     *   min: 18,
     *   max: 65,
     *   type: 'integer'
     * });
     *
     * // Temperature with decimal precision
     * parser.addRangeRule('temperature', {
     *   min: -10.0,
     *   max: 35.0,
     *   type: 'float'
     * });
     *
     * // Dice rolls with step
     * parser.addRangeRule('d6', {
     *   min: 1,
     *   max: 6,
     *   step: 1,
     *   type: 'integer'
     * });
     *
     * // Usage in text
     * parser.addRule('character', ['%name% is %age% years old']);
     * // Output: "Alice is 34 years old"
     * ```
     *
     * @since 1.0.0
     */
    addRangeRule(key: string, config: {
        min: number;
        max: number;
        step?: number;
        type: 'integer' | 'float';
    }): void;
    /**
     * Add a template rule for structured text generation with embedded variables
     *
     * Template rules define reusable text structures with embedded variable placeholders.
     * They provide their own variable scope, making them ideal for creating consistent
     * formats like addresses, names, or structured data without affecting global context.
     *
     * @param key - The unique identifier for this rule
     * @param rule - Template configuration object
     * @param rule.template - Template string with %variable% placeholders
     * @param rule.variables - Object mapping variable names to arrays of possible values
     *
     * @throws {Error} If key is not a non-empty string
     * @throws {Error} If template is not a non-empty string
     * @throws {Error} If variables is not an object
     * @throws {Error} If template references undefined variables
     * @throws {Error} If any variable value is not an array
     *
     * @example
     * ```typescript
     * // Address template
     * parser.addTemplateRule('address', {
     *   template: '%number% %street% %type%, %city%, %state% %zip%',
     *   variables: {
     *     number: ['123', '456', '789', '1001'],
     *     street: ['Oak', 'Pine', 'Maple', 'Cedar'],
     *     type: ['Street', 'Avenue', 'Boulevard', 'Lane'],
     *     city: ['Springfield', 'Riverside', 'Franklin'],
     *     state: ['CA', 'NY', 'TX', 'FL'],
     *     zip: ['12345', '67890', '54321']
     *   }
     * });
     *
     * // Character name template
     * parser.addTemplateRule('fullName', {
     *   template: '%title% %first% %middle% %last%',
     *   variables: {
     *     title: ['Mr.', 'Ms.', 'Dr.', 'Prof.'],
     *     first: ['John', 'Jane', 'Michael', 'Sarah'],
     *     middle: ['A.', 'B.', 'C.', 'D.'],
     *     last: ['Smith', 'Johnson', 'Williams', 'Brown']
     *   }
     * });
     *
     * // Usage
     * console.log(parser.parse('%address%'));
     * // "123 Oak Street, Springfield, CA 12345"
     * ```
     *
     * @since 1.0.0
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
     * Load a modifier into the parser
     * @param modifier - The modifier to load
     */
    loadModifier(modifier: Modifier): void;
    /**
     * Load multiple modifiers into the parser
     * @param modifiers - Array of modifiers to load
     */
    loadModifiers(modifiers: Modifier[]): void;
    /**
     * Get all grammar rules
     * @returns Copy of all grammar rules
     */
    getGrammar(): Grammar;
    /**
     * Parse and expand variables in text using the configured grammar rules
     *
     * This is the core parsing method that processes text containing %variable% placeholders,
     * replacing them with generated values according to the defined grammar rules. The parsing
     * process includes variable expansion, modifier application, and context management.
     *
     * The parsing happens in several phases:
     * 1. Context management (clear or preserve from previous calls)
     * 2. Recursive variable expansion using grammar rules
     * 3. Modifier application for text transformations
     *
     * @param text - Input text containing %variable% placeholders to expand
     * @param preserveContext - If true, maintains variable values from previous parse calls;
     *                         if false, starts with fresh context (default: false)
     *
     * @returns Fully expanded text with all variables replaced and modifiers applied
     *
     * @throws {Error} If text is not a string
     * @throws {Error} If maximum recursion depth is exceeded (circular references)
     * @throws {Error} If function rules throw errors during execution
     *
     * @example
     * ```typescript
     * parser.addRules({
     *   greeting: ['Hello', 'Hi', 'Hey'],
     *   name: ['Alice', 'Bob', 'Charlie'],
     *   punctuation: ['!', '.', '?']
     * });
     *
     * // Basic parsing
     * const result1 = parser.parse('%greeting%, %name%%punctuation%');
     * // Possible: "Hi, Alice!"
     *
     * // Context preservation
     * const result2 = parser.parse('My name is %name%.');
     * const result3 = parser.parse('Nice to meet you, %name%!', true);
     * // result3 will use the same name as result2
     *
     * // Nested variables
     * parser.addRule('sentence', ['%greeting% there, %name%!']);
     * const result4 = parser.parse('%sentence%');
     * // "Hello there, Bob!"
     * ```
     *
     * @see {@link safeParse} for error-handling version
     * @see {@link parseWithTiming} for performance monitoring
     * @see {@link parseBatch} for multiple text processing
     *
     * @since 1.0.0
     */
    parse(text: string, preserveContext?: boolean): string;
    /**
     * Parse text with performance timing
     * @param text - The text to parse
     * @param preserveContext - Whether to preserve context
     * @returns Object with result and timing information
     */
    parseWithTiming(text: string, preserveContext?: boolean): ParseTimingResult;
    /**
     * Recursively expand variables in text with comprehensive rule type support
     *
     * This private method handles the core variable expansion logic, processing %variable%
     * placeholders and replacing them with values from the appropriate rule types. It follows
     * a specific priority order for rule resolution and includes recursion protection.
     *
     * Rule Resolution Priority (first match wins):
     * 1. Reference rules (@variable syntax) - cached previous values
     * 2. Function rules - dynamic generation via JavaScript functions
     * 3. Conditional rules - context-aware value selection
     * 4. Sequential rules - ordered cycling through values
     * 5. Range rules - numeric value generation
     * 6. Template rules - structured text with embedded variables
     * 7. Weighted rules - probability-based selection
     * 8. Static rules - simple random selection from arrays
     *
     * @param text - Input text containing %variable% placeholders
     * @param depth - Current recursion depth (used to prevent infinite loops)
     *
     * @returns Text with one level of variable expansion completed
     *
     * @throws {Error} If recursion depth exceeds maxDepth (prevents circular references)
     * @throws {Error} If function rules fail during execution
     *
     * @private
     * @since 1.0.0
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
     * Perform comprehensive grammar validation to detect potential issues
     *
     * This method analyzes the entire grammar structure to identify problems that could
     * cause parsing failures or unexpected behavior. It checks for missing references,
     * circular dependencies, empty rules, and provides warnings for potential issues.
     *
     * Validation Checks:
     * - Missing rule references (variables that don't have corresponding rules)
     * - Circular references (rules that reference themselves directly)
     * - Empty rules (rules with no values or empty arrays)
     * - Unreachable rules (rules that are never referenced by other rules)
     * - Grammar completeness and consistency
     *
     * @returns Comprehensive validation results object
     * @returns ValidationResult.isValid - Overall validation status (true if no critical errors)
     * @returns ValidationResult.missingRules - Array of rule names that are referenced but not defined
     * @returns ValidationResult.circularReferences - Array of rule names with direct self-references
     * @returns ValidationResult.emptyRules - Array of rule names with no values
     * @returns ValidationResult.unreachableRules - Array of defined rules that are never referenced
     * @returns ValidationResult.warnings - Array of non-critical issues and suggestions
     *
     * @example
     * ```typescript
     * // Set up grammar with some issues
     * parser.addRules({
     *   greeting: ['Hello %name%'],     // references 'name' (missing)
     *   recursive: ['%recursive%'],     // circular reference
     *   empty: [],                      // empty rule
     *   unused: ['never referenced']    // unreachable
     * });
     *
     * const validation = parser.validate();
     * console.log('Valid:', validation.isValid);  // false
     * console.log('Missing:', validation.missingRules);  // ['name']
     * console.log('Circular:', validation.circularReferences);  // ['recursive']
     * console.log('Empty:', validation.emptyRules);  // ['empty']
     * console.log('Unreachable:', validation.unreachableRules);  // ['unused']
     *
     * // Fix issues
     * parser.addRule('name', ['Alice', 'Bob']);
     * parser.removeRule('recursive');
     * parser.removeRule('empty');
     *
     * const validation2 = parser.validate();
     * console.log('Valid now:', validation2.isValid);  // true
     * ```
     *
     * @see {@link safeParse} for validation integration
     * @see {@link getHelpfulError} for error context
     *
     * @since 1.0.0
     */
    validate(): ValidationResult;
    /**
     * Parse text with comprehensive error handling and retry logic
     *
     * This method provides a robust parsing interface that gracefully handles errors,
     * validates grammar before parsing, and implements retry mechanisms for transient
     * failures. It's the recommended method for production use where error handling
     * is critical.
     *
     * Features:
     * - Pre-parsing grammar validation (optional)
     * - Automatic retry on recursion errors with depth reduction
     * - Comprehensive error reporting with context
     * - Attempt counting for debugging
     *
     * @param text - Input text to parse and expand
     * @param options - Configuration options for parsing behavior
     * @param options.preserveContext - Maintain context from previous calls (default: false)
     * @param options.validateFirst - Run grammar validation before parsing (default: true)
     * @param options.maxAttempts - Maximum retry attempts on recoverable errors (default: 3)
     *
     * @returns ParseResult object containing either success with result or failure with error details
     * @returns ParseResult.success - Boolean indicating if parsing succeeded
     * @returns ParseResult.result - Parsed text (only present on success)
     * @returns ParseResult.error - Error message (only present on failure)
     * @returns ParseResult.attempts - Number of attempts made
     * @returns ParseResult.validation - Validation results (only present on validation failure)
     *
     * @example
     * ```typescript
     * // Basic safe parsing
     * const result = parser.safeParse('%greeting% %name%!');
     * if (result.success) {
     *   console.log('Generated:', result.result);
     * } else {
     *   console.error('Parsing failed:', result.error);
     * }
     *
     * // With custom options
     * const result2 = parser.safeParse('%complex%', {
     *   validateFirst: true,
     *   maxAttempts: 5,
     *   preserveContext: true
     * });
     *
     * // Handle validation errors
     * if (!result2.success && result2.validation) {
     *   console.log('Missing rules:', result2.validation.missingRules);
     *   console.log('Circular refs:', result2.validation.circularReferences);
     * }
     * ```
     *
     * @see {@link parse} for the basic parsing method
     * @see {@link validate} for grammar validation details
     *
     * @since 1.0.0
     */
    safeParse(text: string, options?: ParseOptions): ParseResult;
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
     * Configure deterministic random number generation for reproducible results
     *
     * Setting a random seed enables completely predictable text generation, which is
     * essential for:
     * - Unit testing with consistent expected outputs
     * - Reproducible content generation for version control
     * - Debugging grammar issues with consistent test cases
     * - A/B testing with controlled randomization
     *
     * Implementation Details:
     * - Uses Linear Congruential Generator (LCG) algorithm
     * - Parameters from Numerical Recipes: a=1664525, c=1013904223, m=2^32
     * - Provides good statistical properties for text generation use cases
     * - Seed is converted to 32-bit unsigned integer for consistency
     *
     * @param seed - Integer seed value (negative values converted to positive)
     *               Will be converted to 32-bit unsigned integer for internal use
     *
     * @throws {Error} If seed is not an integer number
     *
     * @example
     * ```typescript
     * parser.addRules({
     *   color: ['red', 'blue', 'green', 'yellow'],
     *   animal: ['cat', 'dog', 'bird', 'fish']
     * });
     *
     * // Set seed for reproducible results
     * parser.setRandomSeed(12345);
     * const result1 = parser.parse('%color% %animal%');
     *
     * // Reset to same seed
     * parser.setRandomSeed(12345);
     * const result2 = parser.parse('%color% %animal%');
     *
     * console.log(result1 === result2); // true - same result
     *
     * // Different seed produces different results
     * parser.setRandomSeed(54321);
     * const result3 = parser.parse('%color% %animal%');
     * console.log(result1 === result3); // false - different result
     *
     * // Use in testing
     * describe('Grammar Tests', () => {
     *   beforeEach(() => {
     *     parser.setRandomSeed(42); // Consistent test environment
     *   });
     *
     *   it('should generate expected greeting', () => {
     *     expect(parser.parse('%greeting%')).toBe('Hello'); // Always passes
     *   });
     * });
     * ```
     *
     * @see {@link clearRandomSeed} to return to non-deterministic behavior
     * @see {@link getRandomSeed} to check current seed value
     * @see {@link generateVariations} for seeded variation generation
     *
     * @since 1.0.0
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
    /**
     * Efficiently process multiple texts with optimized context management
     *
     * Batch processing is more efficient than individual parse() calls because it:
     * - Minimizes context switching overhead
     * - Enables smart context preservation across related texts
     * - Reduces function call overhead for large datasets
     * - Maintains consistency in multi-text scenarios
     *
     * Context Management:
     * - First text always starts with fresh context
     * - Subsequent texts preserve or reset context based on preserveContext parameter
     * - Useful for generating coherent multi-part content (stories, conversations)
     *
     * @param texts - Array of input texts containing variables to expand
     * @param preserveContext - If true, maintains variable values across texts;
     *                         if false, each text starts with fresh context (default: true)
     *
     * @returns Array of parsed texts in the same order as input
     *
     * @throws {Error} If texts is not an array
     * @throws {Error} If any parsing errors occur (errors include text index for debugging)
     *
     * @example
     * ```typescript
     * parser.addRules({
     *   character: ['Alice', 'Bob', 'Charlie'],
     *   action: ['walked', 'ran', 'jumped'],
     *   location: ['forest', 'beach', 'city']
     * });
     *
     * // Generate coherent story with consistent character
     * const storyParts = [
     *   '%character% %action% through the %location%.',
     *   'Then %character% stopped to rest.',
     *   'Finally, %character% continued the journey.'
     * ];
     *
     * const coherentStory = parser.parseBatch(storyParts, true);
     * console.log(coherentStory.join(' '));
     * // "Alice walked through the forest. Then Alice stopped to rest. Finally, Alice continued the journey."
     *
     * // Generate independent sentences
     * const separateSentences = parser.parseBatch(storyParts, false);
     * // Each sentence might use different character names
     *
     * // Process large datasets efficiently
     * const templates = Array(1000).fill('%greeting% %name%, welcome to %location%!');
     * const results = parser.parseBatch(templates, false);
     * console.log(`Processed ${results.length} templates`);
     * ```
     *
     * @see {@link parse} for single text processing
     * @see {@link generateVariations} for multiple variations of same text
     *
     * @since 1.0.0
     */
    parseBatch(texts: string[], preserveContext?: boolean): string[];
    /**
     * Generate multiple unique variations of text for testing and content creation
     *
     * This method is particularly useful for:
     * - Testing grammar coverage and variety
     * - Generating content options for user selection
     * - Creating reproducible test datasets
     * - Exploring the full range of possible outputs
     *
     * The method temporarily manages random seeding to ensure variation diversity
     * while preserving the parser's original random state after completion.
     *
     * @param text - Input text template containing variables to expand
     * @param count - Number of different variations to generate (must be positive integer)
     * @param seed - Optional base seed for reproducible results;
     *               each variation uses seed + iteration for deterministic diversity
     *
     * @returns Array of generated text variations
     *
     * @throws {Error} If text is not a string
     * @throws {Error} If count is not a positive integer
     *
     * @example
     * ```typescript
     * parser.addRules({
     *   greeting: ['Hello', 'Hi', 'Hey', 'Greetings'],
     *   name: ['Alice', 'Bob', 'Charlie', 'Diana'],
     *   punctuation: ['!', '.', '?']
     * });
     *
     * // Generate random variations
     * const variations = parser.generateVariations('%greeting% %name%%punctuation%', 5);
     * console.log(variations);
     * // Possible output:
     * // ['Hi Alice!', 'Hello Bob.', 'Hey Charlie?', 'Greetings Diana!', 'Hello Alice.']
     *
     * // Generate reproducible variations for testing
     * const testVariations = parser.generateVariations('%greeting% %name%', 3, 12345);
     * console.log(testVariations);
     * // Always produces the same 3 variations when seed=12345
     *
     * // Use for A/B testing content
     * const headlines = parser.generateVariations('%adjective% %product% for %audience%', 10);
     * headlines.forEach((headline, i) => {
     *   console.log(`Option ${i + 1}: ${headline}`);
     * });
     * ```
     *
     * @see {@link setRandomSeed} for controlling randomness
     * @see {@link parseBatch} for processing multiple different texts
     *
     * @since 1.0.0
     */
    generateVariations(text: string, count: number, seed?: number): string[];
    /**
     * Get comprehensive performance statistics and configuration metrics
     *
     * This method provides a complete overview of the parser's current state,
     * including rule counts by type, configuration settings, and performance-relevant
     * information. Useful for monitoring, debugging, and optimization analysis.
     *
     * Statistics Categories:
     * - Rule counts: Total rules and breakdown by type
     * - Configuration: Current parser settings and limits
     * - State information: Random seed usage, context state
     *
     * @returns Complete parser statistics object
     * @returns ParserStats.totalRules - Total number of rules across all types
     * @returns ParserStats.rulesByType - Breakdown of rule counts by type
     * @returns ParserStats.rulesByType.static - Number of basic static rules
     * @returns ParserStats.rulesByType.function - Number of dynamic function rules
     * @returns ParserStats.rulesByType.weighted - Number of probability-weighted rules
     * @returns ParserStats.rulesByType.conditional - Number of context-aware rules
     * @returns ParserStats.rulesByType.sequential - Number of ordered cycling rules
     * @returns ParserStats.rulesByType.range - Number of numeric range rules
     * @returns ParserStats.rulesByType.template - Number of structured template rules
     * @returns ParserStats.totalModifiers - Number of text transformation modifiers
     * @returns ParserStats.maxDepth - Current maximum recursion depth setting
     * @returns ParserStats.hasRandomSeed - Whether deterministic seed is configured
     *
     * @example
     * ```typescript
     * const stats = parser.getStats();
     *
     * console.log(`Total rules: ${stats.totalRules}`);
     * console.log('Rule breakdown:');
     * console.log(` - Static: ${stats.rulesByType.static}`);
     * console.log(` - Function: ${stats.rulesByType.function}`);
     * console.log(` - Weighted: ${stats.rulesByType.weighted}`);
     * console.log(` - Conditional: ${stats.rulesByType.conditional}`);
     * console.log(` - Sequential: ${stats.rulesByType.sequential}`);
     * console.log(` - Range: ${stats.rulesByType.range}`);
     * console.log(` - Template: ${stats.rulesByType.template}`);
     *
     * console.log(`Modifiers: ${stats.totalModifiers}`);
     * console.log(`Max depth: ${stats.maxDepth}`);
     * console.log(`Seeded random: ${stats.hasRandomSeed}`);
     *
     * // Performance monitoring
     * if (stats.totalRules > 1000) {
     *   console.warn('Large grammar detected - consider optimization');
     * }
     *
     * if (stats.maxDepth > 50) {
     *   console.warn('High recursion limit - may impact performance');
     * }
     * ```
     *
     * @see {@link analyzeRules} for complexity analysis
     * @see {@link optimize} for performance optimization
     *
     * @since 1.0.0
     */
    getStats(): ParserStats;
    /**
     * Export the parser configuration as JSON
     * @returns Serializable parser configuration
     */
    exportConfig(): ParserConfig;
    /**
     * Create a lightweight copy of the parser for parallel processing or experimentation
     *
     * This method creates a new Parser instance with the same basic configuration but
     * independent state. It's useful for:
     * - Creating isolated parser instances for different contexts
     * - Experimenting with modifications without affecting the original
     * - Parallel processing with separate parser states
     * - Creating template parsers for different use cases
     *
     * What Gets Copied:
     * - Static grammar rules (complete copy)
     * - Parser settings (maxDepth, randomSeed)
     * - Basic configuration
     *
     * What Doesn't Get Copied (Limitations):
     * - Function rules (contain closures that can't be serialized)
     * - Weighted rules (contain complex state)
     * - Conditional rules (contain function references)
     * - Sequential rules (contain mutable state)
     * - Range rules (contain configuration objects)
     * - Template rules (contain complex nested structures)
     * - Modifiers (may contain function references)
     * - Current parsing context and reference values
     *
     * @returns New Parser instance with copied static rules and settings
     *
     * @example
     * ```typescript
     * // Set up base parser
     * const baseParser = new Parser();
     * baseParser.addRules({
     *   greeting: ['Hello', 'Hi', 'Hey'],
     *   name: ['Alice', 'Bob', 'Charlie']
     * });
     * baseParser.setMaxDepth(50);
     * baseParser.setRandomSeed(12345);
     *
     * // Create independent clone
     * const clonedParser = baseParser.clone();
     *
     * // Modify clone without affecting original
     * clonedParser.addRule('greeting', ['Greetings', 'Salutations']);
     * clonedParser.setMaxDepth(25);
     *
     * // Original unchanged
     * console.log(baseParser.getStats().maxDepth); // 50
     * console.log(clonedParser.getStats().maxDepth); // 25
     *
     * // Use for parallel processing
     * const workers = [];
     * for (let i = 0; i < 4; i++) {
     *   const workerParser = baseParser.clone();
     *   workerParser.setRandomSeed(i * 1000); // Different seed per worker
     *   workers.push(workerParser);
     * }
     * ```
     *
     * @remarks Function rules and other complex rule types are not cloned due to serialization limitations
     * @see {@link exportConfig} for full serialization
     *
     * @since 1.0.0
     */
    clone(): Parser;
    /**
     * Optimize the parser for better performance
     * Currently just validates and reports potential issues
     * @returns Optimization report
     */
    optimize(): OptimizationReport;
    /**
     * Analyze grammar complexity, performance characteristics, and usage patterns
     *
     * This method provides insights into the complexity and structure of your grammar
     * rules, helping identify performance bottlenecks, overly complex rules, and
     * optimization opportunities. It calculates complexity scores based on variable
     * usage, rule depth, and interconnectedness.
     *
     * Complexity Factors:
     * - Number of variables referenced per rule
     * - Depth of rule nesting (how many levels of references)
     * - Length and complexity of rule values
     * - Type-specific complexity (function rules = 5, weighted rules = values * 2, etc.)
     *
     * Analysis Thresholds:
     * - Total complexity > 100: Suggests grammar simplification
     * - Average depth > 5: May impact parsing performance
     * - Rule count > 50: Consider organizing into groups
     *
     * @param ruleName - Optional specific rule name to analyze in detail;
     *                   if provided, returns detailed analysis for that rule only
     *
     * @returns Comprehensive analysis results
     * @returns RuleAnalysis.totalComplexity - Sum of all rule complexity scores
     * @returns RuleAnalysis.averageDepth - Average nesting depth across all rules
     * @returns RuleAnalysis.mostComplex - Array of most complex rules with scores
     * @returns RuleAnalysis.suggestions - Array of optimization recommendations
     * @returns RuleAnalysis.ruleDetails - Detailed analysis (only when ruleName specified)
     *
     * @example
     * ```typescript
     * // Analyze entire grammar
     * const analysis = parser.analyzeRules();
     * console.log('Total complexity:', analysis.totalComplexity);
     * console.log('Average depth:', analysis.averageDepth);
     * console.log('Most complex:', analysis.mostComplex);
     *
     * // Check for optimization suggestions
     * if (analysis.suggestions.length > 0) {
     *   console.log('Suggestions:');
     *   analysis.suggestions.forEach(suggestion => {
     *     console.log(' -', suggestion);
     *   });
     * }
     *
     * // Analyze specific rule
     * const ruleAnalysis = parser.analyzeRules('complexRule');
     * if (ruleAnalysis.ruleDetails) {
     *   console.log('Rule type:', ruleAnalysis.ruleDetails.type);
     *   console.log('Complexity:', ruleAnalysis.ruleDetails.complexity);
     *   console.log('Variables:', ruleAnalysis.ruleDetails.variables);
     *   console.log('Depth:', ruleAnalysis.ruleDetails.depth);
     * }
     * ```
     *
     * @see {@link optimize} for automated optimization
     * @see {@link getStats} for performance statistics
     *
     * @since 1.0.0
     */
    analyzeRules(ruleName?: string): RuleAnalysis;
    /**
     * Calculate the maximum depth of rule references for a given rule
     * @param ruleName - The rule to analyze
     * @param visited - Set of visited rules to prevent infinite recursion
     * @returns Maximum depth
     */
    private calculateRuleDepth;
    /**
     * Generate helpful error messages with contextual suggestions and debugging information
     *
     * This method analyzes parsing errors and provides intelligent suggestions for resolving
     * common issues. It examines the error type, parsing context, and grammar state to offer
     * specific, actionable advice for fixing problems.
     *
     * Error Analysis Capabilities:
     * - Recursion depth issues with circular reference detection
     * - Function rule execution failures with debugging tips
     * - Weight validation errors with correction examples
     * - Missing rule references with validation integration
     * - Grammar validation issues with detailed breakdowns
     *
     * @param error - The error object that was thrown during parsing
     * @param context - Optional additional context for better error analysis
     * @param context.text - The text that was being parsed when error occurred
     * @param context.ruleName - The specific rule that caused the error
     *
     * @returns Enhanced error message with suggestions, validation info, and debugging tips
     *
     * @example
     * ```typescript
     * try {
     *   const result = parser.parse('%missing_rule%');
     * } catch (error) {
     *   const helpfulMessage = parser.getHelpfulError(error, {
     *     text: '%missing_rule%',
     *     ruleName: 'missing_rule'
     *   });
     *
     *   console.log(helpfulMessage);
     *   // Output:
     *   // "Rule not found
     *   //
     *   // Suggestions:
     *   // • Check that all referenced rules are defined
     *   // • Use validate() method to find missing rules
     *   // • Missing rules detected: missing_rule
     *   //
     *   // Validation Issues:
     *   // • Missing rules: missing_rule"
     * }
     *
     * // Function rule error example
     * parser.addFunctionRule('broken', () => {
     *   throw new Error('Something went wrong');
     * });
     *
     * try {
     *   parser.parse('%broken%');
     * } catch (error) {
     *   const help = parser.getHelpfulError(error);
     *   // Provides specific guidance for function rule debugging
     * }
     * ```
     *
     * @see {@link validate} for comprehensive grammar validation
     * @see {@link safeParse} for error-handling parsing
     *
     * @since 1.0.0
     */
    getHelpfulError(error: Error, context?: ErrorContext): string;
}
//# sourceMappingURL=ParserCore.d.ts.map