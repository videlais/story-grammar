/**
 * English capitalization modifier
 * Capitalizes words after sentence-ending punctuation
 */
export const CapitalizationModifier = {
    name: 'englishCapitalization',
    condition: (text) => {
        // Look for lowercase letters after sentence endings
        return /[.!?]\s+[a-z]/.test(text);
    },
    transform: (text) => {
        // Capitalize first letter of sentences
        return text.replace(/([.!?]\s+)([a-z])/g, (match, punctuation, letter) => {
            return punctuation + letter.toUpperCase();
        });
    },
    priority: 7
};
//# sourceMappingURL=CapitalizationModifier.js.map