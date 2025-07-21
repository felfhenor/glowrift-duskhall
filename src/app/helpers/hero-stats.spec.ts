import {
  heroBaseStat,
  heroEquipmentStat,
  heroStats,
  heroTotalStat,
  recalculateStats,
} from '@helpers/hero-stats';
import type {
  EquipmentBlock,
  EquipmentItemId,
  Hero,
  HeroId,
  StatBlock,
} from '@interfaces';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dependencies
vi.mock('@helpers/hero', () => ({
  updateHeroData: vi.fn(),
  getHero: vi.fn(),
}));

vi.mock('@helpers/item', () => ({
  getItemStat: vi.fn(),
}));

import { getHero, updateHeroData } from '@helpers/hero';
import { getItemStat } from '@helpers/item';

describe('Hero Stats Functions', () => {
  let testHero: Hero;
  const baseStats: StatBlock = {
    Force: 10,
    Health: 20,
    Speed: 2,
    Aura: 3,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    testHero = {
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
  });

  describe('heroBaseStat', () => {
    it('should return base stat value', () => {
      expect(heroBaseStat(testHero, 'Force')).toBe(10);
      expect(heroBaseStat(testHero, 'Health')).toBe(20);
      expect(heroBaseStat(testHero, 'Speed')).toBe(2);
      expect(heroBaseStat(testHero, 'Aura')).toBe(3);
    });
  });

  describe('heroEquipmentStat', () => {
    it('should return sum of equipment stats', () => {
      vi.mocked(getItemStat)
        .mockReturnValueOnce(5) // weapon
        .mockReturnValueOnce(3); // armor

      const equipment: EquipmentBlock = {
        weapon: {
          id: 'weapon-1' as EquipmentItemId,
          __type: 'weapon',
          baseStats: {},
          rarity: 'Common',
          dropLevel: 1,
          sprite: '',
        },
        armor: {
          id: 'armor-1' as EquipmentItemId,
          __type: 'armor',
          baseStats: {},
          rarity: 'Common',
          dropLevel: 1,
          sprite: '',
        },
        accessory: undefined,
        trinket: undefined,
      };

      testHero.equipment = equipment;

      expect(heroEquipmentStat(testHero, 'Force')).toBe(8);
    });

    it('should return 0 when no equipment is present', () => {
      expect(heroEquipmentStat(testHero, 'Force')).toBe(0);
    });
  });

  describe('heroTotalStat', () => {
    it('should return sum of base and equipment stats', () => {
      vi.mocked(getItemStat).mockReturnValue(5);

      testHero.equipment = {
        weapon: {
          id: 'weapon-1' as EquipmentItemId,
          __type: 'weapon',
          baseStats: {},
          rarity: 'Common',
          dropLevel: 1,
          sprite: '',
        },
        armor: undefined,
        accessory: undefined,
        trinket: undefined,
      };

      expect(heroTotalStat(testHero, 'Force')).toBe(15); // 10 base + 5 equipment
    });
  });

  describe('heroStats', () => {
    it('should return complete stat block with totals', () => {
      vi.mocked(getItemStat).mockReturnValue(2);

      testHero.equipment = {
        weapon: {
          id: 'weapon-1' as EquipmentItemId,
          __type: 'weapon',
          baseStats: {},
          rarity: 'Common',
          dropLevel: 1,
          sprite: '',
        },
        armor: {
          id: 'armor-1' as EquipmentItemId,
          __type: 'armor',
          baseStats: {},
          rarity: 'Common',
          dropLevel: 1,
          sprite: '',
        },
        accessory: undefined,
        trinket: undefined,
      };

      const stats = heroStats(testHero);
      expect(stats).toEqual({
        Force: 14, // 10 base + 4 equipment
        Health: 24, // 20 base + 4 equipment
        Speed: 6, // 2 base + 4 equipment
        Aura: 7, // 3 base + 4 equipment
      });
    });
  });

  describe('recalculateStats', () => {
    it('should update hero stats and HP', () => {
      vi.mocked(getHero).mockReturnValue(testHero);
      vi.mocked(getItemStat).mockReturnValue(2);

      recalculateStats(testHero.id);

      expect(updateHeroData).toHaveBeenCalledWith(testHero.id, {
        totalStats: {
          Force: 10,
          Health: 20,
          Speed: 2,
          Aura: 3,
        },
        hp: 20,
      });
    });

    it('should do nothing if hero is not found', () => {
      vi.mocked(getHero).mockReturnValue(undefined);

      recalculateStats('non-existent' as HeroId);

      expect(updateHeroData).not.toHaveBeenCalled();
    });
  });
});
