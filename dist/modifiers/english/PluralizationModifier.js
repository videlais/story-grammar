/**
 * English pluralization modifier
 * Handles comprehensive pluralization patterns including irregular forms
 */
export const PluralizationModifier = {
    name: 'englishPluralization',
    condition: (text) => {
        // Match plural quantifiers followed by a word:
        //   - Quantifier adjectives: "many", "several", "multiple", etc.
        //   - Digits > 1: matches numbers like 2, 30, 102 (but not 1, 11, 21…)
        //   - Number words: "two" through "twenty"
        //   - Zero/no: these also take the plural form in English
        return /\b(many|several|multiple|some|few|all|both|various|numerous|[2-9]\d*|\d*[02-9])\s+[a-zA-Z]+/i.test(text) ||
            /\b(two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)\s+[a-zA-Z]+/i.test(text) ||
            /\b(zero|no)\s+[a-zA-Z]+/i.test(text);
    },
    transform: (text) => {
        return text.replace(/\b(many|several|multiple|some|few|all|both|various|numerous|zero|no|[2-9]\d*|\d*[02-9]|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)\s+([a-zA-Z]+)\b/gi, (match, quantifier, noun) => {
            const pluralNoun = pluralize(noun);
            return `${quantifier} ${pluralNoun}`;
        });
    },
    priority: 4
};
/**
 * Convert a singular noun to its plural form
 * @param noun - The singular noun to pluralize
 * @returns The plural form of the noun
 */
