/**
 * English article modifier (a/an correction)
 * Converts "a" to "an" before vowel sounds
 */
export const ArticleModifier = {
    name: 'englishArticles',
    condition: (text) => {
        return /\ba\s+[aeiouAEIOU]/.test(text);
    },
    transform: (text) => {
        // More precise regex to handle vowel sounds at word boundaries
        return text.replace(/\ba(\s+)([aeiouAEIOU][a-z]*)/gi, 'an$1$2');
    },
    priority: 10
};
//# sourceMappingURL=ArticleModifier.js.map