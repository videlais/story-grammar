/**
 * English language modifiers for the Story Grammar Parser
 */

import { Modifier } from './Parser';

/**
 * English article modifier (a/an correction)
 * Converts "a" to "an" before vowel sounds
 */
export const EnglishArticleModifier: Modifier = {
  name: 'englishArticles',
  condition: (text: string) => {
    return /\ba\s+[aeiouAEIOU]/.test(text);
  },
  transform: (text: string) => {
    // More precise regex to handle vowel sounds at word boundaries
    return text.replace(/\ba(\s+)([aeiouAEIOU][a-z]*)/gi, 'an$1$2');
  },
  priority: 10
};

/**
 * English pluralization modifier
 * Handles comprehensive pluralization patterns including irregular forms
 */
export const EnglishPluralizationModifier: Modifier = {
  name: 'englishPluralization',
  condition: (text: string) => {
    // Look for plural indicators: numbers > 1, "many", "several", "multiple", etc.
    return /\b(many|several|multiple|some|few|all|both|various|numerous|\d*[2-9]\d*|\d+[02-9])\s+[a-zA-Z]+/i.test(text) ||
           /\b(two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)\s+[a-zA-Z]+/i.test(text) ||
           /\b(zero|no)\s+[a-zA-Z]+/i.test(text); // Zero/no also takes plural
  },
  transform: (text: string) => {
    return text.replace(/\b(many|several|multiple|some|few|all|both|various|numerous|zero|no|\d*[2-9]\d*|\d+[02-9]|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)\s+([a-zA-Z]+)\b/gi, 
      (match, quantifier, noun) => {
        const pluralNoun = pluralize(noun);
        return `${quantifier} ${pluralNoun}`;
      }
    );
  },
  priority: 9
};

/**
 * English ordinal modifier
 * Converts cardinal numbers to ordinal format (1 -> 1st, 2 -> 2nd, etc.)
 */
export const EnglishOrdinalModifier: Modifier = {
  name: 'englishOrdinals',
  condition: (text: string) => {
    // Look for standalone numbers (digits)
    return /\b\d+\b/.test(text);
  },
  transform: (text: string) => {
    return text.replace(/\b(\d+)\b/g, (match, num) => {
      const number = parseInt(num, 10);
      
      // Get the last digit and last two digits
      const lastDigit = number % 10;
      const lastTwoDigits = number % 100;
      
      // Exception: numbers ending in 11, 12, 13 use 'th'
      if (lastTwoDigits === 11 || lastTwoDigits === 12 || lastTwoDigits === 13) {
        return num + 'th';
      }
      
      // Apply ordinal rules based on last digit
      switch (lastDigit) {
        case 1:
          return num + 'st';
        case 2:
          return num + 'nd';
        case 3:
          return num + 'rd';
        default:
          return num + 'th';
      }
    });
  },
  priority: 8
};

/**
 * English capitalization modifier
 * Capitalizes words after sentence-ending punctuation
 */
export const EnglishCapitalizationModifier: Modifier = {
  name: 'englishCapitalization',
  condition: (text: string) => {
    // Look for lowercase letters after sentence endings
    return /[.!?]\s+[a-z]/.test(text);
  },
  transform: (text: string) => {
    // Capitalize first letter of sentences
    return text.replace(/([.!?]\s+)([a-z])/g, (match, punctuation, letter) => {
      return punctuation + letter.toUpperCase();
    });
  },
  priority: 7
};

/**
 * English possessive modifier
 * Handles English possessive forms ('s and s')
 */
export const EnglishPossessiveModifier: Modifier = {
  name: 'englishPossessives',
  condition: (text: string) => {
    // Look for possessive patterns: word + possessive marker
    return /\b\w+\s+possessive\b/i.test(text) || /\b\w+'s?\s+\w+/.test(text);
  },
  transform: (text: string) => {
    // Handle explicit possessive marker
    text = text.replace(/\b(\w+)\s+possessive\b/gi, (match, word) => {
      return word.endsWith('s') ? word + "'" : word + "'s";
    });
    
    // Fix double possessives (word's's -> word's)
    text = text.replace(/(\w+)'s's/g, "$1's");
    
    return text;
  },
  priority: 6
};

/**
 * English verb agreement modifier
 * Handles basic subject-verb agreement for common verbs
 */
