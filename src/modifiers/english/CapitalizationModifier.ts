/**
 * English capitalization modifier
 * Capitalizes words after sentence-ending punctuation
 */

import { Modifier } from '../../types.js';

export const CapitalizationModifier: Modifier = {
  name: 'englishCapitalization',
  condition: (text: string) => {
    // Look for lowercase letters after sentence endings
    return /[.!?]\s+[a-z]/.test(text);
  },
  transform: (text: string) => {
    // Capitalize first letter of sentences
    return text.replace(/([.!?]\s+)([a-z])/g, (match, punctuation, letter) => {
      return punctuation + letter.toUpperCase();
    });
  },
  priority: 7
};