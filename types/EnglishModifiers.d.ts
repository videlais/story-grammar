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
 */
export declare const EnglishPossessiveModifier: Modifier;
/**
 * Punctuation cleanup modifier
 * Fixes common punctuation issues like double spaces and spacing around punctuation
 */
export declare const PunctuationCleanupModifier: Modifier;
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