/**
 * English verb agreement modifier
 * Handles subject-verb agreement for "is/are" constructions
 */
export const VerbAgreementModifier = {
    name: 'englishVerbAgreement',
    condition: (text) => {
        // Look for patterns that need verb agreement
        return /\b(he|she|it|\w+(?:ing|ed))\s+are\b/i.test(text) ||
            /\b(they|we|you|\w+s)\s+is\b/i.test(text);
    },
    transform: (text) => {
        // Fix singular subjects with "are"
        text = text.replace(/\b(he|she|it)\s+are\b/gi, '$1 is');
        // Fix plural subjects with "is" (basic heuristic)
        text = text.replace(/\b(they|we|you)\s+is\b/gi, '$1 are');
        return text;
    },
    priority: 5
};
//# sourceMappingURL=VerbAgreementModifier.js.map