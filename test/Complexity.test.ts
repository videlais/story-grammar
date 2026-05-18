import { Parser } from '../src/Parser';

describe('Complexity Calculation', () => {
  let parser: Parser;

  beforeEach(() => {
    parser = new Parser();
  });

  describe('calculateRuleComplexity', () => {
    it('should calculate complexity for simple static rules', () => {
      parser.addRule('colors', ['red', 'blue', 'green']);
      
      const result = parser.calculateRuleComplexity('colors');
      
      expect(result.complexity).toBe(3);
      expect(result.ruleType).toBe('static');
      expect(result.isFinite).toBe(true);
      expect(result.variables).toEqual([]);
      expect(result.warnings).toEqual([]);
    });

    it('should calculate complexity for rules with variables', () => {
      parser.addRule('colors', ['red', 'blue']);
      parser.addRule('animals', ['cat', 'dog', 'bird']);
      parser.addRule('description', ['The %colors% %animals%']);
      
      const result = parser.calculateRuleComplexity('description');
      
      expect(result.complexity).toBe(6); // 2 colors × 3 animals
      expect(result.ruleType).toBe('static');
      expect(result.isFinite).toBe(true);
      expect(result.variables).toEqual(['colors', 'animals']);
      expect(result.warnings).toEqual([]);
    });

    it('should calculate complexity for mixed literal and variable rules', () => {
      parser.addRule('colors', ['red', 'blue']);
      parser.addRule('items', ['apple', '%colors% flower']);
      
      const result = parser.calculateRuleComplexity('items');
      
      expect(result.complexity).toBe(3); // 1 literal + 2 colored flowers
      expect(result.ruleType).toBe('static');
      expect(result.isFinite).toBe(true);
      expect(result.variables).toEqual(['colors']);
    });

    it('should calculate complexity for nested variables', () => {
      parser.addRule('colors', ['red', 'blue']);
      parser.addRule('colored_items', ['%colors% flower']);
      parser.addRule('garden', ['I see %colored_items%']);
      
      const result = parser.calculateRuleComplexity('garden');
      
      expect(result.complexity).toBe(2); // red flower, blue flower
      expect(result.variables).toEqual(['colored_items']);
    });

    it('should calculate complexity for weighted rules', () => {
      parser.addWeightedRule('rarity', 
        ['common', 'rare', 'legendary'], 
        [0.7, 0.25, 0.05]
      );
      
      const result = parser.calculateRuleComplexity('rarity');
      
      expect(result.complexity).toBe(3);
      expect(result.ruleType).toBe('weighted');
      expect(result.isFinite).toBe(true);
    });

    it('should calculate complexity for range rules', () => {
      parser.addRangeRule('age', { min: 18, max: 65, step: 1, type: 'integer' });
      
      const result = parser.calculateRuleComplexity('age');
      
      expect(result.complexity).toBe(48); // (65-18)/1 + 1
      expect(result.ruleType).toBe('range');
      expect(result.isFinite).toBe(true);
    });

    it('should calculate complexity for range rules with custom step', () => {
      parser.addRangeRule('decades', { min: 1900, max: 2000, step: 10, type: 'integer' });
      
      const result = parser.calculateRuleComplexity('decades');
      
      expect(result.complexity).toBe(11); // (2000-1900)/10 + 1
      expect(result.ruleType).toBe('range');
    });

    it('should use default range step when not provided', () => {
      parser.addRangeRule('smallRange', { min: 3, max: 5, type: 'integer' });

      const result = parser.calculateRuleComplexity('smallRange');

      expect(result.complexity).toBe(3); // 3, 4, 5
      expect(result.ruleType).toBe('range');
    });

    it('should calculate complexity for template rules', () => {
      parser.addTemplateRule('address', {
        template: '%number% %street% %type%',
        variables: {
          number: ['123', '456'],
          street: ['Oak', 'Pine', 'Maple'],
          type: ['St', 'Ave']
        }
      });
      
      const result = parser.calculateRuleComplexity('address');
      
      expect(result.complexity).toBe(12); // 2 × 3 × 2
      expect(result.ruleType).toBe('template');
      expect(result.variables).toEqual(['number', 'street', 'type']);
    });

    it('should calculate complexity for sequential rules', () => {
      parser.addSequentialRule('weekdays', ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
      
      const result = parser.calculateRuleComplexity('weekdays');
      
      expect(result.complexity).toBe(5);
      expect(result.ruleType).toBe('sequential');
    });

    it('should calculate complexity for conditional rules', () => {
      parser.addConditionalRule('greeting', {
        conditions: [
          {
            if: (ctx) => ctx.time === 'morning',
            then: ['Good morning', 'Morning!']
          },
          {
            default: ['Hello', 'Hi', 'Hey']
          }
        ]
      });
      
      const result = parser.calculateRuleComplexity('greeting');
      
      expect(result.complexity).toBe(5); // 2 morning + 3 default
      expect(result.ruleType).toBe('conditional');
    });

    it('should handle function rules with infinite complexity', () => {
      parser.addFunctionRule('dynamic', () => ['value']);
      
      const result = parser.calculateRuleComplexity('dynamic');
      
      expect(result.complexity).toBe(Number.POSITIVE_INFINITY);
      expect(result.ruleType).toBe('function');
      expect(result.isFinite).toBe(false);
      expect(result.warnings).toContain("Function rule 'dynamic' has infinite complexity (cannot be calculated)");
    });

    it('should calculate conditional rule complexity for nested variables', () => {
      parser.addRule('colors', ['red', 'blue']);
      parser.addConditionalRule('greeting', {
        conditions: [
          {
            if: () => true,
            then: ['hello %colors%']
          },
          {
            default: ['goodbye']
          }
        ]
      });

      const result = parser.calculateRuleComplexity('greeting');

      expect(result.complexity).toBe(3);
      expect(result.variables).toContain('colors');
      expect(result.warnings).toEqual([]);
    });

    it('should propagate infinite complexity from nested conditional variables', () => {
      parser.addFunctionRule('dynamic', () => ['value']);
      parser.addConditionalRule('greeting', {
        conditions: [
          {
            if: () => true,
            then: ['hello %dynamic%']
          }
        ]
      });

      const result = parser.calculateRuleComplexity('greeting');

      expect(result.complexity).toBe(Number.POSITIVE_INFINITY);
    });

    it('should warn for missing nested conditional variables', () => {
      parser.addConditionalRule('greeting', {
        conditions: [
          {
            if: () => true,
            then: ['hello %missing%']
          }
        ]
      });

      const result = parser.calculateRuleComplexity('greeting');

      expect(result.complexity).toBe(1);
      expect(result.warnings).toContain("Missing rule 'missing' referenced in 'greeting'");
    });

    it('should detect circular references', () => {
      parser.addRule('a', ['%b%']);
      parser.addRule('b', ['%a%']);
      
      const result = parser.calculateRuleComplexity('a');
      
      expect(result.complexity).toBe(1);
      expect(result.ruleType).toBe('static'); // The rule type is still static, but it has circular warnings
      expect(result.warnings).toContain("Circular reference detected for rule 'a'");
    });

    it('should handle missing rule references', () => {
      parser.addRule('broken', ['%missing% item']);
      
      const result = parser.calculateRuleComplexity('broken');
      
      expect(result.complexity).toBe(1); // Treats missing as 1 possibility
      expect(result.warnings).toContain("Missing rule 'missing' referenced in 'broken'");
    });

    it('should return the top-level circular guard result when the rule is already visited', () => {
      parser.addRule('loop', ['value']);

      const result = parser.calculateRuleComplexity('loop', new Set(['loop']));

      expect(result.ruleType).toBe('circular');
      expect(result.complexity).toBe(1);
      expect(result.depth).toBe(1);
      expect(result.warnings).toContain("Circular reference detected for rule 'loop'");
    });

    it('should return the top-level max-depth guard result before analysis', () => {
      parser.addRule('deep', ['value']);

      const result = parser.calculateRuleComplexity('deep', new Set(['parent']), 1);

      expect(result.ruleType).toBe('max-depth');
      expect(result.complexity).toBe(1);
      expect(result.depth).toBe(1);
      expect(result.warnings).toContain('Maximum depth (1) reached, complexity may be underestimated');
    });

    it('should respect maximum depth', () => {
      parser.addRule('deep1', ['%deep2%']);
      parser.addRule('deep2', ['%deep3%']);
      parser.addRule('deep3', ['%deep4%']);
      parser.addRule('deep4', ['%deep5%']);
      parser.addRule('deep5', ['value']);
      
      const result = parser.calculateRuleComplexity('deep1', new Set(), 2);
      
      expect(result.ruleType).toBe('static'); // Will still be static but with warnings
      expect(result.warnings.some(w => w.includes('Maximum depth'))).toBe(true);
    });

    it('should throw error for non-existent rules', () => {
      expect(() => {
        parser.calculateRuleComplexity('nonexistent');
      }).toThrow("Rule 'nonexistent' does not exist");
    });

    it('should return warning for unknown rule types', () => {
      const internalParser = parser as unknown as {
        ruleManager: {
          hasRule: (key: string) => boolean;
          getRuleType: (key: string) => string | null;
        };
      };

      const originalHasRule = internalParser.ruleManager.hasRule.bind(internalParser.ruleManager);
      const originalGetRuleType = internalParser.ruleManager.getRuleType.bind(internalParser.ruleManager);

      internalParser.ruleManager.hasRule = (key: string) => key === 'mystery' ? true : originalHasRule(key);
      internalParser.ruleManager.getRuleType = (key: string) => key === 'mystery' ? null : originalGetRuleType(key);

      try {
        const result = parser.calculateRuleComplexity('mystery');
        expect(result.ruleType).toBe('unknown');
        expect(result.complexity).toBe(1);
        expect(result.warnings).toContain("Unknown rule type for 'mystery'");
      } finally {
        internalParser.ruleManager.hasRule = originalHasRule;
        internalParser.ruleManager.getRuleType = originalGetRuleType;
      }
    });

    it('should evaluate template variables via external rules when local values are missing', () => {
      const internalParser = parser as unknown as {
        ruleManager: {
          hasRule: (key: string) => boolean;
          getRuleType: (key: string) => string | null;
          getTemplateRuleData: (key: string) => { template: string; variables: Record<string, string[]> } | null;
          getGrammar: () => Record<string, string[]>;
        };
      };

      const originalHasRule = internalParser.ruleManager.hasRule.bind(internalParser.ruleManager);
      const originalGetRuleType = internalParser.ruleManager.getRuleType.bind(internalParser.ruleManager);
      const originalGetTemplateRuleData = internalParser.ruleManager.getTemplateRuleData.bind(internalParser.ruleManager);
      const originalGetGrammar = internalParser.ruleManager.getGrammar.bind(internalParser.ruleManager);

      internalParser.ruleManager.hasRule = (key: string) => {
        if (key === 'tmpl' || key === 'external') return true;
        return originalHasRule(key);
      };
      internalParser.ruleManager.getRuleType = (key: string) => {
        if (key === 'tmpl') return 'template';
        if (key === 'external') return 'static';
        return originalGetRuleType(key);
      };
      internalParser.ruleManager.getTemplateRuleData = (key: string) => {
        if (key === 'tmpl') {
          return {
            template: '%external%',
            variables: {}
          };
        }
        return originalGetTemplateRuleData(key);
      };
      internalParser.ruleManager.getGrammar = () => ({
        ...originalGetGrammar(),
        external: ['one', 'two']
      });

      try {
        const result = parser.calculateRuleComplexity('tmpl');
        expect(result.complexity).toBe(2);
        expect(result.variables).toContain('external');
      } finally {
        internalParser.ruleManager.hasRule = originalHasRule;
        internalParser.ruleManager.getRuleType = originalGetRuleType;
        internalParser.ruleManager.getTemplateRuleData = originalGetTemplateRuleData;
        internalParser.ruleManager.getGrammar = originalGetGrammar;
      }
    });

    it('returns infinite complexity when external template variable resolves to a function rule', () => {
      const internalParser = parser as unknown as {
        ruleManager: {
          hasRule: (key: string) => boolean;
          getRuleType: (key: string) => string | null;
          getTemplateRuleData: (key: string) => { template: string; variables: Record<string, string[]> } | null;
        };
      };

      const originalHasRule = internalParser.ruleManager.hasRule.bind(internalParser.ruleManager);
      const originalGetRuleType = internalParser.ruleManager.getRuleType.bind(internalParser.ruleManager);
      const originalGetTemplateRuleData = internalParser.ruleManager.getTemplateRuleData.bind(internalParser.ruleManager);

      internalParser.ruleManager.hasRule = (key: string) => {
        if (key === 'tmpl' || key === 'dynamicExternal') return true;
        return originalHasRule(key);
      };
      internalParser.ruleManager.getRuleType = (key: string) => {
        if (key === 'tmpl') return 'template';
        if (key === 'dynamicExternal') return 'function';
        return originalGetRuleType(key);
      };
      internalParser.ruleManager.getTemplateRuleData = (key: string) => {
        if (key === 'tmpl') {
          return {
            template: '%dynamicExternal%',
            variables: {}
          };
        }
        return originalGetTemplateRuleData(key);
      };

      try {
        const result = parser.calculateRuleComplexity('tmpl');
        expect(result.complexity).toBe(Number.POSITIVE_INFINITY);
      } finally {
        internalParser.ruleManager.hasRule = originalHasRule;
        internalParser.ruleManager.getRuleType = originalGetRuleType;
        internalParser.ruleManager.getTemplateRuleData = originalGetTemplateRuleData;
      }
    });

    it('warns for missing external template variables when local values are absent', () => {
      const internalParser = parser as unknown as {
        ruleManager: {
          hasRule: (key: string) => boolean;
          getRuleType: (key: string) => string | null;
          getTemplateRuleData: (key: string) => { template: string; variables: Record<string, string[]> } | null;
        };
      };

      const originalHasRule = internalParser.ruleManager.hasRule.bind(internalParser.ruleManager);
      const originalGetRuleType = internalParser.ruleManager.getRuleType.bind(internalParser.ruleManager);
      const originalGetTemplateRuleData = internalParser.ruleManager.getTemplateRuleData.bind(internalParser.ruleManager);

      internalParser.ruleManager.hasRule = (key: string) => key === 'tmpl' ? true : originalHasRule(key);
      internalParser.ruleManager.getRuleType = (key: string) => key === 'tmpl' ? 'template' : originalGetRuleType(key);
      internalParser.ruleManager.getTemplateRuleData = (key: string) => {
        if (key === 'tmpl') {
          return {
            template: '%neverDefined%',
            variables: {}
          };
        }
        return originalGetTemplateRuleData(key);
      };

      try {
        const result = parser.calculateRuleComplexity('tmpl');
        expect(result.complexity).toBe(1);
        expect(result.warnings).toContain("Missing rule 'neverDefined' referenced in 'tmpl'");
      } finally {
        internalParser.ruleManager.hasRule = originalHasRule;
        internalParser.ruleManager.getRuleType = originalGetRuleType;
        internalParser.ruleManager.getTemplateRuleData = originalGetTemplateRuleData;
      }
    });

    it('warns when an external template variable is already visited', () => {
      const internalParser = parser as unknown as {
        ruleManager: {
          hasRule: (key: string) => boolean;
          getRuleType: (key: string) => string | null;
          getTemplateRuleData: (key: string) => { template: string; variables: Record<string, string[]> } | null;
        };
      };

      const originalHasRule = internalParser.ruleManager.hasRule.bind(internalParser.ruleManager);
      const originalGetRuleType = internalParser.ruleManager.getRuleType.bind(internalParser.ruleManager);
      const originalGetTemplateRuleData = internalParser.ruleManager.getTemplateRuleData.bind(internalParser.ruleManager);

      internalParser.ruleManager.hasRule = (key: string) => {
        if (key === 'tmpl' || key === 'external') return true;
        return originalHasRule(key);
      };
      internalParser.ruleManager.getRuleType = (key: string) => key === 'tmpl' ? 'template' : originalGetRuleType(key);
      internalParser.ruleManager.getTemplateRuleData = (key: string) => {
        if (key === 'tmpl') {
          return {
            template: '%external%',
            variables: {}
          };
        }
        return originalGetTemplateRuleData(key);
      };

      try {
        const result = parser.calculateRuleComplexity('tmpl', new Set(['external']));
        expect(result.complexity).toBe(1);
        expect(result.warnings).toContain("Circular reference detected for rule 'external'");
      } finally {
        internalParser.ruleManager.hasRule = originalHasRule;
        internalParser.ruleManager.getRuleType = originalGetRuleType;
        internalParser.ruleManager.getTemplateRuleData = originalGetTemplateRuleData;
      }
    });

    it('warns when an external template variable hits max depth', () => {
      const internalParser = parser as unknown as {
        ruleManager: {
          hasRule: (key: string) => boolean;
          getRuleType: (key: string) => string | null;
          getTemplateRuleData: (key: string) => { template: string; variables: Record<string, string[]> } | null;
        };
      };

      const originalHasRule = internalParser.ruleManager.hasRule.bind(internalParser.ruleManager);
      const originalGetRuleType = internalParser.ruleManager.getRuleType.bind(internalParser.ruleManager);
      const originalGetTemplateRuleData = internalParser.ruleManager.getTemplateRuleData.bind(internalParser.ruleManager);

      internalParser.ruleManager.hasRule = (key: string) => {
        if (key === 'tmpl' || key === 'external') return true;
        return originalHasRule(key);
      };
      internalParser.ruleManager.getRuleType = (key: string) => key === 'tmpl' ? 'template' : originalGetRuleType(key);
      internalParser.ruleManager.getTemplateRuleData = (key: string) => {
        if (key === 'tmpl') {
          return {
            template: '%external%',
            variables: {}
          };
        }
        return originalGetTemplateRuleData(key);
      };

      try {
        const result = parser.calculateRuleComplexity('tmpl', new Set(), 1);
        expect(result.complexity).toBe(1);
        expect(result.warnings).toContain("Maximum depth (1) reached while analyzing 'external', complexity may be underestimated");
      } finally {
        internalParser.ruleManager.hasRule = originalHasRule;
        internalParser.ruleManager.getRuleType = originalGetRuleType;
        internalParser.ruleManager.getTemplateRuleData = originalGetTemplateRuleData;
      }
    });

    it('should calculate sequential rule complexity for nested variables', () => {
      parser.addRule('colors', ['red', 'blue']);
      parser.addSequentialRule('steps', ['%colors% door', 'plain door']);

      const result = parser.calculateRuleComplexity('steps');

      expect(result.complexity).toBe(3);
      expect(result.variables).toContain('colors');
      expect(result.warnings).toEqual([]);
    });

    it('should propagate infinite complexity from nested sequential variables', () => {
      parser.addFunctionRule('dynamic', () => ['value']);
      parser.addSequentialRule('steps', ['%dynamic%']);

      const result = parser.calculateRuleComplexity('steps');

      expect(result.complexity).toBe(Number.POSITIVE_INFINITY);
    });

    it('should warn for missing nested sequential variables', () => {
      parser.addSequentialRule('steps', ['%missing%']);

      const result = parser.calculateRuleComplexity('steps');

      expect(result.complexity).toBe(1);
      expect(result.warnings).toContain("Missing rule 'missing' referenced in 'steps'");
    });

    it('should calculate template complexity for local values that reference external rules', () => {
      parser.addRule('shape', ['circle', 'square']);
      parser.addTemplateRule('item', {
        template: '%color%',
        variables: {
          color: ['red %shape%', 'blue %shape%']
        }
      });

      const result = parser.calculateRuleComplexity('item');

      expect(result.complexity).toBe(4);
      expect(result.variables).toContain('color');
      expect(result.variables).toContain('shape');
      expect(result.warnings).toEqual([]);
    });

    it('should warn for circular nested template variables in local values', () => {
      parser.addTemplateRule('item', {
        template: '%color%',
        variables: {
          color: ['%item%']
        }
      });

      const result = parser.calculateRuleComplexity('item');

      expect(result.complexity).toBe(1);
      expect(result.warnings).toContain("Circular reference detected for rule 'item'");
    });

    it('should warn for max depth while analyzing nested template variables in local values', () => {
      parser.addRule('shape', ['circle', 'square']);
      parser.addTemplateRule('item', {
        template: '%color%',
        variables: {
          color: ['%shape%']
        }
      });

      const result = parser.calculateRuleComplexity('item', new Set(), 1);

      expect(result.complexity).toBe(1);
      expect(result.warnings).toContain("Maximum depth (1) reached while analyzing 'shape', complexity may be underestimated");
    });
  });

  describe('calculateTotalComplexity', () => {
    it('should calculate total complexity for simple grammar', () => {
      parser.addRule('colors', ['red', 'blue']);
      parser.addRule('animals', ['cat', 'dog', 'bird']);
      
      const result = parser.calculateTotalComplexity();
      
      expect(result.totalComplexity).toBe(5); // 2 + 3
      expect(result.isFinite).toBe(true);
      expect(result.ruleCount).toBe(2);
      expect(result.averageComplexity).toBe(2.5);
      expect(result.warnings).toEqual([]);
    });

    it('should accept an explicit maxDepth argument', () => {
      parser.addRule('colors', ['red', 'blue']);
      parser.addRule('item', ['%colors% sword']);

      const result = parser.calculateTotalComplexity(10);

      expect(result.totalComplexity).toBe(4); // 2 + 2
      expect(result.ruleCount).toBe(2);
    });

    it('should calculate total complexity with interconnected rules', () => {
      parser.addRule('colors', ['red', 'blue']);
      parser.addRule('animals', ['cat', 'dog']);
      parser.addRule('description', ['%colors% %animals%']);
      
      const result = parser.calculateTotalComplexity();
      
      expect(result.totalComplexity).toBe(8); // 2 + 2 + 4
      expect(result.ruleCount).toBe(3);
      expect(result.mostComplexRules[0].ruleName).toBe('description');
      expect(result.mostComplexRules[0].complexity).toBe(4);
    });

    it('should handle infinite complexity rules', () => {
      parser.addRule('colors', ['red', 'blue']);
      parser.addFunctionRule('dynamic', () => ['value']);
      
      const result = parser.calculateTotalComplexity();
      
      expect(result.totalComplexity).toBe(Number.POSITIVE_INFINITY);
      expect(result.isFinite).toBe(false);
      expect(result.ruleCount).toBe(2);
    });

    it('should detect circular references in total complexity', () => {
      parser.addRule('a', ['%b%']);
      parser.addRule('b', ['%a%']);
      parser.addRule('normal', ['value']);
      
      const result = parser.calculateTotalComplexity();
      
      expect(result.circularReferences).toContain('a');
      expect(result.circularReferences).toContain('b');
      expect(result.ruleCount).toBe(3);
    });

    it('should provide meaningful statistics', () => {
      parser.addRule('simple', ['a']);
      parser.addRule('medium', ['a', 'b', 'c']);
      parser.addRule('complex', ['%simple%', '%medium%']);
      parser.addRangeRule('numbers', { min: 1, max: 10, type: 'integer' });
      
      const result = parser.calculateTotalComplexity();
      
      expect(result.ruleCount).toBe(4);
      expect(result.averageComplexity).toBeGreaterThan(0);
      expect(result.mostComplexRules.length).toBeGreaterThan(0);
      expect(result.complexityByRule.length).toBe(4);
      
      // Check that each rule has proper analysis
      const complexityByName = result.complexityByRule.reduce((acc, rule) => {
        acc[rule.ruleName] = rule;
        return acc;
      }, {} as any);
      
      expect(complexityByName['simple'].complexity).toBe(1);
      expect(complexityByName['medium'].complexity).toBe(3);
      expect(complexityByName['complex'].complexity).toBe(4); // 1 + 3
      expect(complexityByName['numbers'].complexity).toBe(10);
    });

    it('should handle empty grammar', () => {
      const result = parser.calculateTotalComplexity();
      
      expect(result.totalComplexity).toBe(0);
      expect(result.isFinite).toBe(true);
      expect(result.ruleCount).toBe(0);
      expect(result.averageComplexity).toBe(0);
      expect(result.mostComplexRules).toEqual([]);
    });

    it('should handle per-rule complexity calculation errors in total analysis', () => {
      parser.addRule('ok', ['value']);

      const internalParser = parser as unknown as {
        complexityAnalyzer: {
          calculateRuleComplexity: (ruleKey: string, visited?: Set<string>, maxDepth?: number) => unknown;
        };
        ruleManager: {
          getAllKeys: () => string[];
        };
      };

      const originalCalculateRuleComplexity = internalParser.complexityAnalyzer.calculateRuleComplexity.bind(internalParser.complexityAnalyzer);
      const originalGetAllKeys = internalParser.ruleManager.getAllKeys.bind(internalParser.ruleManager);

      internalParser.ruleManager.getAllKeys = () => ['ok', 'bad'];
      internalParser.complexityAnalyzer.calculateRuleComplexity = (ruleKey: string) => {
        if (ruleKey === 'bad') {
          throw new Error('forced failure');
        }
        return originalCalculateRuleComplexity(ruleKey);
      };

      try {
        const result = parser.calculateTotalComplexity();
        expect(result.ruleCount).toBe(2);
        const badRule = result.complexityByRule.find(r => r.ruleName === 'bad');
        expect(badRule?.ruleType).toBe('error');
        expect(result.warnings.some(w => w.includes("Error calculating complexity for rule 'bad'"))).toBe(true);
      } finally {
        internalParser.complexityAnalyzer.calculateRuleComplexity = originalCalculateRuleComplexity;
        internalParser.ruleManager.getAllKeys = originalGetAllKeys;
      }
    });

    it('should handle template rules with local variables only', () => {
      parser.addTemplateRule('item', {
        template: '%color% %type%',
        variables: {
          color: ['red', 'blue'],
          type: ['flower', 'car']
        }
      });
      
      const result = parser.calculateTotalComplexity();
      
      const itemRule = result.complexityByRule.find(r => r.ruleName === 'item');
      expect(itemRule?.complexity).toBe(4); // 2 colors × 2 types
      expect(itemRule?.variables).toContain('color');
      expect(itemRule?.variables).toContain('type');
    });

    it('should return only the top five most complex rules sorted by complexity', () => {
      parser.addRule('one', ['a']);
      parser.addRule('two', ['a', 'b']);
      parser.addRule('three', ['a', 'b', 'c']);
      parser.addRule('four', ['a', 'b', 'c', 'd']);
      parser.addRule('five', ['a', 'b', 'c', 'd', 'e']);
      parser.addRule('six', ['a', 'b', 'c', 'd', 'e', 'f']);

      const result = parser.calculateTotalComplexity();

      expect(result.mostComplexRules).toHaveLength(5);
      expect(result.mostComplexRules.map(rule => rule.ruleName)).toEqual(['six', 'five', 'four', 'three', 'two']);
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle rules with empty arrays', () => {
      parser.addRule('empty', []);
      
      const result = parser.calculateRuleComplexity('empty');
      
      expect(result.complexity).toBe(0);
      expect(result.ruleType).toBe('static');
    });

    it('should handle complex nested structures', () => {
      parser.addRule('adjectives', ['big', 'small']);
      parser.addRule('colors', ['red', 'blue']);
      parser.addRule('nouns', ['cat', 'dog']);
      parser.addRule('phrase', ['%adjectives% %colors% %nouns%']);
      parser.addRule('sentence', ['I see a %phrase%.']);
      
      const result = parser.calculateRuleComplexity('sentence');
      
      expect(result.complexity).toBe(8); // 2 × 2 × 2
      expect(result.variables).toEqual(['phrase']);
    });

    it('should provide unique warnings', () => {
      parser.addRule('broken1', ['%missing% item']);
      parser.addRule('broken2', ['%missing% thing']);
      
      const result = parser.calculateTotalComplexity();
      
      const missingWarnings = result.warnings.filter(w => w.includes('missing'));
      expect(missingWarnings.length).toBe(2); // One for each broken rule
    });

    it('should warn when template local variable references a visited rule', () => {
      parser.addRule('adjective', ['bright']);
      parser.addTemplateRule('item', {
        template: '%slot%',
        variables: {
          slot: ['%adjective%']
        }
      });

      const result = parser.calculateRuleComplexity('item', new Set(['adjective']), 50);

      expect(result.complexity).toBe(1);
      expect(result.warnings).toContain("Circular reference detected for rule 'adjective'");
    });

    it('should warn when template local nested variable hits max depth', () => {
      parser.addRule('adjective', ['bright']);
      parser.addTemplateRule('item', {
        template: '%slot%',
        variables: {
          slot: ['%adjective%']
        }
      });

      const result = parser.calculateRuleComplexity('item', new Set(['seed']), 1);

      expect(result.complexity).toBe(1);
      expect(result.warnings.some(w => w.includes('Maximum depth (1) reached'))).toBe(true);
    });

    it('should warn when template local variables contain nested missing references', () => {
      parser.addTemplateRule('item', {
        template: '%local%',
        variables: {
          local: ['%nestedMissing%']
        }
      });

      const result = parser.calculateRuleComplexity('item');

      expect(result.complexity).toBe(1);
      expect(result.warnings).toContain("Missing rule 'nestedMissing' referenced in 'item'");
    });
  });

  describe('Uncovered branch coverage', () => {
    it('should propagate infinite complexity from function rule nested in a static rule', () => {
      parser.addFunctionRule('dynamic', () => ['value']);
      parser.addRule('sentence', ['I am %dynamic%']);

      const result = parser.calculateRuleComplexity('sentence');

      expect(result.complexity).toBe(Number.POSITIVE_INFINITY);
    });

    describe('weighted rule with variable references', () => {
      it('should calculate complexity for weighted rules containing variables', () => {
        parser.addRule('colors', ['red', 'blue', 'green']);
        parser.addWeightedRule('item', ['%colors% sword', 'shield'], [0.7, 0.3]);

        const result = parser.calculateRuleComplexity('item');

        expect(result.complexity).toBe(4); // 3 colored swords + 1 literal shield
        expect(result.ruleType).toBe('weighted');
        expect(result.variables).toContain('colors');
        expect(result.warnings).toEqual([]);
      });

      it('should propagate infinite complexity from a function rule nested in a weighted rule', () => {
        parser.addFunctionRule('dynamic', () => ['x']);
        parser.addWeightedRule('item', ['%dynamic%'], [1]);

        const result = parser.calculateRuleComplexity('item');

        expect(result.complexity).toBe(Number.POSITIVE_INFINITY);
      });

      it('should detect circular reference in nested weighted variable', () => {
        parser.addWeightedRule('loop', ['%loop%'], [1]);

        const result = parser.calculateRuleComplexity('loop');

        expect(result.complexity).toBe(1);
        expect(result.warnings).toContain("Circular reference detected for rule 'loop'");
      });

      it('should respect max depth in nested weighted variable', () => {
        parser.addRule('child', ['value']);
        parser.addWeightedRule('w', ['%child%'], [1]);

        const result = parser.calculateRuleComplexity('w', new Set(), 1);

        expect(result.complexity).toBe(1);
        expect(result.warnings.some(w => w.includes('Maximum depth (1) reached while analyzing'))).toBe(true);
      });

      it('should warn for missing rule referenced in a weighted value', () => {
        parser.addWeightedRule('item', ['%ghost%'], [1]);

        const result = parser.calculateRuleComplexity('item');

        expect(result.complexity).toBe(1);
        expect(result.warnings).toContain("Missing rule 'ghost' referenced in 'item'");
      });
    });

    describe('conditional rule nested-variable edge cases', () => {
      it('should detect circular reference in nested conditional variable', () => {
        parser.addConditionalRule('greeting', {
          conditions: [{ if: () => true, then: ['%greeting%'] }]
        });

        const result = parser.calculateRuleComplexity('greeting');

        expect(result.complexity).toBe(1);
        expect(result.warnings).toContain("Circular reference detected for rule 'greeting'");
      });

      it('should respect max depth in nested conditional variable', () => {
        parser.addRule('child', ['value']);
        parser.addConditionalRule('greeting', {
          conditions: [{ if: () => true, then: ['%child%'] }]
        });

        const result = parser.calculateRuleComplexity('greeting', new Set(), 1);

        expect(result.complexity).toBe(1);
        expect(result.warnings.some(w => w.includes('Maximum depth (1) reached while analyzing'))).toBe(true);
      });
    });

    describe('sequential rule nested-variable edge cases', () => {
      it('should detect circular reference in nested sequential variable', () => {
        parser.addSequentialRule('steps', ['%steps%']);

        const result = parser.calculateRuleComplexity('steps');

        expect(result.complexity).toBe(1);
        expect(result.warnings).toContain("Circular reference detected for rule 'steps'");
      });

      it('should respect max depth in nested sequential variable', () => {
        parser.addRule('child', ['value']);
        parser.addSequentialRule('steps', ['%child%']);

        const result = parser.calculateRuleComplexity('steps', new Set(), 1);

        expect(result.complexity).toBe(1);
        expect(result.warnings.some(w => w.includes('Maximum depth (1) reached while analyzing'))).toBe(true);
      });
    });

    it('should propagate infinite complexity from function rule referenced in template local values', () => {
      parser.addFunctionRule('dynamic', () => ['x']);
      parser.addTemplateRule('item', {
        template: '%slot%',
        variables: { slot: ['%dynamic%'] }
      });

      const result = parser.calculateRuleComplexity('item');

      expect(result.complexity).toBe(Number.POSITIVE_INFINITY);
    });
  });
});