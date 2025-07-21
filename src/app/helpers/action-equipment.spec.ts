import {
  itemBuyValue,
  itemSalvage,
  itemSalvageValue,
} from '@helpers/action-equipment';
import type { EquipmentItem, EquipmentItemId, StatBlock } from '@interfaces';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dependencies
vi.mock('@helpers/currency', () => ({
  gainCurrency: vi.fn(),
}));

vi.mock('@helpers/inventory-equipment', () => ({
  removeItemFromInventory: vi.fn(),
}));

vi.mock('@helpers/notify', () => ({
  notifySuccess: vi.fn(),
}));

vi.mock('@helpers/item', () => ({
  getItemStat: vi.fn(),
}));

import { gainCurrency } from '@helpers/currency';
import { removeItemFromInventory } from '@helpers/inventory-equipment';
import { getItemStat } from '@helpers/item';
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
    mods: {},
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('itemSalvageValue', () => {
    it('should calculate correct salvage value based on stats', () => {
      vi.mocked(getItemStat)
        .mockReturnValueOnce(3) // Aura
        .mockReturnValueOnce(5) // Force
        .mockReturnValueOnce(10) // Health
        .mockReturnValueOnce(2); // Speed

      const expectedValue =
        3 * 4 + // Aura * 4
        5 * 6 + // Force * 6
        10 * 2 + // Health * 2
        2 * 10; // Speed * 10

      expect(itemSalvageValue(testItem)).toBe(expectedValue);
    });
  });

  describe('itemSalvage', () => {
    it('should salvage item and grant mana', () => {
      const expectedValue =
        5 * 4 + // Aura * 4
        5 * 6 + // Force * 6
        5 * 2 + // Health * 2
        5 * 10; // Speed * 10

      vi.mocked(getItemStat).mockReturnValue(5); // All stats return 5 for simple calculation

      itemSalvage(testItem);

      expect(removeItemFromInventory).toHaveBeenCalledWith(testItem);
      expect(gainCurrency).toHaveBeenCalledWith('Mana', expectedValue);
      expect(notifySuccess).toHaveBeenCalledWith(
        `Salvaged ${testItem.name} for ${expectedValue} mana!`,
      );
    });
  });

  describe('itemBuyValue', () => {
    it('should return salvage value multiplied by 10', () => {
      vi.mocked(getItemStat).mockReturnValue(5); // All stats return 5 for simple calculation

      const salvageValue =
        5 * 4 + // Aura * 4
        5 * 6 + // Force * 6
        5 * 2 + // Health * 2
        5 * 10; // Speed * 10

      expect(itemBuyValue(testItem)).toBe(salvageValue * 10);
    });
  });
});
