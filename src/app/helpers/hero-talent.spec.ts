import {
  heroCanBuyTalent,
  heroHasTalent,
  heroRemainingTalentPoints,
  heroSpendTalentPoint,
  heroTalentsInvestedInTree,
} from '@helpers/hero-talent';
import type {
  Hero,
  HeroId,
  StatBlock,
  TalentContent,
  TalentId,
  TalentTreeContent,
  TalentTreeId,
} from '@interfaces';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dependencies
vi.mock('@helpers/content', () => ({
  getEntry: vi.fn(),
}));

vi.mock('@helpers/hero', () => ({
  heroUpdateData: vi.fn(),
}));

vi.mock('@helpers/talent', () => ({
  talentIdsInTalentTree: vi.fn(),
}));

vi.mock('@helpers/defaults', () => ({
  defaultTownStats: vi.fn(),
  defaultCombatStats: vi.fn(),
}));

import { defaultCombatStats, defaultTownStats } from '@helpers/defaults';
import { heroUpdateData } from '@helpers/hero';
import { talentIdsInTalentTree } from '@helpers/talent';

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
      expect(heroUpdateData).toHaveBeenCalledWith(testHero.id, {
        talents: {
          'talent-1': 2,
          'talent-2': 2,
        },
      });
    });

    it('should add new talent with level 1', () => {
      heroSpendTalentPoint(testHero, 'talent-3');
      expect(heroUpdateData).toHaveBeenCalledWith(testHero.id, {
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

  describe('heroTalentsInvestedInTree', () => {
    let testTalentTree: TalentTreeContent;

    beforeEach(() => {
      testTalentTree = {
        id: 'fire-tree' as TalentTreeId,
        name: 'Fire Talent Tree',
        __type: 'talenttree',
        talents: [
          {
            level: 0,
            learnableTalents: [
              { talentId: 'talent-1' as TalentId },
              { talentId: 'talent-2' as TalentId },
            ],
          },
        ],
      };

      vi.mocked(talentIdsInTalentTree).mockReturnValue([
        'talent-1' as TalentId,
        'talent-2' as TalentId,
        'talent-3' as TalentId,
      ]);
    });

    it('should calculate total talents invested in tree', () => {
      expect(heroTalentsInvestedInTree(testHero, testTalentTree)).toBe(3); // talent-1 (1) + talent-2 (2) = 3
    });

    it('should return 0 when no talents from tree are invested', () => {
      testHero.talents = { 'other-talent': 2 };
      expect(heroTalentsInvestedInTree(testHero, testTalentTree)).toBe(0);
    });

    it('should sum all talent levels in tree', () => {
      testHero.talents = {
        'talent-1': 2,
        'talent-2': 3,
        'talent-3': 1,
        'other-talent': 5, // not in tree
      };
      expect(heroTalentsInvestedInTree(testHero, testTalentTree)).toBe(6); // 2+3+1
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
      applyToAllSkills: false,
      applyToAllStatusEffects: false,
      applyToAttributes: [],
      boostedStatusEffectDuration: 0,
      additionalTargets: 0,
      chanceToIgnoreConsume: 0,
      applyStatusEffects: [],
      combatStats: defaultCombatStats(),
      townStats: defaultTownStats(),
      addTechniques: [],
    };

    let testTalentTree: TalentTreeContent;

    beforeEach(() => {
      testTalentTree = {
        id: 'fire-tree' as TalentTreeId,
        name: 'Fire Talent Tree',
        __type: 'talenttree',
        talents: [],
      };

      vi.mocked(talentIdsInTalentTree).mockReturnValue([
        'talent-1' as TalentId,
        'talent-2' as TalentId,
      ]);
    });

    it('should return true when all conditions are met', () => {
      expect(heroCanBuyTalent(testHero, testTalent, 5)).toBe(true);
    });

    it('should return true when investment requirement is met', () => {
      expect(heroCanBuyTalent(testHero, testTalent, 5, testTalentTree, 2)).toBe(
        true,
      ); // hero has 3 invested, need 2
      expect(heroCanBuyTalent(testHero, testTalent, 5, testTalentTree, 3)).toBe(
        true,
      ); // hero has 3 invested, need 3
    });

    it('should return false when investment requirement is not met', () => {
      expect(heroCanBuyTalent(testHero, testTalent, 5, testTalentTree, 5)).toBe(
        false,
      ); // hero has 3 invested, need 5
    });

    it('should work with no investment requirement', () => {
      expect(heroCanBuyTalent(testHero, testTalent, 5, testTalentTree)).toBe(
        true,
      ); // no requirement specified
    });

    it('should return false for "Blank Talent"', () => {
      const blankTalent = { ...testTalent, name: 'Blank Talent' };
      expect(heroCanBuyTalent(testHero, blankTalent, 5)).toBe(false);
    });

    it('should return false when hero level is too low', () => {
      expect(heroCanBuyTalent(testHero, testTalent, 11)).toBe(false);
    });

    it('should return false when hero has no remaining points', () => {
      testHero.talents = {
        'talent-1': 3,
        'talent-2': 2,
      };
      expect(heroCanBuyTalent(testHero, testTalent, 5)).toBe(false);
    });

    it('should return false when required talent is not learned', () => {
      const talentWithRequirement = {
        ...testTalent,
        requireTalentId: 'required-talent',
      };
      expect(heroCanBuyTalent(testHero, talentWithRequirement, 5)).toBe(false);
    });
  });
});
