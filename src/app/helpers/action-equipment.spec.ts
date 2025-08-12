import {
  actionItemBuyValue,
  actionItemSalvage,
  actionItemSalvageValue,
} from '@helpers/action-equipment';
import type {
  EquipmentItem,
  EquipmentItemId,
  EquipmentSkillId,
  GameStat,
  StatBlock,
  TraitEquipmentId,
} from '@interfaces';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dependencies
vi.mock('@helpers/currency', () => ({
  currencyGain: vi.fn(),
}));

vi.mock('@helpers/inventory-equipment', () => ({
  itemInventoryRemove: vi.fn(),
}));

vi.mock('@helpers/notify', () => ({
  notifySuccess: vi.fn(),
}));

vi.mock('@helpers/item', () => ({
  itemStat: vi.fn(),
  itemTalents: vi.fn(() => []),
  itemSkills: vi.fn(() => []),
  itemTraits: vi.fn(() => []),
}));

vi.mock('@helpers/town', () => ({
  townBuildingLevel: vi.fn(() => 0),
}));

vi.mock('@helpers/rng', () => ({
  rngUuid: () => 'mock-uuid',
}));

import { currencyGain } from '@helpers/currency';
import { itemInventoryRemove } from '@helpers/inventory-equipment';
import { itemStat } from '@helpers/item';
import { notifySuccess } from '@helpers/notify';

describe('Action Equipment Functions', () => {
  const baseStats: StatBlock = {
    Force: 5,
    Health: 10,
    Speed: 2,
    Aura: 3,
  };

  const testItem: EquipmentItem = {
    id: 'test-item-1' as EquipmentItemId,
    name: 'Test Item',
    __type: 'weapon',
    baseStats,
    rarity: 'Common',
    dropLevel: 1,
    sprite: 'test-sprite',
    enchantLevel: 0,
    talentBoosts: [],
    elementMultipliers: [],
    traitIds: [] as TraitEquipmentId[],
    skillIds: [] as EquipmentSkillId[],
    unableToUpgrade: [],
    mods: {
      enchantLevel: 0,
      baseStats: {} as Record<GameStat, number>,
      talentBoosts: [],
      elementMultipliers: [],
      traitIds: [] as TraitEquipmentId[],
      skillIds: [] as EquipmentSkillId[],
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('itemSalvageValue', () => {
    it('should calculate correct salvage value based on stats', () => {
      vi.mocked(itemStat)
        .mockReturnValueOnce(3) // Aura
        .mockReturnValueOnce(5) // Force
        .mockReturnValueOnce(10) // Health
        .mockReturnValueOnce(2); // Speed

      const expectedValue =
        3 * 4 + // Aura * 4
        5 * 6 + // Force * 6
        10 * 2 + // Health * 2
        2 * 10; // Speed * 10

      expect(actionItemSalvageValue(testItem)).toBe(expectedValue);
    });
  });

  describe('itemSalvage', () => {
    it('should salvage item and grant mana', () => {
      const expectedValue =
        5 * 4 + // Aura * 4
        5 * 6 + // Force * 6
        5 * 2 + // Health * 2
        5 * 10; // Speed * 10

      vi.mocked(itemStat).mockReturnValue(5); // All stats return 5 for simple calculation

      actionItemSalvage(testItem);

      expect(itemInventoryRemove).toHaveBeenCalledWith(testItem);
      expect(currencyGain).toHaveBeenCalledWith('Mana', expectedValue);
      expect(notifySuccess).toHaveBeenCalledWith(
        `Salvaged ${testItem.name} for ${expectedValue} mana!`,
      );
    });
  });

  describe('itemBuyValue', () => {
    it('should return salvage value multiplied by 10', () => {
      vi.mocked(itemStat).mockReturnValue(5); // All stats return 5 for simple calculation

      const salvageValue =
        5 * 4 + // Aura * 4
        5 * 6 + // Force * 6
        5 * 2 + // Health * 2
        5 * 10; // Speed * 10

      expect(actionItemBuyValue(testItem)).toBe(salvageValue * 10);
    });
  });
});
