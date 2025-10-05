/**
 * Parser for combinatorial grammar with variable expansion
 */

export interface Grammar {
  [key: string]: string[];
}

export interface ModifierFunction {
  (text: string, context?: ModifierContext): string;
}

export interface ModifierContext {
  ruleName?: string;
  originalText?: string;
  variables?: { [key: string]: string };
}

export interface Modifier {
  name: string;
  condition: (text: string, context?: ModifierContext) => boolean;
  transform: ModifierFunction;
  priority?: number;
}

export interface FunctionRule {
  (): string[];
}

export interface WeightedRule {
  values: string[];
  weights: number[];
  cumulativeWeights: number[];
}

export class Parser {
  private grammar: Grammar = {};
  private functionRules: Map<string, FunctionRule> = new Map();
  private weightedRules: Map<string, WeightedRule> = new Map();
  private modifiers: Map<string, Modifier> = new Map();
  private variablePattern = /%([^%]+)%/g;
  private maxDepth = 100; // Prevent infinite recursion
  private randomSeed: number | null = null;
  private currentSeed: number = 0;

  /**
   * Add a rule to the grammar
   * @param key - The key to define
   * @param values - Array of possible values for this key
   */
  public addRule(key: string, values: string[]): void {
    if (!key || typeof key !== 'string') {
      throw new Error('Key must be a non-empty string');
    }
    if (!Array.isArray(values)) {
      throw new Error('Values must be an array');
    }
    this.grammar[key] = [...values]; // Create a copy to avoid external mutation
  }

  /**
   * Add multiple rules to the grammar
   * @param rules - Object containing key-value pairs of rules
   */
  public addRules(rules: Grammar): void {
    for (const [key, values] of Object.entries(rules)) {
      this.addRule(key, values);
    }
  }

  /**
   * Add a function rule to the grammar
   * @param key - The key to define
   * @param fn - Function that returns an array of possible values
   */
  public addFunctionRule(key: string, fn: FunctionRule): void {
    if (!key || typeof key !== 'string') {
      throw new Error('Key must be a non-empty string');
    }
    if (typeof fn !== 'function') {
      throw new Error('Value must be a function');
    }
    this.functionRules.set(key, fn);
  }

  /**
   * Remove a function rule
   * @param key - Rule key to remove
   * @returns True if the rule was removed, false if it didn't exist
   */
  public removeFunctionRule(key: string): boolean {
    return this.functionRules.delete(key);
  }

  /**
   * Check if a function rule exists
   * @param key - Rule key to check
   * @returns True if the function rule exists
   */
  public hasFunctionRule(key: string): boolean {
    return this.functionRules.has(key);
  }

  /**
   * Clear all function rules
   */
  public clearFunctionRules(): void {
    this.functionRules.clear();
  }

  /**
   * Add a weighted rule to the grammar
   * @param key - The key to define
   * @param values - Array of possible values for this key
   * @param weights - Array of weights corresponding to each value (must sum to 1.0)
   */
  public addWeightedRule(key: string, values: string[], weights: number[]): void {
    if (!key || typeof key !== 'string') {
      throw new Error('Key must be a non-empty string');
    }
    if (!Array.isArray(values)) {
      throw new Error('Values must be an array');
    }
    if (!Array.isArray(weights)) {
      throw new Error('Weights must be an array');
    }
    if (values.length !== weights.length) {
      throw new Error('Values and weights arrays must have the same length');
    }
    if (values.length === 0) {
      throw new Error('Values array cannot be empty');
    }
    
    // Validate weights
    for (const weight of weights) {
      if (typeof weight !== 'number' || weight < 0) {
        throw new Error('All weights must be non-negative numbers');
      }
    }
    
    const weightSum = weights.reduce((sum, weight) => sum + weight, 0);
    if (Math.abs(weightSum - 1.0) > 0.0001) {
      throw new Error(`Weights must sum to 1.0, but sum to ${weightSum}`);
    }
    
    // Calculate cumulative weights for efficient sampling
    const cumulativeWeights: number[] = [];
    let cumSum = 0;
    for (const weight of weights) {
      cumSum += weight;
      cumulativeWeights.push(cumSum);
    }
    
    this.weightedRules.set(key, {
      values: [...values],
      weights: [...weights],
      cumulativeWeights
    });
  }

  /**
   * Remove a weighted rule
   * @param key - Rule key to remove
   * @returns True if the rule was removed, false if it didn't exist
   */
  public removeWeightedRule(key: string): boolean {
    return this.weightedRules.delete(key);
  }

