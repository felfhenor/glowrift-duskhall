import {
  symmetryCanIncreaseCount,
  symmetryCopiesRequired,
  symmetryIncreaseCount,
  symmetryItemBonusDescription,
  symmetryItemsMatchingItem,
  symmetryLevel,
  symmetryLevelDescription,
  symmetrySkillBonusDescription,
  symmetrySkillsMatchingSkill,
} from '@helpers/symmetry';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dependencies
vi.mock('@helpers/droppable', () => ({
  droppableGetBaseId: vi.fn(),
  droppableSortedRarityList: vi.fn(),
}));

vi.mock('@helpers/state-game', () => ({
  gamestate: vi.fn(),
}));

// Import mocked functions
import {
  droppableGetBaseId,
  droppableSortedRarityList,
} from '@helpers/droppable';
import { gamestate } from '@helpers/state-game';
import type { EquipmentItem } from '@interfaces/content-equipment';
import type { EquipmentSkill } from '@interfaces/content-skill';
import type { SymmetryLevel } from '@interfaces/droppable';
import type { GameState } from '@interfaces/state-game';

// Helper functions to create mock objects
function createMockEquipmentItem(
  overrides: Partial<EquipmentItem> = {},
): EquipmentItem {
  return {
    __type: 'weapon',
    id: 'test-item-id' as never,
    name: 'Test Item',
    description: 'A test item',
    rarity: 'Common',
    dropLevel: 1,
    unableToUpgrade: [],
    art: {
      path: 'test-path',
      frame: 0,
    },
    talentBoosts: [],
    elementMultipliers: [],
    traitIds: [],
    skillIds: [],
    mods: {},
    ...overrides,
  } as EquipmentItem;
}

function createMockEquipmentSkill(
  overrides: Partial<EquipmentSkill> = {},
): EquipmentSkill {
  return {
    __type: 'skill',
    id: 'test-skill-id' as never,
    name: 'Test Skill',
    description: 'A test skill',
    rarity: 'Common',
    dropLevel: 1,
    disableUpgrades: false,
    unableToUpgrade: [],
    art: {
      path: 'test-path',
      frame: 0,
    },
    animations: {
      cast: 'test-cast',
      technique: 'test-technique',
    },
    enchantLevel: 0,
    symmetryCount: 0,
    manaCost: 10,
    cooldown: 5,
    targetBehavior: 'Always',
    targetPriority: 'Random',
    targetType: 'Enemies',
    targetCount: 1,
    technique: {
      delay: 0,
      damageScaling: {},
      elements: [],
      attributes: [],
      statusEffects: [],
      combatMessage: 'Test message',
    },
    mods: {},
    ...overrides,
  } as EquipmentSkill;
}

function createMockGameState(overrides: Partial<GameState> = {}): GameState {
  return {
    inventory: {
      items: [],
      skills: [],
    },
    ...overrides,
  } as GameState;
}

