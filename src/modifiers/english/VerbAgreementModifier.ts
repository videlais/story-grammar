/**
 * English verb agreement modifier
 * Handles basic subject-verb agreement for common verbs
 */

import { Modifier } from '../../types.js';

export const VerbAgreementModifier: Modifier = {
  name: 'englishVerbAgreement',
  condition: (text: string) => {
    // Look for patterns that need verb agreement
    return /\b(he|she|it|\w+(?:ing|ed))\s+are\b/i.test(text) ||
           /\b(they|we|you|\w+s)\s+is\b/i.test(text);
  },
  transform: (text: string) => {
    // Fix singular subjects with "are"
    text = text.replace(/\b(he|she|it)\s+are\b/gi, '$1 is');
    
    // Fix plural subjects with "is" (basic heuristic)
    text = text.replace(/\b(they|we|you)\s+is\b/gi, '$1 are');
    
    return text;
  },
  priority: 5
};