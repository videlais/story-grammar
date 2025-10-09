/**
 * English article modifier (a/an correction)
 * Converts "a" to "an" before vowel sounds
 */

import { Modifier } from '../../types.js';

export const ArticleModifier: Modifier = {
  name: 'englishArticles',
  condition: (text: string) => {
    return /\ba\s+[aeiouAEIOU]/.test(text);
  },
  transform: (text: string) => {
    // More precise regex to handle vowel sounds at word boundaries
    return text.replace(/\ba(\s+)([aeiouAEIOU][a-z]*)/gi, 'an$1$2');
  },
  priority: 10
};