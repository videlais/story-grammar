/**
 * Tests for English Modifiers Namespace Index
 */

import {
  ArticleModifier,
  PluralizationModifier,
  OrdinalModifier,
  CapitalizationModifier,
  PossessiveModifier,
  VerbAgreementModifier,
  PunctuationCleanupModifier,
  AllEnglishModifiers
} from '../../../src/modifiers/english/index';

describe('English Modifiers Index', () => {
  test('should export all individual modifiers', () => {
    expect(ArticleModifier).toBeDefined();
    expect(ArticleModifier.name).toBe('englishArticles');
    
    expect(PluralizationModifier).toBeDefined();
    expect(PluralizationModifier.name).toBe('englishPluralization');
    
    expect(OrdinalModifier).toBeDefined();
    expect(OrdinalModifier.name).toBe('englishOrdinals');
    
    expect(CapitalizationModifier).toBeDefined();
    expect(CapitalizationModifier.name).toBe('englishCapitalization');
    
    expect(PossessiveModifier).toBeDefined();
    expect(PossessiveModifier.name).toBe('englishPossessive');
    
    expect(VerbAgreementModifier).toBeDefined();
    expect(VerbAgreementModifier.name).toBe('englishVerbAgreement');
    
    expect(PunctuationCleanupModifier).toBeDefined();
    expect(PunctuationCleanupModifier.name).toBe('englishPunctuationCleanup');
  });

  test('should export AllEnglishModifiers array', () => {
    expect(AllEnglishModifiers).toBeDefined();
    expect(Array.isArray(AllEnglishModifiers)).toBe(true);
    expect(AllEnglishModifiers).toHaveLength(7);
  });

  test('AllEnglishModifiers should contain all individual modifiers', () => {
    expect(AllEnglishModifiers).toContain(ArticleModifier);
    expect(AllEnglishModifiers).toContain(PluralizationModifier);
    expect(AllEnglishModifiers).toContain(OrdinalModifier);
    expect(AllEnglishModifiers).toContain(CapitalizationModifier);
    expect(AllEnglishModifiers).toContain(PossessiveModifier);
    expect(AllEnglishModifiers).toContain(VerbAgreementModifier);
    expect(AllEnglishModifiers).toContain(PunctuationCleanupModifier);
  });

  test('all modifiers should have required properties', () => {
    AllEnglishModifiers.forEach(modifier => {
      expect(modifier).toHaveProperty('name');
      expect(modifier).toHaveProperty('condition');
      expect(modifier).toHaveProperty('transform');
      expect(modifier).toHaveProperty('priority');
      
      expect(typeof modifier.name).toBe('string');
      expect(typeof modifier.condition).toBe('function');
      expect(typeof modifier.transform).toBe('function');
      expect(typeof modifier.priority).toBe('number');
    });
  });

  test('all modifiers should have unique names', () => {
    const names = AllEnglishModifiers.map(modifier => modifier.name);
    const uniqueNames = [...new Set(names)];
    expect(names).toHaveLength(uniqueNames.length);
  });

  test('all modifiers should have unique priorities', () => {
    const priorities = AllEnglishModifiers.map(modifier => modifier.priority);
    const uniquePriorities = [...new Set(priorities)];
    expect(priorities).toHaveLength(uniquePriorities.length);
  });

  test('priorities should be in expected order', () => {
    const sortedModifiers = [...AllEnglishModifiers].sort((a, b) => (b.priority || 0) - (a.priority || 0));
    expect(sortedModifiers[0]).toBe(ArticleModifier); // priority 10
    expect(sortedModifiers[1]).toBe(PunctuationCleanupModifier); // priority 9
    expect(sortedModifiers[2]).toBe(OrdinalModifier); // priority 8
    expect(sortedModifiers[3]).toBe(CapitalizationModifier); // priority 7
    expect(sortedModifiers[4]).toBe(PossessiveModifier); // priority 6
    expect(sortedModifiers[5]).toBe(VerbAgreementModifier); // priority 5
    expect(sortedModifiers[6]).toBe(PluralizationModifier); // priority 4
  });
});