export const EnglishVerbAgreementModifier: Modifier = {
  name: 'englishVerbAgreement',
  condition: (text: string) => {
    // Look for agreement issues
    return /\b(he|she|it)\s+are\b/i.test(text) || 
           /\b(they|many|several|few|all|both)\s+is\b/i.test(text) ||
           /\b(he|she|it)\s+have\b/i.test(text) ||
           /\b(they|many|several|few|all|both)\s+has\b/i.test(text);
  },
  transform: (text: string) => {
    // Fix is/are agreement for singular subjects
    text = text.replace(/\b(he|she|it)\s+are\b/gi, '$1 is');
    
    // Fix is/are agreement for plural subjects and quantifiers
    text = text.replace(/\b(they|many|several|few|all|both)\s+is\b/gi, '$1 are');
    
    // Fix has/have agreement for singular subjects
    text = text.replace(/\b(he|she|it)\s+have\b/gi, '$1 has');
    
    // Fix has/have agreement for plural subjects and quantifiers
    text = text.replace(/\b(they|many|several|few|all|both)\s+has\b/gi, '$1 have');
    
    return text;
  },
  priority: 5
};

/**
 * Punctuation cleanup modifier
 * Fixes common punctuation issues like double spaces and spacing around punctuation
 */
export const PunctuationCleanupModifier: Modifier = {
  name: 'punctuationCleanup',
  condition: (text: string) => {
    // Look for punctuation spacing issues
    return /\s{2,}/.test(text) || /\s+[.!?,:;]/.test(text) || /[.!?,:;]\S/.test(text);
  },
  transform: (text: string) => {
    // Fix multiple spaces
    text = text.replace(/\s{2,}/g, ' ');
    
    // Fix space before punctuation
    text = text.replace(/\s+([.!?,:;])/g, '$1');
    
    // Add space after punctuation if missing (except at end)
    text = text.replace(/([.!?,:;])([A-Za-z])/g, '$1 $2');
    
    // Trim leading/trailing whitespace
    text = text.trim();
    
    return text;
  },
  priority: 1
};

// Helper functions

/**
 * Convert a singular noun to its plural form
 * @param noun - The singular noun to pluralize
 * @returns The plural form of the noun
 */
function pluralize(noun: string): string {
  const lowerNoun = noun.toLowerCase();
  
  // Irregular plurals mapping
  const irregularPlurals: { [key: string]: string } = {
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
  
  // Apply regular pluralization rules in order of specificity
  
  // 1. Words ending in -s, -ss, -sh, -ch, -x, -z: add -es
  if (/[sxz]$/.test(lowerNoun) || /[sc]h$/.test(lowerNoun)) {
    return noun + 'es';
  }
  
  // 2. Words ending in consonant + y: change y to ies
  if (/[bcdfghjklmnpqrstvwxz]y$/i.test(lowerNoun)) {
    return noun.slice(0, -1) + 'ies';
  }
  
  // 3. Words ending in vowel + y: just add -s
  if (/[aeiou]y$/i.test(lowerNoun)) {
    return noun + 's';
  }
  
  // 4. Words ending in -f or -fe: change to -ves (with exceptions)
  if (/fe?$/i.test(lowerNoun)) {
    // Exceptions that just add -s
    const fExceptions = ['belief', 'chief', 'cliff', 'proof', 'roof', 'safe', 'chef', 'handkerchief'];
    if (fExceptions.includes(lowerNoun)) {
      return noun + 's';
    }
    return noun.replace(/fe?$/i, 'ves');
  }
  
  // 5. Words ending in consonant + o: add -es (with common exceptions)
  if (/[bcdfghjklmnpqrstvwxz]o$/i.test(lowerNoun)) {
    // Common exceptions that just add -s
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
  
  // 6. Words ending in vowel + o: just add -s
  if (/[aeiou]o$/i.test(lowerNoun)) {
    return noun + 's';
  }
  
  // 7. Default case: add -s
  return noun + 's';
}

/**
 * Preserve the case pattern of the original word in the plural form
 * @param original - The original word with its case pattern
 * @param plural - The lowercase plural form
 * @returns The plural with preserved case pattern
 */
function preserveCase(original: string, plural: string): string {
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

/**
 * Collection of all English modifiers for convenience
 */
export const AllEnglishModifiers = [
  EnglishArticleModifier,
  EnglishPluralizationModifier,
  EnglishOrdinalModifier,
  EnglishCapitalizationModifier,
  EnglishPossessiveModifier,
  EnglishVerbAgreementModifier,
  PunctuationCleanupModifier
];

/**
 * Basic English modifiers (articles, pluralization, ordinals)
 */
export const BasicEnglishModifiers = [
  EnglishArticleModifier,
  EnglishPluralizationModifier,
  EnglishOrdinalModifier
];