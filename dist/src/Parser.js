/**
 * Parser for combinatorial grammar with variable expansion
 */
export class Parser {
    constructor() {
        this.grammar = {};
        this.functionRules = new Map();
        this.weightedRules = new Map();
        this.conditionalRules = new Map();
        this.sequentialRules = new Map();
        this.rangeRules = new Map();
        this.templateRules = new Map();
        this.referenceValues = new Map();
        this.modifiers = new Map();
        this.variablePattern = /%([^%]+)%/g;
        this.maxDepth = 100; // Prevent infinite recursion
        this.randomSeed = null;
        this.currentSeed = 0;
        this.currentContext = {};
    }
    /**
     * Add a rule to the grammar
     * @param key - The key to define
     * @param values - Array of possible values for this key
     */
    addRule(key, values) {
        if (!key || typeof key !== 'string') {
            throw new Error('Key must be a non-empty string');
        }
        if (!Array.isArray(values)) {
            throw new Error('Values must be an array');
        }
        this.grammar[key] = [...values]; // Create a copy to avoid external mutation
    }
    /**
     * Add multiple rules to the grammar
     * @param rules - Object containing key-value pairs of rules
     */
    addRules(rules) {
        for (const [key, values] of Object.entries(rules)) {
            this.addRule(key, values);
        }
    }
    /**
     * Add a function rule to the grammar
     * @param key - The key to define
     * @param fn - Function that returns an array of possible values
     */
    addFunctionRule(key, fn) {
        if (!key || typeof key !== 'string') {
            throw new Error('Key must be a non-empty string');
        }
        if (typeof fn !== 'function') {
            throw new Error('Value must be a function');
        }
        this.functionRules.set(key, fn);
    }
    /**
     * Remove a function rule
     * @param key - Rule key to remove
     * @returns True if the rule was removed, false if it didn't exist
     */
    removeFunctionRule(key) {
        return this.functionRules.delete(key);
    }
    /**
     * Check if a function rule exists
     * @param key - Rule key to check
     * @returns True if the function rule exists
     */
    hasFunctionRule(key) {
        return this.functionRules.has(key);
    }
    /**
     * Clear all function rules
     */
    clearFunctionRules() {
        this.functionRules.clear();
    }
    /**
     * Add a weighted rule to the grammar
     * @param key - The key to define
     * @param values - Array of possible values for this key
     * @param weights - Array of weights corresponding to each value (must sum to 1.0)
     */
    addWeightedRule(key, values, weights) {
        if (!key || typeof key !== 'string') {
            throw new Error('Key must be a non-empty string');
        }
        if (!Array.isArray(values)) {
            throw new Error('Values must be an array');
        }
        if (!Array.isArray(weights)) {
            throw new Error('Weights must be an array');
        }
        if (values.length !== weights.length) {
            throw new Error('Values and weights arrays must have the same length');
        }
        if (values.length === 0) {
            throw new Error('Values array cannot be empty');
        }
        // Validate weights
        for (const weight of weights) {
            if (typeof weight !== 'number' || weight < 0) {
                throw new Error('All weights must be non-negative numbers');
            }
        }
        const weightSum = weights.reduce((sum, weight) => sum + weight, 0);
        if (Math.abs(weightSum - 1.0) > 0.0001) {
            throw new Error(`Weights must sum to 1.0, but sum to ${weightSum}`);
        }
        // Calculate cumulative weights for efficient sampling
        const cumulativeWeights = [];
        let cumSum = 0;
        for (const weight of weights) {
            cumSum += weight;
            cumulativeWeights.push(cumSum);
        }
        this.weightedRules.set(key, {
            values: [...values],
            weights: [...weights],
            cumulativeWeights
        });
    }
    /**
     * Remove a weighted rule
     * @param key - Rule key to remove
     * @returns True if the rule was removed, false if it didn't exist
     */
    removeWeightedRule(key) {
        return this.weightedRules.delete(key);
    }
    /**
     * Check if a weighted rule exists
     * @param key - Rule key to check
     * @returns True if the weighted rule exists
     */
    hasWeightedRule(key) {
        return this.weightedRules.has(key);
    }
    /**
     * Clear all weighted rules
     */
    clearWeightedRules() {
        this.weightedRules.clear();
    }
    /**
     * Add a conditional rule that selects values based on context
     * @param key - The key to define
     * @param rule - Conditional rule configuration with conditions and values
     */
    addConditionalRule(key, rule) {
        if (!key || typeof key !== 'string') {
            throw new Error('Key must be a non-empty string');
        }
        if (!rule || !Array.isArray(rule.conditions)) {
            throw new Error('Rule must have a conditions array');
        }
        if (rule.conditions.length === 0) {
            throw new Error('Conditions array cannot be empty');
        }
        // Validate conditions
        let hasDefault = false;
        for (const condition of rule.conditions) {
            if ('default' in condition) {
                if (hasDefault) {
                    throw new Error('Only one default condition is allowed');
                }
                hasDefault = true;
                if (!Array.isArray(condition.default)) {
                    throw new Error('Default condition must have an array of values');
                }
            }
            else if ('if' in condition && 'then' in condition) {
                if (typeof condition.if !== 'function') {
                    throw new Error('Condition "if" must be a function');
                }
                if (!Array.isArray(condition.then)) {
                    throw new Error('Condition "then" must be an array of values');
                }
            }
            else {
                throw new Error('Each condition must have either "if/then" or "default"');
            }
        }
        this.conditionalRules.set(key, {
            conditions: rule.conditions.map(c => ({ ...c }))
        });
    }
    /**
     * Add a sequential rule that cycles through values in order
     * @param key - The key to define
     * @param values - Array of values to cycle through
     * @param options - Configuration options
     */
    addSequentialRule(key, values, options = { cycle: true }) {
        if (!key || typeof key !== 'string') {
            throw new Error('Key must be a non-empty string');
        }
        if (!Array.isArray(values) || values.length === 0) {
            throw new Error('Values must be a non-empty array');
        }
        this.sequentialRules.set(key, {
            values: [...values],
            index: 0,
            cycle: options.cycle
        });
    }
    /**
     * Add a range rule that generates numeric values within a range
     * @param key - The key to define
     * @param config - Range configuration
     */
    addRangeRule(key, config) {
        if (!key || typeof key !== 'string') {
            throw new Error('Key must be a non-empty string');
        }
        if (typeof config.min !== 'number' || typeof config.max !== 'number') {
            throw new Error('Min and max must be numbers');
        }
        if (config.min >= config.max) {
            throw new Error('Min must be less than max');
        }
        if (config.step !== undefined && (typeof config.step !== 'number' || config.step <= 0)) {
            throw new Error('Step must be a positive number');
        }
        if (!['integer', 'float'].includes(config.type)) {
            throw new Error('Type must be "integer" or "float"');
        }
        this.rangeRules.set(key, {
            min: config.min,
            max: config.max,
            step: config.step,
            type: config.type
        });
    }
    /**
     * Add a template rule that combines multiple variables into a structured format
     * @param key - The key to define
     * @param rule - Template rule configuration
     */
    addTemplateRule(key, rule) {
        if (!key || typeof key !== 'string') {
            throw new Error('Key must be a non-empty string');
        }
        if (!rule.template || typeof rule.template !== 'string') {
            throw new Error('Template must be a non-empty string');
        }
        if (!rule.variables || typeof rule.variables !== 'object') {
            throw new Error('Variables must be an object');
        }
        // Validate that all variables in template exist in variables object
        const templateVars = this.findVariables(rule.template);
        for (const variable of templateVars) {
            if (!(variable in rule.variables)) {
                throw new Error(`Template variable '${variable}' not found in variables object`);
            }
            if (!Array.isArray(rule.variables[variable])) {
                throw new Error(`Variable '${variable}' must be an array`);
            }
        }
        this.templateRules.set(key, {
            template: rule.template,
            variables: { ...rule.variables }
        });
    }
    /**
     * Remove a conditional rule
     */
    removeConditionalRule(key) {
        return this.conditionalRules.delete(key);
    }
    /**
     * Remove a sequential rule
     */
    removeSequentialRule(key) {
        return this.sequentialRules.delete(key);
    }
    /**
     * Remove a range rule
     */
    removeRangeRule(key) {
        return this.rangeRules.delete(key);
    }
    /**
     * Remove a template rule
     */
    removeTemplateRule(key) {
        return this.templateRules.delete(key);
    }
    /**
     * Check if a conditional rule exists
     */
    hasConditionalRule(key) {
        return this.conditionalRules.has(key);
    }
    /**
     * Check if a sequential rule exists
     */
    hasSequentialRule(key) {
        return this.sequentialRules.has(key);
    }
    /**
     * Check if a range rule exists
     */
    hasRangeRule(key) {
        return this.rangeRules.has(key);
    }
    /**
     * Check if a template rule exists
     */
    hasTemplateRule(key) {
        return this.templateRules.has(key);
    }
    /**
     * Clear all conditional rules
     */
    clearConditionalRules() {
        this.conditionalRules.clear();
    }
    /**
     * Clear all sequential rules
     */
    clearSequentialRules() {
        this.sequentialRules.clear();
    }
    /**
     * Clear all range rules
     */
    clearRangeRules() {
        this.rangeRules.clear();
    }
    /**
     * Clear all template rules
     */
    clearTemplateRules() {
        this.templateRules.clear();
    }
    /**
     * Reset a sequential rule to start from the beginning
     * @param key - The sequential rule key to reset
     * @returns True if rule was reset, false if it doesn't exist
     */
    resetSequentialRule(key) {
        const rule = this.sequentialRules.get(key);
        if (rule) {
            rule.index = 0;
            return true;
        }
        return false;
    }
    /**
     * Add a modifier to the grammar
     * @param modifier - The modifier to add
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
     * @param name - The name of the modifier to remove
     * @returns True if the modifier was removed, false if it didn't exist
     */
    removeModifier(name) {
        return this.modifiers.delete(name);
    }
    /**
     * Check if a modifier exists
     * @param name - The name of the modifier to check
     * @returns True if the modifier exists, false otherwise
     */
    hasModifier(name) {
        return this.modifiers.has(name);
    }
    /**
     * Get all modifiers
     * @returns Array of all modifiers sorted by priority
     */
    getModifiers() {
        return Array.from(this.modifiers.values()).sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
    }
    /**
     * Add built-in English article modifier (a/an)
     */
    addEnglishArticleModifier() {
        this.addModifier({
            name: 'englishArticles',
            condition: (text) => {
                return /\ba\s+[aeiouAEIOU]/.test(text);
            },
            transform: (text) => {
                // More precise regex to handle vowel sounds at word boundaries
                return text.replace(/\ba(\s+)([aeiouAEIOU][a-z]*)/gi, 'an$1$2');
            },
            priority: 10
        });
    }
    /**
     * Add built-in English pluralization modifier
     * Handles common pluralization patterns and irregular forms
     */
    addEnglishPluralizationModifier() {
        this.addModifier({
            name: 'englishPluralization',
            condition: (text) => {
                // Look for plural indicators: numbers > 1, "many", "several", "multiple", etc.
                return /\b(many|several|multiple|some|few|\d*[2-9]\d*|\d+[02-9])\s+[a-zA-Z]+/i.test(text) ||
                    /\b(two|three|four|five|six|seven|eight|nine|ten)\s+[a-zA-Z]+/i.test(text);
            },
            transform: (text) => {
                // Irregular plurals mapping
                const irregularPlurals = {
                    'child': 'children',
                    'person': 'people',
                    'man': 'men',
                    'woman': 'women',
                    'mouse': 'mice',
                    'foot': 'feet',
                    'tooth': 'teeth',
                    'goose': 'geese',
                    'ox': 'oxen',
                    'sheep': 'sheep',
                    'deer': 'deer',
                    'fish': 'fish'
                };
                return text.replace(/\b(many|several|multiple|some|few|\d*[2-9]\d*|\d+[02-9]|two|three|four|five|six|seven|eight|nine|ten)\s+([a-zA-Z]+)\b/gi, (match, quantifier, noun) => {
                    const lowerNoun = noun.toLowerCase();
                    // Check for irregular plurals first
                    if (irregularPlurals[lowerNoun]) {
                        return `${quantifier} ${irregularPlurals[lowerNoun]}`;
                    }
                    // Apply regular pluralization rules
                    let pluralNoun = noun;
                    // Words ending in s, ss, sh, ch, x, z: add -es
                    if (/[sxz]$|[sc]h$/.test(lowerNoun)) {
                        pluralNoun = noun + 'es';
                    }
                    // Words ending in consonant + y: change y to ies
                    else if (/[bcdfghjklmnpqrstvwxz]y$/i.test(noun)) {
                        pluralNoun = noun.slice(0, -1) + 'ies';
                    }
                    // Words ending in f or fe: change to ves
                    else if (/fe?$/i.test(noun)) {
                        pluralNoun = noun.replace(/fe?$/i, 'ves');
                    }
                    // Words ending in o: usually add -es (with some exceptions)
                    else if (/[bcdfghjklmnpqrstvwxz]o$/i.test(noun)) {
                        // Common exceptions that just add -s
                        const oExceptions = ['photo', 'piano', 'halo', 'disco'];
                        if (oExceptions.includes(lowerNoun)) {
                            pluralNoun = noun + 's';
                        }
                        else {
                            pluralNoun = noun + 'es';
                        }
                    }
                    // Default: add -s
                    else {
                        pluralNoun = noun + 's';
                    }
                    return `${quantifier} ${pluralNoun}`;
                });
            },
            priority: 9
        });
    }
    /**
     * Add built-in English ordinal modifier
     * Converts cardinal numbers to ordinal format (1 -> 1st, 2 -> 2nd, etc.)
     */
    addEnglishOrdinalModifier() {
        this.addModifier({
            name: 'englishOrdinals',
            condition: (text) => {
                // Look for standalone numbers (digits)
                return /\b\d+\b/.test(text);
            },
            transform: (text) => {
                return text.replace(/\b(\d+)\b/g, (match, num) => {
                    const number = parseInt(num, 10);
                    // Get the last digit and last two digits
                    const lastDigit = number % 10;
                    const lastTwoDigits = number % 100;
                    // Exception: numbers ending in 11, 12, 13 use 'th'
                    if (lastTwoDigits === 11 || lastTwoDigits === 12 || lastTwoDigits === 13) {
                        return num + 'th';
                    }
                    // Apply ordinal rules based on last digit
                    switch (lastDigit) {
                        case 1:
                            return num + 'st';
                        case 2:
                            return num + 'nd';
                        case 3:
                            return num + 'rd';
                        default:
                            return num + 'th';
                    }
                });
            },
            priority: 8
        });
    }
    /**
     * Get all grammar rules
     * @returns Copy of all grammar rules
     */
    getGrammar() {
        const grammarCopy = {};
        for (const [key, values] of Object.entries(this.grammar)) {
            grammarCopy[key] = [...values];
        }
        return grammarCopy;
    }
    /**
     * Parse a text string and expand all variables
     * @param text - The text to parse
     * @param preserveContext - Whether to preserve context from previous parse calls
     * @returns Parsed text with variables expanded
     */
    parse(text, preserveContext = false) {
        if (typeof text !== 'string') {
            throw new Error('Text must be a string');
        }
        // Clear context unless explicitly preserving it
        if (!preserveContext) {
            this.currentContext = {};
            this.referenceValues.clear();
        }
        const expanded = this.expandVariables(text, 0);
        return this.applyModifiers(expanded, { originalText: text });
    }
    /**
     * Recursively expand variables in text
     * @param text - The text to expand
     * @param depth - Current recursion depth
     * @returns Text with variables expanded
     */
    expandVariables(text, depth) {
        if (depth >= this.maxDepth) {
            throw new Error('Maximum recursion depth exceeded. Check for circular references in grammar.');
        }
        // Reset the regex lastIndex to ensure proper matching
        this.variablePattern.lastIndex = 0;
        return text.replace(this.variablePattern, (match, key) => {
            let selectedValue;
            // Handle reference rules first (syntax: @key)
            if (key.startsWith('@')) {
                const refKey = key.substring(1);
                const refValue = this.referenceValues.get(refKey);
                if (refValue !== undefined) {
                    return refValue;
                }
                return match; // Return original if reference not found
            }
            // Check function rules
            const functionRule = this.functionRules.get(key);
            if (functionRule) {
                try {
                    const values = functionRule();
                    if (!Array.isArray(values)) {
                        throw new Error(`Function rule '${key}' must return an array`);
                    }
                    if (values.length === 0) {
                        return match;
                    }
                    selectedValue = this.getRandomValue(values);
                }
                catch (error) {
                    throw new Error(`Error executing function rule '${key}': ${error instanceof Error ? error.message : String(error)}`);
                }
            }
            else {
                // Check conditional rules
                const conditionalRule = this.conditionalRules.get(key);
                if (conditionalRule) {
                    selectedValue = this.getConditionalValue(conditionalRule);
                }
                else {
                    // Check sequential rules
                    const sequentialRule = this.sequentialRules.get(key);
                    if (sequentialRule) {
                        selectedValue = this.getSequentialValue(sequentialRule);
                    }
                    else {
                        // Check range rules
                        const rangeRule = this.rangeRules.get(key);
                        if (rangeRule) {
                            selectedValue = this.getRangeValue(rangeRule);
                        }
                        else {
                            // Check template rules
                            const templateRule = this.templateRules.get(key);
                            if (templateRule) {
                                selectedValue = this.getTemplateValue(templateRule);
                            }
                            else {
                                // Check weighted rules
                                const weightedRule = this.weightedRules.get(key);
                                if (weightedRule) {
                                    selectedValue = this.getWeightedRandomValue(weightedRule);
                                }
                                else {
                                    // Fall back to static rules
                                    const values = this.grammar[key];
                                    if (!values || values.length === 0) {
                                        // Return the original variable if no rule is found
                                        return match;
                                    }
                                    selectedValue = this.getRandomValue(values);
                                }
                            }
                        }
                    }
                }
            }
            // Store value for potential reference and update context
            this.referenceValues.set(key, selectedValue);
            this.currentContext[key] = selectedValue;
            // Recursively expand variables in the selected value
            return this.expandVariables(selectedValue, depth + 1);
        });
    }
    /**
     * Apply all applicable modifiers to text
     * @param text - The text to modify
     * @param context - Optional context for modifier application
     * @returns Modified text
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
    /**
     * Get a value from a conditional rule based on current context
     * @param conditionalRule - The conditional rule to evaluate
     * @returns A value based on matching condition
     */
    getConditionalValue(conditionalRule) {
        for (const condition of conditionalRule.conditions) {
            if ('if' in condition && condition.if && condition.then) {
                if (condition.if(this.currentContext)) {
                    return this.getRandomValue(condition.then);
                }
            }
            else if ('default' in condition && condition.default) {
                return this.getRandomValue(condition.default);
            }
        }
        throw new Error('No matching condition found and no default provided');
    }
    /**
     * Get the next value from a sequential rule
     * @param sequentialRule - The sequential rule to get value from
     * @returns The next value in sequence
     */
    getSequentialValue(sequentialRule) {
        if (sequentialRule.index >= sequentialRule.values.length) {
            if (sequentialRule.cycle) {
                sequentialRule.index = 0;
            }
            else {
                return sequentialRule.values[sequentialRule.values.length - 1];
            }
        }
        const value = sequentialRule.values[sequentialRule.index];
        sequentialRule.index++;
        return value;
    }
    /**
     * Generate a value from a range rule
     * @param rangeRule - The range rule configuration
     * @returns A value within the specified range
     */
    getRangeValue(rangeRule) {
        const { min, max, step, type } = rangeRule;
        if (step !== undefined) {
            // Generate stepped values
            const numSteps = Math.floor((max - min) / step);
            const stepIndex = Math.floor(this.getSeededRandom() * (numSteps + 1));
            const value = min + (stepIndex * step);
            return type === 'integer' ? Math.round(value).toString() : value.toString();
        }
        else {
            // Generate continuous values
            const value = min + (this.getSeededRandom() * (max - min));
            return type === 'integer' ? Math.floor(value).toString() : value.toString();
        }
    }
    /**
     * Generate a value from a template rule
     * @param templateRule - The template rule configuration
     * @returns A value with template variables expanded
     */
    getTemplateValue(templateRule) {
        // Create a temporary parser context for template variables
        const tempContext = { ...this.currentContext };
        // Expand template using its own variables
        let result = templateRule.template;
        const templateVars = this.findVariables(result);
        for (const variable of templateVars) {
            if (variable in templateRule.variables) {
                const value = this.getRandomValue(templateRule.variables[variable]);
                result = result.replace(new RegExp(`%${variable}%`, 'g'), value);
                tempContext[variable] = value;
            }
        }
        return result;
    }
    /**
     * Generate a seeded random number between 0 and 1
     * Uses Linear Congruential Generator (LCG) when seed is set
     * @returns Random number between 0 and 1
     */
    getSeededRandom() {
        if (this.randomSeed === null) {
            return Math.random();
        }
        // Linear Congruential Generator (LCG)
        // Using parameters from Numerical Recipes: a=1664525, c=1013904223, m=2^32
        this.currentSeed = (this.currentSeed * 1664525 + 1013904223) >>> 0;
        return this.currentSeed / 0x100000000; // Convert to 0-1 range
    }
    /**
     * Get a random value from an array
     * @param values - Array of values to choose from
     * @returns A random value from the array
     */
    getRandomValue(values) {
        const randomIndex = Math.floor(this.getSeededRandom() * values.length);
        return values[randomIndex];
    }
    /**
     * Get a weighted random value from a weighted rule
     * @param weightedRule - Weighted rule containing values and cumulative weights
     * @returns A weighted random value
     */
    getWeightedRandomValue(weightedRule) {
        const random = this.getSeededRandom();
        // Find the first cumulative weight that is greater than our random number
        for (let i = 0; i < weightedRule.cumulativeWeights.length; i++) {
            if (random <= weightedRule.cumulativeWeights[i]) {
                return weightedRule.values[i];
            }
        }
        // Fallback to last value (should not happen with proper weights)
        return weightedRule.values[weightedRule.values.length - 1];
    }
    /**
     * Check if a rule exists (any rule type)
     * @param key - The key to check
     * @returns True if the rule exists, false otherwise
     */
    hasRule(key) {
        return this.functionRules.has(key) ||
            this.conditionalRules.has(key) ||
            this.sequentialRules.has(key) ||
            this.rangeRules.has(key) ||
            this.templateRules.has(key) ||
            this.weightedRules.has(key) ||
            key in this.grammar;
    }
    /**
     * Remove a rule (any rule type)
     * @param key - The key to remove
     * @returns True if rule was removed, false if it didn't exist
     */
    removeRule(key) {
        const removedFunction = this.functionRules.delete(key);
        const removedConditional = this.conditionalRules.delete(key);
        const removedSequential = this.sequentialRules.delete(key);
        const removedRange = this.rangeRules.delete(key);
        const removedTemplate = this.templateRules.delete(key);
        const removedWeighted = this.weightedRules.delete(key);
        const removedStatic = key in this.grammar ? (delete this.grammar[key], true) : false;
        return removedFunction || removedConditional || removedSequential || removedRange || removedTemplate || removedWeighted || removedStatic;
    }
    /**
     * Clear all rules (all rule types)
     */
    clear() {
        this.grammar = {};
        this.functionRules.clear();
        this.conditionalRules.clear();
        this.sequentialRules.clear();
        this.rangeRules.clear();
        this.templateRules.clear();
        this.weightedRules.clear();
        this.referenceValues.clear();
        this.currentContext = {};
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
    /**
     * Get all variable names found in a text string
     * @param text - The text to analyze
     * @returns Array of unique variable names found
     */
    findVariables(text) {
        const variables = new Set();
        this.variablePattern.lastIndex = 0;
        let match;
        while ((match = this.variablePattern.exec(text)) !== null) {
            variables.add(match[1]);
        }
        return Array.from(variables);
    }
    /**
     * Validate that all variables in the grammar can be resolved
     * @returns Object containing validation results
     */
    validate() {
        const missingRules = new Set();
        const circularReferences = new Set();
        for (const [key, values] of Object.entries(this.grammar)) {
            for (const value of values) {
                const variables = this.findVariables(value);
                for (const variable of variables) {
                    if (!this.hasRule(variable)) {
                        missingRules.add(variable);
                    }
                    // Simple circular reference detection (direct self-reference)
                    if (variable === key) {
                        circularReferences.add(key);
                    }
                }
            }
        }
        return {
            isValid: missingRules.size === 0 && circularReferences.size === 0,
            missingRules: Array.from(missingRules),
            circularReferences: Array.from(circularReferences)
        };
    }
    /**
     * Set the maximum recursion depth for variable expansion
     * @param depth - Maximum depth (default: 100)
     */
    setMaxDepth(depth) {
        if (depth < 1) {
            throw new Error('Max depth must be at least 1');
        }
        this.maxDepth = depth;
    }
    /**
     * Get the current maximum recursion depth
     * @returns Current maximum depth
     */
    getMaxDepth() {
        return this.maxDepth;
    }
    /**
     * Set a random seed for deterministic random number generation
     * This makes the parser produce consistent, reproducible results for testing
     * @param seed - Integer seed value (will be converted to 32-bit unsigned integer)
     */
    setRandomSeed(seed) {
        if (typeof seed !== 'number' || !Number.isInteger(seed)) {
            throw new Error('Seed must be an integer');
        }
        // Convert to 32-bit unsigned integer
        this.randomSeed = Math.abs(seed) >>> 0;
        this.currentSeed = this.randomSeed;
    }
    /**
     * Clear the random seed and return to using Math.random()
     */
    clearRandomSeed() {
        this.randomSeed = null;
        this.currentSeed = 0;
    }
    /**
     * Get the current random seed, if any
     * @returns Current seed or null if using Math.random()
     */
    getRandomSeed() {
        return this.randomSeed;
    }
    /**
     * Clear all reference values and reset context
     * Useful for starting fresh generation without clearing rules
     */
    clearReferences() {
        this.referenceValues.clear();
        this.currentContext = {};
    }
    /**
     * Get the current context of generated values
     * @returns Copy of current context
     */
    getContext() {
        return { ...this.currentContext };
    }
}
//# sourceMappingURL=Parser.js.map