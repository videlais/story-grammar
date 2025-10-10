/**
 * Complexity analysis for grammar rules
 */
import { 
  ComplexityResult, 
  TotalComplexityResult 
} from '../types.js';
import { RuleManager } from '../rules/RuleManager.js';
import { VariableExpander } from '../core/VariableExpander.js';

export class ComplexityAnalyzer {
  constructor(
    private ruleManager: RuleManager,
    private variableExpander: VariableExpander
  ) {}

  /**
   * Calculate the complexity (number of possible outcomes) for a specific rule
   * 
   * This method analyzes a single rule and calculates how many different possible
   * values it can generate, taking into account nested variables and rule dependencies.
   * 
   * @param ruleKey - The name of the rule to analyze
   * @param visited - Internal set to track visited rules (prevents infinite recursion)
   * @param maxDepth - Maximum recursion depth to prevent stack overflow (default: 50)
   * 
   * @returns ComplexityResult containing detailed analysis of the rule's complexity
   * 
   * @throws {Error} If the rule does not exist
   */
  public calculateRuleComplexity(
    ruleKey: string, 
    visited: Set<string> = new Set(), 
    maxDepth: number = 50
  ): ComplexityResult {
    const warnings: string[] = [];
    const variables: Set<string> = new Set();
    let ruleType = 'unknown';
    let complexity = 1;
    let isFinite = true;
    
    // Check if rule exists
    if (!this.ruleManager.hasRule(ruleKey)) {
      throw new Error(`Rule '${ruleKey}' does not exist`);
    }
    
    // Check for circular references
    if (visited.has(ruleKey)) {
      warnings.push(`Circular reference detected for rule '${ruleKey}'`);
      return {
        ruleName: ruleKey,
        complexity: 1,
        ruleType: 'circular',
        isFinite: true,
        variables: [],
        depth: visited.size,
        warnings
      };
    }
    
    // Check maximum depth
    if (visited.size >= maxDepth) {
      warnings.push(`Maximum depth (${maxDepth}) reached, complexity may be underestimated`);
      return {
        ruleName: ruleKey,
        complexity: 1,
        ruleType: 'max-depth',
        isFinite: true,
        variables: [],
        depth: visited.size,
        warnings
      };
    }
    
    const newVisited = new Set(visited);
    newVisited.add(ruleKey);
    
    // Determine rule type and calculate complexity
    const type = this.ruleManager.getRuleType(ruleKey);
    ruleType = type || 'unknown';
    
    switch (type) {
      case 'static':
        complexity = this.calculateStaticRuleComplexity(ruleKey, newVisited, maxDepth, variables, warnings);
        break;
      case 'weighted':
        complexity = this.calculateWeightedRuleComplexity(ruleKey, newVisited, maxDepth, variables, warnings);
        break;
      case 'function':
        complexity = Number.POSITIVE_INFINITY;
        isFinite = false;
        warnings.push(`Function rule '${ruleKey}' has infinite complexity (cannot be calculated)`);
        break;
      case 'conditional':
        complexity = this.calculateConditionalRuleComplexity(ruleKey, newVisited, maxDepth, variables, warnings);
        break;
      case 'sequential':
        complexity = this.calculateSequentialRuleComplexity(ruleKey, newVisited, maxDepth, variables, warnings);
        break;
      case 'range':
        complexity = this.calculateRangeRuleComplexity(ruleKey);
        break;
      case 'template':
        complexity = this.calculateTemplateRuleComplexity(ruleKey, newVisited, maxDepth, variables, warnings);
        break;
      default:
        warnings.push(`Unknown rule type for '${ruleKey}'`);
        complexity = 1;
    }
    
    return {
      ruleName: ruleKey,
      complexity,
      ruleType,
      isFinite,
      variables: Array.from(variables),
      depth: visited.size,
      warnings
    };
  }

