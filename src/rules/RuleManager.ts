/**
 * Unified rule manager that coordinates all rule types
 */
import { 
  Grammar, 
  FunctionRule, 
  ConditionalRule, 
  TemplateRule,
  WeightedRule,
  SequentialRule,
  RangeRule
} from '../types.js';
import { SeededRandom } from '../utils/SeededRandom.js';
import { 
  StaticRuleManager, 
  FunctionRuleManager, 
  WeightedRuleManager 
} from './BaseRuleManager.js';
import { 
  ConditionalRuleManager, 
  SequentialRuleManager, 
  RangeRuleManager, 
  TemplateRuleManager 
} from './AdvancedRuleManagers.js';

/**
 * Unified manager for all rule types with priority-based resolution
 */
export class RuleManager {
  private staticRules = new StaticRuleManager();
  private functionRules = new FunctionRuleManager();
  private weightedRules = new WeightedRuleManager();
  private conditionalRules = new ConditionalRuleManager();
  private sequentialRules = new SequentialRuleManager();
  private rangeRules = new RangeRuleManager();
  private templateRules = new TemplateRuleManager();

  // Rule resolution priority (first match wins)
  private readonly ruleManagers = [
    { name: 'function', manager: this.functionRules },
    { name: 'conditional', manager: this.conditionalRules },
    { name: 'sequential', manager: this.sequentialRules },
    { name: 'range', manager: this.rangeRules },
    { name: 'template', manager: this.templateRules },
    { name: 'weighted', manager: this.weightedRules },
    { name: 'static', manager: this.staticRules }
  ];

  /**
   * Add static rules
   */
  public addRule(key: string, values: string[]): void {
    this.staticRules.addRule(key, values);
  }

  public addRules(grammar: Grammar): void {
    this.staticRules.addRules(grammar);
  }

  /**
   * Add function rule
   */
  public addFunctionRule(key: string, fn: FunctionRule): void {
    this.functionRules.addRule(key, fn);
  }

  /**
   * Add weighted rule
   */
  public addWeightedRule(key: string, values: string[], weights: number[]): void {
    this.weightedRules.addRule(key, values, weights);
  }

  /**
   * Add conditional rule
   */
  public addConditionalRule(key: string, rule: ConditionalRule): void {
    this.conditionalRules.addRule(key, rule);
  }

  /**
   * Add sequential rule
   */
  public addSequentialRule(key: string, values: string[], options?: { cycle: boolean }): void {
    this.sequentialRules.addRule(key, values, options);
  }

  /**
   * Add range rule
   */
  public addRangeRule(key: string, config: { min: number; max: number; step?: number; type: 'integer' | 'float' }): void {
    this.rangeRules.addRule(key, config);
  }

  /**
   * Add template rule
   */
  public addTemplateRule(key: string, rule: TemplateRule): void {
    this.templateRules.addRule(key, rule);
  }

  /**
   * Check if a rule exists (any type)
   */
  public hasRule(key: string): boolean {
    return this.ruleManagers.some(({ manager }) => manager.hasRule(key));
  }

  /**
   * Remove a rule (from all managers)
   */
  public removeRule(key: string): boolean {
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
  public generateValue(key: string, context: { [key: string]: string }, random: SeededRandom): string | null {
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
  public getRuleType(key: string): string | null {
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
  public clear(): void {
    for (const { manager } of this.ruleManagers) {
      manager.clear();
    }
  }

  /**
   * Clear specific rule types
   */
  public clearStaticRules(): void { this.staticRules.clear(); }
  public clearFunctionRules(): void { this.functionRules.clear(); }
  public clearWeightedRules(): void { this.weightedRules.clear(); }
  public clearConditionalRules(): void { this.conditionalRules.clear(); }
  public clearSequentialRules(): void { this.sequentialRules.clear(); }
  public clearRangeRules(): void { this.rangeRules.clear(); }
  public clearTemplateRules(): void { this.templateRules.clear(); }

  /**
   * Get statistics about rules
   */
  public getStats(): { [key: string]: number } {
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
  public getAllKeys(): string[] {
    const keys = new Set<string>();
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
  public resetSequentialRule(key: string): boolean {
    return this.sequentialRules.resetRule(key);
  }

  /**
   * Get static grammar
   */
  public getGrammar(): Grammar {
    return this.staticRules.getGrammar();
  }

  /**
   * Get rule data for analysis purposes
   */
  public getWeightedRuleData(key: string): WeightedRule | undefined {
    return this.weightedRules.getRuleData(key);
  }

  public getConditionalRuleData(key: string): ConditionalRule | undefined {
    return this.conditionalRules.getRuleData(key);
  }

  public getSequentialRuleData(key: string): SequentialRule | undefined {
    return this.sequentialRules.getRuleData(key);
  }

  public getRangeRuleData(key: string): RangeRule | undefined {
    return this.rangeRules.getRuleData(key);
  }

  public getTemplateRuleData(key: string): TemplateRule | undefined {
    return this.templateRules.getRuleData(key);
  }

  /**
   * Check specific rule types
   */
  public hasFunctionRule(key: string): boolean { return this.functionRules.hasRule(key); }
  public hasWeightedRule(key: string): boolean { return this.weightedRules.hasRule(key); }
  public hasConditionalRule(key: string): boolean { return this.conditionalRules.hasRule(key); }
  public hasSequentialRule(key: string): boolean { return this.sequentialRules.hasRule(key); }
  public hasRangeRule(key: string): boolean { return this.rangeRules.hasRule(key); }
  public hasTemplateRule(key: string): boolean { return this.templateRules.hasRule(key); }

  /**
   * Remove specific rule types
   */
  public removeFunctionRule(key: string): boolean { return this.functionRules.removeRule(key); }
  public removeWeightedRule(key: string): boolean { return this.weightedRules.removeRule(key); }
  public removeConditionalRule(key: string): boolean { return this.conditionalRules.removeRule(key); }
  public removeSequentialRule(key: string): boolean { return this.sequentialRules.removeRule(key); }
  public removeRangeRule(key: string): boolean { return this.rangeRules.removeRule(key); }
  public removeTemplateRule(key: string): boolean { return this.templateRules.removeRule(key); }
}