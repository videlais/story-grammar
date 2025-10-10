/**
 * Punctuation cleanup modifier
 * Fixes common punctuation issues like double spaces and spacing around punctuation
 */
export const PunctuationCleanupModifier = {
    name: 'englishPunctuationCleanup',
    condition: (text) => {
        // Look for spacing issues around punctuation
        return /\s+[,.!?;:]|\s{2,}/.test(text);
    },
    transform: (text) => {
        // Fix spacing before punctuation
        text = text.replace(/\s+([,.!?;:])/g, '$1');
        // Fix multiple spaces
        text = text.replace(/\s{2,}/g, ' ');
        // Ensure space after sentence-ending punctuation
        text = text.replace(/([.!?])([A-Z])/g, '$1 $2');
        return text;
    },
    priority: 9
};
//# sourceMappingURL=PunctuationCleanupModifier.js.map