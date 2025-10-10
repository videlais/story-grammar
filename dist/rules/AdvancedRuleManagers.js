import { BaseRuleManager } from './BaseRuleManager.js';
/**
 * Manager for conditional rules that select values based on context
 */
export class ConditionalRuleManager extends BaseRuleManager {
    /**
     * Add a conditional rule
     * @param key - Rule identifier
     * @param rule - Conditional rule configuration
     */
    addRule(key, rule) {
        if (!key || typeof key !== 'string') {
            throw new Error('Rule key must be a non-empty string');
        }
        if (!rule || !Array.isArray(rule.conditions)) {
            throw new Error('Conditional rule must have a conditions array');
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
                if (!Array.isArray(condition.default) || condition.default.length === 0) {
                    throw new Error('Default condition must have an array of values');
                }
            }
            else if ('if' in condition && 'then' in condition) {
                if (typeof condition.if !== 'function') {
                    throw new Error('Condition "if" must be a function');
                }
                if (!Array.isArray(condition.then) || condition.then.length === 0) {
                    throw new Error('Condition "then" must be an array of values');
                }
            }
            else {
                throw new Error('Each condition must have either "if/then" or "default"');
            }
        }
        this.rules.set(key, {
            conditions: rule.conditions.map(c => ({ ...c }))
        });
    }
    /**
     * Generate a value from a conditional rule
     * @param key - Rule identifier
     * @param context - Current parsing context
     * @param random - Random number generator
     * @returns Context-appropriate value or null if rule doesn't exist
     */
    generateValue(key, context, random) {
        const rule = this.rules.get(key);
        if (!rule) {
            return null;
        }
        for (const condition of rule.conditions) {
            if ('default' in condition && condition.default) {
                return random.randomChoice(condition.default);
            }
            else if (condition.if && condition.if(context)) {
                return random.randomChoice(condition.then);
            }
        }
        throw new Error('No matching condition found and no default provided');
    }
}
/**
 * Manager for sequential rules that cycle through values in order
 */
export class SequentialRuleManager extends BaseRuleManager {
    /**
     * Add a sequential rule
     * @param key - Rule identifier
     * @param values - Array of values to cycle through
     * @param options - Configuration options
     */
    addRule(key, values, options = { cycle: true }) {
        if (!key || typeof key !== 'string') {
            throw new Error('Key must be a non-empty string');
        }
        if (!Array.isArray(values) || values.length === 0) {
            throw new Error('Values must be a non-empty array');
        }
        this.rules.set(key, {
            values: [...values],
            index: 0,
            cycle: options.cycle
        });
    }
    /**
     * Generate a value from a sequential rule
     * @param key - Rule identifier
     * @param context - Current parsing context (unused for sequential rules)
     * @param random - Random number generator (unused for sequential rules)
     * @returns Next value in sequence or null if rule doesn't exist
     */
    generateValue(key, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _context, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _random) {
        const rule = this.rules.get(key);
        if (!rule) {
            return null;
        }
        if (rule.index >= rule.values.length) {
            if (rule.cycle) {
                rule.index = 0;
            }
            else {
                return rule.values[rule.values.length - 1];
            }
        }
        const value = rule.values[rule.index];
        rule.index++;
        return value;
    }
    /**
     * Reset a sequential rule to start from the beginning
     * @param key - Rule identifier
     * @returns True if rule was reset, false if it doesn't exist
     */
    resetRule(key) {
        const rule = this.rules.get(key);
        if (rule) {
            rule.index = 0;
            return true;
        }
        return false;
    }
}
/**
 * Manager for range rules that generate numeric values
 */
export class RangeRuleManager extends BaseRuleManager {
    /**
     * Add a range rule
     * @param key - Rule identifier
     * @param config - Range configuration
     */
    addRule(key, config) {
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
        this.rules.set(key, {
            min: config.min,
            max: config.max,
            step: config.step,
            type: config.type
        });
    }
    /**
     * Generate a value from a range rule
     * @param key - Rule identifier
     * @param context - Current parsing context (unused for range rules)
     * @param random - Random number generator
     * @returns Generated numeric value as string or null if rule doesn't exist
     */
    generateValue(key, _context, random) {
        const rule = this.rules.get(key);
        if (!rule) {
            return null;
        }
        const { min, max, step, type } = rule;
        if (step !== undefined) {
            // Generate stepped values
            const steps = Math.floor((max - min) / step);
            const randomStep = random.randomInt(0, steps + 1);
            const value = min + (randomStep * step);
            return type === 'integer' ? Math.floor(value).toString() : value.toString();
        }
        else {
            // Generate continuous values
            const randomValue = min + (random.random() * (max - min));
            return type === 'integer' ? Math.floor(randomValue).toString() : randomValue.toString();
        }
    }
}
/**
 * Manager for template rules with embedded variables
 */
export class TemplateRuleManager extends BaseRuleManager {
    /**
     * Add a template rule
     * @param key - Rule identifier
     * @param rule - Template rule configuration
     */
    addRule(key, rule) {
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
            if (!Array.isArray(rule.variables[variable]) || rule.variables[variable].length === 0) {
                throw new Error(`Variable '${variable}' must be an array`);
            }
        }
        this.rules.set(key, {
            template: rule.template,
            variables: { ...rule.variables }
        });
    }
    /**
     * Generate a value from a template rule
     * @param key - Rule identifier
     * @param context - Current parsing context
     * @param random - Random number generator
     * @returns Generated template value or null if rule doesn't exist
     */
    generateValue(key, _context, random) {
        const rule = this.rules.get(key);
        if (!rule) {
            return null;
        }
        // Expand template using its own variables
        let result = rule.template;
        const templateVars = this.findVariables(result);
        for (const variable of templateVars) {
            const values = rule.variables[variable];
            if (values && values.length > 0) {
                const value = random.randomChoice(values);
                result = result.replace(new RegExp(`%${variable}%`, 'g'), value);
            }
        }
        return result;
    }
    /**
     * Find all variables in a text string
     * @param text - Text to analyze
     * @returns Array of unique variable names
     */
    findVariables(text) {
        const variablePattern = /%([^%]+)%/g;
        const variables = new Set();
        let match;
        while ((match = variablePattern.exec(text)) !== null) {
            variables.add(match[1]);
        }
        return Array.from(variables);
    }
}
//# sourceMappingURL=AdvancedRuleManagers.js.map