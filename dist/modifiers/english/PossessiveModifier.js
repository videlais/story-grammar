/**
 * English possessive modifier
 * Adds possessive apostrophes to words ending with "POSSESSIVE"
 */
export const PossessiveModifier = {
    name: 'englishPossessive',
    condition: (text) => text.includes('POSSESSIVE'),
    transform: (text) => {
        return text.replace(/(\w+)POSSESSIVE/g, (match, word) => {
            if (word.endsWith('s')) {
                return word + "'";
            }
            else {
                return word + "'s";
            }
        });
    },
    priority: 6
};
//# sourceMappingURL=PossessiveModifier.js.map