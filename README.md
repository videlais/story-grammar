# Story Grammar

[![CI](https://github.com/videlais/story-grammar/actions/workflows/ci.yml/badge.svg)](https://github.com/videlais/story-grammar/actions/workflows/ci.yml)
[![Security Audit](https://github.com/videlais/story-grammar/actions/workflows/security-audit.yml/badge.svg)](https://github.com/videlais/story-grammar/actions/workflows/security-audit.yml)
[![npm version](https://badge.fury.io/js/story-grammar.svg)](https://badge.fury.io/js/story-grammar)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A combinatorial grammar for generative and narrative-based projects.

This project is heavily inspired by the great work Kate Compton did and continues to do with [Tracery](https://github.com/galaxykate/tracery).

## Table of Contents

- [Story Grammar](#story-grammar)
  - [Table of Contents](#table-of-contents)
  - [Interactive Examples](#interactive-examples)
  - [Overview](#overview)
    - [Key Features](#key-features)
  - [Features](#features)
  - [Quick Start](#quick-start)
  - [Examples](#examples)
    - [Basic Usage](#basic-usage)
    - [Complex Nested Variables](#complex-nested-variables)
    - [Function Rules](#function-rules)
    - [Weighted Rules](#weighted-rules)
    - [Conditional Rules](#conditional-rules)
    - [Sequential Rules](#sequential-rules)
    - [Range Rules](#range-rules)
    - [Template Rules](#template-rules)
    - [Reference Rules](#reference-rules)
    - [Seeded Randomness](#seeded-randomness)
    - [Story Generation](#story-generation)
    - [Error Handling](#error-handling)
  - [Built-in Modifiers](#built-in-modifiers)
    - [Loading Individual Modifiers](#loading-individual-modifiers)
    - [Loading All English Modifiers](#loading-all-english-modifiers)
    - [Basic English Modifiers](#basic-english-modifiers)
  - [Modifier System](#modifier-system)
    - [Modifier Features](#modifier-features)
    - [Adding Custom Modifiers](#adding-custom-modifiers)
    - [Example with Multiple Modifiers](#example-with-multiple-modifiers)
    - [Modifier Interface](#modifier-interface)
    - [Management Methods](#management-methods)
    - [Priority System](#priority-system)
  - [Built-in Modifiers Reference](#built-in-modifiers-reference)
    - [English Articles (`EnglishArticleModifier`)](#english-articles-englisharticlemodifier)
    - [English Pluralization (`EnglishPluralizationModifier`)](#english-pluralization-englishpluralizationmodifier)
    - [English Ordinals (`EnglishOrdinalModifier`)](#english-ordinals-englishordinalmodifier)
    - [English Capitalization (`EnglishCapitalizationModifier`)](#english-capitalization-englishcapitalizationmodifier)
    - [English Possessives (`EnglishPossessiveModifier`)](#english-possessives-englishpossessivemodifier)
    - [English Verb Agreement (`EnglishVerbAgreementModifier`)](#english-verb-agreement-englishverbagreementmodifier)
    - [Punctuation Cleanup (`PunctuationCleanupModifier`)](#punctuation-cleanup-punctuationcleanupmodifier)
  - [Performance and Utility Features](#performance-and-utility-features)
    - [Batch Processing](#batch-processing)
    - [Variation Generation](#variation-generation)
    - [Performance Monitoring](#performance-monitoring)
    - [Parser Analysis and Optimization](#parser-analysis-and-optimization)
  - [Enhanced Error Handling](#enhanced-error-handling)
    - [Safe Parsing](#safe-parsing)
    - [Rule Analysis](#rule-analysis)
    - [Helpful Error Messages](#helpful-error-messages)
  - [Build and Deployment](#build-and-deployment)
    - [TypeScript Build](#typescript-build)
    - [Webpack Bundle](#webpack-bundle)
    - [Browser Usage](#browser-usage)
  - [API Reference](#api-reference)
    - [Parser Class](#parser-class)
      - [Static Rules](#static-rules)
      - [Function Rule Methods](#function-rule-methods)
      - [Weighted Rule Methods](#weighted-rule-methods)
      - [Conditional Rule Methods](#conditional-rule-methods)
      - [Sequential Rule Methods](#sequential-rule-methods)
      - [Range Rule Methods](#range-rule-methods)
      - [Template Rule Methods](#template-rule-methods)
      - [Reference Rule Methods](#reference-rule-methods)
      - [Parsing](#parsing)
      - [Modifiers](#modifiers)
      - [Modifier Loading Methods](#modifier-loading-methods)
      - [Available English Modifiers](#available-english-modifiers)
      - [Configuration](#configuration)
    - [Types](#types)

## Interactive Examples

Visit the `docs/` folder for interactive examples demonstrating the Story Grammar library with the new modular modifier API:

- **[Tarot Three-Card Spread](docs/tarot-three-card-spread.html)** - Generate mystical three-card tarot readings with Past • Present • Future spreads using Story Grammar's combinatorial rules. Features a complete 78-card tarot deck, dynamic card combinations and interpretations, and 474,552 possible combinations.

- **[Weapon Loot Table Generator](docs/weapon-loot-generator.html)** - Generate RPG weapon loot with authentic rarity distribution using Story Grammar's weighted rules system. Includes 17 weapon types, realistic drop rates (Common 38.06%, Magic 50%, Rare 10.44%, Unique 1.5%), dynamic stats and special effects by rarity, and a color-coded rarity system with visual effects.

## Overview

The Story Grammar Parser allows you to create complex, dynamic text generation systems using a simple key-value grammar with variable substitution.

### Key Features

## Features

- **Simple Grammar Definition**: Define rules using key-value pairs
- **Variable Expansion**: Use `%variable%` syntax for rule expansion
- **Nested Variables**: Support for deeply nested rule references
- **Function Rules**: Dynamic rule generation using JavaScript functions
- **Weighted Rules**: Probability-based selection with custom weights
- **Conditional Rules**: Context-aware selection based on previous values
- **Sequential Rules**: Ordered cycling through values with reset capability
- **Range Rules**: Numeric range generation (integers and floats)
- **Template Rules**: Structured multi-variable combinations
- **Reference Rules**: Reuse previously generated values for consistency
- **Seeded Randomness**: Deterministic results for testing and reproducibility
- **Modifier System**: Apply text transformations during generation
- **Circular Reference Detection**: Automatic validation to prevent infinite loops
- **TypeScript Support**: Full type definitions included
- **Zero Dependencies**: Pure TypeScript implementation

## Quick Start

```typescript
import { Parser } from 'story-grammar';

const parser = new Parser();

// Define simple rules
parser.addRule('flowers', ['roses', 'daisies', 'tulips']);
parser.addRule('colors', ['red', 'blue', 'yellow']);

// Define complex rules with variables
parser.addRule('colored_flowers', ['%colors% %flowers%']);

// Generate text
const result = parser.parse('I see beautiful %colored_flowers% in the garden.');
console.log(result); // "I see beautiful red roses in the garden."
```

## Examples

### Basic Usage

```typescript
import { Parser } from 'story-grammar';

const parser = new Parser();

parser.addRule('flowers', ['roses', 'daisies', 'tulips']);
parser.addRule('colors', ['red', 'blue', 'pink']);

const text = 'I see a random %colors% %flowers%.';
console.log(parser.parse(text));
// Output: "I see a random blue roses." (randomized)
```

### Complex Nested Variables

```typescript
### Nested Variables

Variables can reference other variables:

```typescript
parser.addRule('greeting', ['Hello %name%!', 'Hi there %name%!']);
parser.addRule('name', ['Alice', 'Bob', 'Charlie']);
parser.addRule('farewell', ['Goodbye %name%', 'See you later %name%']);

console.log(parser.parse('%greeting% %farewell%'));
// Output: "Hello Alice! See you later Bob"
```

### Function Rules

Create dynamic rules that generate values at runtime:

```typescript
// Add a function rule that returns random numbers
parser.addFunctionRule('randomNumber', () => {
    const num = Math.floor(Math.random() * 100) + 1;
    return [num.toString()];
});

// Add a function rule for dice rolls
parser.addFunctionRule('diceRoll', () => {
    const roll = Math.floor(Math.random() * 20) + 1;
    return [`${roll} (d20)`];
});

// Add a function rule for current time
parser.addFunctionRule('timestamp', () => {
    return [new Date().toLocaleTimeString()];
});

console.log(parser.parse('Player rolls %diceRoll% at %timestamp%'));
// Output: "Player rolls 15 (d20) at 3:45:21 PM"

console.log(parser.parse('Random encounter strength: %randomNumber%'));
// Output: "Random encounter strength: 73"
```

Function rules are perfect for:

- Random numbers and dice rolls
- Current date/time values
- Dynamic calculations
- External API data (when used with async patterns)
- Any content that changes each time it's generated

### Weighted Rules

Create rules where some values are more likely than others using probability weights:

```typescript
// Equal probability (default behavior)
parser.addRule('color', ['red', 'green', 'blue']); // Each has 33.33% chance

// Weighted probability - weights must sum to 1.0
parser.addWeightedRule('rarity', 
  ['common', 'uncommon', 'rare', 'epic', 'legendary'], 
  [0.50, 0.30, 0.15, 0.04, 0.01]
);

// More realistic treasure distribution
parser.addWeightedRule('treasure', 
  ['coins', 'jewelry', 'weapon', 'armor', 'artifact'], 
  [0.40, 0.25, 0.20, 0.10, 0.05]
);

console.log(parser.parse('You found %rarity% %treasure%!'));
// Output: "You found common coins!" (most likely)
// Output: "You found legendary artifact!" (very rare - 0.05% chance)
```

Weighted rules are ideal for:

- Realistic item rarity in games (common items more frequent than legendary)
- Weather patterns (sunny days more common than storms)
- Character traits (normal attributes more common than exceptional ones)
- Any scenario where natural distribution isn't uniform

### Conditional Rules

Create context-aware rules that select values based on previously generated content:

```typescript
parser.addRule('character_type', ['warrior', 'mage', 'rogue']);
parser.addConditionalRule('weapon', {
  conditions: [
    {
      if: (context) => context.character_type === 'warrior',
      then: ['sword', 'axe', 'hammer']
    },
    {
      if: (context) => context.character_type === 'mage', 
      then: ['staff', 'wand', 'orb']
    },
    {
      default: ['dagger', 'bow'] // Fallback for any other case
    }
  ]
});

console.log(parser.parse('A %character_type% wielding a %weapon%'));
// Output: "A warrior wielding a sword" (weapon matches character type)
```

### Sequential Rules

Generate values in a specific order, with optional cycling:

```typescript
// Cycling sequence (repeats after end)
parser.addSequentialRule('day', ['Monday', 'Tuesday', 'Wednesday'], { cycle: true });

// Non-cycling sequence (stops at last value)  
parser.addSequentialRule('countdown', ['3', '2', '1', 'GO!'], { cycle: false });

console.log(parser.parse('%day%')); // Monday
console.log(parser.parse('%day%')); // Tuesday
console.log(parser.parse('%day%')); // Wednesday
console.log(parser.parse('%day%')); // Monday (cycles back)

// Reset a sequential rule to start over
parser.resetSequentialRule('countdown');
```

### Range Rules

Generate numeric values within specified ranges:

```typescript
// Integer ranges
parser.addRangeRule('age', { min: 18, max: 65, type: 'integer' });

// Float ranges with custom steps
parser.addRangeRule('height', { min: 5.0, max: 6.5, step: 0.1, type: 'float' });

// Percentage scores
parser.addRangeRule('score', { min: 0, max: 100, type: 'integer' });

console.log(parser.parse('Character: age %age%, height %height%ft, score %score%'));
// Output: "Character: age 34, height 5.7ft, score 87"
```

### Template Rules

Create structured combinations with their own variable sets:

```typescript
parser.addTemplateRule('npc', {
  template: '%name% the %adjective% %profession%',
  variables: {
    name: ['Aldric', 'Brina', 'Caius'],
    adjective: ['brave', 'wise', 'cunning'],
    profession: ['knight', 'merchant', 'scholar']
  }
});

console.log(parser.parse('Meet %npc%'));
// Output: "Meet Brina the cunning merchant"
```

### Reference Rules

Reuse previously generated values for consistency:

```typescript
parser.addRule('hero', ['Alice', 'Bob', 'Charlie']);
parser.addRule('quest', ['rescue the princess', 'slay the dragon']);

// Use @ prefix to reference previously generated values
const story = parser.parse(
  '%hero% begins to %quest%. Later, %@hero% succeeds and %@hero% becomes legendary.',
  true  // preserveContext = true
);
// Output: "Alice begins to slay the dragon. Later, Alice succeeds and Alice becomes legendary."
```

**Advanced Rule Combinations:**

All rule types can work together seamlessly:

```typescript
parser.addConditionalRule('spell_power', {
  conditions: [
    { if: (ctx) => ctx.character_type === 'mage', then: ['devastating', 'reality-bending'] },
    { default: ['weak', 'fizzling'] }
  ]
});

parser.parse('%character_type% %@character_type% casts a %spell_power% spell', true);
// Output: "mage mage casts a devastating spell" (consistent character, appropriate power)
```

### Seeded Randomness

For testing and reproducible results, you can seed the random number generator:

```typescript
const parser = new Parser();
parser.addRule('character', ['Alice', 'Bob', 'Charlie']);
parser.addWeightedRule('rarity', ['common', 'rare'], [0.8, 0.2]);

// Set a seed for deterministic results
parser.setRandomSeed(12345);

console.log(parser.parse('%character% finds %rarity% treasure'));
// Will always produce the same result with the same seed

// Generate multiple consistent results
for (let i = 0; i < 3; i++) {
  console.log(parser.parse('%character% finds %rarity% treasure'));
}

// Reset to same seed to reproduce the exact same sequence
parser.setRandomSeed(12345);
console.log(parser.parse('%character% finds %rarity% treasure')); // Same as first result

// Clear seed to return to true randomness
parser.clearRandomSeed();
console.log(parser.parse('%character% finds %rarity% treasure')); // Random again
```

**Note:** Seeded randomness affects the parser's internal random selection for static and weighted rules. Function rules that use `Math.random()` internally will remain random unless you implement seeding within your functions.

Seeded randomness is perfect for:

- Unit testing with predictable outcomes
- Debugging complex grammar combinations
- Generating reproducible procedural content
- Creating consistent examples for documentation

### Story Generation

```typescript
parser.addRules({
  characters: ['princess', 'knight', 'dragon', 'wizard'],
  locations: ['castle', 'forest', 'mountain', 'village'],
  actions: ['discovered', 'protected', 'explored', 'enchanted'],
  objects: ['treasure', 'magic sword', 'ancient book', 'crystal'],
  
  story_elements: ['%characters%', '%locations%', '%objects%'],
  story_template: [
    'The %characters% %actions% a %objects% in the %locations%.',
    'Once upon a time, a %characters% lived in a %locations%.',
    'A brave %characters% went to the %locations% seeking %objects%.'
  ]
});

// Generate multiple story variations
for (let i = 0; i < 3; i++) {
  console.log(parser.parse('%story_template%'));
}
```

### Error Handling

```typescript
// Handle undefined variables gracefully
const result = parser.parse('Unknown %variable% stays unchanged');
console.log(result); // "Unknown %variable% stays unchanged"

// Prevent infinite recursion
parser.addRule('infinite', ['%infinite% loop']);
try {
  parser.parse('This is %infinite%');
} catch (error) {
  console.log(error.message); // "Maximum recursion depth exceeded..."
}

// Validate grammar
const validation = parser.validate();
if (!validation.isValid) {
  console.log('Missing rules:', validation.missingRules);
  console.log('Circular references:', validation.circularReferences);
}
```

## Built-in Modifiers

The parser uses a modular modifier system that allows loading language-specific modifiers as needed:

### Loading Individual Modifiers

```typescript
import { Parser, EnglishArticleModifier, EnglishPluralizationModifier } from 'story-grammar';

const parser = new Parser();

// Load specific modifiers
parser.loadModifier(EnglishArticleModifier);
parser.loadModifier(EnglishPluralizationModifier);

// Automatically corrects "a" to "an" before vowel sounds
parser.addRule('items', ['a elephant', 'a umbrella', 'a house']);
console.log(parser.parse('%items%')); 
// Outputs: "an elephant", "an umbrella", "a house"

// Automatically pluralizes nouns with quantity indicators
parser.addRule('animals', ['cat', 'dog', 'mouse', 'child']);
console.log(parser.parse('I saw many %animals%')); 
// Outputs: "I saw many cats", "I saw many dogs", "I saw many mice", "I saw many children"
```

### Loading All English Modifiers

```typescript
import { Parser, AllEnglishModifiers } from 'story-grammar';

const parser = new Parser();

// Load all English modifiers at once
parser.loadModifiers(AllEnglishModifiers);

// Now all English language features are available:
// - Article correction (a/an)
// - Pluralization (many cats)
// - Ordinals (1st, 2nd, 3rd)
// - Capitalization (sentence starts)
// - Possessives (John's car)
// - Verb agreement (he is, they are)
// - Punctuation cleanup
```

### Basic English Modifiers

```typescript
import { Parser, BasicEnglishModifiers } from 'story-grammar';

const parser = new Parser();

// Load only core modifiers for performance
parser.loadModifiers(BasicEnglishModifiers);
// Includes: articles, pluralization, ordinals
```

## Modifier System

The Story Grammar parser includes a powerful modifier system that allows you to apply transformations to generated text after variable expansion.

### Modifier Features

- **Conditional Application**: Modifiers only apply when their condition is met
- **Priority System**: Modifiers are applied in priority order (higher numbers first)
- **Built-in Article Modifier**: Automatically handles English "a/an" articles
- **Built-in Pluralization Modifier**: Automatically pluralizes nouns with quantity words
- **Built-in Ordinal Modifier**: Converts cardinal numbers to ordinal format (1st, 2nd, 3rd, etc.)
- **Chainable**: Multiple modifiers can be applied to the same text

### Adding Custom Modifiers

```typescript
parser.addModifier({
  name: 'emphasize',
  condition: (text: string) => text.includes('important'),
  transform: (text: string) => text.replace(/important/g, 'IMPORTANT'),
  priority: 5
});
```

### Example with Multiple Modifiers

With the article modifier enabled:

```text
Input:  "I found a %adjective% %noun%"
Rules:  adjective: ['old', 'ancient'], noun: ['apple', 'elephant']
Output: "I found an old apple" or "I found an ancient elephant"
```

### Modifier Interface

```typescript
interface Modifier {
  name: string;
  condition: ModifierFunction;
  transform: ModifierFunction;
  priority: number;
}
```

### Management Methods

- `addModifier(modifier)` - Add a new modifier
- `removeModifier(name)` - Remove a modifier by name
- `clearModifiers()` - Remove all modifiers
- `hasModifier(name)` - Check if a modifier exists

### Priority System

Modifiers with higher priority numbers are applied first. This allows you to control the order of transformations. For example:

1. Priority 10: Article correction (a/an)
2. Priority 9: Pluralization (many/several/three/etc.)
3. Priority 8: Ordinal conversion (1st/2nd/3rd/etc.)
4. Priority 7: Capitalization fixes
5. Priority 1: Punctuation cleanup

This ensures that language-specific transformations (articles, plurals, ordinals) are handled before stylistic transformations.

## Built-in Modifiers Reference

All English modifiers are available as separate imports and can be loaded individually or in groups:

```typescript
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
} from 'story-grammar';
```

### English Articles (`EnglishArticleModifier`)

- **Priority**: 10
- **Function**: Converts "a" to "an" before vowel sounds
- **Examples**: "a elephant" → "an elephant", "a umbrella" → "an umbrella"

### English Pluralization (`EnglishPluralizationModifier`)

- **Priority**: 9
- **Function**: Pluralizes nouns when quantity indicators are present
- **Triggers**: "many", "several", "multiple", "few", numbers > 1, written numbers
- **Rules**:
  - Regular: "cat" → "cats"
  - S/X/Z/CH/SH endings: "box" → "boxes"
  - Consonant+Y: "fly" → "flies"
  - F/FE endings: "leaf" → "leaves"
  - Irregular: "child" → "children", "mouse" → "mice"
- **Examples**: "three cat" → "three cats", "many child" → "many children"

### English Ordinals (`EnglishOrdinalModifier`)

- **Priority**: 8
- **Function**: Converts cardinal numbers to ordinal format
- **Triggers**: Any standalone number (digits)
- **Rules**:
  - Numbers ending in 1: "1" → "1st", "21" → "21st"
  - Numbers ending in 2: "2" → "2nd", "22" → "22nd"
  - Numbers ending in 3: "3" → "3rd", "33" → "33rd"
  - Exception - 11, 12, 13: "11" → "11th", "112" → "112th"
  - All others: "4" → "4th", "100" → "100th"
- **Examples**: "1 place" → "1st place", "22 floor" → "22nd floor"

### English Capitalization (`EnglishCapitalizationModifier`)

- **Priority**: 7
- **Function**: Capitalizes words after sentence-ending punctuation
- **Triggers**: Lowercase letters following periods, exclamation marks, or question marks
- **Examples**: "hello. world" → "hello. World", "what? yes!" → "what? Yes!"

### English Possessives (`EnglishPossessiveModifier`)

- **Priority**: 6
- **Function**: Handles English possessive forms
- **Triggers**: "possessive" marker and malformed possessives
- **Rules**:
  - Regular nouns: "John possessive" → "John's"
  - Plural nouns: "boys possessive" → "boys'"
  - Fix doubles: "John's's" → "John's"
- **Examples**: "cat possessive toy" → "cat's toy"

### English Verb Agreement (`EnglishVerbAgreementModifier`)

- **Priority**: 5
- **Function**: Fixes basic subject-verb agreement
- **Triggers**: Mismatched subjects and verbs (is/are, has/have)
- **Rules**:
  - Singular subjects: "he are" → "he is", "she have" → "she has"
  - Plural/quantified subjects: "they is" → "they are", "many has" → "many have"
- **Examples**: "he are happy" → "he is happy", "many is here" → "many are here"

### Punctuation Cleanup (`PunctuationCleanupModifier`)

- **Priority**: 1
- **Function**: Fixes common punctuation and spacing issues
- **Triggers**: Multiple spaces, incorrect punctuation spacing
- **Rules**:
  - Multiple spaces → single space
  - Space before punctuation → removed
  - Missing space after punctuation → added
  - Trim leading/trailing whitespace
- **Examples**: "hello  ,  world" → "hello, world"

## Performance and Utility Features

### Batch Processing

Process multiple texts efficiently with shared context:

```typescript
const texts = [
  'I saw a %animal%',
  'The %animal% was %color%',
  'It ran %direction%'
];

const results = parser.parseBatch(texts, true); // preserve context
// Results will use consistent values across all texts
```

### Variation Generation

Generate multiple variations for testing or options:

```typescript
// Generate 5 variations with consistent seed
const variations = parser.generateVariations('%greeting% %name%!', 5, 12345);
console.log(variations);
// ["Hello Alice!", "Hi Bob!", "Hey Charlie!", "Hello David!", "Hi Eve!"]
```

### Performance Monitoring

Monitor parsing performance with detailed timing:

```typescript
const result = parser.parseWithTiming('%complex_rule%');
console.log(`Total: ${result.timing.totalMs}ms`);
console.log(`Expansion: ${result.timing.expansionMs}ms`);
console.log(`Modifiers: ${result.timing.modifierMs}ms`);
```

### Parser Analysis and Optimization

Analyze your parser for optimization opportunities:

```typescript
// Get statistics
const stats = parser.getStats();
console.log(`Total rules: ${stats.totalRules}`);
console.log(`Rule breakdown:`, stats.rulesByType);

// Analyze complexity
const analysis = parser.analyzeRules();
console.log(`Most complex rules:`, analysis.mostComplex);
console.log(`Suggestions:`, analysis.suggestions);

// Get optimization recommendations
const optimization = parser.optimize();
if (!optimization.optimized) {
  console.log('Warnings:', optimization.warnings);
  console.log('Suggestions:', optimization.suggestions);
}
```

## Enhanced Error Handling

### Safe Parsing

Parse with automatic error recovery and detailed diagnostics:

```typescript
const result = parser.safeParse('%potentially_problematic%', {
  validateFirst: true,    // Validate rules before parsing
  maxAttempts: 3,        // Retry with reduced complexity
  preserveContext: false
});

if (result.success) {
  console.log('Result:', result.result);
  console.log('Attempts needed:', result.attempts);
} else {
  console.log('Error:', result.error);
  if (result.validation) {
    console.log('Missing rules:', result.validation.missingRules);
  }
}
```

### Rule Analysis

Analyze individual rules for complexity and issues:

```typescript
// Analyze specific rule
const ruleAnalysis = parser.analyzeRules('complex_rule');
console.log('Complexity score:', ruleAnalysis.ruleDetails?.complexity);
console.log('Variables used:', ruleAnalysis.ruleDetails?.variables);
console.log('Nesting depth:', ruleAnalysis.ruleDetails?.depth);
```

### Helpful Error Messages

Get detailed error explanations with actionable suggestions:

```typescript
try {
  parser.parse('%problematic_rule%');
} catch (error) {
  const helpfulMessage = parser.getHelpfulError(error, {
    text: '%problematic_rule%',
    ruleName: 'problematic_rule'
  });
  
  console.log(helpfulMessage);
  // Includes suggestions, validation issues, and troubleshooting tips
}
```

## Build and Deployment

### TypeScript Build

Build the library for Node.js environments:

```bash
npm run build
```

This creates TypeScript declaration files and JavaScript modules in the `dist/` directory.

### Webpack Bundle

Build the library for browser environments:

```bash
# Production build (minified)
npm run build:webpack

# Development build (unminified with source maps)
npm run build:webpack:dev

# Build both TypeScript and Webpack
npm run build:all
```

This creates:

- `dist/story-grammar.bundle.js` - Production browser bundle (minified)
- `dist/story-grammar.dev.bundle.js` - Development browser bundle  
- Source maps for debugging

### Browser Usage

Include the webpack bundle in your HTML:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Story Grammar Example</title>
</head>
<body>
    <script src="dist/story-grammar.bundle.js"></script>
    <script>
        // Create parser instance
        const parser = new StoryGrammar.Parser();
        
        // Add rules
        parser.addRule('colors', ['red', 'blue', 'green']);
        parser.addRule('animals', ['cat', 'dog', 'bird']);
        
        // Add modifiers
        parser.loadModifier(EnglishArticleModifier);
        parser.loadModifier(EnglishPluralizationModifier);
        
        // Generate text
        const story = parser.parse('I saw many %colors% %animals%');
        console.log(story); // "I saw many red cats"
    </script>
</body>
</html>
```

The library is exposed as `StoryGrammar` global object with the `Parser` class available as `StoryGrammar.Parser`.

## API Reference

### Parser Class

#### Static Rules

- `addRule(key: string, values: string[])` - Add a static rule with fixed values
- `addRules(rules: Grammar)` - Add multiple static rules at once  
- `removeRule(key: string): boolean` - Remove any rule (static or function)
- `hasRule(key: string): boolean` - Check if any rule exists (static or function)
- `clear()` - Clear all rules (static and function)
- `getGrammar(): Grammar` - Get copy of static rules only

#### Function Rule Methods

- `addFunctionRule(key: string, fn: FunctionRule): void` - Add a dynamic function rule
- `removeFunctionRule(key: string): boolean` - Remove a function rule
- `hasFunctionRule(key: string): boolean` - Check if function rule exists
- `clearFunctionRules(): void` - Clear all function rules

#### Weighted Rule Methods

- `addWeightedRule(key: string, values: string[], weights: number[]): void` - Add a weighted probability rule
- `removeWeightedRule(key: string): boolean` - Remove a weighted rule
- `hasWeightedRule(key: string): boolean` - Check if weighted rule exists
- `clearWeightedRules(): void` - Clear all weighted rules

#### Conditional Rule Methods

- `addConditionalRule(key: string, condition: ConditionalRule): void` - Add a context-aware conditional rule
- `removeConditionalRule(key: string): boolean` - Remove a conditional rule
- `hasConditionalRule(key: string): boolean` - Check if conditional rule exists
- `clearConditionalRules(): void` - Clear all conditional rules

#### Sequential Rule Methods

- `addSequentialRule(key: string, values: string[]): void` - Add a sequential rule that cycles through values
- `resetSequentialRule(key: string): void` - Reset sequential rule to first value
- `removeSequentialRule(key: string): boolean` - Remove a sequential rule
- `hasSequentialRule(key: string): boolean` - Check if sequential rule exists
- `clearSequentialRules(): void` - Clear all sequential rules

#### Range Rule Methods

- `addRangeRule(key: string, min: number, max: number, isInteger?: boolean): void` - Add a numeric range rule
- `removeRangeRule(key: string): boolean` - Remove a range rule
- `hasRangeRule(key: string): boolean` - Check if range rule exists
- `clearRangeRules(): void` - Clear all range rules

#### Template Rule Methods

- `addTemplateRule(key: string, template: string, slots: string[]): void` - Add a template rule with variable slots
- `removeTemplateRule(key: string): boolean` - Remove a template rule
- `hasTemplateRule(key: string): boolean` - Check if template rule exists
- `clearTemplateRules(): void` - Clear all template rules

#### Reference Rule Methods

- `addReferenceRule(key: string, referenceKey: string): void` - Add a rule that references previously generated values
- `removeReferenceRule(key: string): boolean` - Remove a reference rule
- `hasReferenceRule(key: string): boolean` - Check if reference rule exists
- `clearReferenceRules(): void` - Clear all reference rules

#### Parsing

- `parse(text: string): string` - Parse text and expand all variables
- `findVariables(text: string): string[]` - Find all variables in text
- `validate(): ValidationResult` - Validate grammar for missing rules and circular references

#### Modifiers

- `addModifier(modifier: Modifier): void` - Add a text transformation modifier
- `removeModifier(name: string): boolean` - Remove a modifier
- `hasModifier(name: string): boolean` - Check if modifier exists
- `getModifiers(): Modifier[]` - Get all modifiers sorted by priority
- `clearModifiers(): void` - Clear all modifiers

#### Modifier Loading Methods

- `loadModifier(modifier: Modifier)` - Load a single modifier
- `loadModifiers(modifiers: Modifier[])` - Load multiple modifiers

#### Available English Modifiers

All modifiers are available as separate imports:

```typescript
import {
  EnglishArticleModifier,       // Fix a/an articles
  EnglishPluralizationModifier, // Handle English plurals  
  EnglishOrdinalModifier,       // Convert to ordinals (1st, 2nd)
  EnglishCapitalizationModifier,// Capitalize after sentences
  EnglishPossessiveModifier,    // Handle possessives ('s)
  EnglishVerbAgreementModifier, // Fix subject-verb agreement
  PunctuationCleanupModifier,   // Fix spacing/punctuation
  AllEnglishModifiers,          // All modifiers array
  BasicEnglishModifiers         // Core modifiers only
} from 'story-grammar';
```

#### Configuration

- `setMaxDepth(depth: number): void` - Set maximum recursion depth (default: 100)
- `getMaxDepth(): number` - Get current maximum recursion depth
- `setRandomSeed(seed: number): void` - Set random seed for deterministic results
- `clearRandomSeed(): void` - Clear random seed and return to Math.random()
- `getRandomSeed(): number | null` - Get current random seed or null
- `clearAll(): void` - Clear all rules and modifiers

### Types

```typescript
interface FunctionRule {
  (): string[];
}

interface WeightedRule {
  values: string[];
  weights: number[];
  cumulativeWeights: number[];
}

interface ConditionalRule {
  (context: Map<string, string>): string;
}

interface SequentialRule {
  values: string[];
  currentIndex: number;
}

interface RangeRule {
  min: number;
  max: number;
  isInteger: boolean;
}

interface TemplateRule {
  template: string;
  slots: string[];
}

interface ReferenceRule {
  referenceKey: string;
}

interface Grammar {
  [key: string]: string[];
}

interface Modifier {
  name: string;
  condition: (text: string, context?: ModifierContext) => boolean;
  transform: (text: string, context?: ModifierContext) => string;
  priority?: number;
}
```