  /**
   * Calculate total complexity across all rules in the grammar
   */
  public calculateTotalComplexity(maxDepth: number = 50): TotalComplexityResult {
    const allRuleKeys = this.ruleManager.getAllKeys();
    const complexityByRule: ComplexityResult[] = [];
    const warnings: string[] = [];
    const circularReferences: string[] = [];
    let totalComplexity = 0;
    let isFinite = true;

    // Calculate complexity for each rule
    for (const ruleKey of allRuleKeys) {
      try {
        const result = this.calculateRuleComplexity(ruleKey, new Set(), maxDepth);
        complexityByRule.push(result);
        
        if (!result.isFinite) {
          isFinite = false;
        } else {
          totalComplexity += result.complexity;
        }
        
        warnings.push(...result.warnings);
        
        if (result.warnings.some(w => w.includes('Circular reference'))) {
          circularReferences.push(ruleKey);
        }
      } catch (error) {
        warnings.push(`Error calculating complexity for rule '${ruleKey}': ${error}`);
        complexityByRule.push({
          ruleName: ruleKey,
          complexity: 1,
          ruleType: 'error',
          isFinite: true,
          variables: [],
          depth: 0,
          warnings: [`Error: ${error}`]
        });
      }
    }

    // Remove duplicate warnings
    const uniqueWarnings = Array.from(new Set(warnings));
    const uniqueCircularRefs = Array.from(new Set(circularReferences));

    // Sort rules by complexity (descending)
    const sortedByComplexity = [...complexityByRule]
      .filter(r => r.isFinite)
      .sort((a, b) => b.complexity - a.complexity);

    // Get top 5 most complex rules
    const mostComplexRules = sortedByComplexity.slice(0, 5);

    // Calculate average complexity (only finite rules)
    const finiteRules = complexityByRule.filter(r => r.isFinite);
    const averageComplexity = finiteRules.length > 0 
      ? finiteRules.reduce((sum, r) => sum + r.complexity, 0) / finiteRules.length 
      : 0;

    return {
      totalComplexity: isFinite ? totalComplexity : Number.POSITIVE_INFINITY,
      isFinite,
      ruleCount: allRuleKeys.length,
      complexityByRule,
      averageComplexity,
      mostComplexRules,
      warnings: uniqueWarnings,
      circularReferences: uniqueCircularRefs
    };
  }

  /**
   * Calculate complexity for static grammar rules
   */
  private calculateStaticRuleComplexity(
    ruleKey: string, 
    visited: Set<string>, 
    maxDepth: number,
    variables: Set<string>,
    warnings: string[]
  ): number {
    const rule = this.ruleManager.getGrammar()[ruleKey];
    if (!rule) return 1;
    
    let totalComplexity = 0;
    
    for (const value of rule) {
      const valueVariables = this.variableExpander.findVariables(value);
      
      if (valueVariables.length === 0) {
        // Literal string
        totalComplexity += 1;
      } else {
        // Calculate complexity by multiplying all variable complexities
        let valueComplexity = 1;
        for (const variable of valueVariables) {
          variables.add(variable);
          if (visited.has(variable)) {
            // Circular reference detected during recursion
            warnings.push(`Circular reference detected for rule '${variable}'`);
            valueComplexity *= 1; // Treat as single possibility to avoid infinite recursion
          } else if (visited.size >= maxDepth) {
            // Max depth reached during recursion
            warnings.push(`Maximum depth (${maxDepth}) reached while analyzing '${variable}', complexity may be underestimated`);
            valueComplexity *= 1; // Treat as single possibility
          } else if (this.ruleManager.hasRule(variable)) {
            const varResult = this.calculateRuleComplexity(variable, visited, maxDepth);
            if (!varResult.isFinite) {
              return Number.POSITIVE_INFINITY;
            }
            valueComplexity *= varResult.complexity;
            warnings.push(...varResult.warnings);
          } else {
            warnings.push(`Missing rule '${variable}' referenced in '${ruleKey}'`);
            valueComplexity *= 1; // Treat as single possibility
          }
        }
        totalComplexity += valueComplexity;
      }
    }
    
    return totalComplexity;
  }

