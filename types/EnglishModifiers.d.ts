/**
 * English language modifiers for the Story Grammar Parser
 */
import { Modifier } from './types.js';
/**
 * English article modifier (a/an correction)
 * Converts "a" to "an" before vowel sounds
 */
export declare const EnglishArticleModifier: Modifier;
/**
 * English pluralization modifier
 * Handles comprehensive pluralization patterns including irregular forms
 */
export declare const EnglishPluralizationModifier: Modifier;
/**
 * English ordinal modifier
 * Converts cardinal numbers to ordinal format (1 -> 1st, 2 -> 2nd, etc.)
 */
export declare const EnglishOrdinalModifier: Modifier;
/**
 * English capitalization modifier
 * Capitalizes words after sentence-ending punctuation
 */
export declare const EnglishCapitalizationModifier: Modifier;
/**
 * English possessive modifier
 * Handles English possessive forms ('s and s')
 */
export declare const EnglishPossessiveModifier: Modifier;
/**
 * English verb agreement modifier
 * Handles basic subject-verb agreement for common verbs
 */
export declare const EnglishVerbAgreementModifier: Modifier;
/**
 * Punctuation cleanup modifier
 * Fixes common punctuation issues like double spaces and spacing around punctuation
 */
export declare const PunctuationCleanupModifier: Modifier;
/**
 * Collection of all English modifiers for convenience
 */
export declare const AllEnglishModifiers: Modifier[];
/**
 * Basic English modifiers (articles, pluralization, ordinals)
 */
export declare const BasicEnglishModifiers: Modifier[];
//# sourceMappingURL=EnglishModifiers.d.ts.map