  /**
   * Check if a weighted rule exists
   * @param key - Rule key to check
   * @returns True if the weighted rule exists
   */
  public hasWeightedRule(key: string): boolean {
    return this.weightedRules.has(key);
  }

  /**
   * Clear all weighted rules
   */
  public clearWeightedRules(): void {
    this.weightedRules.clear();
  }

  /**
   * Add a modifier to the grammar
   * @param modifier - The modifier to add
   */
  public addModifier(modifier: Modifier): void {
    if (!modifier || typeof modifier !== 'object') {
      throw new Error('Modifier must be an object');
    }
    if (!modifier.name || typeof modifier.name !== 'string') {
      throw new Error('Modifier must have a name');
    }
    if (typeof modifier.condition !== 'function') {
      throw new Error('Modifier must have a condition function');
    }
    if (typeof modifier.transform !== 'function') {
      throw new Error('Modifier must have a transform function');
    }
    
    this.modifiers.set(modifier.name, {
      ...modifier,
      priority: modifier.priority ?? 0
    });
  }

  /**
   * Remove a modifier from the grammar
   * @param name - The name of the modifier to remove
   * @returns True if the modifier was removed, false if it didn't exist
   */
  public removeModifier(name: string): boolean {
    return this.modifiers.delete(name);
  }

  /**
   * Check if a modifier exists
   * @param name - The name of the modifier to check
   * @returns True if the modifier exists, false otherwise
   */
  public hasModifier(name: string): boolean {
    return this.modifiers.has(name);
  }

  /**
   * Get all modifiers
   * @returns Array of all modifiers sorted by priority
   */
  public getModifiers(): Modifier[] {
    return Array.from(this.modifiers.values()).sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
  }

  /**
   * Add built-in English article modifier (a/an)
   */
  public addEnglishArticleModifier(): void {
    this.addModifier({
      name: 'englishArticles',
      condition: (text: string) => {
        return /\ba\s+[aeiouAEIOU]/.test(text);
      },
      transform: (text: string) => {
        // More precise regex to handle vowel sounds at word boundaries
        return text.replace(/\ba(\s+)([aeiouAEIOU][a-z]*)/gi, 'an$1$2');
      },
      priority: 10
    });
  }

  /**
   * Add built-in English pluralization modifier
   * Handles common pluralization patterns and irregular forms
   */
  public addEnglishPluralizationModifier(): void {
    this.addModifier({
      name: 'englishPluralization',
      condition: (text: string) => {
        // Look for plural indicators: numbers > 1, "many", "several", "multiple", etc.
        return /\b(many|several|multiple|some|few|\d*[2-9]\d*|\d+[02-9])\s+[a-zA-Z]+/i.test(text) ||
               /\b(two|three|four|five|six|seven|eight|nine|ten)\s+[a-zA-Z]+/i.test(text);
      },
      transform: (text: string) => {
        // Irregular plurals mapping
        const irregularPlurals: { [key: string]: string } = {
          'child': 'children',
          'person': 'people',
          'man': 'men',
          'woman': 'women',
          'mouse': 'mice',
          'foot': 'feet',
          'tooth': 'teeth',
          'goose': 'geese',
          'ox': 'oxen',
          'sheep': 'sheep',
          'deer': 'deer',
          'fish': 'fish'
        };

        return text.replace(/\b(many|several|multiple|some|few|\d*[2-9]\d*|\d+[02-9]|two|three|four|five|six|seven|eight|nine|ten)\s+([a-zA-Z]+)\b/gi, 
          (match, quantifier, noun) => {
            const lowerNoun = noun.toLowerCase();
            
            // Check for irregular plurals first
            if (irregularPlurals[lowerNoun]) {
              return `${quantifier} ${irregularPlurals[lowerNoun]}`;
            }
            
            // Apply regular pluralization rules
            let pluralNoun = noun;
            
            // Words ending in s, ss, sh, ch, x, z: add -es
            if (/[sxz]$|[sc]h$/.test(lowerNoun)) {
              pluralNoun = noun + 'es';
            }
            // Words ending in consonant + y: change y to ies
            else if (/[bcdfghjklmnpqrstvwxz]y$/i.test(noun)) {
              pluralNoun = noun.slice(0, -1) + 'ies';
            }
            // Words ending in f or fe: change to ves
            else if (/fe?$/i.test(noun)) {
              pluralNoun = noun.replace(/fe?$/i, 'ves');
            }
            // Words ending in o: usually add -es (with some exceptions)
            else if (/[bcdfghjklmnpqrstvwxz]o$/i.test(noun)) {
              // Common exceptions that just add -s
              const oExceptions = ['photo', 'piano', 'halo', 'disco'];
              if (oExceptions.includes(lowerNoun)) {
                pluralNoun = noun + 's';
              } else {
                pluralNoun = noun + 'es';
              }
            }
            // Default: add -s
            else {
              pluralNoun = noun + 's';
            }
            
            return `${quantifier} ${pluralNoun}`;
          }
        );
      },
      priority: 9
    });
  }