  /**
   * Calculate complexity for weighted rules
   */
  private calculateWeightedRuleComplexity(
    ruleKey: string, 
    visited: Set<string>, 
    maxDepth: number,
    variables: Set<string>,
    warnings: string[]
  ): number {
    const rule = this.ruleManager.getWeightedRuleData(ruleKey);
    if (!rule) return 1;
    
    let totalComplexity = 0;
    
    for (const value of rule.values) {
      const valueVariables = this.variableExpander.findVariables(value);
      
      if (valueVariables.length === 0) {
        totalComplexity += 1;
      } else {
        let valueComplexity = 1;
        for (const variable of valueVariables) {
          variables.add(variable);
          if (visited.has(variable)) {
            warnings.push(`Circular reference detected for rule '${variable}'`);
            valueComplexity *= 1;
          } else if (visited.size >= maxDepth) {
            warnings.push(`Maximum depth (${maxDepth}) reached while analyzing '${variable}', complexity may be underestimated`);
            valueComplexity *= 1;
          } else if (this.ruleManager.hasRule(variable)) {
            const varResult = this.calculateRuleComplexity(variable, visited, maxDepth);
            if (!varResult.isFinite) {
              return Number.POSITIVE_INFINITY;
            }
            valueComplexity *= varResult.complexity;
            warnings.push(...varResult.warnings);
          } else {
            warnings.push(`Missing rule '${variable}' referenced in '${ruleKey}'`);
            valueComplexity *= 1;
          }
        }
        totalComplexity += valueComplexity;
      }
    }
    
    return totalComplexity;
  }

    /**
   * Calculate complexity for conditional rules
   */
  private calculateConditionalRuleComplexity(
    ruleKey: string, 
    visited: Set<string>, 
    maxDepth: number,
    variables: Set<string>,
    warnings: string[]
  ): number {
    const rule = this.ruleManager.getConditionalRuleData(ruleKey);
    if (!rule) return 1;
    
    let totalComplexity = 0;
    
    for (const condition of rule.conditions) {
      let conditionComplexity = 0;
      
      // Process values in 'then' or 'default' array
      const values = condition.then || condition.default || [];
      
      for (const value of values) {
        const valueVariables = this.variableExpander.findVariables(value);
        
        if (valueVariables.length === 0) {
          conditionComplexity += 1;
        } else {
          let valueComplexity = 1;
          for (const variable of valueVariables) {
            variables.add(variable);
            if (visited.has(variable)) {
              warnings.push(`Circular reference detected for rule '${variable}'`);
              valueComplexity *= 1;
            } else if (visited.size >= maxDepth) {
              warnings.push(`Maximum depth (${maxDepth}) reached while analyzing '${variable}', complexity may be underestimated`);
              valueComplexity *= 1;
            } else if (this.ruleManager.hasRule(variable)) {
              const varResult = this.calculateRuleComplexity(variable, visited, maxDepth);
              if (!varResult.isFinite) {
                return Number.POSITIVE_INFINITY;
              }
              valueComplexity *= varResult.complexity;
              warnings.push(...varResult.warnings);
            } else {
              warnings.push(`Missing rule '${variable}' referenced in '${ruleKey}'`);
              valueComplexity *= 1;
            }
          }
          conditionComplexity += valueComplexity;
        }
      }
      
      totalComplexity += conditionComplexity;
    }
    
    return totalComplexity;
  }

    /**
   * Calculate complexity for sequential rules
   */
  private calculateSequentialRuleComplexity(
    ruleKey: string, 
    visited: Set<string>, 
    maxDepth: number,
    variables: Set<string>,
    warnings: string[]
  ): number {
    const rule = this.ruleManager.getSequentialRuleData(ruleKey);
    if (!rule) return 1;
    
    let totalComplexity = 0;
    
    for (const value of rule.values) {
      const valueVariables = this.variableExpander.findVariables(value);
      
      if (valueVariables.length === 0) {
        totalComplexity += 1;
      } else {
        let valueComplexity = 1;
        for (const variable of valueVariables) {
          variables.add(variable);
          if (visited.has(variable)) {
            warnings.push(`Circular reference detected for rule '${variable}'`);
            valueComplexity *= 1;
          } else if (visited.size >= maxDepth) {
            warnings.push(`Maximum depth (${maxDepth}) reached while analyzing '${variable}', complexity may be underestimated`);
            valueComplexity *= 1;
          } else if (this.ruleManager.hasRule(variable)) {
            const varResult = this.calculateRuleComplexity(variable, visited, maxDepth);
            if (!varResult.isFinite) {
              return Number.POSITIVE_INFINITY;
            }
            valueComplexity *= varResult.complexity;
            warnings.push(...varResult.warnings);
          } else {
            warnings.push(`Missing rule '${variable}' referenced in '${ruleKey}'`);
            valueComplexity *= 1;
          }
        }
        totalComplexity += valueComplexity;
      }
    }
    
    return totalComplexity;
  }

