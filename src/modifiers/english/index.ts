/**
 * English Modifiers Namespace
 * Collection of text modifiers for English language processing
 */

export { ArticleModifier } from './ArticleModifier.js';
export { PluralizationModifier } from './PluralizationModifier.js';
export { OrdinalModifier } from './OrdinalModifier.js';
export { CapitalizationModifier } from './CapitalizationModifier.js';
export { PossessiveModifier } from './PossessiveModifier.js';
export { VerbAgreementModifier } from './VerbAgreementModifier.js';
export { PunctuationCleanupModifier } from './PunctuationCleanupModifier.js';

// Convenience export of all English modifiers as an array
import { ArticleModifier } from './ArticleModifier.js';
import { PluralizationModifier } from './PluralizationModifier.js';
import { OrdinalModifier } from './OrdinalModifier.js';
import { CapitalizationModifier } from './CapitalizationModifier.js';
import { PossessiveModifier } from './PossessiveModifier.js';
import { VerbAgreementModifier } from './VerbAgreementModifier.js';
import { PunctuationCleanupModifier } from './PunctuationCleanupModifier.js';

export const AllEnglishModifiers = [
  ArticleModifier,
  PluralizationModifier,
  OrdinalModifier,
  CapitalizationModifier,
  PossessiveModifier,
  VerbAgreementModifier,
  PunctuationCleanupModifier
];