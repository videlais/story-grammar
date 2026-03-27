/**
 * English capitalization modifier
 * Capitalizes words after sentence-ending punctuation
 */
export const CapitalizationModifier = {
    name: 'englishCapitalization',
    condition: (text) => {
        // Matches sentence-ending punctuation (.!?) followed by whitespace and a lowercase letter
        return /[.!?]\s+[a-z]/.test(text);
    },
    transform: (text) => {
        // Capture the punctuation+whitespace and the following lowercase letter,
        // then uppercase that letter to start the new sentence
        return text.replace(/([.!?]\s+)([a-z])/g, (match, punctuation, letter) => {
            return punctuation + letter.toUpperCase();
        });
    },
    priority: 7
};
//# sourceMappingURL=CapitalizationModifier.js.map