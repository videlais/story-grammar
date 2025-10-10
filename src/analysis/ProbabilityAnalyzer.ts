/**
 * Probability analysis for grammar rules
 */
import { 
  ProbabilityAnalysis, 
  ProbabilityResult,
  ProbabilityNode
} from '../types.js';
import { RuleManager } from '../rules/RuleManager.js';
import { VariableExpander } from '../core/VariableExpander.js';

export class ProbabilityAnalyzer {
  constructor(
    private ruleManager: RuleManager,
    private variableExpander: VariableExpander
  ) {}

  /**
   * Create a proper ProbabilityResult object
   * @private
   */
  private createProbabilityResult(
    outcome: string, 
    probability: number, 
    variables: string[] = [],
    probabilityTree: ProbabilityResult['probabilityTree'] = []
  ): ProbabilityResult {
    return { outcome, probability, variables, probabilityTree };
  }

  /**
   * Calculate probability analysis for a specific rule
   * 
   * This method analyzes all possible outcomes of a rule and calculates the probability
   * of each outcome occurring. It considers weighted rules, nested variables, and
   * rule dependencies to provide accurate probability distributions.
   * 
   * @param ruleKey - The name of the rule to analyze
   * @param maxDepth - Maximum recursion depth to prevent stack overflow (default: 50)
   * @param maxOutcomes - Maximum number of outcomes to calculate (default: 1000)
   * 
   * @returns ProbabilityAnalysis with detailed probability information
   * 
   * @throws {Error} If the rule does not exist
   */
  public calculateProbabilities(
    ruleKey: string, 
    maxDepth: number = 50, 
    maxOutcomes: number = 1000
  ): ProbabilityAnalysis {
    if (!this.ruleManager.hasRule(ruleKey)) {
      throw new Error(`Rule '${ruleKey}' does not exist`);
    }

    const warnings: string[] = [];
    const outcomes = this.calculateRuleProbabilities(ruleKey, new Set(), maxDepth, maxOutcomes, warnings);
    
    if (outcomes.length === 0) {
      return {
        ruleName: ruleKey,
        outcomes: [],
        totalOutcomes: 0,
        mostProbable: [],
        leastProbable: [],
        averageProbability: 0,
        entropy: 0,
        isFinite: true,
        warnings
      };
    }

    // Sort by probability (descending)
    const sortedOutcomes = outcomes.sort((a, b) => b.probability - a.probability);
    
    // Calculate entropy: H = -Σ(p * log2(p))
    const entropy = outcomes.reduce((sum, outcome) => {
      if (outcome.probability > 0) {
        return sum - (outcome.probability * Math.log2(outcome.probability));
      }
      return sum;
    }, 0);

    // Get top 10 most and least probable
    const mostProbable = sortedOutcomes.slice(0, 10);
    const leastProbable = sortedOutcomes.slice(-10).reverse();
    
    // Calculate average probability
    const averageProbability = outcomes.length > 0 
      ? outcomes.reduce((sum, o) => sum + o.probability, 0) / outcomes.length 
      : 0;

    return {
      ruleName: ruleKey,
      outcomes: sortedOutcomes,
      totalOutcomes: outcomes.length,
      mostProbable,
      leastProbable,
      averageProbability,
      entropy,
      isFinite: true,
      warnings
    };
  }

  /**
   * Get the most probable outcome for a rule
   */
  public getMostProbableOutcome(
    ruleKey: string, 
    maxDepth: number = 50, 
    maxOutcomes: number = 1000
  ): ProbabilityResult | null {
    const analysis = this.calculateProbabilities(ruleKey, maxDepth, maxOutcomes);
    return analysis.mostProbable[0] || null;
  }

  /**
   * Get the least probable outcome for a rule
   */
  public getLeastProbableOutcome(
    ruleKey: string, 
    maxDepth: number = 50, 
    maxOutcomes: number = 1000
  ): ProbabilityResult | null {
    const analysis = this.calculateProbabilities(ruleKey, maxDepth, maxOutcomes);
    return analysis.leastProbable[0] || null;
  }

