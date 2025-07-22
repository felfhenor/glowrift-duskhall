import {
  gamerng,
  randomChoice,
  randomIdentifiableChoice,
  randomNumber,
  randomNumberRange,
  seededrng,
  shufflerng,
  succeedsChance,
  uuid,
} from '@helpers/rng';
import type { Identifiable } from '@interfaces';
import type { PRNG } from 'seedrandom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock uuid
vi.mock('uuid', () => ({
  v4: vi.fn(() => 'mock-uuid'),
}));

// Mock myGameId
vi.mock('@helpers/state-game', () => ({
  myGameId: vi.fn(() => 'game-uuid'),
}));

describe('RNG Helper Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('uuid', () => {
    it('should return a uuid string', () => {
      expect(uuid()).toBe('mock-uuid');
    });
  });

  describe('seededrng', () => {
    it('should return consistent results for same seed', () => {
      const rng1 = seededrng('test-seed');
      const rng2 = seededrng('test-seed');

      expect(rng1()).toBe(rng2());
    });

    it('should return different results for different seeds', () => {
      const rng1 = seededrng('test-seed-1');
      const rng2 = seededrng('test-seed-2');

      expect(rng1()).not.toBe(rng2());
    });
  });

  describe('gamerng', () => {
    it('should use game id as seed', () => {
      const rng = gamerng();
      expect(rng).toBeInstanceOf(Function);
    });
  });

  describe('randomIdentifiableChoice', () => {
    it('should return an id from the choices array', () => {
      const choices: Identifiable[] = [
        { id: 'id1', name: 'test1' },
        { id: 'id2', name: 'test2' },
      ];

      const seed = 'test-seed';
      const result = randomIdentifiableChoice(choices, seededrng(seed));

      expect(choices.some((c) => c.id === result)).toBeTruthy();
    });
  });

  describe('randomNumber', () => {
    it('should return number within range', () => {
      const max = 10;
      const result = randomNumber(max, seededrng('test-seed'));

      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThan(max);
    });
  });

  describe('randomNumberRange', () => {
    it('should return number within specified range', () => {
      const min = 5;
      const max = 10;
      const result = randomNumberRange(min, max, seededrng('test-seed'));

      expect(result).toBeGreaterThanOrEqual(min);
      expect(result).toBeLessThan(max);
    });
  });

  describe('succeedsChance', () => {
    it('should return true when random value is within chance', () => {
      const mockRng: PRNG = () => 0.5; // 50%
      expect(succeedsChance(75, mockRng)).toBeTruthy();
    });

    it('should return false when random value exceeds chance', () => {
      const mockRng: PRNG = () => 0.8; // 80%
      expect(succeedsChance(50, mockRng)).toBeFalsy();
    });
  });

  describe('randomChoice', () => {
    it('should return an item from the choices array', () => {
      const choices = ['a', 'b', 'c'];
      const result = randomChoice(choices, seededrng('test-seed'));

      expect(choices).toContain(result);
    });

    describe('shufflerng', () => {
      it('should return array with same length as input', () => {
        const choices = ['a', 'b', 'c'];
        const result = shufflerng(choices, seededrng('test-seed'));
        expect(result.length).toBe(choices.length);
      });

      it('should contain all original elements', () => {
        const choices = ['a', 'b', 'c'];
        const result = shufflerng(choices, seededrng('test-seed'));
        expect(result).toEqual(expect.arrayContaining(choices));
      });

      it('should maintain consistent order with same seed', () => {
        const choices = ['a', 'b', 'c'];
        const result1 = shufflerng(choices, seededrng('test-seed'));
        const result2 = shufflerng(choices, seededrng('test-seed'));
        expect(result1).toEqual(result2);
      });

      it('should not modify original array', () => {
        const choices = ['a', 'b', 'c'];
        const original = [...choices];
        shufflerng(choices, seededrng('test-seed'));
        expect(choices).toEqual(original);
      });
    });
  });
});
