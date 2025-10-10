/**
 * Seeded random number generator using Linear Congruential Generator (LCG)
 * Provides deterministic pseudo-random numbers for reproducible text generation
 */
export declare class SeededRandom {
    private seed;
    private currentSeed;
    /**
     * Set a seed for deterministic random generation
     * @param seed - Integer seed value
     */
    setSeed(seed: number): void;
    /**
     * Clear the seed and return to using Math.random()
     */
    clearSeed(): void;
    /**
     * Get the current seed value
     * @returns Current seed or null if using Math.random()
     */
    getSeed(): number | null;
    /**
     * Generate a random number between 0 and 1
     * Uses LCG when seed is set, Math.random() otherwise
     * @returns Random number between 0 and 1
     */
    random(): number;
    /**
     * Get a random integer between min (inclusive) and max (exclusive)
     * @param min - Minimum value (inclusive)
     * @param max - Maximum value (exclusive)
     * @returns Random integer
     */
    randomInt(min: number, max: number): number;
    /**
     * Get a random element from an array
     * @param array - Array to choose from
     * @returns Random element from array
     */
    randomChoice<T>(array: T[]): T;
    /**
     * Get a weighted random element from arrays of values and weights
     * @param values - Array of values
     * @param cumulativeWeights - Array of cumulative weights
     * @returns Weighted random value
     */
    weightedChoice<T>(values: T[], cumulativeWeights: number[]): T;
}
//# sourceMappingURL=SeededRandom.d.ts.map