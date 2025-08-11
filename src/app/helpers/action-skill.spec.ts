import { actionSkillSalvageValue } from '@helpers/action-skill';
import type {
  EquipmentSkill,
  EquipmentSkillId,
  StatBlock,
  StatusEffectId,
} from '@interfaces';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dependencies
vi.mock('@helpers/currency', () => ({
  currencyGain: vi.fn(),
}));

vi.mock('@helpers/inventory-skill', () => ({
  skillInventoryRemove: vi.fn(),
}));

vi.mock('@helpers/notify', () => ({
  notifySuccess: vi.fn(),
}));

describe('Action Skill Functions', () => {
  let testSkill: EquipmentSkill;

  beforeEach(() => {
    vi.clearAllMocks();

    testSkill = {
      id: 'test-skill-1' as EquipmentSkillId,
      name: 'Test Skill',
      __type: 'skill',
      sprite: 'skill-sprite',
      frames: 1,
      rarity: 'Common',
      dropLevel: 5,
      enchantLevel: 0,
      techniques: [],
      usesPerCombat: -1,
      numTargets: 1,
      damageScaling: {} as StatBlock,
      statusEffectDurationBoost: {} as Record<StatusEffectId, number>,
      statusEffectChanceBoost: {} as Record<StatusEffectId, number>,
      disableUpgrades: false,
      unableToUpgrade: [],
      mods: {
        enchantLevel: 0,
        techniques: [],
        usesPerCombat: -1,
        numTargets: 1,
        damageScaling: {} as StatBlock,
        statusEffectDurationBoost: {} as Record<StatusEffectId, number>,
        statusEffectChanceBoost: {} as Record<StatusEffectId, number>,
      },
    };
  });

  describe('skillSalvageValue', () => {
    it('should calculate salvage value based on drop level', () => {
      const value = actionSkillSalvageValue(testSkill);
      expect(value).toBe(500); // dropLevel (5) * 100
    });

    it('should handle different drop levels', () => {
      testSkill.dropLevel = 10;
      expect(actionSkillSalvageValue(testSkill)).toBe(1000);

      testSkill.dropLevel = 1;
      expect(actionSkillSalvageValue(testSkill)).toBe(100);
    });
  });
});
