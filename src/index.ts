/**
 * Story Grammar - A combinatorial grammar for narrative-based projects
 */

// Core Parser and all types
export { Parser } from './Parser.js';

// Export all types and interfaces
export * from './types.js';

// English modifiers
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