  /**
   * Add built-in English ordinal modifier
   * Converts cardinal numbers to ordinal format (1 -> 1st, 2 -> 2nd, etc.)
   */
  public addEnglishOrdinalModifier(): void {
    this.addModifier({
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
    });
  }

  /**
   * Get all grammar rules
   * @returns Copy of all grammar rules
   */
  public getGrammar(): Grammar {
    const grammarCopy: Grammar = {};
    for (const [key, values] of Object.entries(this.grammar)) {
      grammarCopy[key] = [...values];
    }
    return grammarCopy;
  }

  /**
   * Parse a text string and expand all variables
   * @param text - The text to parse
   * @returns Parsed text with variables expanded
   */
  public parse(text: string): string {
    if (typeof text !== 'string') {
      throw new Error('Text must be a string');
    }
    const expanded = this.expandVariables(text, 0);
    return this.applyModifiers(expanded, { originalText: text });
  }

  /**
   * Recursively expand variables in text
   * @param text - The text to expand
   * @param depth - Current recursion depth
   * @returns Text with variables expanded
   */
  private expandVariables(text: string, depth: number): string {
    if (depth >= this.maxDepth) {
      throw new Error('Maximum recursion depth exceeded. Check for circular references in grammar.');
    }

    // Reset the regex lastIndex to ensure proper matching
    this.variablePattern.lastIndex = 0;

    return text.replace(this.variablePattern, (match, key) => {
      let selectedValue: string;
      
      // Check function rules first
      const functionRule = this.functionRules.get(key);
      if (functionRule) {
        try {
          const values = functionRule();
          if (!Array.isArray(values)) {
            throw new Error(`Function rule '${key}' must return an array`);
          }
          if (values.length === 0) {
            return match;
          }
          selectedValue = this.getRandomValue(values);
        } catch (error) {
          throw new Error(`Error executing function rule '${key}': ${error instanceof Error ? error.message : String(error)}`);
        }
      } else {
        // Check weighted rules second
        const weightedRule = this.weightedRules.get(key);
        if (weightedRule) {
          selectedValue = this.getWeightedRandomValue(weightedRule);
        } else {
          // Fall back to static rules
          const values = this.grammar[key];
          if (!values || values.length === 0) {
            // Return the original variable if no rule is found
            return match;
          }
          selectedValue = this.getRandomValue(values);
        }
      }
      
      // Recursively expand variables in the selected value
      return this.expandVariables(selectedValue, depth + 1);
    });
  }

  /**
   * Apply all applicable modifiers to text
   * @param text - The text to modify
   * @param context - Optional context for modifier application
   * @returns Modified text
   */
  private applyModifiers(text: string, context?: ModifierContext): string {
    let modifiedText = text;
    
    // Get modifiers sorted by priority (higher priority first)
    const sortedModifiers = this.getModifiers();
    
    for (const modifier of sortedModifiers) {
      if (modifier.condition(modifiedText, context)) {
        modifiedText = modifier.transform(modifiedText, context);
      }
    }
    
    return modifiedText;
  }

  /**
   * Generate a seeded random number between 0 and 1
   * Uses Linear Congruential Generator (LCG) when seed is set
   * @returns Random number between 0 and 1
   */
  private getSeededRandom(): number {
    if (this.randomSeed === null) {
      return Math.random();
    }
    
    // Linear Congruential Generator (LCG)
    // Using parameters from Numerical Recipes: a=1664525, c=1013904223, m=2^32
    this.currentSeed = (this.currentSeed * 1664525 + 1013904223) >>> 0;
    return this.currentSeed / 0x100000000; // Convert to 0-1 range
  }

  /**
   * Get a random value from an array
   * @param values - Array of values to choose from
   * @returns A random value from the array
   */
  private getRandomValue(values: string[]): string {
    const randomIndex = Math.floor(this.getSeededRandom() * values.length);
    return values[randomIndex];
  }

