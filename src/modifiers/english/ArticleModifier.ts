/**
 * English article modifier (a/an correction)
 * Converts "a" to "an" before vowel sounds
 */

import { Modifier } from '../../types.js';

export const ArticleModifier: Modifier = {
  name: 'englishArticles',
  condition: (text: string) => {
    // Matches "a" followed by whitespace and a vowel (e.g. "a apple" -> needs "an")
    return /\ba\s+[aeiouAEIOU]/.test(text);
  },
  transform: (text: string) => {
    // Replace "a" with "an" before words starting with a vowel, preserving whitespace
    return text.replace(/\ba(\s+)([aeiouAEIOU][a-z]*)/gi, 'an$1$2');
  },
  priority: 10
};