  /**
   * Calculate probabilities for a specific rule (recursive helper)
   * @private
   */
  private calculateRuleProbabilities(
    ruleKey: string,
    visited: Set<string>,
    maxDepth: number,
    maxOutcomes: number,
    warnings: string[]
  ): ProbabilityResult[] {
    // Check for circular references and depth limits
    if (visited.has(ruleKey)) {
      warnings.push(`Circular reference detected for rule '${ruleKey}'`);
      return [this.createProbabilityResult(ruleKey, 1.0)];
    }
    
    if (visited.size >= maxDepth) {
      warnings.push(`Maximum depth (${maxDepth}) reached for rule '${ruleKey}'`);
      return [this.createProbabilityResult(ruleKey, 1.0)];
    }

    const newVisited = new Set(visited);
    newVisited.add(ruleKey);

    const ruleType = this.ruleManager.getRuleType(ruleKey);
    
    switch (ruleType) {
      case 'static':
        return this.calculateStaticRuleProbabilities(ruleKey, newVisited, maxDepth, maxOutcomes, warnings);
      case 'weighted':
        return this.calculateWeightedRuleProbabilities(ruleKey, newVisited, maxDepth, maxOutcomes, warnings);
      case 'range':
        return this.calculateRangeRuleProbabilities(ruleKey);
      case 'template':
        return this.calculateTemplateRuleProbabilities(ruleKey, newVisited, maxDepth, maxOutcomes, warnings);
      case 'sequential':
        return this.calculateSequentialRuleProbabilities(ruleKey, newVisited, maxDepth, maxOutcomes, warnings);
      case 'conditional':
        return this.calculateConditionalRuleProbabilities(ruleKey, newVisited, maxDepth, maxOutcomes, warnings);
      case 'function':
        warnings.push(`Function rule '${ruleKey}' has dynamic outcomes - cannot calculate exact probabilities`);
        return [this.createProbabilityResult(`[function:${ruleKey}]`, 1.0)];
      default:
        warnings.push(`Unknown rule type for '${ruleKey}'`);
        return [this.createProbabilityResult(ruleKey, 1.0)];
    }
  }

  /**
   * Calculate probabilities for static rules
   * @private
   */
  private calculateStaticRuleProbabilities(
    ruleKey: string,
    visited: Set<string>,
    maxDepth: number,
    maxOutcomes: number,
    warnings: string[]
  ): ProbabilityResult[] {
    const rule = this.ruleManager.getGrammar()[ruleKey];
    if (!rule || rule.length === 0) {
      return [];
    }

    const outcomes: ProbabilityResult[] = [];
    const baseProb = 1.0 / rule.length; // Equal probability for each value

    for (const value of rule) {
      const variables = this.variableExpander.findVariables(value);
      
      if (variables.length === 0) {
        // Simple literal value
        outcomes.push(this.createProbabilityResult(value, baseProb));
      } else {
        // Expand variables with probabilities
        const expandedOutcomes = this.expandVariablesWithProbabilities(
          value, variables, baseProb, visited, maxDepth, maxOutcomes, warnings
        );
        outcomes.push(...expandedOutcomes);
      }

      if (outcomes.length >= maxOutcomes) {
        warnings.push(`Maximum outcomes (${maxOutcomes}) reached for rule '${ruleKey}'`);
        break;
      }
    }

    return outcomes;
  }

  // Placeholder methods for other rule types
  private calculateWeightedRuleProbabilities(ruleKey: string, visited: Set<string>, maxDepth: number, maxOutcomes: number, warnings: string[]): ProbabilityResult[] {
    const rule = this.ruleManager.getWeightedRuleData(ruleKey);
    if (!rule) return [];
    
    const outcomes: ProbabilityResult[] = [];
    const totalWeight = rule.weights.reduce((sum: number, weight: number) => sum + weight, 0);
    
    for (let i = 0; i < rule.values.length; i++) {
      const value = rule.values[i];
      const weight = rule.weights[i];
      const probability = weight / totalWeight;
      
      const variables = this.variableExpander.findVariables(value);
      
      if (variables.length === 0) {
        outcomes.push(this.createProbabilityResult(value, probability));
      } else {
        const expandedOutcomes = this.expandVariablesWithProbabilities(
          value, variables, probability, visited, maxDepth, maxOutcomes, warnings
        );
        outcomes.push(...expandedOutcomes);
      }
      
      if (outcomes.length >= maxOutcomes) {
        warnings.push(`Maximum outcomes (${maxOutcomes}) reached for rule '${ruleKey}'`);
        break;
      }
    }
    
    return outcomes;
  }

  private calculateRangeRuleProbabilities(ruleKey: string): ProbabilityResult[] {
    const rule = this.ruleManager.getRangeRuleData(ruleKey);
    if (!rule) return [];
    
    const outcomes: ProbabilityResult[] = [];
    const step = rule.step || 1;
    const possibleValues = Math.floor((rule.max - rule.min) / step) + 1;
    const probability = 1.0 / possibleValues;
    
    for (let value = rule.min; value <= rule.max; value += step) {
      const outcome = rule.type === 'integer' ? value.toString() : value.toFixed(2);
      outcomes.push(this.createProbabilityResult(outcome, probability));
    }
    
    return outcomes;
  }

