import {
  getItemStat,
  rarityItemOutlineColor,
  rarityItemTextColor,
  sortedRarityList,
} from '@helpers/item';
import { describe, expect, it } from 'vitest';

import type {
  DroppableEquippable,
  DropRarity,
  EquipmentItem,
  EquipmentItemContent,
  EquipmentItemId,
  GameStat,
} from '@interfaces';

describe('Item Helper Functions', () => {
  describe('sortedRarityList', () => {
    it('should sort items by rarity and dropLevel', () => {
      const items: DroppableEquippable[] = [
        {
          id: '1',
          name: 'Item1',
          rarity: 'Common',
          dropLevel: 1,
          __type: 'weapon',
          sprite: '',
        },
        {
          id: '2',
          name: 'Item2',
          rarity: 'Rare',
          dropLevel: 2,
          __type: 'weapon',
          sprite: '',
        },
        {
          id: '3',
          name: 'Item3',
          rarity: 'Unique',
          dropLevel: 1,
          __type: 'weapon',
          sprite: '',
        },
        {
          id: '4',
          name: 'Item4',
          rarity: 'Legendary',
          dropLevel: 3,
          __type: 'weapon',
          sprite: '',
        },
      ];

      const sorted = sortedRarityList(items);
      expect(sorted.map((i) => i.rarity)).toEqual([
        'Unique',
        'Legendary',
        'Rare',
        'Common',
      ]);
    });

    it('should sort items with same rarity by dropLevel descending', () => {
      const items: DroppableEquippable[] = [
        {
          id: '1',
          name: 'Item1',
          rarity: 'Rare',
          dropLevel: 1,
          __type: 'weapon',
          sprite: '',
        },
        {
          id: '2',
          name: 'Item2',
          rarity: 'Rare',
          dropLevel: 3,
          __type: 'weapon',
          sprite: '',
        },
        {
          id: '3',
          name: 'Item3',
          rarity: 'Rare',
          dropLevel: 2,
          __type: 'weapon',
          sprite: '',
        },
      ];

      const sorted = sortedRarityList(items);
      expect(sorted.map((i) => i.dropLevel)).toEqual([3, 2, 1]);
    });
  });

  describe('getItemStat', () => {
    const baseStat: GameStat = 'Force';

    it('should return base stat value when no mods present', () => {
      const item: EquipmentItemContent = {
        id: '1' as EquipmentItemId,
        name: 'TestItem',
        __type: 'weapon',
        baseStats: { [baseStat]: 5 } as Record<GameStat, number>,
        rarity: 'Common',
        dropLevel: 1,
        sprite: '',
      };

      expect(getItemStat(item, baseStat)).toBe(5);
    });

    it('should return sum of base and mod stats when both present', () => {
      const item: EquipmentItem = {
        id: '1' as EquipmentItemId,
        name: 'TestItem',
        __type: 'weapon',
        baseStats: { [baseStat]: 5 } as Record<GameStat, number>,
        mods: {
          baseStats: { [baseStat]: 3 } as Record<GameStat, number>,
        },
        rarity: 'Common',
        dropLevel: 1,
        sprite: '',
      };

      expect(getItemStat(item, baseStat)).toBe(8);
    });
  });

  describe('rarityItemTextColor', () => {
    it('should return correct color class for each rarity', () => {
      const rarities: DropRarity[] = [
        'Common',
        'Uncommon',
        'Rare',
        'Mystical',
        'Legendary',
        'Unique',
      ];
      const expected = [
        'text-white-400',
        'text-green-400',
        'text-blue-400',
        'text-purple-400',
        'text-yellow-400',
        'text-rose-400',
      ];

      rarities.forEach((rarity, index) => {
        expect(rarityItemTextColor(rarity)).toBe(expected[index]);
      });
    });
  });

  describe('rarityItemOutlineColor', () => {
    it('should return correct outline class for each rarity', () => {
      const rarities: DropRarity[] = [
        'Common',
        'Uncommon',
        'Rare',
        'Mystical',
        'Legendary',
        'Unique',
      ];
      const expected = [
        'outline-white-400',
        'outline-green-400',
        'outline-blue-400',
        'outline-purple-400',
        'outline-yellow-400',
        'outline-rose-400',
      ];

      rarities.forEach((rarity, index) => {
        expect(rarityItemOutlineColor(rarity)).toBe(expected[index]);
      });
    });
  });
});
