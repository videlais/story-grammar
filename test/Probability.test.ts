import { Parser } from '../src/Parser';

describe('Probability Analysis', () => {
  let parser: Parser;

  beforeEach(() => {
    parser = new Parser();
  });

  describe('calculateProbabilities', () => {
    it('should calculate probabilities for simple static rules', () => {
      parser.addRule('colors', ['red', 'blue', 'green']);
      
      const result = parser.calculateProbabilities('colors');
      
      expect(result.totalOutcomes).toBe(3);
      expect(result.outcomes).toHaveLength(3);
      expect(result.outcomes[0].probability).toBeCloseTo(1/3, 5);
      expect(result.outcomes[1].probability).toBeCloseTo(1/3, 5);
      expect(result.outcomes[2].probability).toBeCloseTo(1/3, 5);
      expect(result.averageProbability).toBeCloseTo(1/3, 5);
      expect(result.isFinite).toBe(true);
      expect(result.warnings).toEqual([]);
    });

    it('should calculate probabilities for weighted rules', () => {
      parser.addWeightedRule('rarity', ['common', 'rare', 'legendary'], [0.7, 0.2, 0.1]);
      
      const result = parser.calculateProbabilities('rarity');
      
      expect(result.totalOutcomes).toBe(3);
      expect(result.outcomes).toHaveLength(3);
      
      const commonOutcome = result.outcomes.find(o => o.outcome === 'common');
      const rareOutcome = result.outcomes.find(o => o.outcome === 'rare');
      const legendaryOutcome = result.outcomes.find(o => o.outcome === 'legendary');
      
      expect(commonOutcome?.probability).toBeCloseTo(0.7, 5);
      expect(rareOutcome?.probability).toBeCloseTo(0.2, 5);
      expect(legendaryOutcome?.probability).toBeCloseTo(0.1, 5);
    });

    it('should calculate probabilities for range rules', () => {
      parser.addRangeRule('dice', { min: 1, max: 6, type: 'integer' });
      
      const result = parser.calculateProbabilities('dice');
      
      expect(result.totalOutcomes).toBe(6);
      expect(result.outcomes).toHaveLength(6);
      expect(result.outcomes[0].probability).toBeCloseTo(1/6, 5);
      expect(result.averageProbability).toBeCloseTo(1/6, 5);
    });

    it('should calculate probabilities for template rules', () => {
      parser.addTemplateRule('item', {
        template: '%adjective% %noun%',
        variables: {
          adjective: ['big', 'small'],
          noun: ['sword', 'shield', 'bow']
        }
      });
      
      const result = parser.calculateProbabilities('item');
      
      expect(result.totalOutcomes).toBe(6); // 2 adjectives × 3 nouns
      expect(result.outcomes).toHaveLength(6);
      expect(result.outcomes[0].probability).toBeCloseTo(1/6, 5);
      
      // Check that all combinations exist
      const outcomes = result.outcomes.map(o => o.outcome);
      expect(outcomes).toContain('big sword');
      expect(outcomes).toContain('small bow');
      expect(outcomes).toContain('big shield');
    });

    it('should calculate probabilities for rules with variables', () => {
      parser.addRule('colors', ['red', 'blue']);
      parser.addRule('animals', ['cat', 'dog', 'bird']);
      parser.addRule('description', ['The %colors% %animals%']);
      
      const result = parser.calculateProbabilities('description');
      
      expect(result.totalOutcomes).toBe(6); // 2 colors × 3 animals
      expect(result.outcomes).toHaveLength(6);
      expect(result.outcomes[0].probability).toBeCloseTo(1/6, 5);
      
      // Check specific outcomes
      const outcomes = result.outcomes.map(o => o.outcome);
      expect(outcomes).toContain('The red cat');
      expect(outcomes).toContain('The blue bird');
    });

    it('should calculate probabilities for mixed literal and variable rules', () => {
      parser.addRule('colors', ['red', 'blue']);
      parser.addRule('items', ['apple', '%colors% flower']);
      
      const result = parser.calculateProbabilities('items');
      
      expect(result.totalOutcomes).toBe(3); // 1 literal + 2 colored flowers
      expect(result.outcomes).toHaveLength(3);
      
      const appleOutcome = result.outcomes.find(o => o.outcome === 'apple');
      const redFlowerOutcome = result.outcomes.find(o => o.outcome === 'red flower');
      const blueFlowerOutcome = result.outcomes.find(o => o.outcome === 'blue flower');
      
      expect(appleOutcome?.probability).toBeCloseTo(0.5, 5); // 1/2 of base rule
      expect(redFlowerOutcome?.probability).toBeCloseTo(0.25, 5); // 1/2 * 1/2
      expect(blueFlowerOutcome?.probability).toBeCloseTo(0.25, 5); // 1/2 * 1/2
    });

    it('should calculate probabilities for sequential rules', () => {
      parser.addSequentialRule('weekdays', ['Mon', 'Tue', 'Wed']);
      
      const result = parser.calculateProbabilities('weekdays');
      
      expect(result.totalOutcomes).toBe(3);
      expect(result.outcomes).toHaveLength(3);
      expect(result.outcomes[0].probability).toBeCloseTo(1/3, 5);
    });

    it('should calculate probabilities for conditional rules', () => {
      parser.addConditionalRule('greeting', {
        conditions: [
          {
            if: (ctx) => ctx.time === 'morning',
            then: ['Good morning', 'Morning!']
          },
          {
            default: ['Hello', 'Hi']
          }
        ]
      });
      
      const result = parser.calculateProbabilities('greeting');
      
      expect(result.totalOutcomes).toBe(4); // 2 morning + 2 default
      expect(result.outcomes).toHaveLength(4);
      
      // Each condition has equal weight (1/2), and each value within condition has equal weight
      const expectedProbability = 0.25; // (1/2) * (1/2)
      expect(result.outcomes[0].probability).toBeCloseTo(expectedProbability, 5);
    });

    it('should handle function rules with warning', () => {
      parser.addFunctionRule('dynamic', () => ['value']);
      
      const result = parser.calculateProbabilities('dynamic');
      
      expect(result.totalOutcomes).toBe(1);
      expect(result.outcomes[0].outcome).toBe('[function:dynamic]');
      expect(result.warnings).toContain("Function rule 'dynamic' has dynamic outcomes - cannot calculate exact probabilities");
    });

    it('should detect circular references', () => {
      parser.addRule('a', ['%b%']);
      parser.addRule('b', ['%a%']);
      
      const result = parser.calculateProbabilities('a');
      
      expect(result.totalOutcomes).toBe(1);
      expect(result.outcomes[0].outcome).toBe('[circular:a]');
      expect(result.warnings).toContain("Circular reference detected for rule 'a'");
    });

    it('should handle missing rule references', () => {
      parser.addRule('broken', ['%missing% item']);
      
      const result = parser.calculateProbabilities('broken');
      
      expect(result.totalOutcomes).toBe(1);
      expect(result.outcomes[0].outcome).toBe('[missing:missing] item');
      expect(result.warnings).toContain("Missing rule 'missing' referenced in expansion");
    });

    it('should respect maximum depth', () => {
      parser.addRule('deep1', ['%deep2%']);
      parser.addRule('deep2', ['%deep3%']);
      parser.addRule('deep3', ['value']);
      
      const result = parser.calculateProbabilities('deep1', 2); // maxDepth = 2
      
      expect(result.totalOutcomes).toBe(1);
      expect(result.outcomes[0].outcome).toBe('[max-depth:deep3]');
      expect(result.warnings.some(w => w.includes('Maximum depth (2) reached'))).toBe(true);
    });

    it('should calculate entropy correctly', () => {
      parser.addRule('fair', ['a', 'b', 'c', 'd']); // Equal probabilities
      parser.addWeightedRule('unfair', ['common', 'rare'], [0.9, 0.1]); // Unequal probabilities
      
      const fairResult = parser.calculateProbabilities('fair');
      const unfairResult = parser.calculateProbabilities('unfair');
      
      // Fair distribution should have higher entropy than unfair
      expect(fairResult.entropy).toBeGreaterThan(unfairResult.entropy);
      
      // Fair 4-way split should have entropy = log2(4) = 2
      expect(fairResult.entropy).toBeCloseTo(2, 5);
    });

    it('should throw error for non-existent rules', () => {
      expect(() => {
        parser.calculateProbabilities('nonexistent');
      }).toThrow("Rule 'nonexistent' does not exist");
    });
  });

  describe('getMostProbableOutcome', () => {
    it('should return the most probable outcome', () => {
      parser.addWeightedRule('rarity', ['common', 'rare', 'legendary'], [0.7, 0.2, 0.1]);
      
      const result = parser.getMostProbableOutcome('rarity');
      
      expect(result).not.toBeNull();
      expect(result!.outcome).toBe('common');
      expect(result!.probability).toBeCloseTo(0.7, 5);
    });

    it('should return null for non-existent rules', () => {
      expect(() => {
        parser.getMostProbableOutcome('nonexistent');
      }).toThrow("Rule 'nonexistent' does not exist");
    });

    it('should return null for empty outcomes', () => {
      parser.addRule('empty', []);
      
      const result = parser.getMostProbableOutcome('empty');
      
      expect(result).toBeNull();
    });
  });

  describe('getLeastProbableOutcome', () => {
    it('should return the least probable outcome', () => {
      parser.addWeightedRule('rarity', ['common', 'rare', 'legendary'], [0.7, 0.2, 0.1]);
      
      const result = parser.getLeastProbableOutcome('rarity');
      
      expect(result).not.toBeNull();
      expect(result!.outcome).toBe('legendary');
      expect(result!.probability).toBeCloseTo(0.1, 5);
    });

    it('should return null for non-existent rules', () => {
      expect(() => {
        parser.getLeastProbableOutcome('nonexistent');
      }).toThrow("Rule 'nonexistent' does not exist");
    });

    it('should return null for empty outcomes', () => {
      parser.addRule('empty', []);
      
      const result = parser.getLeastProbableOutcome('empty');
      
      expect(result).toBeNull();
    });
  });

  describe('Complex probability scenarios', () => {
    it('should handle nested weighted rules', () => {
      parser.addWeightedRule('rarity', ['common', 'rare'], [0.8, 0.2]);
      parser.addWeightedRule('type', ['weapon', 'armor'], [0.6, 0.4]);
      parser.addRule('loot', ['%rarity% %type%']);
      
      const result = parser.calculateProbabilities('loot');
      
      expect(result.totalOutcomes).toBe(4);
      
      const commonWeapon = result.outcomes.find(o => o.outcome === 'common weapon');
      const rareArmor = result.outcomes.find(o => o.outcome === 'rare armor');
      
      expect(commonWeapon?.probability).toBeCloseTo(0.48, 5); // 0.8 * 0.6
      expect(rareArmor?.probability).toBeCloseTo(0.08, 5); // 0.2 * 0.4
    });

    it('should handle complex nested structures', () => {
      parser.addRule('adjectives', ['big', 'small']);
      parser.addWeightedRule('colors', ['red', 'blue'], [0.7, 0.3]);
      parser.addRule('nouns', ['cat', 'dog']);
      parser.addRule('phrase', ['%adjectives% %colors% %nouns%']);
      parser.addRule('sentence', ['I see a %phrase%.']);
      
      const result = parser.calculateProbabilities('sentence');
      
      expect(result.totalOutcomes).toBe(8); // 2 × 2 × 2 combinations
      
      // Check specific probability calculation
      const bigRedCat = result.outcomes.find(o => o.outcome === 'I see a big red cat.');
      expect(bigRedCat?.probability).toBeCloseTo(0.175, 5); // (1/2) * 0.7 * (1/2)
    });

    it('should provide meaningful most and least probable outcomes', () => {
      parser.addWeightedRule('frequency', ['very common', 'common', 'uncommon', 'rare', 'very rare'], 
                             [0.4, 0.3, 0.15, 0.1, 0.05]);
      
      const result = parser.calculateProbabilities('frequency');
      
      expect(result.mostProbable[0].outcome).toBe('very common');
      expect(result.mostProbable[0].probability).toBeCloseTo(0.4, 5);
      
      // leastProbable array contains the 5 least probable outcomes, with least probable first
      expect(result.leastProbable[0].outcome).toBe('very rare');
      expect(result.leastProbable[0].probability).toBeCloseTo(0.05, 5);
    });

    it('should handle template rules with all local variables', () => {
      parser.addTemplateRule('item', {
        template: '%color% %type%',
        variables: {
          color: ['red', 'blue'],
          type: ['flower', 'car']
        }
      });
      
      const result = parser.calculateProbabilities('item');
      
      expect(result.totalOutcomes).toBe(4); // 2 colors × 2 types
      expect(result.outcomes.every(o => o.probability === 0.25)).toBe(true);
      
      const outcomes = result.outcomes.map(o => o.outcome);
      expect(outcomes).toContain('red flower');
      expect(outcomes).toContain('blue car');
    });

    it('should respect maxOutcomes parameter', () => {
      parser.addRule('many1', Array.from({length: 10}, (_, i) => `value${i}`));
      parser.addRule('many2', Array.from({length: 10}, (_, i) => `item${i}`));
      parser.addRule('combinations', ['%many1% %many2%']);
      
      const result = parser.calculateProbabilities('combinations', 50, 50); // maxOutcomes = 50
      
      expect(result.totalOutcomes).toBe(50); // Limited by maxOutcomes
      expect(result.warnings.some(w => w.includes('Maximum outcomes (50) reached'))).toBe(true);
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle rules with empty arrays', () => {
      parser.addRule('empty', []);
      
      const result = parser.calculateProbabilities('empty');
      
      expect(result.totalOutcomes).toBe(0);
      expect(result.outcomes).toHaveLength(0);
      expect(result.averageProbability).toBe(0);
      expect(result.entropy).toBe(0);
    });

    it('should handle probability trees correctly', () => {
      parser.addRule('colors', ['red', 'blue']);
      parser.addRule('description', ['The %colors% flower']);
      
      const result = parser.calculateProbabilities('description');
      
      expect(result.outcomes[0].probabilityTree).toHaveLength(1);
      expect(result.outcomes[0].probabilityTree[0].ruleName).toBe('colors');
      expect(result.outcomes[0].variables).toContain('colors');
    });

    it('should provide unique warnings for repeated issues', () => {
      parser.addRule('broken1', ['%missing% item']);
      parser.addRule('broken2', ['%missing% thing']);
      parser.addRule('both', ['%broken1% and %broken2%']);
      
      const result = parser.calculateProbabilities('both');
      
      // Should have warnings about missing rules
      const missingWarnings = result.warnings.filter(w => w.includes('missing'));
      expect(missingWarnings.length).toBeGreaterThan(0);
    });
  });
});