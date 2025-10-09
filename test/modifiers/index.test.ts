/**
 * Tests for Main Modifiers Namespace Index
 */

import { Modifiers } from '../../src/index';
import {
  ArticleModifier,
  PluralizationModifier,
  OrdinalModifier,
  CapitalizationModifier,
  PossessiveModifier,
  VerbAgreementModifier,
  PunctuationCleanupModifier,
  AllEnglishModifiers
} from '../../src/modifiers/index';

describe('Main Modifiers Namespace Index', () => {
  test('should export English namespace', () => {
    expect(Modifiers.English).toBeDefined();
    expect(typeof Modifiers.English).toBe('object');
  });

  test('should export individual modifiers for convenience', () => {
    expect(Modifiers.ArticleModifier).toBeDefined();
    expect(Modifiers.ArticleModifier).toBe(ArticleModifier);
    
    expect(Modifiers.PluralizationModifier).toBeDefined();
    expect(Modifiers.PluralizationModifier).toBe(PluralizationModifier);
    
    expect(Modifiers.OrdinalModifier).toBeDefined();
    expect(Modifiers.OrdinalModifier).toBe(OrdinalModifier);
    
    expect(Modifiers.CapitalizationModifier).toBeDefined();
    expect(Modifiers.CapitalizationModifier).toBe(CapitalizationModifier);
    
    expect(Modifiers.PossessiveModifier).toBeDefined();
    expect(Modifiers.PossessiveModifier).toBe(PossessiveModifier);
    
    expect(Modifiers.VerbAgreementModifier).toBeDefined();
    expect(Modifiers.VerbAgreementModifier).toBe(VerbAgreementModifier);
    
    expect(Modifiers.PunctuationCleanupModifier).toBeDefined();
    expect(Modifiers.PunctuationCleanupModifier).toBe(PunctuationCleanupModifier);
    
    expect(Modifiers.AllEnglishModifiers).toBeDefined();
    expect(Modifiers.AllEnglishModifiers).toBe(AllEnglishModifiers);
  });

  test('English namespace should contain all modifiers', () => {
    expect(Modifiers.English.ArticleModifier).toBeDefined();
    expect(Modifiers.English.ArticleModifier).toBe(ArticleModifier);
    
    expect(Modifiers.English.PluralizationModifier).toBeDefined();
    expect(Modifiers.English.PluralizationModifier).toBe(PluralizationModifier);
    
    expect(Modifiers.English.OrdinalModifier).toBeDefined();
    expect(Modifiers.English.OrdinalModifier).toBe(OrdinalModifier);
    
    expect(Modifiers.English.CapitalizationModifier).toBeDefined();
    expect(Modifiers.English.CapitalizationModifier).toBe(CapitalizationModifier);
    
    expect(Modifiers.English.PossessiveModifier).toBeDefined();
    expect(Modifiers.English.PossessiveModifier).toBe(PossessiveModifier);
    
    expect(Modifiers.English.VerbAgreementModifier).toBeDefined();
    expect(Modifiers.English.VerbAgreementModifier).toBe(VerbAgreementModifier);
    
    expect(Modifiers.English.PunctuationCleanupModifier).toBeDefined();
    expect(Modifiers.English.PunctuationCleanupModifier).toBe(PunctuationCleanupModifier);
    
    expect(Modifiers.English.AllEnglishModifiers).toBeDefined();
    expect(Modifiers.English.AllEnglishModifiers).toBe(AllEnglishModifiers);
  });

  test('should maintain consistency between namespace and convenience exports', () => {
    expect(Modifiers.English.ArticleModifier).toBe(Modifiers.ArticleModifier);
    expect(Modifiers.English.PluralizationModifier).toBe(Modifiers.PluralizationModifier);
    expect(Modifiers.English.OrdinalModifier).toBe(Modifiers.OrdinalModifier);
    expect(Modifiers.English.CapitalizationModifier).toBe(Modifiers.CapitalizationModifier);
    expect(Modifiers.English.PossessiveModifier).toBe(Modifiers.PossessiveModifier);
    expect(Modifiers.English.VerbAgreementModifier).toBe(Modifiers.VerbAgreementModifier);
    expect(Modifiers.English.PunctuationCleanupModifier).toBe(Modifiers.PunctuationCleanupModifier);
    expect(Modifiers.English.AllEnglishModifiers).toBe(Modifiers.AllEnglishModifiers);
  });

  test('should have proper structure for future language support', () => {
    // This test documents the expected structure for adding new languages
    expect(Modifiers).toHaveProperty('English');
    
    // Future languages would be added as:
    // expect(Modifiers).toHaveProperty('Spanish');
    // expect(Modifiers).toHaveProperty('French');
    
    // Each language namespace should follow the same pattern as English
    const englishKeys = Object.keys(Modifiers.English);
    expect(englishKeys).toContain('ArticleModifier');
    expect(englishKeys).toContain('AllEnglishModifiers');
  });
});