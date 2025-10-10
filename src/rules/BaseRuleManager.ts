/**
 * Base class for managing different types of grammar rules
 */
import {
  Grammar,
  FunctionRule,
  WeightedRule
} from '../types.js';
import { SeededRandom } from '../utils/SeededRandom.js';

export abstract class BaseRuleManager<T> {
  protected rules: Map<string, T> = new Map();

  /**
   * Add a rule to the manager
   * @param key - Rule identifier
   * @param ...args - Rule configuration arguments (varies by implementation)
   */
  public abstract addRule(key: string, ...args: unknown[]): void;

  /**
   * Remove a rule from the manager
   * @param key - Rule identifier
   * @returns True if rule was removed
   */
  public removeRule(key: string): boolean {
    return this.rules.delete(key);
  }

  /**
   * Check if a rule exists
   * @param key - Rule identifier
   * @returns True if rule exists
   */
  public hasRule(key: string): boolean {
    return this.rules.has(key);
  }

  /**
   * Get a rule by key
   * @param key - Rule identifier
   * @returns Rule or undefined
   */
  public getRule(key: string): T | undefined {
    return this.rules.get(key);
  }

  /**
   * Clear all rules
   */
  public clear(): void {
    this.rules.clear();
  }

  /**
   * Get all rule keys
   * @returns Array of rule keys
   */
  public getKeys(): string[] {
    return Array.from(this.rules.keys());
  }

  /**
   * Get the number of rules
   * @returns Number of rules
   */
  public size(): number {
    return this.rules.size;
  }

  /**
   * Get rule data for analysis (protected method for analyzers)
   * @param key - Rule identifier
   * @returns Rule data or undefined
   */
  public getRuleData(key: string): T | undefined {
    return this.rules.get(key);
  }

  /**
   * Generate a value from the rule
   * @param key - Rule identifier
   * @param context - Current parsing context
   * @param random - Random number generator
   * @returns Generated value or null if rule doesn't exist
   */
  public abstract generateValue(
    key: string, 
    context: { [key: string]: string }, 
    random: SeededRandom
  ): string | null;
}

/**
 * Manager for static grammar rules
 */
export class StaticRuleManager extends BaseRuleManager<string[]> {
  /**
   * Add a static rule
   * @param key - Rule identifier
   * @param values - Array of possible values
   */
  public addRule(key: string, values: string[]): void {
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
  public addRules(grammar: Grammar): void {
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
  public generateValue(
    key: string, 
    context: { [key: string]: string }, 
    random: SeededRandom
  ): string | null {
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
  public getGrammar(): Grammar {
    const grammar: Grammar = {};
    for (const [key, values] of this.rules.entries()) {
      grammar[key] = [...values];
    }
    return grammar;
  }
}

/**
 * Manager for function-based rules
 */
export class FunctionRuleManager extends BaseRuleManager<FunctionRule> {
  /**
   * Add a function rule
   * @param key - Rule identifier
   * @param fn - Function that returns an array of possible values
   */
  public addRule(key: string, fn: FunctionRule): void {
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
  public generateValue(
    key: string, 
    context: { [key: string]: string }, 
    random: SeededRandom
  ): string | null {
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
    } catch (error) {
      throw new Error(`Error executing function rule '${key}': ${(error as Error).message}`);
    }
  }
}

/**
 * Manager for weighted rules
 */
export class WeightedRuleManager extends BaseRuleManager<WeightedRule> {
  /**
   * Add a weighted rule
   * @param key - Rule identifier
   * @param values - Array of possible values
   * @param weights - Array of probability weights (must sum to 1.0)
   */
  public addRule(key: string, values: string[], weights: number[]): void {
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
    const cumulativeWeights: number[] = [];
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
  public generateValue(
    key: string, 
    context: { [key: string]: string }, 
    random: SeededRandom
  ): string | null {
    const rule = this.rules.get(key);
    if (!rule) {
      return null;
    }
    
    return random.weightedChoice(rule.values, rule.cumulativeWeights);
  }
}