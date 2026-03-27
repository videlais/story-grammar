/**
 * English language modifiers for the Story Grammar Parser
 * Re-exports from the modular structure for backward compatibility
 */

// Re-export individual modifiers from the modular structure
export { ArticleModifier as EnglishArticleModifier } from './modifiers/english/ArticleModifier.js';
export { PluralizationModifier as EnglishPluralizationModifier } from './modifiers/english/PluralizationModifier.js';
export { OrdinalModifier as EnglishOrdinalModifier } from './modifiers/english/OrdinalModifier.js';
export { CapitalizationModifier as EnglishCapitalizationModifier } from './modifiers/english/CapitalizationModifier.js';

// Comprehensive modifiers with enhanced functionality
import { Modifier } from './types.js';

/**
 * English possessive modifier
 * Handles English possessive forms ('s and s')
 *
 * @property {string} name - Modifier identifier: 'englishPossessives'
 * @property {function(string): boolean} condition - Returns true when text contains
 *   a word followed by the literal "possessive" marker, or an existing apostrophe-s pattern.
 * @property {function(string): string} transform - Replaces "word possessive" with the
 *   correct possessive form ("word's" or "words'") and cleans up double possessives.
 * @property {number} priority - Execution priority (6)
 */
export const EnglishPossessiveModifier: Modifier = {
  name: 'englishPossessives',
  condition: (text: string) => {
    // Matches "word possessive" markers or existing apostrophe-s patterns
    return /\b\w+\s+possessive\b/i.test(text) || /\b\w+'s?\s+\w/.test(text);
  },
  transform: (text: string) => {
    // Replace "word possessive" with "word's" or "words'" depending on trailing "s"
    text = text.replace(/\b(\w+)\s+possessive\b/gi, (match, word) => {
      return word.endsWith('s') ? word + "'" : word + "'s";
    });
    
    // Clean up accidental double possessives (e.g. "word's's" -> "word's")
    text = text.replace(/(\w+)'s's/g, "$1's");
    
    return text;
  },
  priority: 6
};

/**
 * Punctuation cleanup modifier
 * Fixes common punctuation issues like double spaces and spacing around punctuation
 *
 * @property {string} name - Modifier identifier: 'punctuationCleanup'
 * @property {function(string): boolean} condition - Returns true when text has
 *   consecutive whitespace, whitespace before punctuation, or missing space after punctuation.
 * @property {function(string): string} transform - Normalizes whitespace and punctuation spacing.
 * @property {number} priority - Execution priority (1 — runs last to clean up after other modifiers)
 */
export const PunctuationCleanupModifier: Modifier = {
  name: 'punctuationCleanup',
  condition: (text: string) => {
    // Detect: multiple consecutive spaces, space before punctuation, or punctuation
    // immediately followed by a non-space character
    return /\s{2,}/.test(text) || /\s[.!?,:;]/.test(text) || /[.!?,:;]\S/.test(text);
  },
  transform: (text: string) => {
    // Collapse runs of whitespace into a single space
    text = text.replace(/\s{2,}/g, ' ');
    
    // Remove errant space before sentence-ending or delimiting punctuation
    text = text.replace(/\s([.!?,:;])/g, '$1');
    
    // Insert a space after punctuation when it's directly followed by a letter
    text = text.replace(/([.!?,:;])([A-Za-z])/g, '$1 $2');
    
    // Trim leading/trailing whitespace
    text = text.trim();
    
    return text;
  },
  priority: 1
};

/**
 * English verb agreement modifier
 * Corrects subject-verb agreement for is/are and has/have
 *
 * @property {string} name - Modifier identifier: 'englishVerbAgreement'
 * @property {function(string): boolean} condition - Returns true when singular subjects
 *   are paired with plural verbs or vice versa.
 * @property {function(string): string} transform - Swaps the verb to match the subject's number.
 * @property {number} priority - Execution priority (5)
 */
export const EnglishVerbAgreementModifier: Modifier = {
  name: 'englishVerbAgreement',
  condition: (text: string) => {
    // Detect singular subjects with plural verbs, or plural subjects with singular verbs
    return /\b(he|she|it)\s+are\b/i.test(text) || 
           /\b(they|many|several|few|all|both)\s+is\b/i.test(text) ||
           /\b(he|she|it)\s+have\b/i.test(text) ||
           /\b(they|many|several|few|all|both)\s+has\b/i.test(text);
  },
  transform: (text: string) => {
    // Singular subjects (he/she/it) require "is" not "are"
    text = text.replace(/\b(he|she|it)\s+are\b/gi, '$1 is');
    
    // Plural subjects and quantifiers require "are" not "is"
    text = text.replace(/\b(they|many|several|few|all|both)\s+is\b/gi, '$1 are');
    
    // Singular subjects (he/she/it) require "has" not "have"
    text = text.replace(/\b(he|she|it)\s+have\b/gi, '$1 has');
    
    // Plural subjects and quantifiers require "have" not "has"
    text = text.replace(/\b(they|many|several|few|all|both)\s+has\b/gi, '$1 have');
    
    return text;
  },
  priority: 5
};

// Import the modifiers to create convenience arrays
import { ArticleModifier } from './modifiers/english/ArticleModifier.js';
import { PluralizationModifier } from './modifiers/english/PluralizationModifier.js';
import { OrdinalModifier } from './modifiers/english/OrdinalModifier.js';
import { CapitalizationModifier } from './modifiers/english/CapitalizationModifier.js';

/**
 * Collection of all English modifiers for convenience
 */
export const AllEnglishModifiers = [
  ArticleModifier,
  PluralizationModifier,
  OrdinalModifier,
  CapitalizationModifier,
  EnglishPossessiveModifier,
  EnglishVerbAgreementModifier,
  PunctuationCleanupModifier
];

/**
 * Basic English modifiers (articles, pluralization, ordinals)
 */
export const BasicEnglishModifiers = [
  ArticleModifier,
  PluralizationModifier,
  OrdinalModifier
];