  private calculateTemplateRuleProbabilities(ruleKey: string, visited: Set<string>, maxDepth: number, maxOutcomes: number, warnings: string[]): ProbabilityResult[] {
    const rule = this.ruleManager.getTemplateRuleData(ruleKey);
    if (!rule) return [];
    
    // Start with the template
    let currentOutcomes = [{ value: rule.template, probability: 1.0 }];
    
    // Expand each variable in the template
    for (const [varName, values] of Object.entries(rule.variables) as [string, string[]][]) {
      const newOutcomes: { value: string; probability: number }[] = [];
      const valueProbability = 1.0 / values.length;
      
      for (const currentOutcome of currentOutcomes) {
        for (const value of values) {
          // Replace the variable in the template
          const expandedValue = currentOutcome.value.replace(
            new RegExp(`%${varName}%`, 'g'), 
            value
          );
          
          // Check if this value has nested variables
          const nestedVariables = this.variableExpander.findVariables(value);
          if (nestedVariables.length > 0) {
            // Recursively expand nested variables
            const nestedOutcomes = this.expandVariablesWithProbabilities(
              expandedValue, nestedVariables, currentOutcome.probability * valueProbability,
              visited, maxDepth, maxOutcomes, warnings
            );
            for (const nestedOutcome of nestedOutcomes) {
              newOutcomes.push({
                value: nestedOutcome.outcome,
                probability: nestedOutcome.probability
              });
            }
          } else {
            newOutcomes.push({
              value: expandedValue,
              probability: currentOutcome.probability * valueProbability
            });
          }
          
          if (newOutcomes.length >= maxOutcomes) {
            warnings.push(`Maximum outcomes (${maxOutcomes}) reached for template rule '${ruleKey}'`);
            break;
          }
        }
        if (newOutcomes.length >= maxOutcomes) break;
      }
      
      currentOutcomes = newOutcomes;
      if (currentOutcomes.length >= maxOutcomes) break;
    }
    
    // Handle any remaining variables that aren't in the local variables object
    const remainingVariables = this.variableExpander.findVariables(currentOutcomes[0]?.value || '');
    if (remainingVariables.length > 0) {
      const finalOutcomes: { value: string; probability: number }[] = [];
      
      for (const outcome of currentOutcomes) {
        const expandedOutcomes = this.expandVariablesWithProbabilities(
          outcome.value, remainingVariables, outcome.probability,
          visited, maxDepth, maxOutcomes, warnings
        );
        for (const expanded of expandedOutcomes) {
          finalOutcomes.push({
            value: expanded.outcome,
            probability: expanded.probability
          });
        }
        
        if (finalOutcomes.length >= maxOutcomes) break;
      }
      
      currentOutcomes = finalOutcomes;
    }
    
    // Convert to ProbabilityResult format
    return currentOutcomes.map(outcome => 
      this.createProbabilityResult(outcome.value, outcome.probability)
    );
  }

  private calculateSequentialRuleProbabilities(ruleKey: string, visited: Set<string>, maxDepth: number, maxOutcomes: number, warnings: string[]): ProbabilityResult[] {
    const rule = this.ruleManager.getSequentialRuleData(ruleKey);
    if (!rule) return [];
    
    const outcomes: ProbabilityResult[] = [];
    const baseProb = 1.0 / rule.values.length;
    
    for (const value of rule.values) {
      const variables = this.variableExpander.findVariables(value);
      
      if (variables.length === 0) {
        outcomes.push(this.createProbabilityResult(value, baseProb));
      } else {
        const expandedOutcomes = this.expandVariablesWithProbabilities(
          value, variables, baseProb, visited, maxDepth, maxOutcomes, warnings
        );
        outcomes.push(...expandedOutcomes);
      }
      
      if (outcomes.length >= maxOutcomes) {
        warnings.push(`Maximum outcomes (${maxOutcomes}) reached for rule '${ruleKey}'`);
        break;
      }
    }
    
    return outcomes;
  }

  private calculateConditionalRuleProbabilities(ruleKey: string, visited: Set<string>, maxDepth: number, maxOutcomes: number, warnings: string[]): ProbabilityResult[] {
    const rule = this.ruleManager.getConditionalRuleData(ruleKey);
    if (!rule) return [];
    
    const outcomes: ProbabilityResult[] = [];
    const conditionProbability = 1.0 / rule.conditions.length; // Equal probability for each condition
    
    for (const condition of rule.conditions) {
      const values = condition.then || condition.default || [];
      const valueProbability = conditionProbability / values.length;
      
      for (const value of values) {
        const variables = this.variableExpander.findVariables(value);
        
        if (variables.length === 0) {
          outcomes.push(this.createProbabilityResult(value, valueProbability));
        } else {
          const expandedOutcomes = this.expandVariablesWithProbabilities(
            value, variables, valueProbability, visited, maxDepth, maxOutcomes, warnings
          );
          outcomes.push(...expandedOutcomes);
        }
        
        if (outcomes.length >= maxOutcomes) {
          warnings.push(`Maximum outcomes (${maxOutcomes}) reached for rule '${ruleKey}'`);
          break;
        }
      }
      
      if (outcomes.length >= maxOutcomes) break;
    }
    
    return outcomes;
  }

