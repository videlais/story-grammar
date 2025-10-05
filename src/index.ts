/**
 * Story Grammar - A combinatorial grammar for narrative-based projects
 */

export { 
  Parser, 
  type Grammar, 
  type Modifier, 
  type ModifierFunction, 
  type ModifierContext 
} from './Parser.js';

// Re-export for backward compatibility
export { Parser as StoryGrammar } from './Parser.js';