import {
  heroGainXp,
  heroLevelUp,
  heroXpRequiredForLevelUp,
} from '@helpers/hero-xp';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Hero, HeroId, StatBlock } from '@interfaces';

// Mock dependencies
vi.mock('@helpers/hero', () => ({
  updateHeroData: vi.fn(),
}));

vi.mock('@helpers/hero-stats', () => ({
  recalculateStats: vi.fn(),
}));

vi.mock('@helpers/state-game', () => ({
  gamestate: vi.fn(),
}));

vi.mock('@helpers/rng', () => ({
  seededrng: vi.fn(),
  randomChoice: vi.fn(),
}));

import { updateHeroData } from '@helpers/hero';
import { recalculateStats } from '@helpers/hero-stats';
import { randomChoice } from '@helpers/rng';
import { gamestate } from '@helpers/state-game';

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

  describe('heroLevelUp', () => {
    it('should level up hero with correct stat increases', () => {
      const baseStats: StatBlock = {
        Force: 10,
        Health: 20,
        Speed: 2,
        Aura: 3,
      };

      const hero: Hero = {
        id: 'test-hero-1' as HeroId,
        name: 'Test Hero',
        level: 1,
        xp: 0,
        hp: 20,
        baseStats,
        totalStats: baseStats,
        equipment: {
          accessory: undefined,
          armor: undefined,
          trinket: undefined,
          weapon: undefined,
        },
        skills: [],
        talents: {},
        sprite: 'hero-1',
        frames: 1,
        targettingType: 'Random',
      };

      vi.mocked(randomChoice)
        .mockReturnValueOnce(2) // Force
        .mockReturnValueOnce(5) // Health
        .mockReturnValueOnce(0.3) // Speed
        .mockReturnValueOnce(1); // Aura

      vi.mocked(gamestate).mockReturnValue({
        hero: {
          heroes: [hero],
        },
      } as ReturnType<typeof gamestate>);

      heroLevelUp(hero);

      expect(updateHeroData).toHaveBeenCalledWith(hero.id, {
        level: 2,
        xp: 0,
        baseStats: {
          Force: 12,
          Health: 25,
          Speed: 2.3,
          Aura: 4,
        },
        hp: 25,
      });

      expect(recalculateStats).toHaveBeenCalledWith(hero.id);
    });
  });

  describe('heroGainXp', () => {
    it('should update XP without leveling up if below requirement', () => {
      const hero: Hero = {
        id: 'test-hero-2' as HeroId,
        name: 'Test Hero',
        level: 1,
        xp: 0,
        hp: 20,
        baseStats: { Force: 10, Health: 20, Speed: 2, Aura: 3 },
        totalStats: { Force: 10, Health: 20, Speed: 2, Aura: 3 },
        equipment: {
          accessory: undefined,
          armor: undefined,
          trinket: undefined,
          weapon: undefined,
        },
        skills: [],
        talents: {},
        sprite: 'hero-2',
        frames: 1,
        targettingType: 'Random',
      };

      heroGainXp(hero, 20);

      expect(updateHeroData).toHaveBeenCalledWith(hero.id, { xp: 20 });
    });

    it('should level up hero if XP requirement is met', () => {
      const hero: Hero = {
        id: 'test-hero-3' as HeroId,
        name: 'Test Hero',
        level: 1,
        xp: 35,
        hp: 20,
        baseStats: { Force: 10, Health: 20, Speed: 2, Aura: 3 },
        totalStats: { Force: 10, Health: 20, Speed: 2, Aura: 3 },
        equipment: {
          accessory: undefined,
          armor: undefined,
          trinket: undefined,
          weapon: undefined,
        },
        skills: [],
        talents: {},
        sprite: 'hero-3',
        frames: 1,
        targettingType: 'Random',
      };

      vi.mocked(gamestate).mockReturnValue({
        hero: {
          heroes: [hero],
        },
      } as ReturnType<typeof gamestate>);

      heroGainXp(hero, 10); // This should trigger level up at 40 XP

      expect(updateHeroData).toHaveBeenCalledWith(hero.id, { xp: 40 });
    });

    it('should not level up hero at max level 99', () => {
      const hero: Hero = {
        id: 'test-hero-4' as HeroId,
        name: 'Test Hero',
        level: 99,
        xp: 0,
        hp: 20,
        baseStats: { Force: 10, Health: 20, Speed: 2, Aura: 3 },
        totalStats: { Force: 10, Health: 20, Speed: 2, Aura: 3 },
        equipment: {
          accessory: undefined,
          armor: undefined,
          trinket: undefined,
          weapon: undefined,
        },
        skills: [],
        talents: {},
        sprite: 'hero-4',
        frames: 1,
        targettingType: 'Random',
      };

      heroGainXp(hero, 1000000);

      expect(updateHeroData).toHaveBeenCalledWith(hero.id, {
        xp: heroXpRequiredForLevelUp(99),
      });
    });
  });
});
