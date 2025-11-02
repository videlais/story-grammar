/**
 * English possessive modifier
 * Adds possessive apostrophes to words ending with "POSSESSIVE"
 */

import { Modifier } from '../../types.js';

export const PossessiveModifier: Modifier = {
  name: 'englishPossessive',
  condition: (text: string) => text.includes('POSSESSIVE'),
  transform: (text: string) => {
    // Split by POSSESSIVE and process each part
    const parts = text.split('POSSESSIVE');
    if (parts.length === 1) return text; // No POSSESSIVE found
    
    let result = '';
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      
      // Find the last word without regex - scan backwards for non-word chars
      let wordStart = part.length;
      while (wordStart > 0 && /\w/.test(part[wordStart - 1])) {
        wordStart--;
      }
      
      if (wordStart < part.length) {
        const word = part.slice(wordStart);
        const beforeWord = part.slice(0, wordStart);
        const possessive = word.endsWith('s') ? word + "'" : word + "'s";
        result += beforeWord + possessive;
      } else {
        result += part;
      }
    }
    result += parts[parts.length - 1]; // Add the last part
    return result;
  },
  priority: 6
};