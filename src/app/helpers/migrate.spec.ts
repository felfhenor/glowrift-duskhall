import type { GameOptions } from '@interfaces';
import type { GameState } from '@interfaces/state-game';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Direct module mocking to avoid Angular signal compilation issues
vi.mock('@helpers/migrate-items', () => ({
  migrateItems: vi.fn(),
}));

vi.mock('@helpers/migrate-skills', () => ({
  migrateSkills: vi.fn(),
}));

vi.mock('@helpers/defaults', () => ({
  defaultGameState: vi.fn(),
  gamestate: vi.fn(),
  setGameState: vi.fn(),
}));

vi.mock('@helpers/state-game', () => ({
  gamestate: vi.fn(),
  setGameState: vi.fn(),
  gamestateTickStart: vi.fn(),
  gamestateTickEnd: vi.fn(),
  saveGameState: vi.fn(),
}));

vi.mock('@helpers/state-options', () => ({
  defaultOptions: vi.fn(),
  options: vi.fn(),
  setOptions: vi.fn(),
}));

vi.mock('@helpers/timer', () => ({
  cleanupOldTimerEntries: vi.fn(),
}));

vi.mock('@helpers/world-location', () => ({
  resetClaimedNodeCounts: vi.fn(),
  locationGetClaimed: vi.fn(() => []),
}));

vi.mock('@helpers/interconnectedness', () => ({
  interconnectednessRecalculate: vi.fn(),
}));

vi.mock('es-toolkit/compat', () => ({
  merge: vi.fn(),
}));

vi.mock('@helpers/timer', () => ({
  migrateCleanupOldTimerEntries: vi.fn(),
}));

vi.mock('@helpers/migrate-world', () => ({
  migrateResetClaimedNodeCounts: vi.fn(),
  migrateUnclaimMissedNodes: vi.fn(),
  migratePermanentlyClaimedNodes: vi.fn(),
}));

// Import after mocking
import { migrateGameState, migrateOptionsState } from '@helpers/migrate';

// Import mocked functions
import { defaultGameState } from '@helpers/defaults';
import { migrateItems } from '@helpers/migrate-items';
import { migrateSkills } from '@helpers/migrate-skills';
import { gamestate, setGameState } from '@helpers/state-game';
import { defaultOptions, options, setOptions } from '@helpers/state-options';
import { merge } from 'es-toolkit/compat';

import { migrateResetClaimedNodeCounts } from '@helpers/migrate-world';
import { migrateCleanupOldTimerEntries } from '@helpers/timer';

