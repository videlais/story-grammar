/**
 * Example demonstrating the new modifiers namespace structure
 */

import { Parser, Modifiers } from '../dist/index.js';

console.log('=== Story Grammar Modifiers Namespace Example ===\n');

const parser = new Parser();

// Load individual modifiers from the English namespace
parser.loadModifier(Modifiers.English.ArticleModifier);
parser.loadModifier(Modifiers.English.PluralizationModifier);
parser.loadModifier(Modifiers.English.CapitalizationModifier);

// Add some rules that will demonstrate the modifiers
parser.addRule('animal', ['elephant', 'umbrella', 'owl', 'horse']);
parser.addRule('quantity', ['many', 'several', 'few']);

console.log('1. Article Modifier Demo:');
for (let i = 0; i < 5; i++) {
  console.log(`   - "a ${parser.parse('%animal%')}" -> "a %animal%"`);
}

console.log('\n2. Pluralization Modifier Demo:');
for (let i = 0; i < 5; i++) {
  console.log(`   - "%quantity% %animal%" -> "${parser.parse('%quantity% %animal%')}"`);
}

console.log('\n3. Combined Modifiers Demo:');
parser.addRule('sentence', ['a %animal% is here.', '%quantity% %animal% are there.', 'i saw a %animal% today.']);
for (let i = 0; i < 5; i++) {
  console.log(`   - "${parser.parse('%sentence%')}"`);
}

console.log('\n4. Namespace Import Demo:');
console.log(`   - Available English modifiers: ${Modifiers.English.AllEnglishModifiers.length}`);
console.log(`   - Backward compatibility: ${Modifiers.AllEnglishModifiers.length} modifiers`);

console.log('\n=== Example completed successfully! ===');