describe('symmetry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('symmetryCopiesRequired', () => {
    it('should return correct requirements for each symmetry level', () => {
      expect(symmetryCopiesRequired(0)).toBe(0);
      expect(symmetryCopiesRequired(1)).toBe(4);
      expect(symmetryCopiesRequired(2)).toBe(12);
      expect(symmetryCopiesRequired(3)).toBe(28);
      expect(symmetryCopiesRequired(4)).toBe(60);
      expect(symmetryCopiesRequired(5)).toBe(124);
    });

    it('should return -1 for invalid levels', () => {
      expect(symmetryCopiesRequired(6 as SymmetryLevel)).toBe(-1);
      expect(symmetryCopiesRequired(-1 as SymmetryLevel)).toBe(-1);
    });
  });

  describe('symmetryLevel', () => {
    it('should return 0 for items with no symmetry count', () => {
      const item = createMockEquipmentItem();
      expect(symmetryLevel(item)).toBe(0);
    });

    it('should return 0 for items with undefined mods', () => {
      const item = createMockEquipmentItem({ mods: undefined });
      expect(symmetryLevel(item)).toBe(0);
    });

    it('should return 0 for items with undefined symmetryCount', () => {
      const item = createMockEquipmentItem({
        mods: {},
      });
      expect(symmetryLevel(item)).toBe(0);
    });

    it('should return correct level for items with symmetry count', () => {
      // Level 1: 4+ copies
      const item1 = createMockEquipmentItem({
        mods: { symmetryCount: 4 },
      });
      expect(symmetryLevel(item1)).toBe(1);

      // Level 2: 12+ copies
      const item2 = createMockEquipmentItem({
        mods: { symmetryCount: 12 },
      });
      expect(symmetryLevel(item2)).toBe(2);

      // Level 3: 28+ copies
      const item3 = createMockEquipmentItem({
        mods: { symmetryCount: 28 },
      });
      expect(symmetryLevel(item3)).toBe(3);

      // Level 4: 60+ copies
      const item4 = createMockEquipmentItem({
        mods: { symmetryCount: 60 },
      });
      expect(symmetryLevel(item4)).toBe(4);

      // Level 5: 124+ copies
      const item5 = createMockEquipmentItem({
        mods: { symmetryCount: 124 },
      });
      expect(symmetryLevel(item5)).toBe(5);
    });

    it('should return highest applicable level for items with high symmetry count', () => {
      const item = createMockEquipmentItem({
        mods: { symmetryCount: 200 },
      });
      expect(symmetryLevel(item)).toBe(5);
    });

    it('should work with skills', () => {
      const skill = createMockEquipmentSkill({
        mods: { symmetryCount: 12 },
      });
      expect(symmetryLevel(skill)).toBe(2);
    });

    it('should return correct level for edge cases between levels', () => {
      // Just below level 1
      const item1 = createMockEquipmentItem({
        mods: { symmetryCount: 3 },
      });
      expect(symmetryLevel(item1)).toBe(0);

      // Just below level 2
      const item2 = createMockEquipmentItem({
        mods: { symmetryCount: 11 },
      });
      expect(symmetryLevel(item2)).toBe(1);
    });
  });

  describe('symmetryLevelDescription', () => {
    it('should return correct descriptions for each level', () => {
      expect(symmetryLevelDescription(0)).toBe('No Symmetry');
      expect(symmetryLevelDescription(1)).toBe('Common Symmetry');
      expect(symmetryLevelDescription(2)).toBe('Uncommon Symmetry');
      expect(symmetryLevelDescription(3)).toBe('Rare Symmetry');
      expect(symmetryLevelDescription(4)).toBe('Mystical Symmetry');
      expect(symmetryLevelDescription(5)).toBe('Legendary Symmetry');
    });

    it('should return empty string for invalid levels', () => {
      expect(symmetryLevelDescription(6 as SymmetryLevel)).toBe('');
      expect(symmetryLevelDescription(-1 as SymmetryLevel)).toBe('');
    });
  });

  describe('symmetryItemBonusDescription', () => {
    it('should return correct bonus descriptions for each level', () => {
      expect(symmetryItemBonusDescription(0)).toBe('');
      expect(symmetryItemBonusDescription(1)).toBe('+5% All Stats');
      expect(symmetryItemBonusDescription(2)).toBe('+10% All Stats');
      expect(symmetryItemBonusDescription(3)).toBe(
        '+15% All Stats; +1 Max Trait',
      );
      expect(symmetryItemBonusDescription(4)).toBe(
        '+20% All Stats; +1 Max Trait',
      );
      expect(symmetryItemBonusDescription(5)).toBe(
        '+25% All Stats; +2 Max Traits',
      );
    });

    it('should return empty string for invalid levels', () => {
      expect(symmetryItemBonusDescription(6 as SymmetryLevel)).toBe('');
      expect(symmetryItemBonusDescription(-1 as SymmetryLevel)).toBe('');
    });
  });

  describe('symmetrySkillBonusDescription', () => {
    it('should return correct bonus descriptions for each level', () => {
      expect(symmetrySkillBonusDescription(0)).toBe('');
      expect(symmetrySkillBonusDescription(1)).toBe('+5% All Stats');
      expect(symmetrySkillBonusDescription(2)).toBe('+10% All Stats');
      expect(symmetrySkillBonusDescription(3)).toBe(
        '+15% All Stats; +1x Repeat (25%)',
      );
      expect(symmetrySkillBonusDescription(4)).toBe(
        '+20% All Stats; +1x Repeat (25%)',
      );
      expect(symmetrySkillBonusDescription(5)).toBe(
        '+25% All Stats; +1x Repeat (50%)',
      );
    });

    it('should return empty string for invalid levels', () => {
      expect(symmetrySkillBonusDescription(6 as SymmetryLevel)).toBe('');
      expect(symmetrySkillBonusDescription(-1 as SymmetryLevel)).toBe('');
    });
  });

  describe('symmetryIncreaseCount', () => {
    it('should initialize mods if undefined', () => {
      const item = createMockEquipmentItem({ mods: undefined });
      symmetryIncreaseCount(item);
      expect(item.mods).toBeDefined();
      expect(item.mods?.symmetryCount).toBe(1);
    });

    it('should initialize symmetryCount to 0 if undefined and add 1', () => {
      const item = createMockEquipmentItem({
        mods: {},
      });
      symmetryIncreaseCount(item);
      expect(item.mods?.symmetryCount).toBe(1);
    });

    it('should increase symmetryCount by 1 by default', () => {
      const item = createMockEquipmentItem({
        mods: { symmetryCount: 5 },
      });
      symmetryIncreaseCount(item);
      expect(item.mods?.symmetryCount).toBe(6);
    });

    it('should increase symmetryCount by specified amount', () => {
      const item = createMockEquipmentItem({
        mods: { symmetryCount: 10 },
      });
      symmetryIncreaseCount(item, 3);
      expect(item.mods?.symmetryCount).toBe(13);
    });

    it('should work with skills', () => {
      const skill = createMockEquipmentSkill({
        mods: { symmetryCount: 2 },
      });
      symmetryIncreaseCount(skill, 5);
      expect(skill.mods?.symmetryCount).toBe(7);
    });

    it('should handle edge case when at maximum level', () => {
      const item = createMockEquipmentItem({
        mods: { symmetryCount: 124 },
      });
      symmetryIncreaseCount(item);
      expect(item.mods?.symmetryCount).toBe(125);
    });

    it('should return early if next level requirement is -1', () => {
      const item = createMockEquipmentItem({
        mods: { symmetryCount: 200 },
      });
      const initialCount = item.mods?.symmetryCount ?? 0;
      symmetryIncreaseCount(item);
      expect(item.mods?.symmetryCount).toBe(initialCount + 1);
    });
  });

  describe('symmetryCanIncreaseCount', () => {
    it('should return true for items below max level', () => {
      const item1 = createMockEquipmentItem();
      expect(symmetryCanIncreaseCount(item1)).toBe(true);

      const item2 = createMockEquipmentItem({
        mods: { symmetryCount: 60 },
      });
      expect(symmetryCanIncreaseCount(item2)).toBe(true);
    });

    it('should return false for items at max level', () => {
      const item = createMockEquipmentItem({
        mods: { symmetryCount: 124 },
      });
      expect(symmetryCanIncreaseCount(item)).toBe(false);
    });

    it('should return false for items above max level', () => {
      const item = createMockEquipmentItem({
        mods: { symmetryCount: 200 },
      });
      expect(symmetryCanIncreaseCount(item)).toBe(false);
    });

    it('should work with skills', () => {
      const skill1 = createMockEquipmentSkill({
        mods: { symmetryCount: 28 },
      });
      expect(symmetryCanIncreaseCount(skill1)).toBe(true);

      const skill2 = createMockEquipmentSkill({
        mods: { symmetryCount: 124 },
      });
      expect(symmetryCanIncreaseCount(skill2)).toBe(false);
    });
  });

  describe('symmetryItemsMatchingItem', () => {
    beforeEach(() => {
      vi.mocked(droppableGetBaseId).mockReturnValue('default-base-id');
      vi.mocked(droppableSortedRarityList).mockImplementation((items) => [
        ...items,
      ]);
    });

    it('should filter out the same item', () => {
      const targetItem = createMockEquipmentItem({
        id: 'target-item' as never,
      });
      const sameItem = createMockEquipmentItem({ id: 'target-item' as never });
      const otherItem = createMockEquipmentItem({ id: 'other-item' as never });

      const mockGameState = createMockGameState({
        inventory: {
          items: [sameItem, otherItem],
          skills: [],
        },
      });

      vi.mocked(gamestate).mockReturnValue(mockGameState);

      const result = symmetryItemsMatchingItem(targetItem);
      expect(result).not.toContain(sameItem);
    });

    it('should filter out favorite items', () => {
      const targetItem = createMockEquipmentItem({
        id: 'target-item' as never,
      });
      const favoriteItem = createMockEquipmentItem({
        id: 'favorite-item' as never,
        isFavorite: true,
      });
      const normalItem = createMockEquipmentItem({
        id: 'normal-item' as never,
      });

      const mockGameState = createMockGameState({
        inventory: {
          items: [favoriteItem, normalItem],
          skills: [],
        },
      });

      vi.mocked(gamestate).mockReturnValue(mockGameState);

      const result = symmetryItemsMatchingItem(targetItem);
      expect(result).not.toContain(favoriteItem);
    });

    it('should return items with matching base ID', () => {
      const targetItem = createMockEquipmentItem({
        id: 'target-item' as never,
      });
      const matchingItem1 = createMockEquipmentItem({
        id: 'matching-1' as never,
      });
      const matchingItem2 = createMockEquipmentItem({
        id: 'matching-2' as never,
      });
      const nonMatchingItem = createMockEquipmentItem({
        id: 'non-matching' as never,
      });

      const mockGameState = createMockGameState({
        inventory: {
          items: [matchingItem1, matchingItem2, nonMatchingItem],
          skills: [],
        },
      });

      vi.mocked(gamestate).mockReturnValue(mockGameState);
      vi.mocked(droppableGetBaseId)
        .mockReturnValueOnce('target-base-id') // for targetItem
        .mockReturnValueOnce('target-base-id') // for matchingItem1
        .mockReturnValueOnce('target-base-id') // for matchingItem2
        .mockReturnValueOnce('different-base-id'); // for nonMatchingItem

      const result = symmetryItemsMatchingItem(targetItem);
      expect(result).toContain(matchingItem1);
      expect(result).toContain(matchingItem2);
      expect(result).not.toContain(nonMatchingItem);
    });

    it('should reverse the sorted list', () => {
      const targetItem = createMockEquipmentItem({
        id: 'target-item' as never,
      });
      const item1 = createMockEquipmentItem({ id: 'item-1' as never });
      const item2 = createMockEquipmentItem({ id: 'item-2' as never });

      const mockGameState = createMockGameState({
        inventory: {
          items: [item1, item2],
          skills: [],
        },
      });

      vi.mocked(gamestate).mockReturnValue(mockGameState);
      vi.mocked(droppableGetBaseId).mockReturnValue('same-base-id');
      vi.mocked(droppableSortedRarityList).mockReturnValue([item1, item2]);

      const result = symmetryItemsMatchingItem(targetItem);
      expect(result).toEqual([item2, item1]); // reversed
    });

    it('should handle empty inventory', () => {
      const targetItem = createMockEquipmentItem({
        id: 'target-item' as never,
      });

      const mockGameState = createMockGameState({
        inventory: {
          items: [],
          skills: [],
        },
      });

      vi.mocked(gamestate).mockReturnValue(mockGameState);

      const result = symmetryItemsMatchingItem(targetItem);
      expect(result).toEqual([]);
    });
  });

  describe('symmetrySkillsMatchingSkill', () => {
    beforeEach(() => {
      vi.mocked(droppableGetBaseId).mockReturnValue('default-base-id');
      vi.mocked(droppableSortedRarityList).mockImplementation((items) => [
        ...items,
      ]);
    });

    it('should filter out the same skill', () => {
      const targetSkill = createMockEquipmentSkill({
        id: 'target-skill' as never,
      });
      const sameSkill = createMockEquipmentSkill({
        id: 'target-skill' as never,
      });
      const otherSkill = createMockEquipmentSkill({
        id: 'other-skill' as never,
      });

      const mockGameState = createMockGameState({
        inventory: {
          items: [],
          skills: [sameSkill, otherSkill],
        },
      });

      vi.mocked(gamestate).mockReturnValue(mockGameState);

      const result = symmetrySkillsMatchingSkill(targetSkill);
      expect(result).not.toContain(sameSkill);
    });

    it('should filter out favorite skills', () => {
      const targetSkill = createMockEquipmentSkill({
        id: 'target-skill' as never,
      });
      const favoriteSkill = createMockEquipmentSkill({
        id: 'favorite-skill' as never,
        isFavorite: true,
      });
      const normalSkill = createMockEquipmentSkill({
        id: 'normal-skill' as never,
      });

      const mockGameState = createMockGameState({
        inventory: {
          items: [],
          skills: [favoriteSkill, normalSkill],
        },
      });

      vi.mocked(gamestate).mockReturnValue(mockGameState);

      const result = symmetrySkillsMatchingSkill(targetSkill);
      expect(result).not.toContain(favoriteSkill);
    });

    it('should return skills with matching base ID', () => {
      const targetSkill = createMockEquipmentSkill({
        id: 'target-skill' as never,
      });
      const matchingSkill1 = createMockEquipmentSkill({
        id: 'matching-1' as never,
      });
      const matchingSkill2 = createMockEquipmentSkill({
        id: 'matching-2' as never,
      });
      const nonMatchingSkill = createMockEquipmentSkill({
        id: 'non-matching' as never,
      });

      const mockGameState = createMockGameState({
        inventory: {
          items: [],
          skills: [matchingSkill1, matchingSkill2, nonMatchingSkill],
        },
      });

      vi.mocked(gamestate).mockReturnValue(mockGameState);
      vi.mocked(droppableGetBaseId)
        .mockReturnValueOnce('target-base-id') // for targetSkill
        .mockReturnValueOnce('target-base-id') // for matchingSkill1
        .mockReturnValueOnce('target-base-id') // for matchingSkill2
        .mockReturnValueOnce('different-base-id'); // for nonMatchingSkill

      const result = symmetrySkillsMatchingSkill(targetSkill);
      expect(result).toContain(matchingSkill1);
      expect(result).toContain(matchingSkill2);
      expect(result).not.toContain(nonMatchingSkill);
    });

    it('should reverse the sorted list', () => {
      const targetSkill = createMockEquipmentSkill({
        id: 'target-skill' as never,
      });
      const skill1 = createMockEquipmentSkill({ id: 'skill-1' as never });
      const skill2 = createMockEquipmentSkill({ id: 'skill-2' as never });

      const mockGameState = createMockGameState({
        inventory: {
          items: [],
          skills: [skill1, skill2],
        },
      });

      vi.mocked(gamestate).mockReturnValue(mockGameState);
      vi.mocked(droppableGetBaseId).mockReturnValue('same-base-id');
      vi.mocked(droppableSortedRarityList).mockReturnValue([skill1, skill2]);

      const result = symmetrySkillsMatchingSkill(targetSkill);
      expect(result).toEqual([skill2, skill1]); // reversed
    });

    it('should handle empty skill inventory', () => {
      const targetSkill = createMockEquipmentSkill({
        id: 'target-skill' as never,
      });

      const mockGameState = createMockGameState({
        inventory: {
          items: [],
          skills: [],
        },
      });

      vi.mocked(gamestate).mockReturnValue(mockGameState);

      const result = symmetrySkillsMatchingSkill(targetSkill);
      expect(result).toEqual([]);
    });
  });
});
