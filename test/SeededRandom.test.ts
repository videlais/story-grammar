import { SeededRandom } from '../src/utils/SeededRandom';

describe('SeededRandom', () => {
  let random: SeededRandom;

  beforeEach(() => {
    random = new SeededRandom();
  });

  it('produces deterministic sequence when seed is set', () => {
    random.setSeed(12345);
    const firstRun = [random.random(), random.random(), random.random()];

    random.setSeed(12345);
    const secondRun = [random.random(), random.random(), random.random()];

    expect(secondRun).toEqual(firstRun);
  });

  it('uses Math.random when no seed is set', () => {
    const mathRandomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.123456);

    try {
      expect(random.random()).toBe(0.123456);
    } finally {
      mathRandomSpy.mockRestore();
    }
  });

  it('clears seed state back to unseeded mode', () => {
    random.setSeed(42);
    expect(random.getSeed()).toBe(42);

    random.clearSeed();
    expect(random.getSeed()).toBeNull();
  });

  it('validates integer seed values', () => {
    expect(() => random.setSeed(1.5)).toThrow('Seed must be an integer');
  });

  it('throws when choosing from an empty array', () => {
    expect(() => random.randomChoice([])).toThrow('Cannot choose from empty array');
  });

  it('chooses a weighted value based on cumulative weights', () => {
    const randomSpy = jest.spyOn(random, 'random').mockReturnValue(0.3);

    try {
      const value = random.weightedChoice(['a', 'b', 'c'], [0.2, 0.5, 1.0]);
      expect(value).toBe('b');
    } finally {
      randomSpy.mockRestore();
    }
  });

  it('falls back to the last weighted value when random exceeds all cumulative weights', () => {
    const randomSpy = jest.spyOn(random, 'random').mockReturnValue(0.95);

    try {
      const value = random.weightedChoice(['a', 'b'], [0.1, 0.2]);
      expect(value).toBe('b');
    } finally {
      randomSpy.mockRestore();
    }
  });

  it('validates weightedChoice input array lengths', () => {
    expect(() => random.weightedChoice(['a', 'b'], [1.0])).toThrow('Values and weights arrays must have same length');
  });

  it('validates weightedChoice empty inputs', () => {
    expect(() => random.weightedChoice([], [])).toThrow('Cannot choose from empty arrays');
  });
});
