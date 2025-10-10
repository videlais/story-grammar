/**
 * Seeded random number generator using Linear Congruential Generator (LCG)
 * Provides deterministic pseudo-random numbers for reproducible text generation
 */
export class SeededRandom {
    constructor() {
        this.seed = null;
        this.currentSeed = 0;
    }
    /**
     * Set a seed for deterministic random generation
     * @param seed - Integer seed value
     */
    setSeed(seed) {
        if (!Number.isInteger(seed)) {
            throw new Error('Seed must be an integer');
        }
        this.seed = Math.abs(seed) >>> 0; // Convert to 32-bit unsigned integer
        this.currentSeed = this.seed;
    }
    /**
     * Clear the seed and return to using Math.random()
     */
    clearSeed() {
        this.seed = null;
        this.currentSeed = 0;
    }
    /**
     * Get the current seed value
     * @returns Current seed or null if using Math.random()
     */
    getSeed() {
        return this.seed;
    }
    /**
     * Generate a random number between 0 and 1
     * Uses LCG when seed is set, Math.random() otherwise
     * @returns Random number between 0 and 1
     */
    random() {
        if (this.seed === null) {
            return Math.random();
        }
        // Linear Congruential Generator (LCG)
        // Using parameters from Numerical Recipes: a=1664525, c=1013904223, m=2^32
        this.currentSeed = (this.currentSeed * 1664525 + 1013904223) >>> 0;
        return this.currentSeed / 0x100000000; // Convert to 0-1 range
    }
    /**
     * Get a random integer between min (inclusive) and max (exclusive)
     * @param min - Minimum value (inclusive)
     * @param max - Maximum value (exclusive)
     * @returns Random integer
     */
    randomInt(min, max) {
        return Math.floor(this.random() * (max - min)) + min;
    }
    /**
     * Get a random element from an array
     * @param array - Array to choose from
     * @returns Random element from array
     */
    randomChoice(array) {
        if (array.length === 0) {
            throw new Error('Cannot choose from empty array');
        }
        const index = this.randomInt(0, array.length);
        return array[index];
    }
    /**
     * Get a weighted random element from arrays of values and weights
     * @param values - Array of values
     * @param cumulativeWeights - Array of cumulative weights
     * @returns Weighted random value
     */
    weightedChoice(values, cumulativeWeights) {
        if (values.length !== cumulativeWeights.length) {
            throw new Error('Values and weights arrays must have same length');
        }
        if (values.length === 0) {
            throw new Error('Cannot choose from empty arrays');
        }
        const random = this.random();
        // Find the first cumulative weight that is greater than our random number
        for (let i = 0; i < cumulativeWeights.length; i++) {
            if (random <= cumulativeWeights[i]) {
                return values[i];
            }
        }
        // Fallback to last value (should not happen with proper weights)
        return values[values.length - 1];
    }
}
//# sourceMappingURL=SeededRandom.js.map