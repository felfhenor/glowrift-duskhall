import {
  rngChoice,
  rngChoiceIdentifiable,
  rngGame,
  rngNumber,
  rngNumberRange,
  rngSeeded,
  rngShuffle,
  rngSucceedsChance,
  rngUuid,
} from '@helpers/rng';
import type { Identifiable } from '@interfaces';
import type { PRNG } from 'seedrandom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock uuid
vi.mock('uuid', () => ({
  v4: vi.fn(() => 'mock-uuid'),
}));

// Mock worldGameId
vi.mock('@helpers/world', () => ({
  worldGameId: vi.fn(() => 'game-uuid'),
}));

describe('RNG Helper Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('uuid', () => {
    it('should return a uuid string', () => {
      expect(rngUuid()).toBe('mock-uuid');
    });
  });

  describe('seededrng', () => {
    it('should return consistent results for same seed', () => {
      const rng1 = rngSeeded('test-seed');
      const rng2 = rngSeeded('test-seed');

      expect(rng1()).toBe(rng2());
    });

    it('should return different results for different seeds', () => {
      const rng1 = rngSeeded('test-seed-1');
      const rng2 = rngSeeded('test-seed-2');

      expect(rng1()).not.toBe(rng2());
    });
  });

  describe('gamerng', () => {
    it('should use game id as seed', () => {
      const rng = rngGame();
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
      const result = rngChoiceIdentifiable(choices, rngSeeded(seed));

      expect(choices.some((c) => c.id === result)).toBeTruthy();
    });
  });

  describe('randomNumber', () => {
    it('should return number within range', () => {
      const max = 10;
      const result = rngNumber(max, rngSeeded('test-seed'));

      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThan(max);
    });
  });

  describe('randomNumberRange', () => {
    it('should return number within specified range', () => {
      const min = 5;
      const max = 10;
      const result = rngNumberRange(min, max, rngSeeded('test-seed'));

      expect(result).toBeGreaterThanOrEqual(min);
      expect(result).toBeLessThan(max);
    });
  });

  describe('succeedsChance', () => {
    it('should return true when random value is within chance', () => {
      const mockRng = () => 0.5; // 50%
      expect(rngSucceedsChance(75, mockRng as PRNG)).toBeTruthy();
    });

    it('should return false when random value exceeds chance', () => {
      const mockRng = () => 0.8; // 80%
      expect(rngSucceedsChance(50, mockRng as PRNG)).toBeFalsy();
    });
  });

  describe('randomChoice', () => {
    it('should return an item from the choices array', () => {
      const choices = ['a', 'b', 'c'];
      const result = rngChoice(choices, rngSeeded('test-seed'));

      expect(choices).toContain(result);
    });

    describe('shufflerng', () => {
      it('should return array with same length as input', () => {
        const choices = ['a', 'b', 'c'];
        const result = rngShuffle(choices, rngSeeded('test-seed'));
        expect(result.length).toBe(choices.length);
      });

      it('should contain all original elements', () => {
        const choices = ['a', 'b', 'c'];
        const result = rngShuffle(choices, rngSeeded('test-seed'));
        expect(result).toEqual(expect.arrayContaining(choices));
      });

      it('should maintain consistent order with same seed', () => {
        const choices = ['a', 'b', 'c'];
        const result1 = rngShuffle(choices, rngSeeded('test-seed'));
        const result2 = rngShuffle(choices, rngSeeded('test-seed'));
        expect(result1).toEqual(result2);
      });

      it('should not modify original array', () => {
        const choices = ['a', 'b', 'c'];
        const original = [...choices];
        rngShuffle(choices, rngSeeded('test-seed'));
        expect(choices).toEqual(original);
      });
    });
  });
});
