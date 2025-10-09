/**
 * Story Grammar - A combinatorial grammar for narrative-based projects
 */

// Core Parser and all types
export { Parser } from './Parser.js';

// Export all types and interfaces
export * from './types.js';

// New Modifiers namespace
export * as Modifiers from './modifiers/index.js';

// English modifiers (backward compatibility)
export {
  EnglishArticleModifier,
  EnglishPluralizationModifier,
  EnglishOrdinalModifier,
  EnglishCapitalizationModifier,
  EnglishPossessiveModifier,
  EnglishVerbAgreementModifier,
  PunctuationCleanupModifier,
  AllEnglishModifiers,
  BasicEnglishModifiers
} from './EnglishModifiers.js';

// Re-export for backward compatibility
export { Parser as StoryGrammar } from './Parser.js';