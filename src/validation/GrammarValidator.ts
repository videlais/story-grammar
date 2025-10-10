/**
 * Grammar validation functionality
 */
import { ValidationResult } from '../types.js';
import { RuleManager } from '../rules/RuleManager.js';
import { VariableExpander } from '../core/VariableExpander.js';

export class GrammarValidator {
  constructor(
    private ruleManager: RuleManager,
    private variableExpander: VariableExpander
  ) {}

  /**
   * Perform comprehensive grammar validation to detect potential issues
   * 
   * This method analyzes the entire grammar structure to identify problems that could
   * cause parsing failures or unexpected behavior. It checks for missing references,
   * circular dependencies, empty rules, and provides warnings for potential issues.
   * 
   * @returns Comprehensive validation results object
   */
  public validate(): ValidationResult {
    const missingRules: string[] = [];
    const circularReferences: string[] = [];
    const emptyRules: string[] = [];
    const unreachableRules: string[] = [];
    const warnings: string[] = [];

    const allRules = this.ruleManager.getAllKeys();
    const referencedRules = new Set<string>();

    // Check each rule for issues
    for (const ruleKey of allRules) {
      // Check if rule is empty
      if (this.isRuleEmpty(ruleKey)) {
        emptyRules.push(ruleKey);
      }

      // Find all variables referenced by this rule and check if they exist
      const referencedVariables = this.findRuleReferences(ruleKey);
      for (const variable of referencedVariables) {
        referencedRules.add(variable);
        if (!this.ruleManager.hasRule(variable)) {
          if (!missingRules.includes(variable)) {
            missingRules.push(variable);
          }
        }
      }
    }

    // Find unreachable rules (rules that exist but are never referenced)
    for (const ruleKey of allRules) {
      if (!referencedRules.has(ruleKey) && !this.isRootRule(ruleKey)) {
        unreachableRules.push(ruleKey);
      }
    }

    // Check for circular references
    const circularRefs = this.variableExpander.findCircularReferences();
    circularReferences.push(...circularRefs);

    // Generate warnings
    if (emptyRules.length > 0) {
      warnings.push(`Found ${emptyRules.length} empty rules that may cause issues`);
    }
    if (unreachableRules.length > 5) {
      warnings.push(`Found ${unreachableRules.length} unreachable rules - consider cleanup`);
    }
    if (allRules.length > 100) {
      warnings.push(`Large grammar with ${allRules.length} rules - consider organizing into groups`);
    }

    const isValid = missingRules.length === 0 && 
                   circularReferences.length === 0 && 
                   emptyRules.length === 0;

    return {
      isValid,
      missingRules,
      circularReferences,
      emptyRules,
      unreachableRules,
      warnings
    };
  }

  /**
   * Check if a rule is empty (has no values or only empty values)
   * @private
   */
  private isRuleEmpty(ruleKey: string): boolean {
    const ruleType = this.ruleManager.getRuleType(ruleKey);
    
    switch (ruleType) {
      case 'static': {
        const staticRule = this.ruleManager.getGrammar()[ruleKey];
        return !staticRule || staticRule.length === 0 || 
               staticRule.every(value => !value || value.trim() === '');
      }
      
      case 'function':
        // Function rules can't be easily checked for emptiness
        return false;
        
      case 'weighted':
      case 'conditional':
      case 'sequential':
      case 'template':
      case 'range':
        // These rule types are handled by their respective managers
        // and should have validation in place during creation
        return false;
        
      default:
        return true;
    }
  }

  /**
   * Find all variables referenced by a rule
   * @private
   */
  private findRuleReferences(ruleKey: string): string[] {
    const references: string[] = [];
    const ruleType = this.ruleManager.getRuleType(ruleKey);
    
    switch (ruleType) {
      case 'static': {
        const staticRule = this.ruleManager.getGrammar()[ruleKey];
        if (staticRule) {
          for (const value of staticRule) {
            const variables = this.variableExpander.findVariables(value);
            references.push(...variables.filter(v => !v.startsWith('@')));
          }
        }
        break;
      }
        
      case 'function':
        // Function rules are dynamic, can't analyze statically
        break;
        
      // Other rule types would need specific analysis
      // This is a simplified implementation
    }
    
    // Remove duplicates
    return Array.from(new Set(references));
  }

  /**
   * Check if a rule is likely a root rule (commonly used entry points)
   * @private
   */
  private isRootRule(ruleKey: string): boolean {
    const rootPatterns = [
      /^(main|start|root|entry|begin)$/i,
      /^(sentence|story|text|output)$/i,
      /^(template|pattern|format)$/i
    ];
    
    return rootPatterns.some(pattern => pattern.test(ruleKey));
  }

  /**
   * Validate a specific text string for missing variables
   * @param text - Text to validate
   * @returns Array of missing variable names
   */
  public validateText(text: string): string[] {
    return this.variableExpander.findMissingVariables(text);
  }

  /**
   * Quick validation check - returns true if grammar is valid
   * @returns True if grammar passes basic validation
   */
  public isValid(): boolean {
    const result = this.validate();
    return result.isValid;
  }

  /**
   * Get validation summary as a readable string
   * @returns Human-readable validation summary
   */
  public getValidationSummary(): string {
    const result = this.validate();
    const lines: string[] = [];
    
    if (result.isValid) {
      lines.push('✅ Grammar validation passed');
    } else {
      lines.push('❌ Grammar validation failed');
    }
    
    if (result.missingRules.length > 0) {
      lines.push(`Missing rules: ${result.missingRules.join(', ')}`);
    }
    
    if (result.circularReferences.length > 0) {
      lines.push(`Circular references: ${result.circularReferences.join(', ')}`);
    }
    
    if (result.emptyRules.length > 0) {
      lines.push(`Empty rules: ${result.emptyRules.join(', ')}`);
    }
    
    if (result.unreachableRules.length > 0) {
      lines.push(`Unreachable rules: ${result.unreachableRules.slice(0, 5).join(', ')}${result.unreachableRules.length > 5 ? '...' : ''}`);
    }
    
    if (result.warnings.length > 0) {
      lines.push('Warnings:');
      for (const warning of result.warnings) {
        lines.push(`  - ${warning}`);
      }
    }
    
    return lines.join('\n');
  }
}