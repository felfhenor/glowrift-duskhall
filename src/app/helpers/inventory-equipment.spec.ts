import {
  itemInventoryAdd,
  itemInventoryMaxSize,
} from '@helpers/inventory-equipment';
import type { EquipmentItem, GameState } from '@interfaces';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dependencies
vi.mock('@helpers/rng', () => ({
  rngUuid: vi.fn(() => 'mock-uuid'),
}));

vi.mock('@helpers/currency', () => ({
  currencyGain: vi.fn(),
}));

vi.mock('@helpers/action-equipment', () => ({
  actionItemSalvageValue: vi.fn(() => 10),
}));

// Mock state management
let mockGameState: GameState;

vi.mock('@helpers/state-game', () => ({
  gamestate: vi.fn(() => mockGameState),
  updateGamestate: vi.fn((callback) => {
    mockGameState = callback(mockGameState);
    return mockGameState;
  }),
}));

describe('Inventory Equipment Management', () => {
  beforeEach(() => {
    // Reset mock game state
    mockGameState = {
      inventory: {
        items: [],
        skills: [],
      },
    } as GameState;
  });

  function createTestItem(
    rarity: string,
    dropLevel: number,
    type: string = 'weapon',
  ): EquipmentItem {
    return {
      id: `item-${rarity}-${dropLevel}-${Math.random()}`,
      name: `Test ${rarity} ${type}`,
      __type: type as 'weapon' | 'armor' | 'accessory' | 'trinket',
      rarity: rarity as
        | 'Common'
        | 'Uncommon'
        | 'Rare'
        | 'Mystical'
        | 'Legendary'
        | 'Unique',
      dropLevel,
      sprite: '',
      baseStats: {},
      elementMultipliers: [],
      traitIds: [],
      talentBoosts: [],
      skillIds: [],
      enchantLevel: 0,
    } as EquipmentItem;
  }

  describe('addItemToInventory when inventory has space', () => {
    it('should add item to empty inventory', () => {
      const item = createTestItem('Common', 1);
      itemInventoryAdd(item);

      const inventory = mockGameState.inventory.items;
      expect(inventory).toHaveLength(1);
      expect(inventory[0].id).toBe(item.id);
    });

    it('should add multiple items to inventory', () => {
      const item1 = createTestItem('Common', 1);
      const item2 = createTestItem('Rare', 2);

      itemInventoryAdd(item1);
      itemInventoryAdd(item2);

      const inventory = mockGameState.inventory.items;
      expect(inventory).toHaveLength(2);
      expect(inventory.map((i) => i.rarity)).toEqual(['Rare', 'Common']); // Sorted by rarity
    });
  });

  describe('addItemToInventory when inventory is full', () => {
    beforeEach(() => {
      // Fill inventory to capacity with items of same type
      const maxSize = itemInventoryMaxSize();
      for (let i = 0; i < maxSize; i++) {
        const item = createTestItem('Common', 1, 'weapon');
        itemInventoryAdd(item);
      }
    });

    it('should have exactly max items after filling', () => {
      const inventory = mockGameState.inventory.items;
      expect(inventory).toHaveLength(itemInventoryMaxSize());
    });

    it('should keep new item and remove worst existing item when new item is better', () => {
      const newBetterItem = createTestItem('Legendary', 10, 'weapon');

      itemInventoryAdd(newBetterItem);

      const finalInventory = mockGameState.inventory.items;
      expect(finalInventory).toHaveLength(itemInventoryMaxSize());
      expect(finalInventory.some((i) => i.id === newBetterItem.id)).toBe(true);

      // The worst item should be removed
      expect(
        finalInventory.filter((i) => i.id !== newBetterItem.id),
      ).toHaveLength(itemInventoryMaxSize() - 1);
    });

    it('should keep new item and remove worst existing item even when new item is worse [CURRENT BUG]', () => {
      const initialInventory = [...mockGameState.inventory.items];
      const worstExistingItem = initialInventory[initialInventory.length - 1];
      const newWorseItem = createTestItem('Common', 0, 'weapon'); // Worse than existing items

      itemInventoryAdd(newWorseItem);

      const finalInventory = mockGameState.inventory.items;
      expect(finalInventory).toHaveLength(itemInventoryMaxSize());

      // The new item should be kept (this is the bug we're fixing)
      expect(finalInventory.some((i) => i.id === newWorseItem.id)).toBe(true);

      // The previously worst item should be removed
      expect(finalInventory.some((i) => i.id === worstExistingItem.id)).toBe(
        false,
      );
    });
  });

  describe('addItemToInventory with different item types', () => {
    it('should handle different item types separately', () => {
      const weapon = createTestItem('Common', 1, 'weapon');
      const armor = createTestItem('Common', 1, 'armor');

      itemInventoryAdd(weapon);
      itemInventoryAdd(armor);

      const inventory = mockGameState.inventory.items;
      expect(inventory).toHaveLength(2);
      expect(inventory.map((i) => i.__type)).toContain('weapon');
      expect(inventory.map((i) => i.__type)).toContain('armor');
    });

    it('should manage capacity per item type', () => {
      const maxSize = itemInventoryMaxSize();

      // Fill weapons to capacity
      for (let i = 0; i < maxSize; i++) {
        const weapon = createTestItem('Common', 1, 'weapon');
        itemInventoryAdd(weapon);
      }

      // Add one armor - should not affect weapon count
      const armor = createTestItem('Common', 1, 'armor');
      itemInventoryAdd(armor);

      const inventory = mockGameState.inventory.items;
      const weapons = inventory.filter((i) => i.__type === 'weapon');
      const armors = inventory.filter((i) => i.__type === 'armor');

      expect(weapons).toHaveLength(maxSize);
      expect(armors).toHaveLength(1);
    });
  });
});
