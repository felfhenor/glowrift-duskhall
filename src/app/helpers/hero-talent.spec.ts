import {
  canHeroBuyTalent,
  heroHasTalent,
  heroRemainingTalentPoints,
  heroSpendTalentPoint,
} from '@helpers/hero-talent';
import type {
  Hero,
  HeroId,
  StatBlock,
  TalentContent,
  TalentId,
} from '@interfaces';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dependencies
vi.mock('@helpers/content', () => ({
  getEntry: vi.fn(),
}));

vi.mock('@helpers/hero', () => ({
  updateHeroData: vi.fn(),
}));

import { updateHeroData } from '@helpers/hero';

describe('Hero Talent Functions', () => {
  let testHero: Hero;
  const baseStats: StatBlock = {
    Force: 5,
    Health: 10,
    Speed: 1,
    Aura: 1,
  };

  beforeEach(() => {
    testHero = {
      id: 'test-hero-1' as HeroId,
      name: 'Test Hero',
      level: 10,
      xp: 0,
      hp: 10,
      baseStats,
      totalStats: baseStats,
      equipment: {
        accessory: undefined,
        armor: undefined,
        trinket: undefined,
        weapon: undefined,
      },
      skills: [],
      talents: {
        'talent-1': 1,
        'talent-2': 2,
      },
      sprite: 'hero-1',
      frames: 1,
      targettingType: 'Random',
    };
  });

  describe('heroRemainingTalentPoints', () => {
    it('should calculate remaining talent points correctly', () => {
      // 10 (level) - 3 (spent points) = 2 remaining
      expect(heroRemainingTalentPoints(testHero)).toBe(2);
    });

    it('should return full level/2 when no talents are spent', () => {
      testHero.talents = {};
      expect(heroRemainingTalentPoints(testHero)).toBe(5);
    });
  });

  describe('heroSpendTalentPoint', () => {
    it('should increment existing talent level', () => {
      heroSpendTalentPoint(testHero, 'talent-1');
      expect(updateHeroData).toHaveBeenCalledWith(testHero.id, {
        talents: {
          'talent-1': 2,
          'talent-2': 2,
        },
      });
    });

    it('should add new talent with level 1', () => {
      heroSpendTalentPoint(testHero, 'talent-3');
      expect(updateHeroData).toHaveBeenCalledWith(testHero.id, {
        talents: {
          'talent-1': 1,
          'talent-2': 2,
          'talent-3': 1,
        },
      });
    });
  });

  describe('heroHasTalent', () => {
    it('should return true for learned talents', () => {
      expect(heroHasTalent(testHero, 'talent-1')).toBe(true);
    });

    it('should return false for unlearned talents', () => {
      expect(heroHasTalent(testHero, 'talent-3')).toBe(false);
    });
  });

  describe('canHeroBuyTalent', () => {
    const testTalent: TalentContent = {
      id: 'new-talent' as TalentId,
      name: 'New Talent',
      __type: 'talent',
      sprite: 'new-talent',
      description: 'Test talent',
      applyToElements: [],
      applyToSkillIds: [],
      boostStats: baseStats,
      applyToStatusEffectIds: [],
      boostedStatusEffectChance: 0,
      boostStatusEffectStats: baseStats,
    };

    it('should return true when all conditions are met', () => {
      expect(canHeroBuyTalent(testHero, testTalent, 5)).toBe(true);
    });

    it('should return false for "Blank Talent"', () => {
      const blankTalent = { ...testTalent, name: 'Blank Talent' };
      expect(canHeroBuyTalent(testHero, blankTalent, 5)).toBe(false);
    });

    it('should return false when hero level is too low', () => {
      expect(canHeroBuyTalent(testHero, testTalent, 11)).toBe(false);
    });

    it('should return false when hero has no remaining points', () => {
      testHero.talents = {
        'talent-1': 3,
        'talent-2': 2,
      };
      expect(canHeroBuyTalent(testHero, testTalent, 5)).toBe(false);
    });

    it('should return false when required talent is not learned', () => {
      const talentWithRequirement = {
        ...testTalent,
        requireTalentId: 'required-talent',
      };
      expect(canHeroBuyTalent(testHero, talentWithRequirement, 5)).toBe(false);
    });
  });
});
