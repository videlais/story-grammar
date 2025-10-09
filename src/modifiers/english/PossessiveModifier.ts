/**
 * English possessive modifier
 * Adds possessive apostrophes to words ending with "POSSESSIVE"
 */

import { Modifier } from '../../types.js';

export const PossessiveModifier: Modifier = {
  name: 'englishPossessive',
  condition: (text: string) => text.includes('POSSESSIVE'),
  transform: (text: string) => {
    return text.replace(/(\w+)POSSESSIVE/g, (match, word) => {
      if (word.endsWith('s')) {
        return word + "'";
      } else {
        return word + "'s";
      }
    });
  },
  priority: 6
};