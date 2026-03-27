/**
 * English article modifier (a/an correction)
 * Converts "a" to "an" before vowel sounds
 */
export const ArticleModifier = {
    name: 'englishArticles',
    condition: (text) => {
        // Matches "a" followed by whitespace and a vowel (e.g. "a apple" -> needs "an")
        return /\ba\s+[aeiouAEIOU]/.test(text);
    },
    transform: (text) => {
        // Replace "a" with "an" before words starting with a vowel, preserving whitespace
        return text.replace(/\ba(\s+)([aeiouAEIOU][a-z]*)/gi, 'an$1$2');
    },
    priority: 10
};
//# sourceMappingURL=ArticleModifier.js.map