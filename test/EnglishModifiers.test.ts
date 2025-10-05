import { Parser } from '../src/Parser';
import {
  EnglishArticleModifier,
  EnglishPluralizationModifier,
  EnglishOrdinalModifier,
  EnglishCapitalizationModifier,
  EnglishPossessiveModifier,
  EnglishVerbAgreementModifier,
  PunctuationCleanupModifier,
  AllEnglishModifiers,
  BasicEnglishModifiers
} from '../src/EnglishModifiers';

describe('EnglishModifiers Comprehensive Coverage', () => {
  let parser: Parser;

  beforeEach(() => {
    parser = new Parser();
  });

  describe('EnglishArticleModifier', () => {
    it('should handle article condition detection', () => {
      expect(EnglishArticleModifier.condition('a apple')).toBe(true);
      expect(EnglishArticleModifier.condition('a elephant')).toBe(true);
      expect(EnglishArticleModifier.condition('a umbrella')).toBe(true);
      expect(EnglishArticleModifier.condition('a dog')).toBe(false);
      expect(EnglishArticleModifier.condition('the apple')).toBe(false);
    });

    it('should transform articles correctly', () => {
      expect(EnglishArticleModifier.transform('I have a apple')).toBe('I have an apple');
      expect(EnglishArticleModifier.transform('A Elephant is big')).toBe('an Elephant is big');
      expect(EnglishArticleModifier.transform('a umbrella and a dog')).toBe('an umbrella and a dog');
    });

    it('should have correct priority and name', () => {
      expect(EnglishArticleModifier.name).toBe('englishArticles');
      expect(EnglishArticleModifier.priority).toBe(10);
    });
  });

  describe('EnglishPluralizationModifier - Comprehensive Edge Cases', () => {
    beforeEach(() => {
      parser.loadModifier(EnglishPluralizationModifier);
    });

    it('should handle consonant + y words', () => {
      parser.addRule('item', ['city', 'baby', 'party']);
      const result = parser.parse('many %item%');
      expect(['many cities', 'many babies', 'many parties']).toContain(result);
    });

    it('should handle vowel + y words', () => {
      parser.addRule('item', ['day', 'key', 'boy']);
      const result = parser.parse('several %item%');
      expect(['several days', 'several keys', 'several boys']).toContain(result);
    });

    it('should handle f/fe words with exceptions', () => {
      // Regular f/fe -> ves
      parser.addRule('item', ['knife', 'wolf', 'leaf']);
      let result = parser.parse('many %item%');
      expect(['many knives', 'many wolves', 'many leaves']).toContain(result);

      // f/fe exceptions that just add s
      parser.clear();
      parser.loadModifier(EnglishPluralizationModifier);
      parser.addRule('item', ['belief', 'chief', 'cliff', 'proof', 'roof']);
      result = parser.parse('many %item%');
      expect(['many beliefs', 'many chiefs', 'many cliffs', 'many proofs', 'many roofs']).toContain(result);
    });

    it('should handle consonant + o words with exceptions', () => {
      // Regular consonant + o -> es
      parser.addRule('item', ['hero', 'potato', 'tomato']);
      let result = parser.parse('many %item%');
      expect(['many heroes', 'many potatoes', 'many tomatoes']).toContain(result);

      // consonant + o exceptions that just add s
      parser.clear();
      parser.loadModifier(EnglishPluralizationModifier);
      parser.addRule('item', ['photo', 'piano', 'halo', 'disco', 'studio', 'radio', 'video', 'auto', 'memo', 'pro', 'casino', 'patio', 'portfolio', 'logo', 'commando', 'solo', 'soprano', 'alto', 'kimono']);
      result = parser.parse('many %item%');
      expect(['many photos', 'many pianos', 'many halos', 'many discos', 'many studios', 'many radios', 'many videos', 'many autos', 'many memos', 'many pros', 'many casinos', 'many patios', 'many portfolios', 'many logos', 'many commandos', 'many solos', 'many sopranos', 'many altos', 'many kimonos']).toContain(result);
    });

    it('should handle vowel + o words', () => {
      parser.addRule('item', ['radio', 'video', 'portfolio']);
      const result = parser.parse('many %item%');
      expect(['many radios', 'many videos', 'many portfolios']).toContain(result);
    });

    it('should preserve case in irregular plurals', () => {
      // Test uppercase preservation
      parser.addRule('item', ['CHILD', 'WOMAN', 'MAN']);
      let result = parser.parse('many %item%');
      expect(['many CHILDREN', 'many WOMEN', 'many MEN']).toContain(result);

      // Test capitalized preservation  
      parser.clear();
      parser.loadModifier(EnglishPluralizationModifier);
      parser.addRule('item', ['Child', 'Woman', 'Man']);
      result = parser.parse('many %item%');
      expect(['many Children', 'many Women', 'many Men']).toContain(result);

      // Test lowercase preservation
      parser.clear();
      parser.loadModifier(EnglishPluralizationModifier);
      parser.addRule('item', ['child', 'woman', 'man']);
      result = parser.parse('many %item%');
      expect(['many children', 'many women', 'many men']).toContain(result);
    });

    it('should handle numbers and quantifiers', () => {
      parser.addRule('item', ['cat']);
      
      // Test numbers
      expect(parser.parse('2 %item%')).toBe('2 cats');
      expect(parser.parse('10 %item%')).toBe('10 cats');
      expect(parser.parse('23 %item%')).toBe('23 cats');
      
      // Test zero/no (takes plural)
      expect(parser.parse('zero %item%')).toBe('zero cats');
      expect(parser.parse('no %item%')).toBe('no cats');
      
      // Test written numbers
      expect(parser.parse('two %item%')).toBe('two cats');
      expect(parser.parse('fifteen %item%')).toBe('fifteen cats');
      expect(parser.parse('twenty %item%')).toBe('twenty cats');
    });

    it('should test condition detection', () => {
      expect(EnglishPluralizationModifier.condition('many dogs')).toBe(true);
      expect(EnglishPluralizationModifier.condition('several cats')).toBe(true);
      expect(EnglishPluralizationModifier.condition('5 birds')).toBe(true);
      expect(EnglishPluralizationModifier.condition('zero items')).toBe(true);
      expect(EnglishPluralizationModifier.condition('one cat')).toBe(false);
      expect(EnglishPluralizationModifier.condition('a dog')).toBe(false);
    });
  });

  describe('EnglishOrdinalModifier', () => {
    beforeEach(() => {
      parser.loadModifier(EnglishOrdinalModifier);
    });

    it('should handle special cases (11th, 12th, 13th)', () => {
      expect(parser.parse('11 place')).toBe('11th place');
      expect(parser.parse('12 item')).toBe('12th item');
      expect(parser.parse('13 floor')).toBe('13th floor');
      expect(parser.parse('111 anniversary')).toBe('111th anniversary');
      expect(parser.parse('112 edition')).toBe('112th edition');
      expect(parser.parse('113 time')).toBe('113th time');
    });

    it('should handle regular ordinal patterns', () => {
      expect(parser.parse('1 place')).toBe('1st place');
      expect(parser.parse('21 century')).toBe('21st century');
      expect(parser.parse('2 floor')).toBe('2nd floor');
      expect(parser.parse('22 day')).toBe('22nd day');
      expect(parser.parse('3 time')).toBe('3rd time');
      expect(parser.parse('23 hour')).toBe('23rd hour');
      expect(parser.parse('4 attempt')).toBe('4th attempt');
      expect(parser.parse('5 try')).toBe('5th try');
      expect(parser.parse('10 item')).toBe('10th item');
    });

    it('should test condition detection', () => {
      expect(EnglishOrdinalModifier.condition('I have 5 items')).toBe(true);
      expect(EnglishOrdinalModifier.condition('The 21 gun salute')).toBe(true);
      expect(EnglishOrdinalModifier.condition('No numbers here')).toBe(false);
      expect(EnglishOrdinalModifier.condition('Only letters')).toBe(false);
    });
  });

  describe('EnglishCapitalizationModifier', () => {
    beforeEach(() => {
      parser.loadModifier(EnglishCapitalizationModifier);
    });

    it('should handle various punctuation marks', () => {
      expect(parser.parse('hello. world')).toBe('hello. World');
      expect(parser.parse('what? yes')).toBe('what? Yes');
      expect(parser.parse('wow! amazing')).toBe('wow! Amazing');
      expect(parser.parse('first. second? third!')).toBe('first. Second? Third!');
    });

    it('should handle multiple spaces after punctuation', () => {
      expect(parser.parse('hello.  world')).toBe('hello.  World');
      expect(parser.parse('what?   yes')).toBe('what?   Yes');
    });

    it('should test condition detection', () => {
      expect(EnglishCapitalizationModifier.condition('hello. world')).toBe(true);
      expect(EnglishCapitalizationModifier.condition('what? yes')).toBe(true);
      expect(EnglishCapitalizationModifier.condition('wow! amazing')).toBe(true);
      expect(EnglishCapitalizationModifier.condition('Hello. World')).toBe(false);
      expect(EnglishCapitalizationModifier.condition('no punctuation')).toBe(false);
    });
  });

  describe('EnglishPossessiveModifier', () => {
    beforeEach(() => {
      parser.loadModifier(EnglishPossessiveModifier);
    });

    it('should handle possessive marker patterns', () => {
      expect(parser.parse('John possessive car')).toBe("John's car");
      expect(parser.parse('boys possessive toys')).toBe("boys' toys");
      expect(parser.parse('James possessive book')).toBe("James' book");
    });

    it('should handle existing possessives', () => {
      expect(parser.parse("John's car")).toBe("John's car");
      expect(parser.parse("boys' toys")).toBe("boys' toys");
    });

    it('should fix double possessives', () => {
      expect(parser.parse("John's's car")).toBe("John's car");
      expect(parser.parse("Mary's's house")).toBe("Mary's house");
    });

    it('should test condition detection', () => {
      expect(EnglishPossessiveModifier.condition('John possessive car')).toBe(true);
      expect(EnglishPossessiveModifier.condition("John's car")).toBe(true);
      expect(EnglishPossessiveModifier.condition("John's's car")).toBe(true);
      expect(EnglishPossessiveModifier.condition('regular text')).toBe(false);
    });
  });

  describe('EnglishVerbAgreementModifier', () => {
    beforeEach(() => {
      parser.loadModifier(EnglishVerbAgreementModifier);
    });

    it('should fix singular subjects with are/have', () => {
      expect(parser.parse('he are happy')).toBe('he is happy');
      expect(parser.parse('she are tall')).toBe('she is tall');
      expect(parser.parse('it are working')).toBe('it is working');
      expect(parser.parse('he have money')).toBe('he has money');
      expect(parser.parse('she have books')).toBe('she has books');
      expect(parser.parse('it have power')).toBe('it has power');
    });

    it('should fix plural subjects with is/has', () => {
      expect(parser.parse('they is running')).toBe('they are running');
      expect(parser.parse('many is here')).toBe('many are here');
      expect(parser.parse('several is working')).toBe('several are working');
      expect(parser.parse('few is available')).toBe('few are available');
      expect(parser.parse('all is good')).toBe('all are good');
      expect(parser.parse('both is fine')).toBe('both are fine');
      
      expect(parser.parse('they has books')).toBe('they have books');
      expect(parser.parse('many has items')).toBe('many have items');
      expect(parser.parse('several has problems')).toBe('several have problems');
      expect(parser.parse('few has answers')).toBe('few have answers');
      expect(parser.parse('all has rights')).toBe('all have rights');
      expect(parser.parse('both has issues')).toBe('both have issues');
    });

    it('should test condition detection', () => {
      expect(EnglishVerbAgreementModifier.condition('he are happy')).toBe(true);
      expect(EnglishVerbAgreementModifier.condition('they is running')).toBe(true);
      expect(EnglishVerbAgreementModifier.condition('he have money')).toBe(true);
      expect(EnglishVerbAgreementModifier.condition('they has books')).toBe(true);
      expect(EnglishVerbAgreementModifier.condition('he is happy')).toBe(false);
      expect(EnglishVerbAgreementModifier.condition('they are running')).toBe(false);
    });
  });

  describe('PunctuationCleanupModifier', () => {
    beforeEach(() => {
      parser.loadModifier(PunctuationCleanupModifier);
    });

    it('should fix various spacing issues', () => {
      // Multiple spaces
      expect(parser.parse('hello   world')).toBe('hello world');
      expect(parser.parse('a    b     c')).toBe('a b c');
      
      // Space before punctuation
      expect(parser.parse('hello , world .')).toBe('hello, world.');
      expect(parser.parse('what ? really ! wow')).toBe('what? really! wow');
      expect(parser.parse('test : example ; note')).toBe('test: example; note');
      
      // Missing space after punctuation
      expect(parser.parse('hello,world.test')).toBe('hello, world. test');
      expect(parser.parse('what?really!amazing')).toBe('what? really! amazing');
      expect(parser.parse('test:example;note')).toBe('test: example; note');
      
      // Trim whitespace
      expect(parser.parse('  hello world  ')).toBe('hello world');
      expect(parser.parse('\t  test  \n')).toBe('test');
    });

    it('should not add space at end of text', () => {
      expect(parser.parse('hello world.')).toBe('hello world.');
      expect(parser.parse('question?')).toBe('question?');
    });

    it('should test condition detection', () => {
      expect(PunctuationCleanupModifier.condition('hello  world')).toBe(true);
      expect(PunctuationCleanupModifier.condition('hello , world')).toBe(true);
      expect(PunctuationCleanupModifier.condition('hello,world')).toBe(true);
      expect(PunctuationCleanupModifier.condition('  hello  ')).toBe(true);
      expect(PunctuationCleanupModifier.condition('hello world')).toBe(false);
    });
  });

  describe('Modifier Collections', () => {
    it('should contain all modifiers in AllEnglishModifiers', () => {
      expect(AllEnglishModifiers).toHaveLength(7);
      expect(AllEnglishModifiers).toContain(EnglishArticleModifier);
      expect(AllEnglishModifiers).toContain(EnglishPluralizationModifier);
      expect(AllEnglishModifiers).toContain(EnglishOrdinalModifier);
      expect(AllEnglishModifiers).toContain(EnglishCapitalizationModifier);
      expect(AllEnglishModifiers).toContain(EnglishPossessiveModifier);
      expect(AllEnglishModifiers).toContain(EnglishVerbAgreementModifier);
      expect(AllEnglishModifiers).toContain(PunctuationCleanupModifier);
    });

    it('should contain basic modifiers in BasicEnglishModifiers', () => {
      expect(BasicEnglishModifiers).toHaveLength(3);
      expect(BasicEnglishModifiers).toContain(EnglishArticleModifier);
      expect(BasicEnglishModifiers).toContain(EnglishPluralizationModifier);
      expect(BasicEnglishModifiers).toContain(EnglishOrdinalModifier);
    });

    it('should load all modifiers correctly', () => {
      parser.loadModifiers(AllEnglishModifiers);
      
      expect(parser.hasModifier('englishArticles')).toBe(true);
      expect(parser.hasModifier('englishPluralization')).toBe(true);
      expect(parser.hasModifier('englishOrdinals')).toBe(true);
      expect(parser.hasModifier('englishCapitalization')).toBe(true);
      expect(parser.hasModifier('englishPossessives')).toBe(true);
      expect(parser.hasModifier('englishVerbAgreement')).toBe(true);
      expect(parser.hasModifier('punctuationCleanup')).toBe(true);
    });
  });

  describe('Complex Pluralization Edge Cases', () => {
    beforeEach(() => {
      parser.loadModifier(EnglishPluralizationModifier);
    });

    it('should handle all irregular plurals', () => {
      const irregularTests = [
        ['child', 'children'],
        ['mouse', 'mice'],
        ['foot', 'feet'],
        ['tooth', 'teeth'],
        ['goose', 'geese'],
        ['man', 'men'],
        ['woman', 'women'],
        ['ox', 'oxen'],
        ['deer', 'deer'],
        ['sheep', 'sheep'],
        ['fish', 'fish'],
        ['aircraft', 'aircraft'],
        ['series', 'series'],
        ['species', 'species'],
        ['moose', 'moose'],
        ['salmon', 'salmon'],
        ['trout', 'trout'],
        ['swine', 'swine'],
        ['bison', 'bison'],
        ['offspring', 'offspring'],
        ['shrimp', 'shrimp'],
        ['datum', 'data'],
        ['medium', 'media'],
        ['bacterium', 'bacteria'],
        ['curriculum', 'curricula'],
        ['memorandum', 'memoranda'],
        ['addendum', 'addenda'],
        ['referendum', 'referenda'],
        ['stratum', 'strata'],
        ['erratum', 'errata'],
        ['alumnus', 'alumni'],
        ['alumna', 'alumnae'],
        ['analysis', 'analyses'],
        ['basis', 'bases'],
        ['crisis', 'crises'],
        ['diagnosis', 'diagnoses'],
        ['hypothesis', 'hypotheses'],
        ['oasis', 'oases'],
        ['parenthesis', 'parentheses'],
        ['synopsis', 'synopses'],
        ['thesis', 'theses'],
        ['axis', 'axes'],
        ['matrix', 'matrices'],
        ['vertex', 'vertices'],
        ['vortex', 'vortices'],
        ['index', 'indices'],
        ['appendix', 'appendices'],
        ['codex', 'codices']
      ];

      irregularTests.forEach(([singular, plural]) => {
        parser.clear();
        parser.loadModifier(EnglishPluralizationModifier);
        parser.addRule('item', [singular]);
        const result = parser.parse('many %item%');
        expect(result).toBe(`many ${plural}`);
      });
    });

    it('should handle s/x/z/ch/sh endings', () => {
      const sibilantTests = [
        ['glass', 'glasses'],
        ['box', 'boxes'],  
        ['buzz', 'buzzes'],
        ['church', 'churches'],
        ['dish', 'dishes'],
        ['bus', 'buses'],
        ['fox', 'foxes'],
        ['quiz', 'quizzes']
      ];

      sibilantTests.forEach(([singular, plural]) => {
        parser.clear();
        parser.loadModifier(EnglishPluralizationModifier);
        parser.addRule('item', [singular]);
        const result = parser.parse('many %item%');
        expect(result).toBe(`many ${plural}`);
      });
    });

    it('should test default pluralization', () => {
      parser.addRule('item', ['book', 'table', 'computer']);
      const result = parser.parse('many %item%');
      expect(['many books', 'many tables', 'many computers']).toContain(result);
    });
  });

  describe('Integration Tests', () => {
    it('should work with all modifiers in complex sentences', () => {
      parser.loadModifiers(AllEnglishModifiers);
      parser.addRule('animal', ['elephant', 'mouse']);
      parser.addRule('number', ['5', '12']);
      parser.addRule('owner', ['john', 'mary']);
      
      const text = 'i saw a %animal%. there are %number% %animal% in %owner% possessive house!';
      const result = parser.parse(text);
      
      // Should be capitalized, have correct articles, pluralization, possessives, etc.
      expect(result).toMatch(/^i saw an? (elephant|mouse)\. There are (5th|12th) (elephants|mice) in (john's|mary's) house!$/);
    });

    it('should maintain priority order', () => {
      parser.loadModifiers(AllEnglishModifiers);
      
      // Check that modifiers have correct priorities  
      const modifiers = parser.getModifiers();
      const priorities = modifiers.map(m => m.priority || 0);
      
      // Should be in descending order
      for (let i = 0; i < priorities.length - 1; i++) {
        expect(priorities[i]).toBeGreaterThanOrEqual(priorities[i + 1]);
      }
    });
  });
});