import { Parser } from '../src/Parser';

// Create a parser
const parser = new Parser();

// Add rules with different types
parser.addWeightedRule('rarity', ['common', 'rare', 'legendary'], [0.7, 0.2, 0.1]);
parser.addRule('items', ['sword', 'shield']);
parser.addRule('loot', ['%rarity% %items%']);
parser.addRangeRule('level', { min: 1, max: 5, type: 'integer' });

console.log('=== Probability Analysis Example ===');

// Test individual rule probability
console.log('\n--- Weighted Rule Probabilities ---');
const rarityAnalysis = parser.calculateProbabilities('rarity');
console.log('Rarity outcomes:');
rarityAnalysis.outcomes.forEach(outcome => {
  console.log(`  ${outcome.outcome}: ${(outcome.probability * 100).toFixed(1)}%`);
});

// Test complex rule probability
console.log('\n--- Complex Rule Probabilities ---');
const lootAnalysis = parser.calculateProbabilities('loot');
console.log(`Total loot combinations: ${lootAnalysis.totalOutcomes}`);
console.log(`Entropy: ${lootAnalysis.entropy.toFixed(2)}`);

console.log('\nMost probable loot:');
lootAnalysis.mostProbable.slice(0, 3).forEach(outcome => {
  console.log(`  ${outcome.outcome}: ${(outcome.probability * 100).toFixed(1)}%`);
});

console.log('\nLeast probable loot:');
lootAnalysis.leastProbable.slice(0, 3).forEach(outcome => {
  console.log(`  ${outcome.outcome}: ${(outcome.probability * 100).toFixed(1)}%`);
});

// Test convenience methods
console.log('\n--- Convenience Methods ---');
const mostProbable = parser.getMostProbableOutcome('loot');
const leastProbable = parser.getLeastProbableOutcome('loot');

console.log(`Most likely outcome: ${mostProbable?.outcome} (${((mostProbable?.probability ?? 0) * 100).toFixed(1)}%)`);
console.log(`Rarest outcome: ${leastProbable?.outcome} (${((leastProbable?.probability ?? 0) * 100).toFixed(1)}%)`);

// Test range rule probability
console.log('\n--- Range Rule Probabilities ---');
const levelAnalysis = parser.calculateProbabilities('level');
console.log('Level distribution:');
levelAnalysis.outcomes.forEach(outcome => {
  console.log(`  Level ${outcome.outcome}: ${(outcome.probability * 100).toFixed(1)}%`);
});

console.log('\n=== Analysis Complete ===');