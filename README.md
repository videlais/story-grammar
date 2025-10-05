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
  - [Overview](#overview)
    - [Key Features](#key-features)
  - [Features](#features)
  - [Quick Start](#quick-start)
  - [Examples](#examples)
    - [Basic Usage](#basic-usage)
    - [Complex Nested Variables](#complex-nested-variables)
    - [Function Rules](#function-rules)
    - [Weighted Rules](#weighted-rules)
    - [Story Generation](#story-generation)
    - [Error Handling](#error-handling)
  - [Built-in Modifiers](#built-in-modifiers)
    - [English Article Correction](#english-article-correction)
    - [English Pluralization](#english-pluralization)
    - [English Ordinal Numbers](#english-ordinal-numbers)
  - [Modifier System](#modifier-system)
    - [Modifier Features](#modifier-features)
    - [Adding Custom Modifiers](#adding-custom-modifiers)
    - [Example with Multiple Modifiers](#example-with-multiple-modifiers)
    - [Modifier Interface](#modifier-interface)
    - [Management Methods](#management-methods)
    - [Priority System](#priority-system)
  - [Built-in Modifiers Reference](#built-in-modifiers-reference)
    - [English Articles (`addEnglishArticleModifier()`)](#english-articles-addenglisharticlemodifier)
    - [English Pluralization (`addEnglishPluralizationModifier()`)](#english-pluralization-addenglishpluralizationmodifier)
    - [English Ordinals (`addEnglishOrdinalModifier()`)](#english-ordinals-addenglishordinalmodifier)
  - [Build and Deployment](#build-and-deployment)
    - [TypeScript Build](#typescript-build)
    - [Webpack Bundle](#webpack-bundle)
    - [Browser Usage](#browser-usage)
  - [API Reference](#api-reference)
    - [Parser Class](#parser-class)
      - [Static Rules](#static-rules)
      - [Function Rule Methods](#function-rule-methods)
      - [Weighted Rule Methods](#weighted-rule-methods)
      - [Parsing](#parsing)
      - [Modifiers](#modifiers)
      - [Built-in Modifier Methods](#built-in-modifier-methods)
      - [Configuration](#configuration)
    - [Types](#types)
  - [Interactive Examples](#interactive-examples)
    - [🏰 Fantasy Kingdom Generator](#-fantasy-kingdom-generator)
    - [🎲 Function Rules Example](#-function-rules-example)
    - [⚖️ Weighted Rules Example](#️-weighted-rules-example)
    - [🐉 D\&D Encounter Generator](#-dd-encounter-generator)
    - [Additional Examples](#additional-examples)

## Overview

The Story Grammar Parser allows you to create complex, dynamic text generation systems using a simple key-value grammar with variable substitution.

### Key Features

## Features

- **Simple Grammar Definition**: Define rules using key-value pairs
- **Variable Expansion**: Use `%variable%` syntax for rule expansion
- **Nested Variables**: Support for deeply nested rule references
- **Function Rules**: Dynamic rule generation using JavaScript functions
- **Weighted Rules**: Probability-based selection with custom weights
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

The parser includes built-in English language modifiers for common transformations:

### English Article Correction

```typescript
parser.addEnglishArticleModifier();

// Automatically corrects "a" to "an" before vowel sounds
parser.addRule('items', ['a elephant', 'a umbrella', 'a house']);
console.log(parser.parse('%items%')); 
// Outputs: "an elephant", "an umbrella", "a house"
```

### English Pluralization

```typescript
parser.addEnglishPluralizationModifier();

// Automatically pluralizes nouns with quantity indicators
parser.addRule('animals', ['cat', 'dog', 'mouse', 'child']);
console.log(parser.parse('I saw many %animals%')); 
// Outputs: "I saw many cats", "I saw many dogs", "I saw many mice", "I saw many children"
```

### English Ordinal Numbers

```typescript
parser.addEnglishOrdinalModifier();

// Automatically converts cardinal numbers to ordinal format
parser.addRule('positions', ['1', '2', '3', '21', '22']);
console.log(parser.parse('I finished in %positions% place')); 
// Outputs: "I finished in 1st place", "I finished in 2nd place", "I finished in 21st place"
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
4. Priority 5: Emphasis transformations
5. Priority 1: Capitalization fixes

This ensures that language-specific transformations (articles, plurals, ordinals) are handled before stylistic transformations.

## Built-in Modifiers Reference

### English Articles (`addEnglishArticleModifier()`)

- **Priority**: 10
- **Function**: Converts "a" to "an" before vowel sounds
- **Examples**: "a elephant" → "an elephant", "a umbrella" → "an umbrella"

### English Pluralization (`addEnglishPluralizationModifier()`)

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

### English Ordinals (`addEnglishOrdinalModifier()`)

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
        parser.addEnglishArticleModifier();
        parser.addEnglishPluralizationModifier();
        
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

#### Built-in Modifier Methods

- `addEnglishArticleModifier()` - Fix a/an articles based on vowel sounds
- `addEnglishPluralizationModifier()` - Handle English plural forms
- `addEnglishOrdinalModifier()` - Convert numbers to ordinal form (1st, 2nd, etc.)

#### Configuration

- `setMaxDepth(depth: number): void` - Set maximum recursion depth (default: 100)
- `getMaxDepth(): number` - Get current maximum recursion depth
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

## Interactive Examples

Visit the `docs/` folder for interactive examples demonstrating the Story Grammar library:

### 🏰 Fantasy Kingdom Generator

**File:** [`docs/fantasy-kingdom-example.html`](docs/fantasy-kingdom-example.html)  
**Live Demo:** [https://videlais.github.io/story-grammar/fantasy-kingdom-example.html](https://videlais.github.io/story-grammar/fantasy-kingdom-example.html)

A complete interactive example that generates 12 generations of fantasy kingdoms with dramatic endings.

### 🎲 Function Rules Example

**File:** [`docs/function-rules-example.html`](docs/function-rules-example.html)  
**Live Demo:** [https://dancox.github.io/story-grammar/function-rules-example.html](https://dancox.github.io/story-grammar/function-rules-example.html)

Demonstrates dynamic rule generation using function-based rules. Features:

- **Dynamic Content**: Rules that generate different values each time
- **Random Numbers**: Dice rolls, percentages, and random values
- **Real-time Data**: Current timestamps and calculated values
- **Interactive Examples**: Live demonstration of function vs static rules

### ⚖️ Weighted Rules Example

**File:** [`docs/weighted-rules-example.html`](docs/weighted-rules-example.html)  
**Live Demo:** [https://dancox.github.io/story-grammar/weighted-rules-example.html](https://dancox.github.io/story-grammar/weighted-rules-example.html)

Showcases probability-based rule selection with custom weights. Features:

- **Realistic Distributions**: Common items appear more frequently than rare ones
- **Statistical Verification**: 1000-sample tests verify weight accuracy
- **Comparative Analysis**: Side-by-side weighted vs equal probability
- **Interactive Controls**: Live weight adjustment and result generation

### 🐉 D&D Encounter Generator

**File:** [`docs/dnd-encounter-generator.html`](docs/dnd-encounter-generator.html)  
**Live Demo:** [https://videlais.github.io/story-grammar/dnd-encounter-generator.html](https://videlais.github.io/story-grammar/dnd-encounter-generator.html)

A dynamic D&D encounter generator that fetches real monster data from GitHub and creates procedural encounters. Features:

- **External API Integration**: Fetches 1000+ monsters from D&D monster database
- **Smart Categorization**: Filters monsters by Challenge Rating for balanced encounters
- **Advanced Grammar**: Multi-variable templates with weighted probability distributions
- **Real-time Statistics**: Tracks monster usage, encounter difficulty, and trends
- **Professional UI**: Game-quality interface with responsive design

Demonstrates complex data integration, statistical analysis, and advanced grammar usage patterns.

### Additional Examples

See [`docs/README.md`](docs/README.md) for comprehensive documentation of all examples, usage patterns, and integration guides.
