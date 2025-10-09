/**
 * Type definitions and interfaces for the Story Grammar Parser
 */

export interface Grammar {
  [key: string]: string[];
}

export interface ModifierFunction {
  (text: string, context?: ModifierContext): string;
}

export interface ModifierContext {
  ruleName?: string;
  originalText?: string;
  variables?: { [key: string]: string };
}

export interface Modifier {
  name: string;
  condition: (text: string, context?: ModifierContext) => boolean;
  transform: ModifierFunction;
  priority?: number;
}

export interface FunctionRule {
  (): string[];
}

export interface WeightedRule {
  values: string[];
  weights: number[];
  cumulativeWeights: number[];
}

export interface ConditionalRule {
  conditions: Array<{
    if?: (context: { [key: string]: string }) => boolean;
    then: string[];
    default?: never;
  } | {
    if?: never;
    then?: never;
    default: string[];
  }>;
}

export interface SequentialRule {
  values: string[];
  index: number;
  cycle: boolean;
}

export interface RangeRule {
  min: number;
  max: number;
  step?: number;
  type: 'integer' | 'float';
}

export interface TemplateRule {
  template: string;
  variables: { [key: string]: string[] };
}

// Parser configuration and result types
export interface ParseOptions {
  preserveContext?: boolean;
  validateFirst?: boolean;
  maxAttempts?: number;
}

export interface ParseResult {
  success: boolean;
  result?: string;
  error?: string;
  attempts?: number;
  validation?: ValidationResult;
}

export interface ValidationResult {
  isValid: boolean;
  missingRules: string[];
  circularReferences: string[];
  emptyRules: string[];
  unreachableRules: string[];
  warnings: string[];
}

export interface ParseTiming {
  totalMs: number;
  expansionMs: number;
  modifierMs: number;
}

export interface ParseTimingResult {
  result: string;
  timing: ParseTiming;
}

export interface ParserStats {
  totalRules: number;
  rulesByType: { [type: string]: number };
  totalModifiers: number;
  maxDepth: number;
  hasRandomSeed: boolean;
}

export interface ParserConfig {
  grammar: Grammar;
  modifiers: string[];
  settings: {
    maxDepth: number;
    randomSeed: number | null;
  };
}

export interface OptimizationReport {
  warnings: string[];
  suggestions: string[];
  optimized: boolean;
}

export interface RuleAnalysis {
  totalComplexity: number;
  averageDepth: number;
  mostComplex: string[];
  suggestions: string[];
  ruleDetails?: {
    name: string;
    type: string;
    complexity: number;
    variables: string[];
    depth: number;
  };
}

export interface ErrorContext {
  text?: string;
  ruleName?: string;
}

export interface ComplexityResult {
  ruleName: string;
  complexity: number;
  ruleType: string;
  isFinite: boolean;
  variables: string[];
  depth: number;
  warnings: string[];
}

export interface TotalComplexityResult {
  totalComplexity: number;
  isFinite: boolean;
  ruleCount: number;
  complexityByRule: ComplexityResult[];
  averageComplexity: number;
  mostComplexRules: ComplexityResult[];
  warnings: string[];
  circularReferences: string[];
}