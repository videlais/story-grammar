/**
 * English possessive modifier
 * Adds possessive apostrophes to words ending with "POSSESSIVE"
 */
export const PossessiveModifier = {
    name: 'englishPossessive',
    condition: (text) => text.includes('POSSESSIVE'),
    transform: (text) => {
        // Split by POSSESSIVE and process each part
        const parts = text.split('POSSESSIVE');
        if (parts.length === 1)
            return text; // No POSSESSIVE found
        let result = '';
        for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];
            // Walk backwards from the end of this segment to find where the
            // last word starts (i.e. the noun that should become possessive).
            // We avoid regex here for clarity: any \w char is part of the word.
            let wordStart = part.length;
            while (wordStart > 0 && /\w/.test(part[wordStart - 1])) {
                wordStart--;
            }
            if (wordStart < part.length) {
                const word = part.slice(wordStart);
                const beforeWord = part.slice(0, wordStart);
                // English convention: words already ending in "s" get just an
                // apostrophe ("dogs'"), all others get "'s" ("dog's").
                const possessive = word.endsWith('s') ? word + "'" : word + "'s";
                result += beforeWord + possessive;
            }
            else {
                result += part;
            }
        }
        result += parts[parts.length - 1]; // Add the last part
        return result;
    },
    priority: 6
};
//# sourceMappingURL=PossessiveModifier.js.map