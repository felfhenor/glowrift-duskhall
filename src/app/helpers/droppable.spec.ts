import type {
  ContentType,
  DroppableEquippable,
  DropRarity,
  EquipmentItem,
  EquipmentItemContent,
  EquipmentSkill,
  EquipmentSkillContent,
} from '@interfaces';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dependencies
vi.mock('@helpers/content', () => ({
  getEntry: vi.fn(),
}));

vi.mock('@helpers/creator-equipment', () => ({
  equipmentCreate: vi.fn(),
}));

vi.mock('@helpers/creator-skill', () => ({
  skillCreate: vi.fn(),
}));

vi.mock('@helpers/inventory-equipment', () => ({
  itemInventoryAdd: vi.fn(),
}));

vi.mock('@helpers/inventory-skill', () => ({
  skillInventoryAdd: vi.fn(),
}));

// Import functions after mocking
import { getEntry } from '@helpers/content';
import { equipmentCreate } from '@helpers/creator-equipment';
import { skillCreate } from '@helpers/creator-skill';
import {
  droppableCleanup,
  droppableGain,
  droppableGetBaseId,
  droppableMakeReal,
  droppableSortedRarityList,
} from '@helpers/droppable';
import { itemInventoryAdd } from '@helpers/inventory-equipment';
import { skillInventoryAdd } from '@helpers/inventory-skill';