  /**
   * Get a weighted random value from a weighted rule
   * @param weightedRule - Weighted rule containing values and cumulative weights
   * @returns A weighted random value
   */
  private getWeightedRandomValue(weightedRule: WeightedRule): string {
    const random = this.getSeededRandom();
    
    // Find the first cumulative weight that is greater than our random number
    for (let i = 0; i < weightedRule.cumulativeWeights.length; i++) {
      if (random <= weightedRule.cumulativeWeights[i]) {
        return weightedRule.values[i];
      }
    }
    
    // Fallback to last value (should not happen with proper weights)
    return weightedRule.values[weightedRule.values.length - 1];
  }

  /**
   * Check if a rule exists (static, function, or weighted rule)
   * @param key - The key to check
   * @returns True if the rule exists, false otherwise
   */
  public hasRule(key: string): boolean {
    return this.functionRules.has(key) || this.weightedRules.has(key) || key in this.grammar;
  }

  /**
   * Remove a rule (static, function, or weighted rule)
   * @param key - The key to remove
   * @returns True if rule was removed, false if it didn't exist
   */
  public removeRule(key: string): boolean {
    const removedFunction = this.functionRules.delete(key);
    const removedWeighted = this.weightedRules.delete(key);
    const removedStatic = key in this.grammar ? (delete this.grammar[key], true) : false;
    return removedFunction || removedWeighted || removedStatic;
  }

  /**
   * Clear all rules (static, function, and weighted rules)
   */
  public clear(): void {
    this.grammar = {};
    this.functionRules.clear();
    this.weightedRules.clear();
  }

  /**
   * Clear all modifiers
   */
  public clearModifiers(): void {
    this.modifiers.clear();
  }

  /**
   * Clear all rules and modifiers
   */
  public clearAll(): void {
    this.clear();
    this.clearModifiers();
  }

  /**
   * Get all variable names found in a text string
   * @param text - The text to analyze
   * @returns Array of unique variable names found
   */
  public findVariables(text: string): string[] {
    const variables: Set<string> = new Set();
    this.variablePattern.lastIndex = 0;
    
    let match;
    while ((match = this.variablePattern.exec(text)) !== null) {
      variables.add(match[1]);
    }
    
    return Array.from(variables);
  }

  /**
   * Validate that all variables in the grammar can be resolved
   * @returns Object containing validation results
   */
  public validate(): { isValid: boolean; missingRules: string[]; circularReferences: string[] } {
    const missingRules: Set<string> = new Set();
    const circularReferences: Set<string> = new Set();

    for (const [key, values] of Object.entries(this.grammar)) {
      for (const value of values) {
        const variables = this.findVariables(value);
        
        for (const variable of variables) {
          if (!this.hasRule(variable)) {
            missingRules.add(variable);
          }
          
          // Simple circular reference detection (direct self-reference)
          if (variable === key) {
            circularReferences.add(key);
          }
        }
      }
    }

    return {
      isValid: missingRules.size === 0 && circularReferences.size === 0,
      missingRules: Array.from(missingRules),
      circularReferences: Array.from(circularReferences)
    };
  }

  /**
   * Set the maximum recursion depth for variable expansion
   * @param depth - Maximum depth (default: 100)
   */
  public setMaxDepth(depth: number): void {
    if (depth < 1) {
      throw new Error('Max depth must be at least 1');
    }
    this.maxDepth = depth;
  }

  /**
   * Get the current maximum recursion depth
   * @returns Current maximum depth
   */
  public getMaxDepth(): number {
    return this.maxDepth;
  }

  /**
   * Set a random seed for deterministic random number generation
   * This makes the parser produce consistent, reproducible results for testing
   * @param seed - Integer seed value (will be converted to 32-bit unsigned integer)
   */
  public setRandomSeed(seed: number): void {
    if (typeof seed !== 'number' || !Number.isInteger(seed)) {
      throw new Error('Seed must be an integer');
    }
    // Convert to 32-bit unsigned integer
    this.randomSeed = Math.abs(seed) >>> 0;
    this.currentSeed = this.randomSeed;
  }

  /**
   * Clear the random seed and return to using Math.random()
   */
  public clearRandomSeed(): void {
    this.randomSeed = null;
    this.currentSeed = 0;
  }

  /**
   * Get the current random seed, if any
   * @returns Current seed or null if using Math.random()
   */
  public getRandomSeed(): number | null {
    return this.randomSeed;
  }
}