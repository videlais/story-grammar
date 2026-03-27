/**
 * English language modifiers for the Story Grammar Parser
 * Re-exports from the modular structure for backward compatibility
 */
export { ArticleModifier as EnglishArticleModifier } from './modifiers/english/ArticleModifier.js';
export { PluralizationModifier as EnglishPluralizationModifier } from './modifiers/english/PluralizationModifier.js';
export { OrdinalModifier as EnglishOrdinalModifier } from './modifiers/english/OrdinalModifier.js';
export { CapitalizationModifier as EnglishCapitalizationModifier } from './modifiers/english/CapitalizationModifier.js';
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
export declare const EnglishPossessiveModifier: Modifier;
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
export declare const PunctuationCleanupModifier: Modifier;
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
export declare const EnglishVerbAgreementModifier: Modifier;
/**
 * Collection of all English modifiers for convenience
 */
export declare const AllEnglishModifiers: Modifier[];
/**
 * Basic English modifiers (articles, pluralization, ordinals)
 */
export declare const BasicEnglishModifiers: Modifier[];
//# sourceMappingURL=EnglishModifiers.d.ts.map