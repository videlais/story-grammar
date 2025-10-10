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
 */
export const EnglishPossessiveModifier: Modifier = {
  name: 'englishPossessives',
  condition: (text: string) => {
    // Look for possessive patterns: word + possessive marker
    return /\b\w+\s+possessive\b/i.test(text) || /\b\w+'s?\s+\w/.test(text);
  },
  transform: (text: string) => {
    // Handle explicit possessive marker
    text = text.replace(/\b(\w+)\s+possessive\b/gi, (match, word) => {
      return word.endsWith('s') ? word + "'" : word + "'s";
    });
    
    // Fix double possessives (word's's -> word's)
    text = text.replace(/(\w+)'s's/g, "$1's");
    
    return text;
  },
  priority: 6
};

/**
 * Punctuation cleanup modifier
 * Fixes common punctuation issues like double spaces and spacing around punctuation
 */
export const PunctuationCleanupModifier: Modifier = {
  name: 'punctuationCleanup',
  condition: (text: string) => {
    // Look for punctuation spacing issues
    return /\s{2,}/.test(text) || /\s[.!?,:;]/.test(text) || /[.!?,:;]\S/.test(text);
  },
  transform: (text: string) => {
    // Fix multiple spaces
    text = text.replace(/\s{2,}/g, ' ');
    
    // Fix space before punctuation
    text = text.replace(/\s([.!?,:;])/g, '$1');
    
    // Add space after punctuation if missing (except at end)
    text = text.replace(/([.!?,:;])([A-Za-z])/g, '$1 $2');
    
    // Trim leading/trailing whitespace
    text = text.trim();
    
    return text;
  },
  priority: 1
};

export const EnglishVerbAgreementModifier: Modifier = {
  name: 'englishVerbAgreement',
  condition: (text: string) => {
    // Look for agreement issues including has/have
    return /\b(he|she|it)\s+are\b/i.test(text) || 
           /\b(they|many|several|few|all|both)\s+is\b/i.test(text) ||
           /\b(he|she|it)\s+have\b/i.test(text) ||
           /\b(they|many|several|few|all|both)\s+has\b/i.test(text);
  },
  transform: (text: string) => {
    // Fix is/are agreement for singular subjects
    text = text.replace(/\b(he|she|it)\s+are\b/gi, '$1 is');
    
    // Fix is/are agreement for plural subjects and quantifiers
    text = text.replace(/\b(they|many|several|few|all|both)\s+is\b/gi, '$1 are');
    
    // Fix has/have agreement for singular subjects
    text = text.replace(/\b(he|she|it)\s+have\b/gi, '$1 has');
    
    // Fix has/have agreement for plural subjects and quantifiers
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