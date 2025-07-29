import {
  allItemDefinitions,
  createItem,
  pickRandomItemDefinitionBasedOnRarity,
} from '@helpers/creator-equipment';
import type {
  EquipmentItem,
  EquipmentItemContent,
  EquipmentItemId,
} from '@interfaces';
import type { PRNG } from 'seedrandom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dependencies
vi.mock('@helpers/content', () => ({
  getEntriesByType: vi.fn(),
  getEntry: vi.fn(),
}));

vi.mock('@helpers/droppable', () => ({
  cleanupDroppableDefinition: vi.fn(),
}));

vi.mock('@helpers/rng', () => ({
  randomChoiceByRarity: vi.fn(),
  succeedsChance: vi.fn(),
  seededrng: vi.fn(),
  uuid: () => 'mock-uuid',
}));

import { getEntriesByType, getEntry } from '@helpers/content';
import { cleanupDroppableDefinition } from '@helpers/droppable';
import { randomChoiceByRarity, seededrng } from '@helpers/rng';

describe('Equipment Creator Functions', () => {
  const mockItemContent: EquipmentItemContent = {
    id: 'item-1' as EquipmentItemId,
    name: 'Test Item',
    __type: 'weapon',
    sprite: 'item-sprite',
    rarity: 'Common',
    dropLevel: 1,
    baseStats: {},
    traitIds: [],
  };

  const mockRng: PRNG = () => 0.5;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('allItemDefinitions', () => {
    it('should combine and filter all equipment types', () => {
      const mockAccessories = [{ ...mockItemContent, __type: 'accessory' }];
      const mockArmors = [{ ...mockItemContent, __type: 'armor' }];
      const mockTrinkets = [{ ...mockItemContent, __type: 'trinket' }];
      const mockWeapons = [{ ...mockItemContent, __type: 'weapon' }];

      vi.mocked(getEntriesByType)
        .mockReturnValueOnce(mockAccessories)
        .mockReturnValueOnce(mockArmors)
        .mockReturnValueOnce(mockTrinkets)
        .mockReturnValueOnce(mockWeapons);

      const result = allItemDefinitions();

      expect(result).toHaveLength(4);
      expect(getEntriesByType).toHaveBeenCalledWith('accessory');
      expect(getEntriesByType).toHaveBeenCalledWith('armor');
      expect(getEntriesByType).toHaveBeenCalledWith('trinket');
      expect(getEntriesByType).toHaveBeenCalledWith('weapon');
    });

    it('should filter out items with preventDrop flag', () => {
      const preventDropItem = { ...mockItemContent, preventDrop: true };
      const normalItem = { ...mockItemContent };

      vi.mocked(getEntriesByType)
        .mockReturnValueOnce([])
        .mockReturnValueOnce([])
        .mockReturnValueOnce([])
        .mockReturnValueOnce([preventDropItem, normalItem]);

      const result = allItemDefinitions();
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(normalItem);
    });
  });

  describe('pickRandomItemDefinitionBasedOnRarity', () => {
    it('should return a random item definition', () => {
      vi.mocked(randomChoiceByRarity).mockReturnValue(mockItemContent);
      vi.mocked(getEntry).mockReturnValue(mockItemContent);
      vi.mocked(seededrng).mockReturnValue(mockRng);

      const result = pickRandomItemDefinitionBasedOnRarity(
        [mockItemContent],
        mockRng,
      );

      expect(result).toEqual(mockItemContent);
      expect(randomChoiceByRarity).toHaveBeenCalledWith(
        [mockItemContent],
        mockRng,
      );
    });

    it('should throw error if no item could be generated', () => {
      vi.mocked(randomChoiceByRarity).mockReturnValue(undefined);

      expect(() => pickRandomItemDefinitionBasedOnRarity([], mockRng)).toThrow(
        'Could not generate an item.',
      );
    });

    it('should throw error if item definition not found', () => {
      vi.mocked(randomChoiceByRarity).mockReturnValue(mockItemContent);
      vi.mocked(getEntry).mockReturnValue(undefined);

      expect(() =>
        pickRandomItemDefinitionBasedOnRarity([mockItemContent], mockRng),
      ).toThrow('Could not generate an item.');
    });
  });

  describe('createItem', () => {
    it('should create an item from definition', () => {
      const expectedItem: EquipmentItem = {
        ...mockItemContent,
        id: 'item-1|mock-uuid' as EquipmentItemId,
        mods: {},
      };

      const result = createItem(mockItemContent);

      expect(cleanupDroppableDefinition).toHaveBeenCalled();
      expect(result).toEqual(expectedItem);
    });
  });
});