function pluralize(noun) {
    const lowerNoun = noun.toLowerCase();
    // Irregular plurals that don't follow standard English rules.
    // Grouped loosely by origin: Latin/Greek forms, Old English holdovers,
    // foreign loanwords, and zero-change (uncountable/collective) nouns.
    const irregularPlurals = {
        'addendum': 'addenda',
        'aircraft': 'aircraft',
        'alumna': 'alumnae',
        'alumnus': 'alumni',
        'analysis': 'analyses',
        'antenna': 'antennae',
        'antithesis': 'antitheses',
        'apex': 'apices',
        'appendix': 'appendices',
        'axis': 'axes',
        'bacillus': 'bacilli',
        'bacterium': 'bacteria',
        'basis': 'bases',
        'beau': 'beaux',
        'bison': 'bison',
        'bureau': 'bureaux',
        'cactus': 'cacti',
        'château': 'châteaux',
        'child': 'children',
        'codex': 'codices',
        'concerto': 'concerti',
        'corpus': 'corpora',
        'crisis': 'crises',
        'criterion': 'criteria',
        'curriculum': 'curricula',
        'datum': 'data',
        'deer': 'deer',
        'diagnosis': 'diagnoses',
        'die': 'dice',
        'dwarf': 'dwarves',
        'ellipsis': 'ellipses',
        'erratum': 'errata',
        'fez': 'fezzes',
        'fish': 'fish',
        'focus': 'foci',
        'foot': 'feet',
        'formula': 'formulae',
        'fungus': 'fungi',
        'genus': 'genera',
        'goose': 'geese',
        'graffito': 'graffiti',
        'grouse': 'grouse',
        'half': 'halves',
        'hoof': 'hooves',
        'hypothesis': 'hypotheses',
        'index': 'indices',
        'larva': 'larvae',
        'libretto': 'libretti',
        'loaf': 'loaves',
        'locus': 'loci',
        'louse': 'lice',
        'man': 'men',
        'matrix': 'matrices',
        'medium': 'media',
        'memorandum': 'memoranda',
        'minutia': 'minutiae',
        'moose': 'moose',
        'mouse': 'mice',
        'nebula': 'nebulae',
        'nucleus': 'nuclei',
        'oasis': 'oases',
        'offspring': 'offspring',
        'opus': 'opera',
        'ovum': 'ova',
        'ox': 'oxen',
        'parenthesis': 'parentheses',
        'person': 'people',
        'phenomenon': 'phenomena',
        'phylum': 'phyla',
        'quiz': 'quizzes',
        'radius': 'radii',
        'referendum': 'referenda',
        'salmon': 'salmon',
        'scarf': 'scarves',
        'self': 'selves',
        'series': 'series',
        'sheep': 'sheep',
        'shrimp': 'shrimp',
        'species': 'species',
        'stimulus': 'stimuli',
        'stratum': 'strata',
        'swine': 'swine',
        'syllabus': 'syllabi',
        'symposium': 'symposia',
        'synopsis': 'synopses',
        'tableau': 'tableaux',
        'thesis': 'theses',
        'thief': 'thieves',
        'tooth': 'teeth',
        'trout': 'trout',
        'tuna': 'tuna',
        'vertebra': 'vertebrae',
        'vertex': 'vertices',
        'vita': 'vitae',
        'vortex': 'vortices',
        'wharf': 'wharves',
        'wife': 'wives',
        'wolf': 'wolves',
        'woman': 'women'
    };
    // Check for irregular plurals first
    if (irregularPlurals[lowerNoun]) {
        const irregularPlural = irregularPlurals[lowerNoun];
        // Preserve original case pattern
        return preserveCase(noun, irregularPlural);
    }
    // Apply regular pluralization rules in order of specificity.
    // Rules are ordered so more specific patterns are tested first,
    // falling through to the general "-s" default.
    // 1. Sibilant endings (-s, -x, -z, -sh, -ch): English requires "-es" to
    //    keep the consonant cluster pronounceable (e.g. "bus" -> "buses").
    if (/[sxz]$/.test(lowerNoun) || /[sc]h$/.test(lowerNoun)) {
        return noun + 'es';
    }
    // 2. Consonant + y: the "y" changes to "i" before "-es"
    //    (e.g. "city" -> "cities"), because English avoids "ys" after consonants.
    if (/[bcdfghjklmnpqrstvwxz]y$/i.test(lowerNoun)) {
        return noun.slice(0, -1) + 'ies';
    }
    // 3. Vowel + y: the "y" is preserved and just "-s" is added
    //    (e.g. "day" -> "days"), because the preceding vowel keeps it regular.
    if (/[aeiou]y$/i.test(lowerNoun)) {
        return noun + 's';
    }
    // 4. Words ending in -f or -fe: typically change to "-ves"
    //    (e.g. "knife" -> "knives"). The /fe?$/ pattern matches both endings.
    if (/fe?$/i.test(lowerNoun)) {
        // These are established exceptions that simply add "-s" because they
        // entered English from different origins or hardened into fixed forms.
        const fExceptions = ['belief', 'chief', 'cliff', 'proof', 'roof', 'safe', 'chef', 'handkerchief'];
        if (fExceptions.includes(lowerNoun)) {
            return noun + 's';
        }
        return noun.replace(/fe?$/i, 'ves');
    }
    // 5. Consonant + o: typically adds "-es" (e.g. "tomato" -> "tomatoes").
    if (/[bcdfghjklmnpqrstvwxz]o$/i.test(lowerNoun)) {
        // These loanwords and modern coinages have kept the simpler "-s" plural,
        // often because they are abbreviations or borrowed from Italian/Spanish.
        const oExceptions = [
            'photo', 'piano', 'halo', 'disco', 'studio', 'radio', 'video',
            'auto', 'memo', 'pro', 'casino', 'patio', 'portfolio', 'logo',
            'commando', 'solo', 'soprano', 'alto', 'kimono'
        ];
        if (oExceptions.includes(lowerNoun)) {
            return noun + 's';
        }
        return noun + 'es';
    }
    // 6. Vowel + o: just add "-s" (e.g. "zoo" -> "zoos").
    if (/[aeiou]o$/i.test(lowerNoun)) {
        return noun + 's';
    }
    // 7. Default: add "-s" — the standard English plural ending.
    return noun + 's';
}
/**
 * Preserve the case pattern of the original word in the plural form
 * @param original - The original word with its case pattern
 * @param plural - The lowercase plural form
 * @returns The plural with preserved case pattern
 */
function preserveCase(original, plural) {
    // If original is all uppercase, make plural all uppercase
    if (original === original.toUpperCase()) {
        return plural.toUpperCase();
    }
    // If original starts with uppercase, capitalize the plural
    if (original[0] === original[0].toUpperCase()) {
        return plural.charAt(0).toUpperCase() + plural.slice(1);
    }
    // Otherwise, return lowercase plural
    return plural;
}
//# sourceMappingURL=PluralizationModifier.js.map