  /**
   * Expand variables in a value with probability calculations
   * @private
   */
  private expandVariablesWithProbabilities(
    value: string,
    variables: string[],
    baseProbability: number,
    visited: Set<string>,
    maxDepth: number,
    maxOutcomes: number,
    warnings: string[]
  ): ProbabilityResult[] {
    if (variables.length === 0) {
      return [this.createProbabilityResult(value, baseProbability)];
    }
    
    // Start with the original value and expand one variable at a time
    let currentOutcomes: Array<{ 
      value: string; 
      probability: number; 
      probabilityTree?: ProbabilityNode[] 
    }> = [{ value, probability: baseProbability }];
    
    for (const variable of variables) {
      const newOutcomes: Array<{ 
        value: string; 
        probability: number; 
        probabilityTree?: ProbabilityNode[] 
      }> = [];
      
      // Handle special cases
      if (visited.has(variable)) {
        warnings.push(`Circular reference detected for rule '${variable}'`);
        // Replace with circular marker
        for (const outcome of currentOutcomes) {
          newOutcomes.push({
            value: outcome.value.replace(new RegExp(`%${variable}%`, 'g'), `[circular:${variable}]`),
            probability: outcome.probability
          });
        }
        currentOutcomes = newOutcomes;
        continue;
      }
      
      if (visited.size >= maxDepth) {
        warnings.push(`Maximum depth (${maxDepth}) reached for rule '${variable}'`);
        // Replace with max-depth marker
        for (const outcome of currentOutcomes) {
          newOutcomes.push({
            value: outcome.value.replace(new RegExp(`%${variable}%`, 'g'), `[max-depth:${variable}]`),
            probability: outcome.probability
          });
        }
        currentOutcomes = newOutcomes;
        continue;
      }
      
      if (!this.ruleManager.hasRule(variable)) {
        warnings.push(`Missing rule '${variable}' referenced in expansion`);
        // Replace with missing marker
        for (const outcome of currentOutcomes) {
          newOutcomes.push({
            value: outcome.value.replace(new RegExp(`%${variable}%`, 'g'), `[missing:${variable}]`),
            probability: outcome.probability
          });
        }
        currentOutcomes = newOutcomes;
        continue;
      }
      
      // Get probabilities for this variable
      const ruleType = this.ruleManager.getRuleType(variable);
      if (ruleType === 'function') {
        warnings.push(`Function rule '${variable}' has dynamic outcomes - cannot calculate exact probabilities`);
        // Replace with function marker
        for (const outcome of currentOutcomes) {
          newOutcomes.push({
            value: outcome.value.replace(new RegExp(`%${variable}%`, 'g'), `[function:${variable}]`),
            probability: outcome.probability
          });
        }
        currentOutcomes = newOutcomes;
        continue;
      }
      
      // Recursively get probabilities for this variable
      const variableProbabilities = this.calculateRuleProbabilities(
        variable, new Set(visited), maxDepth, maxOutcomes, warnings
      );
      
      // Expand each current outcome with each variable possibility
      for (const currentOutcome of currentOutcomes) {
        for (const varOutcome of variableProbabilities) {
          const expandedValue = currentOutcome.value.replace(
            new RegExp(`%${variable}%`, 'g'), 
            varOutcome.outcome
          );
          const combinedProbability = currentOutcome.probability * varOutcome.probability;
          
          // Create probability tree node for this variable expansion
          const probabilityNode = {
            ruleName: variable,
            value: varOutcome.outcome,
            probability: varOutcome.probability,
            children: varOutcome.probabilityTree || []
          };
          
          newOutcomes.push({
            value: expandedValue,
            probability: combinedProbability,
            probabilityTree: [probabilityNode]
          });
          
          if (newOutcomes.length >= maxOutcomes) {
            warnings.push(`Maximum outcomes (${maxOutcomes}) reached during expansion`);
            break;
          }
        }
        if (newOutcomes.length >= maxOutcomes) break;
      }
      
      currentOutcomes = newOutcomes;
      if (currentOutcomes.length >= maxOutcomes) break;
    }
    
    // Convert to ProbabilityResult format
    return currentOutcomes.map(outcome => 
      this.createProbabilityResult(
        outcome.value, 
        outcome.probability, 
        variables,
        outcome.probabilityTree || []
      )
    );
  }
}