/**
 * Parser for combinatorial grammar with variable expansion
 */
export class Parser {
    constructor() {
        this.grammar = {};
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
            const values = this.grammar[key];
            if (!values || values.length === 0) {
                // Return the original variable if no rule is found
                return match;
            }
            // Randomly select a value
            const selectedValue = this.getRandomValue(values);
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
     * Check if a key exists in the grammar
     * @param key - The key to check
     * @returns True if the key exists, false otherwise
     */
    hasRule(key) {
        return key in this.grammar;
    }
    /**
     * Remove a rule from the grammar
     * @param key - The key to remove
     * @returns True if the rule was removed, false if it didn't exist
     */
    removeRule(key) {
        if (this.hasRule(key)) {
            delete this.grammar[key];
            return true;
        }
        return false;
    }
    /**
     * Clear all rules from the grammar
     */
    clear() {
        this.grammar = {};
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