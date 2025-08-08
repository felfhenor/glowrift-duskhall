import { heroXpRequiredForLevelUp } from '@helpers/hero-xp';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dependencies
vi.mock('@helpers/hero', () => ({
  updateHeroData: vi.fn(),
}));

vi.mock('@helpers/hero-stats', () => ({
  recalculateStats: vi.fn(),
}));

vi.mock('@helpers/state-game', () => ({
  gamestate: vi.fn(),
  updateGamestate: vi.fn(),
}));

vi.mock('@helpers/rng', () => ({
  seededrng: vi.fn(),
  randomChoice: vi.fn(),
}));

describe('Hero XP Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('heroXpRequiredForLevelUp', () => {
    it('should calculate correct XP requirement for different levels', () => {
      expect(heroXpRequiredForLevelUp(1)).toBe(40); // 10 * (1 + 1)^2
      expect(heroXpRequiredForLevelUp(5)).toBe(360); // 10 * (5 + 1)^2
      expect(heroXpRequiredForLevelUp(10)).toBe(1210); // 10 * (10 + 1)^2
    });
  });
});
