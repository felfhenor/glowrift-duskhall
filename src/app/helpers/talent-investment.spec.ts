import {
  canHeroBuyTalent,
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
  updateHeroData: vi.fn(),
}));

vi.mock('@helpers/talent', () => ({
  allTalentIdsInTalentTree: vi.fn(),
}));

import { allTalentIdsInTalentTree } from '@helpers/talent';

describe('Talent Investment Requirements', () => {
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
      level: 20,
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
        'fire-talent-1': 2,
        'fire-talent-2': 1,
        'air-talent-1': 1,
      },
      sprite: 'hero-1',
      frames: 1,
      targettingType: 'Random',
    };
  });

  describe('heroTalentsInvestedInTree', () => {
    let fireTalentTree: TalentTreeContent;

    beforeEach(() => {
      fireTalentTree = {
        id: 'fire-tree' as TalentTreeId,
        name: 'Fire Talent Tree',
        __type: 'talenttree',
        talents: [],
      };

      vi.mocked(allTalentIdsInTalentTree).mockReturnValue([
        'fire-talent-1' as TalentId,
        'fire-talent-2' as TalentId,
      ]);
    });

    it('should calculate total talents invested in fire tree', () => {
      expect(heroTalentsInvestedInTree(testHero, fireTalentTree)).toBe(3); // 2 + 1
    });

    it('should only count talents from the specified tree', () => {
      vi.mocked(allTalentIdsInTalentTree).mockReturnValue([
        'air-talent-1' as TalentId,
      ]);
      
      expect(heroTalentsInvestedInTree(testHero, fireTalentTree)).toBe(1); // only air-talent-1
    });
  });

  describe('canHeroBuyTalent with investment requirements', () => {
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
      combatStats: {},
      addTechniques: [],
    };

    let fireTalentTree: TalentTreeContent;

    beforeEach(() => {
      fireTalentTree = {
        id: 'fire-tree' as TalentTreeId,
        name: 'Fire Talent Tree',
        __type: 'talenttree',
        talents: [],
      };

      vi.mocked(allTalentIdsInTalentTree).mockReturnValue([
        'fire-talent-1' as TalentId,
        'fire-talent-2' as TalentId,
      ]);
    });

    it('should allow purchase when investment requirement is met', () => {
      expect(canHeroBuyTalent(testHero, testTalent, 5, fireTalentTree, 3)).toBe(true); // has 3 invested, needs 3
    });

    it('should block purchase when investment requirement is not met', () => {
      expect(canHeroBuyTalent(testHero, testTalent, 5, fireTalentTree, 5)).toBe(false); // has 3 invested, needs 5
    });

    it('should work with no investment requirement', () => {
      expect(canHeroBuyTalent(testHero, testTalent, 5, fireTalentTree)).toBe(true);
    });

    it('should work without talent tree parameter (backward compatibility)', () => {
      expect(canHeroBuyTalent(testHero, testTalent, 5)).toBe(true);
    });
  });
});