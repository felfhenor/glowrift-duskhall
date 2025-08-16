import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockedFunction,
} from 'vitest';

// Import the functions under test
import { migrateSkills } from '@helpers/migrate-skills';

// Types
import type {
  EquipmentSkill,
  EquipmentSkillId,
} from '@interfaces/content-skill';
import type { Hero, HeroId } from '@interfaces/hero';
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

describe('migrateSkills', () => {
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
  const createMockSkill = (
    props: Partial<EquipmentSkill> = {},
  ): EquipmentSkill => ({
    id: 'test-skill-1|uuid123' as EquipmentSkillId,
    name: 'Test Skill',
    __type: 'skill',
    sprite: 'test-sprite',
    frames: 1,
    rarity: 'Common',
    dropLevel: 1,
    enchantLevel: 0,
    disableUpgrades: false,
    unableToUpgrade: [],
    preventDrop: false,
    preventModification: false,
    isFavorite: false,
    techniques: [],
    usesPerCombat: -1,
    numTargets: 1,
    damageScaling: {
      Force: 0,
      Health: 0,
      Speed: 0,
      Aura: 0,
    },
    statusEffectDurationBoost: {},
    statusEffectChanceBoost: {},
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
    baseStats: {
      Force: 10,
      Health: 100,
      Speed: 5,
      Aura: 5,
    },
    totalStats: {
      Force: 10,
      Health: 100,
      Speed: 5,
      Aura: 5,
    },
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
    mockDroppableGetBaseId.mockImplementation((item) => item.id.split('|')[0]);
  });

  describe('empty state tests', () => {
    it('should handle empty state gracefully', () => {
      // Arrange
      mockGameState = createMockGamestate({
        inventory: { skills: [], items: [] },
        hero: {
          ...mockGameState.hero,
          heroes: [],
        },
      });

      mockAllHeroes.mockReturnValue([]);

      // Act
      migrateSkills();

      // Assert
      expect(mockAllHeroes).toHaveBeenCalledOnce();
    });

    it('should not call heroUpdateData when no heroes exist', () => {
      // Arrange
      mockGameState = createMockGamestate();
      mockAllHeroes.mockReturnValue([]);

      // Act
      migrateSkills();

      // Assert
      expect(mockHeroUpdateData).not.toHaveBeenCalled();
    });
  });

  describe('inventory skills migration', () => {
    it('should migrate inventory skills with updated references', () => {
      // Arrange
      const originalSkill = createMockSkill({
        id: 'old-skill|uuid1' as EquipmentSkillId,
        name: 'Old Skill',
      });

      const updatedSkill = createMockSkill({
        id: 'new-skill|uuid2' as EquipmentSkillId,
        name: 'New Skill',
        dropLevel: 5,
      });

      mockGameState = createMockGamestate({
        inventory: { skills: [originalSkill], items: [] },
      });

      mockAllHeroes.mockReturnValue([]);
      mockDroppableGetBaseId.mockReturnValue('old-skill' as EquipmentSkillId);
      mockGetEntry.mockReturnValue(updatedSkill);

      // Act
      migrateSkills();

      // Assert
      expect(mockGetEntry).toHaveBeenCalledWith('old-skill');
      expect(mockDroppableGetBaseId).toHaveBeenCalledWith(originalSkill);
      expect(mockGameState.inventory.skills[0].name).toBe('New Skill');
      expect(mockGameState.inventory.skills[0].dropLevel).toBe(5);
      expect(mockGameState.inventory.skills[0].id).toBe('old-skill|uuid1'); // ID preserved
    });

    it('should handle skills with null or undefined base data', () => {
      // Arrange
      const originalSkill = createMockSkill({
        id: 'missing-skill|uuid1' as EquipmentSkillId,
      });

      mockGameState = createMockGamestate({
        inventory: { skills: [originalSkill], items: [] },
      });

      mockAllHeroes.mockReturnValue([]);
      mockDroppableGetBaseId.mockReturnValue(
        'missing-skill' as EquipmentSkillId,
      );
      mockGetEntry.mockReturnValue(undefined); // Simulate missing base data

      // Act
      migrateSkills();

      // Assert
      // Original skill should remain unchanged when base data is missing
      const unchangedSkill = mockGameState.inventory.skills[0];
      expect(unchangedSkill).toEqual(originalSkill);
    });
  });

  describe('hero equipped skills migration', () => {
    it('should migrate equipped skills for single hero', () => {
      // Arrange
      const equippedSkill = createMockSkill({
        id: 'equipped-skill|uuid1' as EquipmentSkillId,
        name: 'Equipped Skill',
      });

      const updatedSkillData = createMockSkill({
        id: 'equipped-skill' as EquipmentSkillId,
        name: 'Updated Equipped Skill',
        dropLevel: 7,
      });

      const hero = createMockHero({
        id: 'hero-1' as HeroId,
        skills: [equippedSkill, undefined, undefined],
      });

      mockGameState = createMockGamestate({
        inventory: { skills: [], items: [] },
      });

      mockAllHeroes.mockReturnValue([hero]);
      mockDroppableGetBaseId.mockReturnValue(
        'equipped-skill' as EquipmentSkillId,
      );
      mockGetEntry.mockReturnValue(updatedSkillData);

      // Act
      migrateSkills();

      // Assert
      expect(mockHeroUpdateData).toHaveBeenCalledWith('hero-1', {
        skills: [
          expect.objectContaining({
            name: 'Updated Equipped Skill',
            dropLevel: 7,
          }),
        ],
      });
    });

    it('should handle heroes with empty skills array', () => {
      // Arrange
      const hero = createMockHero({
        id: 'hero-empty-skills' as HeroId,
        skills: [],
      });

      mockAllHeroes.mockReturnValue([hero]);
      mockGameState = createMockGamestate();

      // Act
      migrateSkills();

      // Assert
      expect(mockHeroUpdateData).toHaveBeenCalledWith('hero-empty-skills', {
        skills: [],
      });
    });
  });
});
