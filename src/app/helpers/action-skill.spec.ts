import { skillSalvage, skillSalvageValue } from '@helpers/action-skill';
import type { EquipmentSkill, EquipmentSkillId } from '@interfaces';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dependencies
vi.mock('@helpers/currency', () => ({
  gainCurrency: vi.fn(),
}));

vi.mock('@helpers/inventory-skill', () => ({
  removeSkillFromInventory: vi.fn(),
}));

vi.mock('@helpers/notify', () => ({
  notifySuccess: vi.fn(),
}));

import { gainCurrency } from '@helpers/currency';
import { removeSkillFromInventory } from '@helpers/inventory-skill';
import { notifySuccess } from '@helpers/notify';

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
      techniques: [],
      usesPerCombat: -1,
      mods: {},
    };
  });

  describe('skillSalvageValue', () => {
    it('should calculate salvage value based on drop level', () => {
      const value = skillSalvageValue(testSkill);
      expect(value).toBe(500); // dropLevel (5) * 100
    });

    it('should handle different drop levels', () => {
      testSkill.dropLevel = 10;
      expect(skillSalvageValue(testSkill)).toBe(1000);

      testSkill.dropLevel = 1;
      expect(skillSalvageValue(testSkill)).toBe(100);
    });
  });

  describe('skillSalvage', () => {
    it('should salvage skill and grant mana', () => {
      skillSalvage(testSkill);

      expect(removeSkillFromInventory).toHaveBeenCalledWith(testSkill);
      expect(gainCurrency).toHaveBeenCalledWith('Mana', 500);
      expect(notifySuccess).toHaveBeenCalledWith(
        'Salvaged Test Skill for 500 mana!',
      );
    });
  });
});
