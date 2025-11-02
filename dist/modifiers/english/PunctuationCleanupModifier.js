/**
 * Punctuation cleanup modifier
 * Fixes common punctuation issues like double spaces and spacing around punctuation
 */
export const PunctuationCleanupModifier = {
    name: 'englishPunctuationCleanup',
    condition: (text) => {
        // Look for spacing issues around punctuation
        return /\s[,.!?;:]|\s{2,}/.test(text);
    },
    transform: (text) => {
        // Fix multiple spaces first to prevent backtracking issues
        text = text.replace(/\s{2,}/g, ' ');
        // Fix spacing before punctuation (now safe since multiple spaces are already collapsed)
        text = text.replace(/\s([,.!?;:])/g, '$1');
        // Ensure space after sentence-ending punctuation
        text = text.replace(/([.!?])([A-Z])/g, '$1 $2');
        return text;
    },
    priority: 9
};
//# sourceMappingURL=PunctuationCleanupModifier.js.map