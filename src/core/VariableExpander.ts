/**
 * Variable expansion engine for processing %variable% placeholders
 */
import { RuleManager } from '../rules/RuleManager.js';
import { SeededRandom } from '../utils/SeededRandom.js';

export class VariableExpander {
  private variablePattern = /%([^%]+)%/g;
  private referenceValues: Map<string, string> = new Map();
  private currentContext: { [key: string]: string } = {};
  private maxDepth: number = 100;

  constructor(
    private ruleManager: RuleManager,
    private random: SeededRandom
  ) {}

  /**
   * Set maximum recursion depth
   */
  public setMaxDepth(depth: number): void {
    if (typeof depth !== 'number' || depth < 1) {
      throw new Error('Max depth must be at least 1');
    }
    this.maxDepth = depth;
  }

  /**
   * Get maximum recursion depth
   */
  public getMaxDepth(): number {
    return this.maxDepth;
  }

  /**
   * Clear context and reference values
   */
  public clearContext(): void {
    this.currentContext = {};
    this.referenceValues.clear();
  }

  /**
   * Get current context
   */
  public getContext(): { [key: string]: string } {
    return { ...this.currentContext };
  }

  /**
   * Clear reference values and context
   */
  public clearReferences(): void {
    this.referenceValues.clear();
    this.currentContext = {};
  }

  /**
   * Expand variables in text with recursive processing
   * @param text - Text containing %variable% placeholders
   * @param preserveContext - Whether to maintain context from previous expansions
   * @returns Fully expanded text
   */
  public expandVariables(text: string, preserveContext: boolean = false): string {
    if (!preserveContext) {
      this.clearContext();
    }
    
    return this.expandVariablesRecursive(text, 0);
  }

  /**
   * Recursively expand variables with depth protection
   * @private
   */
  private expandVariablesRecursive(text: string, depth: number): string {
    if (depth >= this.maxDepth) {
      throw new Error(`Maximum recursion depth of ${this.maxDepth} exceeded. This may indicate circular references in your grammar rules.`);
    }

    // Reset the regex lastIndex to ensure proper matching
    this.variablePattern.lastIndex = 0;

    return text.replace(this.variablePattern, (match, key) => {
      // Handle reference variables (@variable syntax)
      if (key.startsWith('@')) {
        const refKey = key.substring(1);
        const refValue = this.referenceValues.get(refKey);
        if (refValue !== undefined) {
          return refValue;
        }
        // If reference doesn't exist, fall through to generate new value
        key = refKey;
      }

      // Try to generate value from rule manager
      const value = this.ruleManager.generateValue(key, this.currentContext, this.random);
      
      if (value === null) {
        // Rule not found - return original placeholder
        return match;
      }

      // Store in context and references
      this.currentContext[key] = value;
      this.referenceValues.set(key, value);

      // Recursively expand the generated value
      return this.expandVariablesRecursive(value, depth + 1);
    });
  }

  /**
   * Find all variable names in text
   * @param text - Text to analyze
   * @returns Array of unique variable names
   */
  public findVariables(text: string): string[] {
    const variables = new Set<string>();
    const regex = new RegExp(this.variablePattern.source, 'g');
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      variables.add(match[1]);
    }
    
    return Array.from(variables);
  }

  /**
   * Validate that all variables in text have corresponding rules
   * @param text - Text to validate
   * @returns Array of missing variable names
   */
  public findMissingVariables(text: string): string[] {
    const variables = this.findVariables(text);
    const missing: string[] = [];
    
    for (const variable of variables) {
      // Skip reference variables
      if (variable.startsWith('@')) {
        continue;
      }
      
      if (!this.ruleManager.hasRule(variable)) {
        missing.push(variable);
      }
    }
    
    return missing;
  }

  /**
   * Check for circular references in grammar rules
   * @param startRule - Rule to start checking from
   * @param visited - Set of already visited rules
   * @returns Array of circular reference chains found
   */
  public findCircularReferences(startRule?: string, visited: Set<string> = new Set()): string[] {
    const circular: string[] = [];
    
    if (startRule) {
      this.checkRuleForCircularReferences(startRule, visited, circular);
    } else {
      // Check all rules
      const allKeys = this.ruleManager.getAllKeys();
      for (const key of allKeys) {
        this.checkRuleForCircularReferences(key, new Set(), circular);
      }
    }
    
    return circular;
  }

  /**
   * Check a specific rule for circular references
   * @private
   */
  private checkRuleForCircularReferences(
    ruleName: string, 
    visited: Set<string>, 
    circular: string[]
  ): void {
    if (visited.has(ruleName)) {
      circular.push(ruleName);
      return;
    }
    
    visited.add(ruleName);
    
    // Get a sample value from the rule to check its variables  
    const sampleValue = this.ruleManager.generateValue(ruleName, {}, this.random);
    if (sampleValue) {
      const variables = this.findVariables(sampleValue);
      for (const variable of variables) {
        if (!variable.startsWith('@') && this.ruleManager.hasRule(variable)) {
          this.checkRuleForCircularReferences(variable, new Set(visited), circular);
        }
      }
    }
    
    visited.delete(ruleName);
  }
}