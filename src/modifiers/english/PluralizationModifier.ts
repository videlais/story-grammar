/**
 * English pluralization modifier
 * Handles comprehensive pluralization patterns including irregular forms
 */

import { Modifier } from '../../types.js';

export const PluralizationModifier: Modifier = {
  name: 'englishPluralization',
  condition: (text: string) => {
    // Look for plural indicators: numbers > 1, "many", "several", "multiple", etc.
    return /\b(many|several|multiple|some|few|all|both|various|numerous|[2-9]\d*|\d*[02-9])\s+[a-zA-Z]+/i.test(text) ||
           /\b(two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)\s+[a-zA-Z]+/i.test(text) ||
           /\b(zero|no)\s+[a-zA-Z]+/i.test(text); // Zero/no also takes plural
  },
  transform: (text: string) => {
    return text.replace(/\b(many|several|multiple|some|few|all|both|various|numerous|zero|no|[2-9]\d*|\d*[02-9]|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)\s+([a-zA-Z]+)\b/gi, 
      (match, quantifier, noun) => {
        const pluralNoun = pluralize(noun);
        return `${quantifier} ${pluralNoun}`;
      }
    );
  },
  priority: 4
};

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