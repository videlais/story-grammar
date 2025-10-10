export class BaseRuleManager {
    constructor() {
        this.rules = new Map();
    }
    /**
     * Remove a rule from the manager
     * @param key - Rule identifier
     * @returns True if rule was removed
     */
    removeRule(key) {
        return this.rules.delete(key);
    }
    /**
     * Check if a rule exists
     * @param key - Rule identifier
     * @returns True if rule exists
     */
    hasRule(key) {
        return this.rules.has(key);
    }
    /**
     * Get a rule by key
     * @param key - Rule identifier
     * @returns Rule or undefined
     */
    getRule(key) {
        return this.rules.get(key);
    }
    /**
     * Clear all rules
     */
    clear() {
        this.rules.clear();
    }
    /**
     * Get all rule keys
     * @returns Array of rule keys
     */
    getKeys() {
        return Array.from(this.rules.keys());
    }
    /**
     * Get the number of rules
     * @returns Number of rules
     */
    size() {
        return this.rules.size;
    }
    /**
     * Get rule data for analysis (protected method for analyzers)
     * @param key - Rule identifier
     * @returns Rule data or undefined
     */
    getRuleData(key) {
        return this.rules.get(key);
    }
}
/**
 * Manager for static grammar rules
 */
export class StaticRuleManager extends BaseRuleManager {
    /**
     * Add a static rule
     * @param key - Rule identifier
     * @param values - Array of possible values
     */
    addRule(key, values) {
        if (!key || typeof key !== 'string') {
            throw new Error('Rule key must be a non-empty string');
        }
        if (!Array.isArray(values)) {
            throw new Error('Rule values must be an array');
        }
        this.rules.set(key, [...values]); // Create a copy to avoid external mutation
    }
    /**
     * Add multiple static rules
     * @param grammar - Object containing key-value pairs of rules
     */
    addRules(grammar) {
        for (const [key, values] of Object.entries(grammar)) {
            this.addRule(key, values);
        }
    }
    /**
     * Generate a value from a static rule
     * @param key - Rule identifier
     * @param context - Current parsing context (unused for static rules)
     * @param random - Random number generator
     * @returns Random value from rule or null if rule doesn't exist
     */
    generateValue(key, context, random) {
        const rule = this.rules.get(key);
        if (!rule) {
            return null;
        }
        if (rule.length === 0) {
            return '';
        }
        return random.randomChoice(rule);
    }
    /**
     * Get all static rules as a Grammar object
     * @returns Copy of all static rules
     */
    getGrammar() {
        const grammar = {};
        for (const [key, values] of this.rules.entries()) {
            grammar[key] = [...values];
        }
        return grammar;
    }
}
/**
 * Manager for function-based rules
 */
export class FunctionRuleManager extends BaseRuleManager {
    /**
     * Add a function rule
     * @param key - Rule identifier
     * @param fn - Function that returns an array of possible values
     */
    addRule(key, fn) {
        if (!key || typeof key !== 'string') {
            throw new Error('Rule key must be a non-empty string');
        }
        if (typeof fn !== 'function') {
            throw new Error('Rule function must be a function');
        }
        this.rules.set(key, fn);
    }
    /**
     * Generate a value from a function rule
     * @param key - Rule identifier
     * @param context - Current parsing context (unused for function rules)
     * @param random - Random number generator
     * @returns Random value from function result or null if rule doesn't exist
     */
    generateValue(key, context, random) {
        const rule = this.rules.get(key);
        if (!rule) {
            return null;
        }
        try {
            const values = rule();
            if (!Array.isArray(values)) {
                throw new Error(`Function rule '${key}' must return an array`);
            }
            if (values.length === 0) {
                return null; // This will cause the variable to remain unchanged
            }
            return random.randomChoice(values);
        }
        catch (error) {
            throw new Error(`Error executing function rule '${key}': ${error.message}`);
        }
    }
}
/**
 * Manager for weighted rules
 */
export class WeightedRuleManager extends BaseRuleManager {
    /**
     * Add a weighted rule
     * @param key - Rule identifier
     * @param values - Array of possible values
     * @param weights - Array of probability weights (must sum to 1.0)
     */
    addRule(key, values, weights) {
        if (!key || typeof key !== 'string') {
            throw new Error('Rule key must be a non-empty string');
        }
        if (!Array.isArray(values)) {
            throw new Error('Rule values must be an array');
        }
        if (!Array.isArray(weights)) {
            throw new Error('Rule weights must be an array');
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
            throw new Error(`Weights must sum to 1.0, got ${weightSum}`);
        }
        // Calculate cumulative weights for efficient sampling
        const cumulativeWeights = [];
        let cumSum = 0;
        for (const weight of weights) {
            cumSum += weight;
            cumulativeWeights.push(cumSum);
        }
        this.rules.set(key, {
            values: [...values],
            weights: [...weights],
            cumulativeWeights
        });
    }
    /**
     * Generate a value from a weighted rule
     * @param key - Rule identifier
     * @param context - Current parsing context (unused for weighted rules)
     * @param random - Random number generator
     * @returns Weighted random value or null if rule doesn't exist
     */
    generateValue(key, context, random) {
        const rule = this.rules.get(key);
        if (!rule) {
            return null;
        }
        return random.weightedChoice(rule.values, rule.cumulativeWeights);
    }
}
//# sourceMappingURL=BaseRuleManager.js.map