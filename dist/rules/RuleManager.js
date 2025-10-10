import { StaticRuleManager, FunctionRuleManager, WeightedRuleManager } from './BaseRuleManager.js';
import { ConditionalRuleManager, SequentialRuleManager, RangeRuleManager, TemplateRuleManager } from './AdvancedRuleManagers.js';
/**
 * Unified manager for all rule types with priority-based resolution
 */
export class RuleManager {
    constructor() {
        this.staticRules = new StaticRuleManager();
        this.functionRules = new FunctionRuleManager();
        this.weightedRules = new WeightedRuleManager();
        this.conditionalRules = new ConditionalRuleManager();
        this.sequentialRules = new SequentialRuleManager();
        this.rangeRules = new RangeRuleManager();
        this.templateRules = new TemplateRuleManager();
        // Rule resolution priority (first match wins)
        this.ruleManagers = [
            { name: 'function', manager: this.functionRules },
            { name: 'conditional', manager: this.conditionalRules },
            { name: 'sequential', manager: this.sequentialRules },
            { name: 'range', manager: this.rangeRules },
            { name: 'template', manager: this.templateRules },
            { name: 'weighted', manager: this.weightedRules },
            { name: 'static', manager: this.staticRules }
        ];
    }
    /**
     * Add static rules
     */
    addRule(key, values) {
        this.staticRules.addRule(key, values);
    }
    addRules(grammar) {
        this.staticRules.addRules(grammar);
    }
    /**
     * Add function rule
     */
    addFunctionRule(key, fn) {
        this.functionRules.addRule(key, fn);
    }
    /**
     * Add weighted rule
     */
    addWeightedRule(key, values, weights) {
        this.weightedRules.addRule(key, values, weights);
    }
    /**
     * Add conditional rule
     */
    addConditionalRule(key, rule) {
        this.conditionalRules.addRule(key, rule);
    }
    /**
     * Add sequential rule
     */
    addSequentialRule(key, values, options) {
        this.sequentialRules.addRule(key, values, options);
    }
    /**
     * Add range rule
     */
    addRangeRule(key, config) {
        this.rangeRules.addRule(key, config);
    }
    /**
     * Add template rule
     */
    addTemplateRule(key, rule) {
        this.templateRules.addRule(key, rule);
    }
    /**
     * Check if a rule exists (any type)
     */
    hasRule(key) {
        return this.ruleManagers.some(({ manager }) => manager.hasRule(key));
    }
    /**
     * Remove a rule (from all managers)
     */
    removeRule(key) {
        let removed = false;
        for (const { manager } of this.ruleManagers) {
            if (manager.removeRule(key)) {
                removed = true;
            }
        }
        return removed;
    }
    /**
     * Generate a value from any rule type
     * Uses priority order: function → conditional → sequential → range → template → weighted → static
     */
    generateValue(key, context, random) {
        for (const { manager } of this.ruleManagers) {
            if (manager.hasRule(key)) {
                return manager.generateValue(key, context, random);
            }
        }
        return null;
    }
    /**
     * Get rule type for a given key
     */
    getRuleType(key) {
        for (const { name, manager } of this.ruleManagers) {
            if (manager.hasRule(key)) {
                return name;
            }
        }
        return null;
    }
    /**
     * Clear all rules
     */
    clear() {
        for (const { manager } of this.ruleManagers) {
            manager.clear();
        }
    }
    /**
     * Clear specific rule types
     */
    clearStaticRules() { this.staticRules.clear(); }
    clearFunctionRules() { this.functionRules.clear(); }
    clearWeightedRules() { this.weightedRules.clear(); }
    clearConditionalRules() { this.conditionalRules.clear(); }
    clearSequentialRules() { this.sequentialRules.clear(); }
    clearRangeRules() { this.rangeRules.clear(); }
    clearTemplateRules() { this.templateRules.clear(); }
    /**
     * Get statistics about rules
     */
    getStats() {
        return {
            static: this.staticRules.size(),
            function: this.functionRules.size(),
            weighted: this.weightedRules.size(),
            conditional: this.conditionalRules.size(),
            sequential: this.sequentialRules.size(),
            range: this.rangeRules.size(),
            template: this.templateRules.size(),
            total: this.ruleManagers.reduce((sum, { manager }) => sum + manager.size(), 0)
        };
    }
    /**
     * Get all rule keys
     */
    getAllKeys() {
        const keys = new Set();
        for (const { manager } of this.ruleManagers) {
            for (const key of manager.getKeys()) {
                keys.add(key);
            }
        }
        return Array.from(keys);
    }
    /**
     * Reset sequential rule
     */
    resetSequentialRule(key) {
        return this.sequentialRules.resetRule(key);
    }
    /**
     * Get static grammar
     */
    getGrammar() {
        return this.staticRules.getGrammar();
    }
    /**
     * Get rule data for analysis purposes
     */
    getWeightedRuleData(key) {
        return this.weightedRules.getRuleData(key);
    }
    getConditionalRuleData(key) {
        return this.conditionalRules.getRuleData(key);
    }
    getSequentialRuleData(key) {
        return this.sequentialRules.getRuleData(key);
    }
    getRangeRuleData(key) {
        return this.rangeRules.getRuleData(key);
    }
    getTemplateRuleData(key) {
        return this.templateRules.getRuleData(key);
    }
    /**
     * Check specific rule types
     */
    hasFunctionRule(key) { return this.functionRules.hasRule(key); }
    hasWeightedRule(key) { return this.weightedRules.hasRule(key); }
    hasConditionalRule(key) { return this.conditionalRules.hasRule(key); }
    hasSequentialRule(key) { return this.sequentialRules.hasRule(key); }
    hasRangeRule(key) { return this.rangeRules.hasRule(key); }
    hasTemplateRule(key) { return this.templateRules.hasRule(key); }
    /**
     * Remove specific rule types
     */
    removeFunctionRule(key) { return this.functionRules.removeRule(key); }
    removeWeightedRule(key) { return this.weightedRules.removeRule(key); }
    removeConditionalRule(key) { return this.conditionalRules.removeRule(key); }
    removeSequentialRule(key) { return this.sequentialRules.removeRule(key); }
    removeRangeRule(key) { return this.rangeRules.removeRule(key); }
    removeTemplateRule(key) { return this.templateRules.removeRule(key); }
}
//# sourceMappingURL=RuleManager.js.map