import {
  equipmentAllDefinitions,
  equipmentCreate,
  equipmentPickRandomDefinitionByRarity,
} from '@helpers/creator-equipment';
import type {
  EquipmentItem,
  EquipmentItemContent,
  EquipmentItemId,
} from '@interfaces';
import type { PRNG } from 'seedrandom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dependencies
vi.mock('@helpers/defaults', () => ({
  defaultEquipment: vi.fn(),
  defaultStats: vi.fn(),
  defaultGameState: vi.fn(),
}));

vi.mock('@helpers/content', () => ({
  getEntriesByType: vi.fn(),
  getEntry: vi.fn(),
}));

vi.mock('@helpers/droppable', () => ({
  droppableCleanup: vi.fn(),
}));

vi.mock('@helpers/rng', () => ({
  rngChoiceRarity: vi.fn(),
  rngSeeded: vi.fn(),
  rngSucceedsChance: vi.fn(),
  rngUuid: () => 'mock-uuid',
}));

import { getEntriesByType, getEntry } from '@helpers/content';
import { defaultEquipment, defaultStats } from '@helpers/defaults';
import { rngChoiceRarity, rngSeeded } from '@helpers/rng';

describe('Equipment Creator Functions', () => {
  const mockItemContent: EquipmentItemContent = {
    ...defaultEquipment(),
    id: 'item-1' as EquipmentItemId,
    name: 'Test Item',
    __type: 'weapon',
    sprite: 'item-sprite',
    rarity: 'Common',
    dropLevel: 1,
    baseStats: defaultStats(),
    traitIds: [],
  };

  const mockRng = () => 0.5;

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

      const result = equipmentAllDefinitions();

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

      const result = equipmentAllDefinitions();
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(normalItem);
    });
  });

  describe('pickRandomItemDefinitionBasedOnRarity', () => {
    it('should return a random item definition', () => {
      vi.mocked(rngChoiceRarity).mockReturnValue(mockItemContent);
      vi.mocked(getEntry).mockReturnValue(mockItemContent);
      vi.mocked(rngSeeded).mockReturnValue(mockRng as PRNG);

      const result = equipmentPickRandomDefinitionByRarity(
        [mockItemContent],
        mockRng as PRNG,
      );

      expect(result).toEqual(mockItemContent);
      expect(rngChoiceRarity).toHaveBeenCalledWith([mockItemContent], mockRng);
    });
  });

  describe('createItem', () => {
    it('should create an item from definition', () => {
      const expectedItem: EquipmentItem = {
        ...mockItemContent,
        id: 'item-1|mock-uuid' as EquipmentItemId,
        mods: {},
      };

      const result = equipmentCreate(mockItemContent);

      expect(result).toEqual(expectedItem);
    });
  });
});
