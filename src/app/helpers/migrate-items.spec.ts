import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockedFunction,
} from 'vitest';

// Import the functions under test
import { migrateItems } from '@helpers/migrate-items';

// Types
import type {
  EquipmentItem,
  EquipmentItemId,
} from '@interfaces/content-equipment';
import type { EquipmentSkillId } from '@interfaces/content-skill';
import type { TalentBoost } from '@interfaces/content-talent';
import type { TraitEquipmentId } from '@interfaces/content-trait-equipment';
import type { Hero, HeroId } from '@interfaces/hero';
import type { StatBlock } from '@interfaces/stat';
import type { GameState } from '@interfaces/state-game';

// Mock dependencies
vi.mock('@helpers/content', () => ({
  getEntry: vi.fn(),
}));

vi.mock('@helpers/droppable', () => ({
  droppableGetBaseId: vi.fn(),
}));

vi.mock('@helpers/hero', () => ({
  allHeroes: vi.fn(),
  heroUpdateData: vi.fn(),
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

// Import mocked functions after mocking
import { getEntry } from '@helpers/content';
import { droppableGetBaseId } from '@helpers/droppable';
import { allHeroes, heroUpdateData } from '@helpers/hero';

describe('migrateItems', () => {
  // Mock implementations
  const mockGetEntry = vi.mocked(getEntry) as MockedFunction<typeof getEntry>;
  const mockDroppableGetBaseId = vi.mocked(
    droppableGetBaseId,
  ) as MockedFunction<typeof droppableGetBaseId>;
  const mockAllHeroes = vi.mocked(allHeroes) as MockedFunction<
    typeof allHeroes
  >;
  const mockHeroUpdateData = vi.mocked(heroUpdateData) as MockedFunction<
    typeof heroUpdateData
  >;

  // Test data factory functions
  const createMockStatBlock = (props: Partial<StatBlock> = {}): StatBlock => ({
    Force: 0,
    Health: 0,
    Speed: 0,
    Aura: 0,
    ...props,
  });

  const createMockItem = (
    props: Partial<EquipmentItem> = {},
  ): EquipmentItem => ({
    id: 'test-item-1|uuid123' as EquipmentItemId,
    name: 'Test Item',
    __type: 'weapon',
    sprite: 'test-sprite',
    rarity: 'Common',
    dropLevel: 1,
    enchantLevel: 0,
    unableToUpgrade: [],
    preventDrop: false,
    preventModification: false,
    isFavorite: false,
    baseStats: createMockStatBlock(),
    talentBoosts: [],
    elementMultipliers: [],
    traitIds: [],
    skillIds: [],
    mods: {},
    ...props,
  });

  const createMockHero = (props: Partial<Hero> = {}): Hero => ({
    id: 'hero-1' as HeroId,
    name: 'Test Hero',
    sprite: 'hero-sprite',
    frames: 1,
    level: 1,
    xp: 0,
    hp: 100,
    baseStats: createMockStatBlock({
      Force: 10,
      Health: 100,
      Speed: 5,
      Aura: 5,
    }),
    totalStats: createMockStatBlock({
      Force: 10,
      Health: 100,
      Speed: 5,
      Aura: 5,
    }),
    equipment: {
      accessory: undefined,
      armor: undefined,
      trinket: undefined,
      weapon: undefined,
    },
    skills: [],
    talents: {},
    targettingType: 'Random',
    ...props,
  });

  const createMockGamestate = (props: Partial<GameState> = {}): GameState =>
    ({
      meta: {
        version: 1,
        isSetup: true,
        isPaused: false,
        hasWon: false,
        hasDismissedWinNotification: false,
        wonAtTick: 0,
        createdAt: Date.now(),
      },
      gameId: 'test-game-id' as GameState['gameId'],
      world: {
        config: {} as GameState['world']['config'],
        nodes: {},
        homeBase: { x: 0, y: 0 },
        nodeCounts: {
          town: 0,
          village: 0,
          cave: 0,
          dungeon: 0,
          castle: 0,
        },
        claimedCounts: {
          town: 0,
          village: 0,
          cave: 0,
          dungeon: 0,
          castle: 0,
        },
      },
      camera: { x: 0, y: 0 },
      hero: {
        heroes: [],
        position: { x: 0, y: 0, nodeId: '' },
        travel: { x: 0, y: 0, nodeId: '', ticksLeft: 0 },
        location: { ticksTotal: 0, ticksLeft: 0 },
        respawnTicks: 0,
        tooHardNodes: [],
        riskTolerance: 'medium',
        nodeTypePreferences: {
          town: true,
          village: true,
          cave: true,
          dungeon: true,
          castle: true,
        },
        lootRarityPreferences: {
          Common: true,
          Uncommon: true,
          Rare: true,
          Mystical: true,
          Legendary: true,
          Unique: true,
        },
      },
      inventory: {
        items: [],
        skills: [],
      },
      currency: {
        currencyPerTickEarnings: {},
        currencies: {},
      } as GameState['currency'],
      actionClock: {
        numTicks: 0,
        timers: {},
      },
      town: {
        buildingLevels: {} as GameState['town']['buildingLevels'],
        merchant: {
          ticksUntilRefresh: 0,
          soldItems: [],
        },
        townUpgrades: {},
      },
      festival: {
        ticksWithoutFestivalStart: 0,
        festivals: {},
      },
      ...props,
    }) as GameState;

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset mock game state
    mockGameState = createMockGamestate();

    // Default mock implementations
    mockDroppableGetBaseId.mockImplementation(
      (item) => item.id.split('|')[0] as EquipmentItemId,
    );
  });

  describe('empty state tests', () => {
    it('should handle empty state gracefully', () => {
      // Arrange
      mockGameState = createMockGamestate({
        inventory: { items: [], skills: [] },
        hero: {
          ...mockGameState.hero,
          heroes: [],
        },
      });

      mockAllHeroes.mockReturnValue([]);

      // Act
      migrateItems();

      // Assert
      expect(mockAllHeroes).toHaveBeenCalledOnce();
    });

    it('should not call heroUpdateData when no heroes exist', () => {
      // Arrange
      mockGameState = createMockGamestate();
      mockAllHeroes.mockReturnValue([]);

      // Act
      migrateItems();

      // Assert
      expect(mockHeroUpdateData).not.toHaveBeenCalled();
    });
  });

  describe('inventory items migration', () => {
    it('should migrate inventory items with updated references', () => {
      // Arrange
      const originalItem = createMockItem({
        id: 'old-weapon|uuid1' as EquipmentItemId,
        name: 'Old Weapon',
        __type: 'weapon',
      });

      const updatedItem = createMockItem({
        id: 'new-weapon|uuid2' as EquipmentItemId,
        name: 'New Weapon',
        dropLevel: 5,
        baseStats: createMockStatBlock({ Force: 10 }),
      });

      mockGameState = createMockGamestate({
        inventory: { items: [originalItem], skills: [] },
      });

      mockAllHeroes.mockReturnValue([]);
      mockDroppableGetBaseId.mockReturnValue('old-weapon' as EquipmentItemId);
      mockGetEntry.mockReturnValue(updatedItem);

      // Act
      migrateItems();

      // Assert
      expect(mockGetEntry).toHaveBeenCalledWith('old-weapon');
      expect(mockDroppableGetBaseId).toHaveBeenCalledWith(originalItem);
      expect(mockGameState.inventory.items[0].name).toBe('New Weapon');
      expect(mockGameState.inventory.items[0].dropLevel).toBe(5);
      expect(mockGameState.inventory.items[0].baseStats.Force).toBe(10);
      expect(mockGameState.inventory.items[0].id).toBe('old-weapon|uuid1'); // ID preserved
    });

    it('should preserve item properties when updating references', () => {
      // Arrange
      const originalItem = createMockItem({
        id: 'item-base|uuid1' as EquipmentItemId,
        enchantLevel: 3,
        isFavorite: true,
        mods: {
          enchantLevel: 2,
          baseStats: createMockStatBlock({ Force: 5 }),
        },
      });

      const baseItemData = createMockItem({
        id: 'item-base' as EquipmentItemId,
        name: 'Updated Base Item',
        dropLevel: 10,
        baseStats: createMockStatBlock({ Health: 20 }),
        // Note: Object.assign will overwrite these properties from base data
        enchantLevel: 0, // This will overwrite the original enchantLevel
        isFavorite: false, // This will overwrite the original isFavorite
        mods: {}, // This will overwrite the original mods
      });

      mockGameState = createMockGamestate({
        inventory: { items: [originalItem], skills: [] },
      });

      mockAllHeroes.mockReturnValue([]);
      mockDroppableGetBaseId.mockReturnValue('item-base' as EquipmentItemId);
      mockGetEntry.mockReturnValue(baseItemData);

      // Act
      migrateItems();

      // Assert
      const migratedItem = mockGameState.inventory.items[0];
      expect(migratedItem.id).toBe(originalItem.id); // ID should be preserved
      expect(migratedItem.enchantLevel).toBe(0); // Base data overwrites original
      expect(migratedItem.isFavorite).toBe(false); // Base data overwrites original
      expect(migratedItem.mods).toEqual({}); // Base data overwrites original
      expect(migratedItem.name).toBe('Updated Base Item'); // Updated from base data
      expect(migratedItem.dropLevel).toBe(10); // Updated from base data
      expect(migratedItem.baseStats.Health).toBe(20); // Updated from base data
    });

    it('should handle items with null or undefined base data', () => {
      // Arrange
      const originalItem = createMockItem({
        id: 'missing-item|uuid1' as EquipmentItemId,
      });

      mockGameState = createMockGamestate({
        inventory: { items: [originalItem], skills: [] },
      });

      mockAllHeroes.mockReturnValue([]);
      mockDroppableGetBaseId.mockReturnValue('missing-item' as EquipmentItemId);
      mockGetEntry.mockReturnValue(undefined); // Simulate missing base data

      // Act
      migrateItems();

      // Assert
      // Original item should remain unchanged when base data is missing
      const unchangedItem = mockGameState.inventory.items[0];
      expect(unchangedItem).toEqual(originalItem);
    });

    it('should handle multiple items with different base references', () => {
      // Arrange
      const item1 = createMockItem({
        id: 'weapon-a|uuid1' as EquipmentItemId,
        name: 'Weapon A Instance',
        __type: 'weapon',
      });

      const item2 = createMockItem({
        id: 'armor-b|uuid2' as EquipmentItemId,
        name: 'Armor B Instance',
        __type: 'armor',
      });

      const baseWeaponA = createMockItem({
        id: 'weapon-a' as EquipmentItemId,
        name: 'Updated Weapon A',
        dropLevel: 5,
        __type: 'weapon',
      });

      const baseArmorB = createMockItem({
        id: 'armor-b' as EquipmentItemId,
        name: 'Updated Armor B',
        dropLevel: 8,
        __type: 'armor',
      });

      mockGameState = createMockGamestate({
        inventory: { items: [item1, item2], skills: [] },
      });

      mockAllHeroes.mockReturnValue([]);

      mockDroppableGetBaseId
        .mockReturnValueOnce('weapon-a' as EquipmentItemId)
        .mockReturnValueOnce('armor-b' as EquipmentItemId);

      mockGetEntry
        .mockReturnValueOnce(baseWeaponA)
        .mockReturnValueOnce(baseArmorB);

      // Act
      migrateItems();

      // Assert
      const [migratedItem1, migratedItem2] = mockGameState.inventory.items;

      expect(migratedItem1.name).toBe('Updated Weapon A');
      expect(migratedItem1.dropLevel).toBe(5);
      expect(migratedItem1.__type).toBe('weapon');

      expect(migratedItem2.name).toBe('Updated Armor B');
      expect(migratedItem2.dropLevel).toBe(8);
      expect(migratedItem2.__type).toBe('armor');
    });

    it('should handle items of all equipment types', () => {
      // Arrange
      const weapon = createMockItem({
        id: 'weapon|uuid1' as EquipmentItemId,
        __type: 'weapon',
      });

      const armor = createMockItem({
        id: 'armor|uuid2' as EquipmentItemId,
        __type: 'armor',
      });

      const accessory = createMockItem({
        id: 'accessory|uuid3' as EquipmentItemId,
        __type: 'accessory',
      });

      const trinket = createMockItem({
        id: 'trinket|uuid4' as EquipmentItemId,
        __type: 'trinket',
      });

      const baseData = createMockItem({
        name: 'Updated Item',
      });

      mockGameState = createMockGamestate({
        inventory: { items: [weapon, armor, accessory, trinket], skills: [] },
      });

      mockAllHeroes.mockReturnValue([]);
      mockDroppableGetBaseId.mockImplementation(
        (item) => item.id.split('|')[0] as EquipmentItemId,
      );
      mockGetEntry.mockReturnValue(baseData);

      // Act
      migrateItems();

      // Assert
      mockGameState.inventory.items.forEach((item) => {
        expect(item.name).toBe('Updated Item');
      });
    });
  });

  describe('hero equipped items migration', () => {
    it('should migrate equipped weapon for single hero', () => {
      // Arrange
      const equippedWeapon = createMockItem({
        id: 'equipped-weapon|uuid1' as EquipmentItemId,
        name: 'Equipped Weapon',
        __type: 'weapon',
      });

      const updatedWeaponData = createMockItem({
        id: 'equipped-weapon' as EquipmentItemId,
        name: 'Updated Equipped Weapon',
        dropLevel: 7,
        __type: 'weapon',
      });

      const hero = createMockHero({
        id: 'hero-1' as HeroId,
        equipment: {
          weapon: equippedWeapon,
          armor: undefined,
          accessory: undefined,
          trinket: undefined,
        },
      });

      mockGameState = createMockGamestate({
        inventory: { items: [], skills: [] },
      });

      mockAllHeroes.mockReturnValue([hero]);
      mockDroppableGetBaseId.mockReturnValue(
        'equipped-weapon' as EquipmentItemId,
      );
      mockGetEntry.mockReturnValue(updatedWeaponData);

      // Act
      migrateItems();

      // Assert
      expect(mockHeroUpdateData).toHaveBeenCalledWith('hero-1', {
        equipment: {
          weapon: expect.objectContaining({
            name: 'Updated Equipped Weapon',
            dropLevel: 7,
          }),
          armor: undefined,
          accessory: undefined,
          trinket: undefined,
        },
      });
    });

    it('should migrate all equipment slots for hero', () => {
      // Arrange
      const weapon = createMockItem({
        id: 'weapon|uuid1' as EquipmentItemId,
        __type: 'weapon',
      });

      const armor = createMockItem({
        id: 'armor|uuid2' as EquipmentItemId,
        __type: 'armor',
      });

      const accessory = createMockItem({
        id: 'accessory|uuid3' as EquipmentItemId,
        __type: 'accessory',
      });

      const trinket = createMockItem({
        id: 'trinket|uuid4' as EquipmentItemId,
        __type: 'trinket',
      });

      const baseData = createMockItem({
        name: 'Updated Equipment',
      });

      const hero = createMockHero({
        id: 'hero-multi' as HeroId,
        equipment: {
          weapon,
          armor,
          accessory,
          trinket,
        },
      });

      mockAllHeroes.mockReturnValue([hero]);
      mockGameState = createMockGamestate();

      mockDroppableGetBaseId.mockImplementation(
        (item) => item.id.split('|')[0] as EquipmentItemId,
      );

      mockGetEntry.mockReturnValue(baseData);

      // Act
      migrateItems();

      // Assert
      expect(mockHeroUpdateData).toHaveBeenCalledWith('hero-multi', {
        equipment: {
          weapon: expect.objectContaining({
            name: 'Updated Equipment',
          }),
          armor: expect.objectContaining({
            name: 'Updated Equipment',
          }),
          accessory: expect.objectContaining({
            name: 'Updated Equipment',
          }),
          trinket: expect.objectContaining({
            name: 'Updated Equipment',
          }),
        },
      });
    });

    it('should handle heroes with partial equipment', () => {
      // Arrange
      const weapon = createMockItem({
        id: 'weapon|uuid1' as EquipmentItemId,
        __type: 'weapon',
      });

      const baseData = createMockItem({
        name: 'Updated Weapon',
      });

      const hero = createMockHero({
        id: 'hero-partial' as HeroId,
        equipment: {
          weapon,
          armor: undefined,
          accessory: undefined,
          trinket: undefined,
        },
      });

      mockAllHeroes.mockReturnValue([hero]);
      mockGameState = createMockGamestate();
      mockDroppableGetBaseId.mockReturnValue('weapon' as EquipmentItemId);
      mockGetEntry.mockReturnValue(baseData);

      // Act
      migrateItems();

      // Assert
      expect(mockHeroUpdateData).toHaveBeenCalledWith('hero-partial', {
        equipment: {
          weapon: expect.objectContaining({
            name: 'Updated Weapon',
          }),
          armor: undefined,
          accessory: undefined,
          trinket: undefined,
        },
      });
    });

    it('should handle multiple heroes with equipped items', () => {
      // Arrange
      const hero1Weapon = createMockItem({
        id: 'hero1-weapon|uuid1' as EquipmentItemId,
        __type: 'weapon',
      });

      const hero2Armor = createMockItem({
        id: 'hero2-armor|uuid2' as EquipmentItemId,
        __type: 'armor',
      });

      const hero1 = createMockHero({
        id: 'hero-1' as HeroId,
        equipment: {
          weapon: hero1Weapon,
          armor: undefined,
          accessory: undefined,
          trinket: undefined,
        },
      });

      const hero2 = createMockHero({
        id: 'hero-2' as HeroId,
        equipment: {
          weapon: undefined,
          armor: hero2Armor,
          accessory: undefined,
          trinket: undefined,
        },
      });

      const baseWeapon = createMockItem({
        id: 'hero1-weapon' as EquipmentItemId,
        name: 'Hero 1 Updated Weapon',
        __type: 'weapon',
      });

      const baseArmor = createMockItem({
        id: 'hero2-armor' as EquipmentItemId,
        name: 'Hero 2 Updated Armor',
        __type: 'armor',
      });

      mockAllHeroes.mockReturnValue([hero1, hero2]);
      mockGameState = createMockGamestate();

      mockDroppableGetBaseId
        .mockReturnValueOnce('hero1-weapon' as EquipmentItemId)
        .mockReturnValueOnce('hero2-armor' as EquipmentItemId);

      mockGetEntry
        .mockReturnValueOnce(baseWeapon)
        .mockReturnValueOnce(baseArmor);

      // Act
      migrateItems();

      // Assert
      expect(mockHeroUpdateData).toHaveBeenCalledTimes(2);
      expect(mockHeroUpdateData).toHaveBeenNthCalledWith(1, 'hero-1', {
        equipment: {
          weapon: expect.objectContaining({ name: 'Hero 1 Updated Weapon' }),
          armor: undefined,
          accessory: undefined,
          trinket: undefined,
        },
      });
      expect(mockHeroUpdateData).toHaveBeenNthCalledWith(2, 'hero-2', {
        equipment: {
          weapon: undefined,
          armor: expect.objectContaining({ name: 'Hero 2 Updated Armor' }),
          accessory: undefined,
          trinket: undefined,
        },
      });
    });

    it('should handle heroes with no equipped items', () => {
      // Arrange
      const hero = createMockHero({
        id: 'hero-empty' as HeroId,
        equipment: {
          weapon: undefined,
          armor: undefined,
          accessory: undefined,
          trinket: undefined,
        },
      });

      mockAllHeroes.mockReturnValue([hero]);
      mockGameState = createMockGamestate();

      // Act
      migrateItems();

      // Assert
      expect(mockHeroUpdateData).toHaveBeenCalledWith('hero-empty', {
        equipment: {
          weapon: undefined,
          armor: undefined,
          accessory: undefined,
          trinket: undefined,
        },
      });
    });

    it('should handle equipped items with missing base data', () => {
      // Arrange
      const orphanedItem = createMockItem({
        id: 'orphaned-item|uuid1' as EquipmentItemId,
        name: 'Orphaned Item',
        __type: 'weapon',
      });

      const hero = createMockHero({
        id: 'hero-orphaned' as HeroId,
        equipment: {
          weapon: orphanedItem,
          armor: undefined,
          accessory: undefined,
          trinket: undefined,
        },
      });

      mockAllHeroes.mockReturnValue([hero]);
      mockGameState = createMockGamestate();
      mockDroppableGetBaseId.mockReturnValue(
        'orphaned-item' as EquipmentItemId,
      );
      mockGetEntry.mockReturnValue(undefined); // Missing base data

      // Act
      migrateItems();

      // Assert - original item should be preserved
      expect(mockHeroUpdateData).toHaveBeenCalledWith('hero-orphaned', {
        equipment: {
          weapon: orphanedItem, // Original item unchanged
          armor: undefined,
          accessory: undefined,
          trinket: undefined,
        },
      });
    });
  });

  describe('complex migration scenarios', () => {
    it('should handle mixed inventory and equipped items migration', () => {
      // Arrange
      const inventoryItem = createMockItem({
        id: 'inv-item|uuid1' as EquipmentItemId,
        name: 'Inventory Item',
        __type: 'accessory',
      });

      const equippedItem = createMockItem({
        id: 'eq-item|uuid2' as EquipmentItemId,
        name: 'Equipped Item',
        __type: 'weapon',
      });

      const baseInvItem = createMockItem({
        id: 'inv-item' as EquipmentItemId,
        name: 'Updated Inventory Item',
        __type: 'accessory',
      });

      const baseEqItem = createMockItem({
        id: 'eq-item' as EquipmentItemId,
        name: 'Updated Equipped Item',
        __type: 'weapon',
      });

      const hero = createMockHero({
        id: 'hero-mixed' as HeroId,
        equipment: {
          weapon: equippedItem,
          armor: undefined,
          accessory: undefined,
          trinket: undefined,
        },
      });

      mockGameState = createMockGamestate({
        inventory: { items: [inventoryItem], skills: [] },
      });

      mockAllHeroes.mockReturnValue([hero]);

      mockDroppableGetBaseId
        .mockReturnValueOnce('inv-item' as EquipmentItemId)
        .mockReturnValueOnce('eq-item' as EquipmentItemId);

      mockGetEntry
        .mockReturnValueOnce(baseInvItem)
        .mockReturnValueOnce(baseEqItem);

      // Act
      migrateItems();

      // Assert
      expect(mockGameState.inventory.items[0].name).toBe(
        'Updated Inventory Item',
      );

      expect(mockHeroUpdateData).toHaveBeenCalledWith('hero-mixed', {
        equipment: {
          weapon: expect.objectContaining({ name: 'Updated Equipped Item' }),
          armor: undefined,
          accessory: undefined,
          trinket: undefined,
        },
      });
    });

    it('should handle items with complex mods data structure', () => {
      // Arrange
      const complexItem = createMockItem({
        id: 'complex-item|uuid1' as EquipmentItemId,
        enchantLevel: 5,
        mods: {
          enchantLevel: 3,
          baseStats: createMockStatBlock({ Force: 15, Health: 30 }),
          elementMultipliers: [
            { element: 'Fire', multiplier: 0.5 },
            { element: 'Water', multiplier: 0.3 },
          ],
          talentBoosts: [
            { talentId: 'talent1' as TalentBoost['talentId'], value: 2 },
          ],
          traitIds: ['trait1' as TraitEquipmentId],
          skillIds: ['skill1' as EquipmentSkillId],
        },
      });

      const baseComplexItem = createMockItem({
        id: 'complex-item' as EquipmentItemId,
        name: 'Updated Complex Item',
        dropLevel: 15,
        // Base data will overwrite all properties except id
        enchantLevel: 0,
        mods: {},
      });

      const hero = createMockHero({
        id: 'hero-complex' as HeroId,
        equipment: {
          weapon: complexItem,
          armor: undefined,
          accessory: undefined,
          trinket: undefined,
        },
      });

      mockAllHeroes.mockReturnValue([hero]);
      mockGameState = createMockGamestate();
      mockDroppableGetBaseId.mockReturnValue('complex-item' as EquipmentItemId);
      mockGetEntry.mockReturnValue(baseComplexItem);

      // Act
      migrateItems();

      // Assert
      expect(mockHeroUpdateData).toHaveBeenCalledWith('hero-complex', {
        equipment: {
          weapon: expect.objectContaining({
            name: 'Updated Complex Item',
            dropLevel: 15,
            enchantLevel: 0, // Base data overwrites
            mods: {}, // Base data overwrites
          }),
          armor: undefined,
          accessory: undefined,
          trinket: undefined,
        },
      });
    });

    it('should preserve item instance IDs during migration', () => {
      // Arrange
      const originalId = 'preserve-id-item|unique-uuid-123' as EquipmentItemId;
      const item = createMockItem({
        id: originalId,
        name: 'Original Item',
      });

      const baseItem = createMockItem({
        id: 'preserve-id-item' as EquipmentItemId,
        name: 'Updated Base Item',
      });

      mockGameState = createMockGamestate({
        inventory: { items: [item], skills: [] },
      });

      mockAllHeroes.mockReturnValue([]);
      mockDroppableGetBaseId.mockReturnValue(
        'preserve-id-item' as EquipmentItemId,
      );
      mockGetEntry.mockReturnValue(baseItem);

      // Act
      migrateItems();

      // Assert
      expect(mockGameState.inventory.items[0].id).toBe(originalId);
      expect(mockGameState.inventory.items[0].name).toBe('Updated Base Item');
    });
  });

  describe('error handling and edge cases', () => {
    it('should propagate droppableGetBaseId errors', () => {
      // Arrange
      const problematicItem = createMockItem({
        id: 'problematic-item|uuid1' as EquipmentItemId,
      });

      mockGameState = createMockGamestate({
        inventory: { items: [problematicItem], skills: [] },
      });

      mockAllHeroes.mockReturnValue([]);
      mockDroppableGetBaseId.mockImplementation(() => {
        throw new Error('Failed to get base ID');
      });

      // Act & Assert - should propagate error
      expect(() => migrateItems()).toThrow('Failed to get base ID');
    });

    it('should propagate getEntry errors', () => {
      // Arrange
      const item = createMockItem({
        id: 'error-item|uuid1' as EquipmentItemId,
      });

      mockGameState = createMockGamestate({
        inventory: { items: [item], skills: [] },
      });

      mockAllHeroes.mockReturnValue([]);
      mockDroppableGetBaseId.mockReturnValue('error-item' as EquipmentItemId);
      mockGetEntry.mockImplementation(() => {
        throw new Error('Failed to get entry');
      });

      // Act & Assert - should propagate error
      expect(() => migrateItems()).toThrow('Failed to get entry');
    });

    it('should propagate heroUpdateData errors', () => {
      // Arrange
      const item = createMockItem({
        id: 'update-error-item|uuid1' as EquipmentItemId,
      });

      const baseItem = createMockItem({
        id: 'update-error-item' as EquipmentItemId,
        name: 'Updated Item',
      });

      const hero = createMockHero({
        id: 'error-hero' as HeroId,
        equipment: {
          weapon: item,
          armor: undefined,
          accessory: undefined,
          trinket: undefined,
        },
      });

      mockAllHeroes.mockReturnValue([hero]);
      mockGameState = createMockGamestate();
      mockDroppableGetBaseId.mockReturnValue(
        'update-error-item' as EquipmentItemId,
      );
      mockGetEntry.mockReturnValue(baseItem);
      mockHeroUpdateData.mockImplementation(() => {
        throw new Error('Failed to update hero');
      });

      // Act & Assert - should propagate error
      expect(() => migrateItems()).toThrow('Failed to update hero');
    });

    it('should handle malformed item IDs gracefully', () => {
      // Arrange
      const malformedItem = createMockItem({
        id: 'malformed-id-without-separator' as EquipmentItemId,
      });

      mockGameState = createMockGamestate({
        inventory: { items: [malformedItem], skills: [] },
      });

      mockAllHeroes.mockReturnValue([]);
      mockDroppableGetBaseId.mockReturnValue(
        'malformed-base' as EquipmentItemId,
      );
      mockGetEntry.mockReturnValue(undefined);

      // Act
      migrateItems();

      // Assert - item should have id preserved but other properties may be undefined
      const resultItem = mockGameState.inventory.items[0];
      expect(resultItem.id).toBe('malformed-id-without-separator');
    });

    it('should handle items with null base data from getEntry', () => {
      // Arrange
      const itemWithNullBase = createMockItem({
        id: 'null-base-item|uuid1' as EquipmentItemId,
        name: 'Original Item',
      });

      mockGameState = createMockGamestate({
        inventory: { items: [itemWithNullBase], skills: [] },
      });

      mockAllHeroes.mockReturnValue([]);
      mockDroppableGetBaseId.mockReturnValue(
        'null-base-item' as EquipmentItemId,
      );
      mockGetEntry.mockReturnValue(undefined); // Simulate null base data

      // Act
      migrateItems();

      // Assert - item should still have its original id preserved
      const resultItem = mockGameState.inventory.items[0];
      expect(resultItem.id).toBe('null-base-item|uuid1');
    });

    it('should handle large inventory with many items', () => {
      // Arrange
      const manyItems = Array.from({ length: 100 }, (_, i) =>
        createMockItem({
          id: `item-${i}|uuid${i}` as EquipmentItemId,
          name: `Item ${i}`,
        }),
      );

      const baseItem = createMockItem({
        name: 'Updated Item',
      });

      mockGameState = createMockGamestate({
        inventory: { items: manyItems, skills: [] },
      });

      mockAllHeroes.mockReturnValue([]);
      mockDroppableGetBaseId.mockImplementation(
        (item) => item.id.split('|')[0] as EquipmentItemId,
      );
      mockGetEntry.mockReturnValue(baseItem);

      // Act
      migrateItems();

      // Assert
      expect(mockGetEntry).toHaveBeenCalledTimes(100);
      mockGameState.inventory.items.forEach((item, index) => {
        expect(item.name).toBe('Updated Item');
        expect(item.id).toBe(`item-${index}|uuid${index}`);
      });
    });
  });
});