  /**
   * Calculate complexity for range rules
   */
  private calculateRangeRuleComplexity(ruleKey: string): number {
    const rule = this.ruleManager.getRangeRuleData(ruleKey);
    if (!rule) return 1;
    
    // For range rules, complexity is the number of possible values
    const step = rule.step || 1;
    const possibleValues = Math.floor((rule.max - rule.min) / step) + 1;
    
    return possibleValues;
  }

  /**
   * Calculate complexity for template rules
   */
  private calculateTemplateRuleComplexity(
    ruleKey: string, 
    visited: Set<string>, 
    maxDepth: number,
    variables: Set<string>,
    warnings: string[]
  ): number {
    const rule = this.ruleManager.getTemplateRuleData(ruleKey);
    if (!rule) return 1;
    
    let totalComplexity = 1;
    
    // Find all variables in the template
    const templateVariables = this.variableExpander.findVariables(rule.template);
    
    for (const variable of templateVariables) {
      variables.add(variable);
      
      // Check if this variable has values defined in the template rule
      if (rule.variables[variable]) {
        const values = rule.variables[variable];
        let variableComplexity = 0;
        
        for (const value of values) {
          const valueVariables = this.variableExpander.findVariables(value);
          
          if (valueVariables.length === 0) {
            variableComplexity += 1;
          } else {
            let valueComplexity = 1;
            for (const nestedVariable of valueVariables) {
              variables.add(nestedVariable);
              if (visited.has(nestedVariable)) {
                warnings.push(`Circular reference detected for rule '${nestedVariable}'`);
                valueComplexity *= 1;
              } else if (visited.size >= maxDepth) {
                warnings.push(`Maximum depth (${maxDepth}) reached while analyzing '${nestedVariable}', complexity may be underestimated`);
                valueComplexity *= 1;
              } else if (this.ruleManager.hasRule(nestedVariable)) {
                const varResult = this.calculateRuleComplexity(nestedVariable, visited, maxDepth);
                if (!varResult.isFinite) {
                  return Number.POSITIVE_INFINITY;
                }
                valueComplexity *= varResult.complexity;
                warnings.push(...varResult.warnings);
              } else {
                warnings.push(`Missing rule '${nestedVariable}' referenced in '${ruleKey}'`);
                valueComplexity *= 1;
              }
            }
            variableComplexity += valueComplexity;
          }
        }
        
        totalComplexity *= variableComplexity;
      } else if (this.ruleManager.hasRule(variable)) {
        // Variable references another rule
        if (visited.has(variable)) {
          warnings.push(`Circular reference detected for rule '${variable}'`);
          totalComplexity *= 1;
        } else if (visited.size >= maxDepth) {
          warnings.push(`Maximum depth (${maxDepth}) reached while analyzing '${variable}', complexity may be underestimated`);
          totalComplexity *= 1;
        } else {
          const varResult = this.calculateRuleComplexity(variable, visited, maxDepth);
          if (!varResult.isFinite) {
            return Number.POSITIVE_INFINITY;
          }
          totalComplexity *= varResult.complexity;
          warnings.push(...varResult.warnings);
        }
      } else {
        warnings.push(`Missing rule '${variable}' referenced in '${ruleKey}'`);
        totalComplexity *= 1;
      }
    }
    
    return totalComplexity;
  }
}