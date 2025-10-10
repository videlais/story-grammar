/**
 * Index file for the refactored modular architecture
 * This allows importing individual modules for advanced use cases
 */

// Core modules
export { SeededRandom } from './utils/SeededRandom.js';
export { RuleManager } from './rules/RuleManager.js';
export { VariableExpander } from './core/VariableExpander.js';
export { ComplexityAnalyzer } from './analysis/ComplexityAnalyzer.js';
export { ProbabilityAnalyzer } from './analysis/ProbabilityAnalyzer.js';
export { GrammarValidator } from './validation/GrammarValidator.js';
export { ErrorHandler } from './core/ErrorHandler.js';

// Rule managers
export { 
  StaticRuleManager, 
  FunctionRuleManager, 
  WeightedRuleManager 
} from './rules/BaseRuleManager.js';
export { 
  ConditionalRuleManager, 
  SequentialRuleManager, 
  RangeRuleManager, 
  TemplateRuleManager 
} from './rules/AdvancedRuleManagers.js';

// The refactored parser is now the main Parser in ParserCore.ts
// This export is for backward compatibility if needed
export { Parser as RefactoredParser } from './ParserCore.js';