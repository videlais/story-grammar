import { Parser } from '../src/Parser';
import { 
  EnglishCapitalizationModifier, 
  EnglishPossessiveModifier, 
  EnglishVerbAgreementModifier,
  PunctuationCleanupModifier,
  AllEnglishModifiers,
  BasicEnglishModifiers,
  EnglishArticleModifier
} from '../src/EnglishModifiers';

describe('Enhanced Modifiers and Features', () => {
  let parser: Parser;

  beforeEach(() => {
    parser = new Parser();
  });

  describe('English Capitalization Modifier', () => {
    it('should capitalize words after sentence endings', () => {
      parser.loadModifier(EnglishCapitalizationModifier);
      
      expect(parser.parse('hello world. this is a test.')).toBe('hello world. This is a test.');
      expect(parser.parse('what? yes! maybe.')).toBe('what? Yes! Maybe.');
      expect(parser.parse('first sentence. second sentence! third sentence?')).toBe('first sentence. Second sentence! Third sentence?');
    });

    it('should not affect already capitalized text', () => {
      parser.loadModifier(EnglishCapitalizationModifier);
      
      expect(parser.parse('Hello World. This Is Fine.')).toBe('Hello World. This Is Fine.');
    });
  });

  describe('English Possessive Modifier', () => {
    it('should handle possessive forms', () => {
      parser.loadModifier(EnglishPossessiveModifier);
      
      expect(parser.parse('John possessive car')).toBe("John's car");
      expect(parser.parse('boys possessive toys')).toBe("boys' toys");
    });

    it('should fix double possessives', () => {
      parser.loadModifier(EnglishPossessiveModifier);
      
      expect(parser.parse("John's's car")).toBe("John's car");
    });
  });

  describe('English Verb Agreement Modifier', () => {
    it('should fix is/are agreement', () => {
      parser.loadModifier(EnglishVerbAgreementModifier);
      
      expect(parser.parse('he are happy')).toBe('he is happy');
      expect(parser.parse('she are tall')).toBe('she is tall');
      expect(parser.parse('they is running')).toBe('they are running');
    });

    it('should fix has/have agreement', () => {
      parser.loadModifier(EnglishVerbAgreementModifier);
      
      expect(parser.parse('he have a car')).toBe('he has a car');
      expect(parser.parse('they has books')).toBe('they have books');
    });
  });

  describe('Punctuation Cleanup Modifier', () => {
    it('should fix multiple spaces', () => {
      parser.loadModifier(PunctuationCleanupModifier);

      expect(parser.parse('Hello  world')).toBe('Hello world');
      expect(parser.parse('a    b     c')).toBe('a b c');
    });

    it('should fix spacing around punctuation', () => {
      parser.loadModifier(PunctuationCleanupModifier);
      
      expect(parser.parse('hello , world .')).toBe('hello, world.');
      expect(parser.parse('what ?really !amazing')).toBe('what? really! amazing');
    });

    it('should trim whitespace', () => {
      parser.loadModifier(PunctuationCleanupModifier);
      
      expect(parser.parse('  hello world  ')).toBe('hello world');
    });
  });

  describe('Combined Modifiers', () => {
    it('should work with all English modifiers together', () => {
      parser.loadModifiers(AllEnglishModifiers);
      
      parser.addRule('items', ['apple', 'elephant']);
      parser.addRule('quantities', ['many', 'three']);
      
      const result = parser.parse('I found a %items%. there are %quantities% %items% here.');
      
      // Check individual components work correctly
      expect(result).toMatch(/^I found an? (apple|elephant)\./); // Article correction
      expect(result).toMatch(/There are (many|three) (apples|elephants) here\.$/); // Capitalization, pluralization, verb agreement
    });
  });

  describe('Performance and Utility Methods', () => {
    it('should generate variations with seed', () => {
      parser.addRule('colors', ['red', 'blue', 'green']);
      
      const variations1 = parser.generateVariations('%colors%', 3, 12345);
      const variations2 = parser.generateVariations('%colors%', 3, 12345);
      
      expect(variations1).toHaveLength(3);
      expect(variations2).toHaveLength(3);
      expect(variations1).toEqual(variations2); // Should be identical with same seed
    });

    it('should parse batch efficiently', () => {
      parser.addRule('animals', ['cat', 'dog']);
      
      const texts = ['I saw a %animals%', 'The %animals% ran'];
      const results = parser.parseBatch(texts);
      
      expect(results).toHaveLength(2);
      expect(results[0]).toMatch(/^I saw a (cat|dog)$/);
      expect(results[1]).toMatch(/^The (cat|dog) ran$/);
    });

    it('should provide timing information', () => {
      parser.addRule('simple', ['test']);
      
      const result = parser.parseWithTiming('%simple%');
      
      expect(result.result).toBe('test');
      expect(result.timing.totalMs).toBeGreaterThanOrEqual(0);
      expect(result.timing.expansionMs).toBeGreaterThanOrEqual(0);
      expect(result.timing.modifierMs).toBeGreaterThanOrEqual(0);
    });

    it('should provide parser statistics', () => {
      parser.addRule('test1', ['value1']);
      parser.addFunctionRule('test2', () => ['value2']);
      parser.addWeightedRule('test3', ['value3'], [1.0]);
      
      const stats = parser.getStats();
      
      expect(stats.totalRules).toBe(3);
      expect(stats.rulesByType.static).toBe(1);
      expect(stats.rulesByType.function).toBe(1);
      expect(stats.rulesByType.weighted).toBe(1);
    });

    it('should add basic English modifiers preset', () => {
      parser.loadModifiers(BasicEnglishModifiers);
      
      expect(parser.hasModifier('englishArticles')).toBe(true);
      expect(parser.hasModifier('englishPluralization')).toBe(true);
      expect(parser.hasModifier('englishOrdinals')).toBe(true);
      expect(parser.hasModifier('englishCapitalization')).toBe(false);
    });
  });

  describe('Enhanced Validation', () => {
    it('should provide comprehensive validation', () => {
      parser.addRule('valid', ['test']);
      parser.addRule('empty', []);
      parser.addRule('referencing', ['%missing%']);
      
      const validation = parser.validate();
      
      expect(validation.isValid).toBe(false);
      expect(validation.emptyRules).toContain('empty');
      expect(validation.missingRules).toContain('missing');
      expect(validation.warnings.length).toBeGreaterThan(0);
    });

    it('should safely parse with error handling', () => {
      parser.addRule('test', ['%missing%']);
      
      const result = parser.safeParse('%test%');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Validation failed');
      expect(result.validation).toBeDefined();
    });

    it('should analyze rule complexity', () => {
      parser.addRule('simple', ['test']);
      parser.addRule('complex', ['%simple% %simple% %simple% with a very long string that should increase complexity']);
      
      const analysis = parser.analyzeRules();
      
      expect(analysis.totalComplexity).toBeGreaterThan(0);
      expect(analysis.mostComplex.length).toBeGreaterThan(0);
    });

    it('should provide helpful error messages', () => {
      const error = new Error('Maximum recursion depth exceeded');
      const helpfulError = parser.getHelpfulError(error, { ruleName: 'test' });
      
      expect(helpfulError).toContain('Suggestions:');
      expect(helpfulError).toContain('maxDepth');
      expect(helpfulError).toContain('circular references');
    });
  });

  describe('Optimization Features', () => {
    it('should provide optimization suggestions', () => {
      // Create many rules to trigger warnings
      for (let i = 0; i < 15; i++) {
        parser.addRule(`rule${i}`, [`value${i}`]);
        parser.addModifier({
          name: `modifier${i}`,
          condition: () => true,
          transform: (text) => text,
          priority: i
        });
      }
      
      const optimization = parser.optimize();
      
      expect(optimization.warnings.length).toBeGreaterThan(0);
      expect(optimization.optimized).toBe(false);
    });

    it('should clone parser correctly', () => {
      parser.addRule('test', ['value']);
      parser.setMaxDepth(50);
      parser.setRandomSeed(12345);
      
      const cloned = parser.clone();
      
      expect(cloned.hasRule('test')).toBe(true);
      expect(cloned.getMaxDepth()).toBe(50);
      expect(cloned.getRandomSeed()).toBe(12345);
    });

    it('should export configuration', () => {
      parser.addRule('test', ['value']);
      parser.loadModifier(EnglishArticleModifier);
      parser.setRandomSeed(12345);
      
      const config = parser.exportConfig();
      
      expect(config.grammar).toHaveProperty('test');
      expect(config.modifiers).toContain('englishArticles');
      expect(config.settings.randomSeed).toBe(12345);
    });
  });
});