describe('migrate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Get mocked function references that are used
  const mockedGamestate = vi.mocked(gamestate);
  const mockedDefaultGameState = vi.mocked(defaultGameState);
  const mockedMerge = vi.mocked(merge);
  const mockedSetGameState = vi.mocked(setGameState);
  const mockedMigrateItems = vi.mocked(migrateItems);
  const mockedMigrateSkills = vi.mocked(migrateSkills);
  const mockedOptions = vi.mocked(options);
  const mockedDefaultOptions = vi.mocked(defaultOptions);

  // Mock data factories
  const createMockGameState = (): GameState => ({
    meta: {
      version: 1,
      isSetup: true,
      isPaused: false,
      hasWon: false,
      hasDismissedWinNotification: false,
      wonAtTick: 0,
      createdAt: Date.now(),
      lastSaveTick: 0,
    },
    gameId: 'test-game-id' as GameState['gameId'],
    world: {
      config: {
        id: 'test-world',
        name: 'Test World',
        __type: 'worldconfig',
        width: 100,
        height: 100,
        maxLevel: 25,
        nodeCount: {
          town: { min: 1, max: 2 },
          village: { min: 1, max: 3 },
          cave: { min: 0, max: 1 },
          dungeon: { min: 0, max: 1 },
          castle: { min: 1, max: 1 },
        },
      },
      nodes: {},
      homeBase: { x: 50, y: 50 },
      nodeCounts: {
        town: 5,
        cave: 10,
        village: 15,
        dungeon: 8,
        castle: 12,
      },
      claimedCounts: {
        town: 0,
        cave: 0,
        village: 0,
        dungeon: 0,
        castle: 0,
      },
    },
    camera: { x: 50, y: 50 },
    hero: {
      respawnTicks: 0,
      riskTolerance: 'medium',
      nodeTypePreferences: {
        town: true,
        cave: true,
        village: true,
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
      heroes: [],
      position: { nodeId: 'test-node', x: 50, y: 50 },
      travel: {
        nodeId: 'test-travel-node',
        x: 45,
        y: 45,
        ticksLeft: 0,
        ticksTotal: 0,
      },
      location: { ticksLeft: 0, ticksTotal: 0 },
      tooHardNodes: [],
    },
    inventory: {
      items: [],
      skills: [],
    },
    currency: {
      currencyPerTickEarnings: {
        'Fire Sliver': 0,
        'Fire Shard': 0,
        'Fire Crystal': 0,
        'Fire Core': 0,
        'Water Sliver': 0,
        'Water Shard': 0,
        'Water Crystal': 0,
        'Water Core': 0,
        'Air Sliver': 0,
        'Air Shard': 0,
        'Air Crystal': 0,
        'Air Core': 0,
        'Earth Sliver': 0,
        'Earth Shard': 0,
        'Earth Crystal': 0,
        'Earth Core': 0,
        'Soul Essence': 0,
        'Common Dust': 0,
        'Uncommon Dust': 0,
        'Rare Dust': 0,
        'Legendary Dust': 0,
        'Mystical Dust': 0,
        'Unique Dust': 0,
        Mana: 0,
      },
      currencies: {
        'Fire Sliver': 25,
        'Fire Shard': 5,
        'Fire Crystal': 1,
        'Fire Core': 0,
        'Water Sliver': 30,
        'Water Shard': 3,
        'Water Crystal': 0,
        'Water Core': 0,
        'Air Sliver': 20,
        'Air Shard': 2,
        'Air Crystal': 0,
        'Air Core': 0,
        'Earth Sliver': 15,
        'Earth Shard': 1,
        'Earth Crystal': 0,
        'Earth Core': 0,
        'Soul Essence': 50,
        'Common Dust': 10,
        'Uncommon Dust': 0,
        'Rare Dust': 0,
        'Legendary Dust': 0,
        'Mystical Dust': 0,
        'Unique Dust': 0,
        Mana: 1000,
      },
    },
    actionClock: {
      numTicks: 0,
      timers: {},
    },
    town: {
      buildingLevels: {
        Academy: 1,
        Alchemist: 1,
        Blacksmith: 1,
        Market: 1,
        Merchant: 1,
        Salvager: 1,
        'Rally Point': 1,
      },
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
  });

  const createMockOptions = (): GameOptions => ({
    showDebug: false,
    debugConsoleLogStateUpdates: false,
    debugGameloopTimerUpdates: false,
    debugMapNodePositions: false,
    debugAllowBackgroundOperations: false,
    debugDisableFogOfWar: false,
    debugTickMultiplier: 1,
    debugSaveInterval: 30,
    sfxPlay: true,
    followHeroesOnMap: false,
    uiTheme: 'dark',
    sfxVolume: 0.5,
    gameloopPaused: false,
    canSendNotifications: true,
    enabledNotificationCategories: ['Travel', 'LocationClaim'],
    combatTab: 'Preferences',
    optionsTab: 'UI',
    townTab: 'Market',
    worldTab: 'ResourceGeneration',
    inventoryFilter: 'accessory',
    selectedHeroIndex: 0,
    selectedTalentTreeElement: 'Fire',
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('migrateGameState', () => {
    it('should migrate game state by merging blank state with current state', () => {
      // Arrange
      const mockCurrentState = createMockGameState();
      const mockBlankState = createMockGameState();
      const mockMergedState = { ...mockBlankState, ...mockCurrentState };

      mockedGamestate.mockReturnValue(mockCurrentState);
      mockedDefaultGameState.mockReturnValue(mockBlankState);
      mockedMerge.mockReturnValue(mockMergedState);

      // Act
      migrateGameState();

      // Assert
      expect(defaultGameState).toHaveBeenCalledOnce();
      expect(gamestate).toHaveBeenCalledOnce();
      expect(merge).toHaveBeenCalledWith(mockBlankState, mockCurrentState);
      expect(setGameState).toHaveBeenCalledWith(mockMergedState);
    });

    it('should call migration helpers after setting game state', () => {
      // Arrange
      const mockCurrentState = createMockGameState();
      const mockBlankState = createMockGameState();
      const mockMergedState = { ...mockBlankState, ...mockCurrentState };

      mockedGamestate.mockReturnValue(mockCurrentState);
      mockedDefaultGameState.mockReturnValue(mockBlankState);
      mockedMerge.mockReturnValue(mockMergedState);

      // Act
      migrateGameState();

      // Assert
      expect(migrateItems).toHaveBeenCalledOnce();
      expect(migrateSkills).toHaveBeenCalledOnce();
      expect(migrateCleanupOldTimerEntries).toHaveBeenCalledOnce();
      expect(migrateResetClaimedNodeCounts).toHaveBeenCalledOnce();
    });

    it('should perform migration steps in correct order', () => {
      // Arrange
      const mockCurrentState = createMockGameState();
      const mockBlankState = createMockGameState();
      const mockMergedState = { ...mockBlankState, ...mockCurrentState };

      mockedGamestate.mockReturnValue(mockCurrentState);
      mockedDefaultGameState.mockReturnValue(mockBlankState);
      mockedMerge.mockReturnValue(mockMergedState);

      const callOrder: string[] = [];
      mockedSetGameState.mockImplementation(() => {
        callOrder.push('setGameState');
      });
      mockedMigrateItems.mockImplementation(() => {
        callOrder.push('migrateItems');
      });
      mockedMigrateSkills.mockImplementation(() => {
        callOrder.push('migrateSkills');
      });
      (
        migrateCleanupOldTimerEntries as unknown as ReturnType<typeof vi.fn>
      ).mockImplementation(() => {
        callOrder.push('cleanupOldTimerEntries');
      });
      (
        migrateResetClaimedNodeCounts as unknown as ReturnType<typeof vi.fn>
      ).mockImplementation(() => {
        callOrder.push('resetClaimedNodeCounts');
      });

      // Act
      migrateGameState();

      // Assert
      expect(callOrder).toEqual([
        'setGameState',
        'migrateItems',
        'migrateSkills',
        'cleanupOldTimerEntries',
        'resetClaimedNodeCounts',
      ]);
    });

    it('should handle partial game state data', () => {
      // Arrange
      const partialState = {
        meta: {
          version: 1,
          isSetup: false,
          isPaused: false,
          hasWon: false,
          hasDismissedWinNotification: false,
          wonAtTick: 0,
          createdAt: Date.now(),
        },
        gameId: 'partial-game-id' as GameState['gameId'],
      } as GameState;

      const mockBlankState = createMockGameState();
      const mockMergedState = { ...mockBlankState, ...partialState };

      mockedGamestate.mockReturnValue(partialState);
      mockedDefaultGameState.mockReturnValue(mockBlankState);
      mockedMerge.mockReturnValue(mockMergedState);

      // Act
      migrateGameState();

      // Assert
      expect(merge).toHaveBeenCalledWith(mockBlankState, partialState);
      expect(setGameState).toHaveBeenCalledWith(mockMergedState);
      expect(migrateItems).toHaveBeenCalledOnce();
      expect(migrateSkills).toHaveBeenCalledOnce();
      expect(migrateCleanupOldTimerEntries).toHaveBeenCalledOnce();
      expect(migrateResetClaimedNodeCounts).toHaveBeenCalledOnce();
    });
  });

  describe('migrateOptionsState', () => {
    it('should migrate options state by merging default options with current options', () => {
      // Arrange
      const mockCurrentOptions = createMockOptions();
      const mockDefaultOptions = createMockOptions();
      const mockMergedOptions = {
        ...mockDefaultOptions,
        ...mockCurrentOptions,
      };

      mockedOptions.mockReturnValue(mockCurrentOptions);
      mockedDefaultOptions.mockReturnValue(mockDefaultOptions);
      mockedMerge.mockReturnValue(mockMergedOptions);

      // Act
      migrateOptionsState();

      // Assert
      expect(defaultOptions).toHaveBeenCalledOnce();
      expect(options).toHaveBeenCalledOnce();
      expect(merge).toHaveBeenCalledWith(
        mockDefaultOptions,
        mockCurrentOptions,
      );
      expect(setOptions).toHaveBeenCalledWith(mockMergedOptions);
    });

    it('should handle partial options data', () => {
      // Arrange
      const partialOptions = {
        showDebug: true,
        sfxPlay: false,
        sfxVolume: 0.8,
      } as GameOptions;

      const mockDefaultOptions = createMockOptions();
      const mockMergedOptions = { ...mockDefaultOptions, ...partialOptions };

      mockedOptions.mockReturnValue(partialOptions);
      mockedDefaultOptions.mockReturnValue(mockDefaultOptions);
      mockedMerge.mockReturnValue(mockMergedOptions);

      // Act
      migrateOptionsState();

      // Assert
      expect(merge).toHaveBeenCalledWith(mockDefaultOptions, partialOptions);
      expect(setOptions).toHaveBeenCalledWith(mockMergedOptions);
    });

    it('should handle empty options object', () => {
      // Arrange
      const emptyOptions = {} as GameOptions;
      const mockDefaultOptions = createMockOptions();
      const mockMergedOptions = mockDefaultOptions;

      mockedOptions.mockReturnValue(emptyOptions);
      mockedDefaultOptions.mockReturnValue(mockDefaultOptions);
      mockedMerge.mockReturnValue(mockMergedOptions);

      // Act
      migrateOptionsState();

      // Assert
      expect(merge).toHaveBeenCalledWith(mockDefaultOptions, emptyOptions);
      expect(setOptions).toHaveBeenCalledWith(mockMergedOptions);
    });

    it('should preserve custom options values during migration', () => {
      // Arrange
      const customOptions: GameOptions = {
        ...createMockOptions(),
        showDebug: true,
        sfxPlay: false,
        sfxVolume: 0.8,
        uiTheme: 'light',
        enabledNotificationCategories: ['Travel'],
        combatTab: 'CombatLog',
        selectedHeroIndex: 2,
      };

      const mockDefaultOptions = createMockOptions();
      const mockMergedOptions = { ...mockDefaultOptions, ...customOptions };

      mockedOptions.mockReturnValue(customOptions);
      mockedDefaultOptions.mockReturnValue(mockDefaultOptions);
      mockedMerge.mockReturnValue(mockMergedOptions);

      // Act
      migrateOptionsState();

      // Assert
      expect(merge).toHaveBeenCalledWith(mockDefaultOptions, customOptions);
      expect(setOptions).toHaveBeenCalledWith(mockMergedOptions);
    });

    it('should handle options with different notification categories', () => {
      // Arrange
      const optionsWithDifferentCategories: GameOptions = {
        ...createMockOptions(),
        enabledNotificationCategories: ['Travel', 'Festival'],
      };

      const mockDefaultOptions = createMockOptions();
      const mockMergedOptions = {
        ...mockDefaultOptions,
        ...optionsWithDifferentCategories,
      };

      mockedOptions.mockReturnValue(optionsWithDifferentCategories);
      mockedDefaultOptions.mockReturnValue(mockDefaultOptions);
      mockedMerge.mockReturnValue(mockMergedOptions);

      // Act
      migrateOptionsState();

      // Assert
      expect(merge).toHaveBeenCalledWith(
        mockDefaultOptions,
        optionsWithDifferentCategories,
      );
      expect(setOptions).toHaveBeenCalledWith(mockMergedOptions);
    });

    it('should handle debug options correctly', () => {
      // Arrange
      const debugEnabledOptions: GameOptions = {
        ...createMockOptions(),
        showDebug: true,
        debugConsoleLogStateUpdates: true,
        debugGameloopTimerUpdates: true,
        debugMapNodePositions: true,
        debugAllowBackgroundOperations: true,
        debugDisableFogOfWar: true,
        debugTickMultiplier: 5,
      };

      const mockDefaultOptions = createMockOptions();
      const mockMergedOptions = {
        ...mockDefaultOptions,
        ...debugEnabledOptions,
      };

      mockedOptions.mockReturnValue(debugEnabledOptions);
      mockedDefaultOptions.mockReturnValue(mockDefaultOptions);
      mockedMerge.mockReturnValue(mockMergedOptions);

      // Act
      migrateOptionsState();

      // Assert
      expect(merge).toHaveBeenCalledWith(
        mockDefaultOptions,
        debugEnabledOptions,
      );
      expect(setOptions).toHaveBeenCalledWith(mockMergedOptions);
    });
  });
});