describe('Droppable Helper Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Helper function to create mock droppables
  const createMockDroppable = (
    type: ContentType,
    overrides: Partial<DroppableEquippable> = {},
  ): DroppableEquippable => ({
    id: 'test-item-123',
    name: 'Test Item',
    __type: type,
    sprite: 'test-sprite.png',
    rarity: 'Common' as DropRarity,
    dropLevel: 1,
    preventModification: false,
    preventDrop: false,
    isFavorite: false,
    ...overrides,
  });

  describe('droppableGetBaseId', () => {
    it('should extract base ID from item with pipe separator', () => {
      const droppable = createMockDroppable('weapon', {
        id: 'iron-sword|unique-123456',
      });

      const result = droppableGetBaseId(droppable);

      expect(result).toBe('iron-sword');
    });

    it('should return full ID when no pipe separator exists', () => {
      const droppable = createMockDroppable('weapon', {
        id: 'simple-id',
      });

      const result = droppableGetBaseId(droppable);

      expect(result).toBe('simple-id');
    });

    it('should handle multiple pipe separators correctly', () => {
      const droppable = createMockDroppable('armor', {
        id: 'iron-armor|variant|unique-789',
      });

      const result = droppableGetBaseId(droppable);

      expect(result).toBe('iron-armor');
    });

    it('should handle empty string after pipe', () => {
      const droppable = createMockDroppable('accessory', {
        id: 'magic-ring|',
      });

      const result = droppableGetBaseId(droppable);

      expect(result).toBe('magic-ring');
    });

    it('should handle ID that starts with pipe', () => {
      const droppable = createMockDroppable('trinket', {
        id: '|unique-item',
      });

      const result = droppableGetBaseId(droppable);

      expect(result).toBe('');
    });
  });

  describe('droppableCleanup', () => {
    it('should remove preventModification property', () => {
      const droppable = createMockDroppable('weapon', {
        preventModification: true,
      });

      const result = droppableCleanup(droppable);

      expect(result.preventModification).toBeUndefined();
      expect(result.id).toBe('test-item-123');
      expect(result.name).toBe('Test Item');
    });

    it('should remove preventDrop property', () => {
      const droppable = createMockDroppable('armor', {
        preventDrop: true,
      });

      const result = droppableCleanup(droppable);

      expect(result.preventDrop).toBeUndefined();
      expect(result.id).toBe('test-item-123');
      expect(result.name).toBe('Test Item');
    });

    it('should remove both prevention properties', () => {
      const droppable = createMockDroppable('accessory', {
        preventModification: true,
        preventDrop: true,
      });

      const result = droppableCleanup(droppable);

      expect(result.preventModification).toBeUndefined();
      expect(result.preventDrop).toBeUndefined();
    });

    it('should not affect other properties', () => {
      const droppable = createMockDroppable('trinket', {
        preventModification: true,
        preventDrop: true,
        rarity: 'Legendary',
        dropLevel: 10,
        isFavorite: true,
      });

      const result = droppableCleanup(droppable);

      expect(result.rarity).toBe('Legendary');
      expect(result.dropLevel).toBe(10);
      expect(result.isFavorite).toBe(true);
      expect(result.__type).toBe('trinket');
    });

    it('should handle droppable without prevention properties', () => {
      const droppable = createMockDroppable('weapon');
      delete droppable.preventModification;
      delete droppable.preventDrop;

      const result = droppableCleanup(droppable);

      expect(result.preventModification).toBeUndefined();
      expect(result.preventDrop).toBeUndefined();
      expect(result.id).toBe('test-item-123');
    });

    it('should return the same object reference (mutates original)', () => {
      const droppable = createMockDroppable('weapon', {
        preventModification: true,
      });

      const result = droppableCleanup(droppable);

      expect(result).toBe(droppable); // Same reference
    });
  });

  describe('droppableMakeReal', () => {
    it('should create skill for skill type', () => {
      const skillDroppable = createMockDroppable(
        'skill',
      ) as EquipmentSkillContent;
      const mockSkill = {
        ...skillDroppable,
        realSkill: true,
      } as EquipmentSkill;

      vi.mocked(skillCreate).mockReturnValue(mockSkill);

      const result = droppableMakeReal(skillDroppable);

      expect(skillCreate).toHaveBeenCalledWith(skillDroppable);
      expect(result).toBe(mockSkill);
    });

    it('should create equipment for weapon type', () => {
      const weaponDroppable = createMockDroppable(
        'weapon',
      ) as EquipmentItemContent;
      const mockWeapon = {
        ...weaponDroppable,
        realWeapon: true,
      } as EquipmentItem;

      vi.mocked(equipmentCreate).mockReturnValue(mockWeapon);

      const result = droppableMakeReal(weaponDroppable);

      expect(equipmentCreate).toHaveBeenCalledWith(weaponDroppable);
      expect(result).toBe(mockWeapon);
    });

    it('should create equipment for armor type', () => {
      const armorDroppable = createMockDroppable(
        'armor',
      ) as EquipmentItemContent;
      const mockArmor = { ...armorDroppable, realArmor: true } as EquipmentItem;

      vi.mocked(equipmentCreate).mockReturnValue(mockArmor);

      const result = droppableMakeReal(armorDroppable);

      expect(equipmentCreate).toHaveBeenCalledWith(armorDroppable);
      expect(result).toBe(mockArmor);
    });

    it('should create equipment for accessory type', () => {
      const accessoryDroppable = createMockDroppable(
        'accessory',
      ) as EquipmentItemContent;
      const mockAccessory = {
        ...accessoryDroppable,
        realAccessory: true,
      } as EquipmentItem;

      vi.mocked(equipmentCreate).mockReturnValue(mockAccessory);

      const result = droppableMakeReal(accessoryDroppable);

      expect(equipmentCreate).toHaveBeenCalledWith(accessoryDroppable);
      expect(result).toBe(mockAccessory);
    });

    it('should create equipment for trinket type', () => {
      const trinketDroppable = createMockDroppable(
        'trinket',
      ) as EquipmentItemContent;
      const mockTrinket = {
        ...trinketDroppable,
        realTrinket: true,
      } as EquipmentItem;

      vi.mocked(equipmentCreate).mockReturnValue(mockTrinket);

      const result = droppableMakeReal(trinketDroppable);

      expect(equipmentCreate).toHaveBeenCalledWith(trinketDroppable);
      expect(result).toBe(mockTrinket);
    });

    it('should throw error for unknown type', () => {
      const unknownDroppable = createMockDroppable('currency' as ContentType);

      expect(() => droppableMakeReal(unknownDroppable)).toThrow(
        'Could not create a real item with type: currency',
      );
    });

    it('should throw error for guardian type', () => {
      const guardianDroppable = createMockDroppable('guardian' as ContentType);

      expect(() => droppableMakeReal(guardianDroppable)).toThrow(
        'Could not create a real item with type: guardian',
      );
    });

    it('should throw error for festival type', () => {
      const festivalDroppable = createMockDroppable('festival' as ContentType);

      expect(() => droppableMakeReal(festivalDroppable)).toThrow(
        'Could not create a real item with type: festival',
      );
    });
  });

  describe('droppableGain', () => {
    it('should add skill to skill inventory', () => {
      const skillDroppable = createMockDroppable('skill') as EquipmentSkill;

      vi.mocked(getEntry).mockReturnValue(undefined);

      droppableGain(skillDroppable);

      expect(skillInventoryAdd).toHaveBeenCalledWith(skillDroppable);
      expect(itemInventoryAdd).not.toHaveBeenCalled();
    });

    it('should add weapon to item inventory', () => {
      const weaponDroppable = createMockDroppable('weapon') as EquipmentItem;

      vi.mocked(getEntry).mockReturnValue(undefined);

      droppableGain(weaponDroppable);

      expect(itemInventoryAdd).toHaveBeenCalledWith(weaponDroppable);
      expect(skillInventoryAdd).not.toHaveBeenCalled();
    });

    it('should add armor to item inventory', () => {
      const armorDroppable = createMockDroppable('armor') as EquipmentItem;

      vi.mocked(getEntry).mockReturnValue(undefined);

      droppableGain(armorDroppable);

      expect(itemInventoryAdd).toHaveBeenCalledWith(armorDroppable);
      expect(skillInventoryAdd).not.toHaveBeenCalled();
    });

    it('should add accessory to item inventory', () => {
      const accessoryDroppable = createMockDroppable(
        'accessory',
      ) as EquipmentItem;

      vi.mocked(getEntry).mockReturnValue(undefined);

      droppableGain(accessoryDroppable);

      expect(itemInventoryAdd).toHaveBeenCalledWith(accessoryDroppable);
      expect(skillInventoryAdd).not.toHaveBeenCalled();
    });

    it('should add trinket to item inventory', () => {
      const trinketDroppable = createMockDroppable('trinket') as EquipmentItem;

      vi.mocked(getEntry).mockReturnValue(undefined);

      droppableGain(trinketDroppable);

      expect(itemInventoryAdd).toHaveBeenCalledWith(trinketDroppable);
      expect(skillInventoryAdd).not.toHaveBeenCalled();
    });

    it('should throw error when droppable has real content id', () => {
      const weaponDroppable = createMockDroppable('weapon');

      vi.mocked(getEntry).mockReturnValue(weaponDroppable);

      expect(() => droppableGain(weaponDroppable)).toThrow(
        'Gaining a droppable that has a real content id instead of a unique one',
      );
    });

    it('should throw error for unknown type', () => {
      const unknownDroppable = createMockDroppable('currency' as ContentType);

      vi.mocked(getEntry).mockReturnValue(undefined);

      expect(() => droppableGain(unknownDroppable)).toThrow(
        'Could not handle adding a real item with type: currency',
      );
    });

    it('should check getEntry with droppable id', () => {
      const weaponDroppable = createMockDroppable('weapon', {
        id: 'unique-weapon-id',
      });

      vi.mocked(getEntry).mockReturnValue(undefined);

      droppableGain(weaponDroppable);

      expect(getEntry).toHaveBeenCalledWith('unique-weapon-id');
    });
  });

  describe('droppableSortedRarityList', () => {
    it('should sort by dropLevel descending (higher first)', () => {
      const items: DroppableEquippable[] = [
        createMockDroppable('weapon', { dropLevel: 1, rarity: 'Common' }),
        createMockDroppable('weapon', { dropLevel: 5, rarity: 'Common' }),
        createMockDroppable('weapon', { dropLevel: 3, rarity: 'Common' }),
      ];

      const result = droppableSortedRarityList(items);

      expect(result[0].dropLevel).toBe(5);
      expect(result[1].dropLevel).toBe(3);
      expect(result[2].dropLevel).toBe(1);
    });

    it('should sort by rarity descending when dropLevel is same', () => {
      const items: DroppableEquippable[] = [
        createMockDroppable('weapon', { dropLevel: 5, rarity: 'Common' }),
        createMockDroppable('weapon', { dropLevel: 5, rarity: 'Legendary' }),
        createMockDroppable('weapon', { dropLevel: 5, rarity: 'Rare' }),
        createMockDroppable('weapon', { dropLevel: 5, rarity: 'Unique' }),
        createMockDroppable('weapon', { dropLevel: 5, rarity: 'Uncommon' }),
        createMockDroppable('weapon', { dropLevel: 5, rarity: 'Mystical' }),
      ];

      const result = droppableSortedRarityList(items);

      expect(result[0].rarity).toBe('Unique');
      expect(result[1].rarity).toBe('Legendary');
      expect(result[2].rarity).toBe('Mystical');
      expect(result[3].rarity).toBe('Rare');
      expect(result[4].rarity).toBe('Uncommon');
      expect(result[5].rarity).toBe('Common');
    });

    it('should prioritize dropLevel over rarity', () => {
      const items: DroppableEquippable[] = [
        createMockDroppable('weapon', { dropLevel: 1, rarity: 'Unique' }),
        createMockDroppable('weapon', { dropLevel: 10, rarity: 'Common' }),
      ];

      const result = droppableSortedRarityList(items);

      expect(result[0].dropLevel).toBe(10);
      expect(result[0].rarity).toBe('Common');
      expect(result[1].dropLevel).toBe(1);
      expect(result[1].rarity).toBe('Unique');
    });

    it('should handle empty array', () => {
      const items: DroppableEquippable[] = [];

      const result = droppableSortedRarityList(items);

      expect(result).toEqual([]);
    });

    it('should handle single item', () => {
      const items: DroppableEquippable[] = [
        createMockDroppable('weapon', { dropLevel: 5, rarity: 'Rare' }),
      ];

      const result = droppableSortedRarityList(items);

      expect(result).toHaveLength(1);
      expect(result[0].dropLevel).toBe(5);
      expect(result[0].rarity).toBe('Rare');
    });

    it('should maintain relative order for identical items', () => {
      const item1 = createMockDroppable('weapon', {
        id: 'weapon-1',
        dropLevel: 5,
        rarity: 'Rare',
      });
      const item2 = createMockDroppable('armor', {
        id: 'armor-1',
        dropLevel: 5,
        rarity: 'Rare',
      });

      const items: DroppableEquippable[] = [item1, item2];

      const result = droppableSortedRarityList(items);

      expect(result).toHaveLength(2);
      expect(result[0]).toBe(item1);
      expect(result[1]).toBe(item2);
    });

    it('should handle complex mixed sorting', () => {
      const items: DroppableEquippable[] = [
        createMockDroppable('weapon', {
          id: '1',
          dropLevel: 3,
          rarity: 'Common',
        }),
        createMockDroppable('armor', {
          id: '2',
          dropLevel: 5,
          rarity: 'Uncommon',
        }),
        createMockDroppable('accessory', {
          id: '3',
          dropLevel: 5,
          rarity: 'Legendary',
        }),
        createMockDroppable('trinket', {
          id: '4',
          dropLevel: 1,
          rarity: 'Unique',
        }),
        createMockDroppable('skill', {
          id: '5',
          dropLevel: 5,
          rarity: 'Common',
        }),
      ];

      const result = droppableSortedRarityList(items);

      // dropLevel 5, rarity Legendary (highest)
      expect(result[0].id).toBe('3');
      // dropLevel 5, rarity Uncommon
      expect(result[1].id).toBe('2');
      // dropLevel 5, rarity Common
      expect(result[2].id).toBe('5');
      // dropLevel 3, rarity Common
      expect(result[3].id).toBe('1');
      // dropLevel 1, rarity Unique (lowest dropLevel)
      expect(result[4].id).toBe('4');
    });

    it('should work with different droppable types maintaining generic constraint', () => {
      interface CustomDroppable extends DroppableEquippable {
        customProperty: string;
      }

      const items: CustomDroppable[] = [
        {
          ...createMockDroppable('weapon'),
          customProperty: 'test1',
          dropLevel: 2,
          rarity: 'Rare',
        },
        {
          ...createMockDroppable('armor'),
          customProperty: 'test2',
          dropLevel: 5,
          rarity: 'Common',
        },
      ];

      const result = droppableSortedRarityList(items);

      expect(result[0].customProperty).toBe('test2');
      expect(result[1].customProperty).toBe('test1');
    });
  });
});
