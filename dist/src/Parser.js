/**
 * Parser for combinatorial grammar with variable expansion
 */
export class Parser {
    constructor() {
        this.grammar = {};
        this.functionRules = new Map();
        this.weightedRules = new Map();
        this.modifiers = new Map();
        this.variablePattern = /%([^%]+)%/g;
        this.maxDepth = 100; // Prevent infinite recursion
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
     * @returns Parsed text with variables expanded
     */
    parse(text) {
        if (typeof text !== 'string') {
            throw new Error('Text must be a string');
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
            // Check function rules first
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
                // Check weighted rules second
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
     * Get a random value from an array
     * @param values - Array of values to choose from
     * @returns A random value from the array
     */
    getRandomValue(values) {
        const randomIndex = Math.floor(Math.random() * values.length);
        return values[randomIndex];
    }
    /**
     * Get a weighted random value from a weighted rule
     * @param weightedRule - Weighted rule containing values and cumulative weights
     * @returns A weighted random value
     */
    getWeightedRandomValue(weightedRule) {
        const random = Math.random();
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
     * Check if a rule exists (static, function, or weighted rule)
     * @param key - The key to check
     * @returns True if the rule exists, false otherwise
     */
    hasRule(key) {
        return this.functionRules.has(key) || this.weightedRules.has(key) || key in this.grammar;
    }
    /**
     * Remove a rule (static, function, or weighted rule)
     * @param key - The key to remove
     * @returns True if rule was removed, false if it didn't exist
     */
    removeRule(key) {
        const removedFunction = this.functionRules.delete(key);
        const removedWeighted = this.weightedRules.delete(key);
        const removedStatic = key in this.grammar ? (delete this.grammar[key], true) : false;
        return removedFunction || removedWeighted || removedStatic;
    }
    /**
     * Clear all rules (static, function, and weighted rules)
     */
    clear() {
        this.grammar = {};
        this.functionRules.clear();
        this.weightedRules.clear();
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
}
//# sourceMappingURL=Parser.js.map