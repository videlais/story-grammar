/**
 * English capitalization modifier
 * Capitalizes words after sentence-ending punctuation
 */

import { Modifier } from '../../types.js';

export const CapitalizationModifier: Modifier = {
  name: 'englishCapitalization',
  condition: (text: string) => {
    // Matches sentence-ending punctuation (.!?) followed by whitespace and a lowercase letter
    return /[.!?]\s+[a-z]/.test(text);
  },
  transform: (text: string) => {
    // Capture the punctuation+whitespace and the following lowercase letter,
    // then uppercase that letter to start the new sentence
    return text.replace(/([.!?]\s+)([a-z])/g, (match, punctuation, letter) => {
      return punctuation + letter.toUpperCase();
    });
  },
  priority: 7
};