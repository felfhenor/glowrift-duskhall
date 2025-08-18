import { defaultCurrencyBlock } from '@helpers/defaults';
import type { FestivalContent, FestivalId } from '@interfaces/content-festival';
import type { GameState } from '@interfaces/state-game';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Helper function to create properly typed FestivalId
const createFestivalId = (id: string): FestivalId => id as FestivalId;

// Create a mock game state
const createMockGameState = (
  overrides: Partial<GameState> = {},
): GameState => ({
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
      id: 'world-config-1',
      name: 'Test World Config',
      __type: 'worldconfig',
      width: 1000,
      height: 1000,
      maxLevel: 100,
      nodeCount: {
        town: { min: 1, max: 3 },
        village: { min: 2, max: 5 },
        cave: { min: 3, max: 8 },
        dungeon: { min: 5, max: 12 },
        castle: { min: 1, max: 2 },
      },
    },
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
  camera: {
    x: 0,
    y: 0,
  },
  hero: {
    riskTolerance: 'low',
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
    heroes: [],
    position: { x: 0, y: 0, nodeId: 'test-node' },
    travel: { x: 0, y: 0, nodeId: 'test-node', ticksLeft: 0 },
    location: { ticksTotal: 0, ticksLeft: 0 },
    respawnTicks: 0,
    tooHardNodes: [],
    combat: undefined,
  },
  currency: {
    currencyPerTickEarnings: defaultCurrencyBlock(),
    currencies: defaultCurrencyBlock(),
  },
  inventory: {
    items: [],
    skills: [],
  },
  actionClock: {
    numTicks: 0,
    timers: {},
  },
  town: {
    buildingLevels: {
      Market: 0,
      Merchant: 0,
      Blacksmith: 0,
      Academy: 0,
      Alchemist: 0,
      Salvager: 0,
      'Rally Point': 0,
    },
    merchant: {
      ticksUntilRefresh: 0,
      soldItems: [],
    },
    townUpgrades: {},
  },
  festival: {
    ticksWithoutFestivalStart: 5000,
    festivals: {},
  },
  ...overrides,
});

// Mock dependencies
vi.mock('@helpers/clock', () => ({
  clockGetTickTimer: vi.fn((duration: number) => Date.now() + duration),
}));

vi.mock('@helpers/content', () => ({
  getEntriesByType: vi.fn(() => []),
  getEntry: vi.fn(() => null),
}));

vi.mock('@helpers/notify', () => ({
  notify: vi.fn(),
}));

vi.mock('@helpers/rng', () => ({
  rngChoiceRarity: vi.fn(() => null),
  rngSucceedsChance: vi.fn(() => false),
}));

vi.mock('@helpers/state-game', () => ({
  gamestate: vi.fn(() => createMockGameState()),
  updateGamestate: vi.fn((updater) => {
    const state = createMockGameState();
    return updater(state);
  }),
}));

vi.mock('@helpers/timer', () => ({
  timerAddFestivalEndAction: vi.fn(),
}));

// Import functions after mocking
import { clockGetTickTimer } from '@helpers/clock';
import { getEntriesByType, getEntry } from '@helpers/content';
import {
  festivalGetActive,
  festivalIsActive,
  festivalMaybeStartNew,
  festivalPickRandomByRarity,
  festivalStart,
  festivalStop,
} from '@helpers/festival';
import { notify } from '@helpers/notify';
import { rngChoiceRarity, rngSucceedsChance } from '@helpers/rng';
import { gamestate, updateGamestate } from '@helpers/state-game';
import { timerAddFestivalEndAction } from '@helpers/timer';

describe('Festival Helper', () => {
  let mockFestival: FestivalContent;

  beforeEach(() => {
    vi.clearAllMocks();

    mockFestival = {
      id: createFestivalId('test-festival'),
      name: 'Test Festival',
      description: 'A test festival',
      rarity: 'Common',
      __type: 'festival',
      endDescription: 'Test festival ends',
      effectsDescription: 'Test effects',
      duration: 10000,
      effects: {
        production: {
          Mana: 100,
        },
      },
    };

    // Reset default game state
    vi.mocked(gamestate).mockReturnValue(createMockGameState());
  });

  describe('festivalGetActive', () => {
    it('should return empty array when no festivals are active', () => {
      vi.mocked(gamestate).mockReturnValue(
        createMockGameState({
          festival: {
            ticksWithoutFestivalStart: 0,
            festivals: {},
          },
        }),
      );

      const result = festivalGetActive();

      expect(result).toEqual([]);
    });

    it('should return active festivals', () => {
      vi.mocked(gamestate).mockReturnValue(
        createMockGameState({
          festival: {
            ticksWithoutFestivalStart: 0,
            festivals: {
              'test-festival': Date.now() + 5000,
              'another-festival': Date.now() + 3000,
            },
          },
        }),
      );

      vi.mocked(getEntry).mockImplementation((id: string) => {
        if (id === 'test-festival') return mockFestival;
        if (id === 'another-festival') {
          return {
            ...mockFestival,
            id: createFestivalId('another-festival'),
            name: 'Another Festival',
          };
        }
        return undefined;
      });

      const result = festivalGetActive();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(mockFestival);
      expect(result[1].name).toBe('Another Festival');
      expect(getEntry).toHaveBeenCalledWith('test-festival');
      expect(getEntry).toHaveBeenCalledWith('another-festival');
    });

    it('should filter out null entries', () => {
      vi.mocked(gamestate).mockReturnValue(
        createMockGameState({
          festival: {
            ticksWithoutFestivalStart: 0,
            festivals: {
              'valid-festival': Date.now() + 5000,
              'invalid-festival': Date.now() + 3000,
            },
          },
        }),
      );

      vi.mocked(getEntry).mockImplementation((id: string) => {
        if (id === 'valid-festival') return mockFestival;
        return undefined; // invalid-festival returns undefined
      });

      const result = festivalGetActive();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockFestival);
    });

    it('should handle empty festival object keys', () => {
      vi.mocked(gamestate).mockReturnValue(
        createMockGameState({
          festival: {
            ticksWithoutFestivalStart: 0,
            festivals: {},
          },
        }),
      );

      const result = festivalGetActive();

      expect(result).toEqual([]);
      expect(getEntry).not.toHaveBeenCalled();
    });
  });

  describe('festivalIsActive', () => {
    it('should return true when festival is active', () => {
      vi.mocked(gamestate).mockReturnValue(
        createMockGameState({
          festival: {
            ticksWithoutFestivalStart: 0,
            festivals: {
              'test-festival': Date.now() + 5000,
            },
          },
        }),
      );

      const result = festivalIsActive('test-festival');

      expect(result).toBe(true);
    });

    it('should return false when festival is not active', () => {
      vi.mocked(gamestate).mockReturnValue(
        createMockGameState({
          festival: {
            ticksWithoutFestivalStart: 0,
            festivals: {},
          },
        }),
      );

      const result = festivalIsActive('test-festival');

      expect(result).toBe(false);
    });

    it('should return false when festival value is 0', () => {
      vi.mocked(gamestate).mockReturnValue(
        createMockGameState({
          festival: {
            ticksWithoutFestivalStart: 0,
            festivals: {
              'test-festival': 0,
            },
          },
        }),
      );

      const result = festivalIsActive('test-festival');

      expect(result).toBe(false);
    });

    it('should return true when festival value is positive', () => {
      vi.mocked(gamestate).mockReturnValue(
        createMockGameState({
          festival: {
            ticksWithoutFestivalStart: 0,
            festivals: {
              'test-festival': 12345,
            },
          },
        }),
      );

      const result = festivalIsActive('test-festival');

      expect(result).toBe(true);
    });

    it('should handle non-existent festival gracefully', () => {
      vi.mocked(gamestate).mockReturnValue(
        createMockGameState({
          festival: {
            ticksWithoutFestivalStart: 0,
            festivals: {
              'other-festival': Date.now() + 5000,
            },
          },
        }),
      );

      const result = festivalIsActive('non-existent-festival');

      expect(result).toBe(false);
    });
  });

  describe('festivalStart', () => {
    it('should start a festival successfully', () => {
      const mockEndTime = Date.now() + 10000;
      vi.mocked(getEntry).mockReturnValue(mockFestival);
      vi.mocked(clockGetTickTimer).mockReturnValue(mockEndTime);

      let capturedState: GameState | undefined;
      vi.mocked(updateGamestate).mockImplementation((updater) => {
        const state = createMockGameState();
        capturedState = updater(state);
        return capturedState;
      });

      festivalStart('test-festival');

      expect(getEntry).toHaveBeenCalledWith('test-festival');
      expect(clockGetTickTimer).toHaveBeenCalledWith(10000);
      expect(notify).toHaveBeenCalledWith('Festival', 'A test festival');
      expect(updateGamestate).toHaveBeenCalled();
      expect(timerAddFestivalEndAction).toHaveBeenCalledWith(
        mockFestival.id,
        mockEndTime,
      );

      expect(capturedState?.festival.festivals['test-festival']).toBe(
        mockEndTime,
      );
      expect(capturedState?.festival.ticksWithoutFestivalStart).toBe(0);
    });

    it('should do nothing when festival data is not found', () => {
      vi.mocked(getEntry).mockReturnValue(undefined);

      festivalStart('non-existent-festival');

      expect(getEntry).toHaveBeenCalledWith('non-existent-festival');
      expect(clockGetTickTimer).not.toHaveBeenCalled();
      expect(notify).not.toHaveBeenCalled();
      expect(updateGamestate).not.toHaveBeenCalled();
      expect(timerAddFestivalEndAction).not.toHaveBeenCalled();
    });

    it('should handle festival with different duration', () => {
      const customFestival = {
        ...mockFestival,
        duration: 20000,
      };
      const mockEndTime = Date.now() + 20000;

      vi.mocked(getEntry).mockReturnValue(customFestival);
      vi.mocked(clockGetTickTimer).mockReturnValue(mockEndTime);

      festivalStart('test-festival');

      expect(clockGetTickTimer).toHaveBeenCalledWith(20000);
    });

    it('should handle festival with empty description', () => {
      const customFestival = {
        ...mockFestival,
        description: '',
      };

      vi.mocked(getEntry).mockReturnValue(customFestival);

      festivalStart('test-festival');

      expect(notify).toHaveBeenCalledWith('Festival', '');
    });
  });

  describe('festivalStop', () => {
    it('should stop a festival successfully', () => {
      vi.mocked(getEntry).mockReturnValue(mockFestival);

      let capturedState: GameState | undefined;
      vi.mocked(updateGamestate).mockImplementation((updater) => {
        const state = createMockGameState({
          festival: {
            ticksWithoutFestivalStart: 0,
            festivals: {
              'test-festival': Date.now() + 5000,
            },
          },
        });
        capturedState = updater(state);
        return capturedState;
      });

      festivalStop('test-festival');

      expect(getEntry).toHaveBeenCalledWith('test-festival');
      expect(notify).toHaveBeenCalledWith('Festival', 'Test festival ends');
      expect(updateGamestate).toHaveBeenCalled();

      expect(
        capturedState?.festival.festivals['test-festival'],
      ).toBeUndefined();
    });

    it('should do nothing when festival data is not found', () => {
      vi.mocked(getEntry).mockReturnValue(undefined);

      festivalStop('non-existent-festival');

      expect(getEntry).toHaveBeenCalledWith('non-existent-festival');
      expect(notify).not.toHaveBeenCalled();
      expect(updateGamestate).not.toHaveBeenCalled();
    });

    it('should handle festival with empty end description', () => {
      const customFestival = {
        ...mockFestival,
        endDescription: '',
      };

      vi.mocked(getEntry).mockReturnValue(customFestival);

      festivalStop('test-festival');

      expect(notify).toHaveBeenCalledWith('Festival', '');
    });

    it('should properly delete festival from state', () => {
      vi.mocked(getEntry).mockReturnValue(mockFestival);

      let capturedState: GameState | undefined;
      vi.mocked(updateGamestate).mockImplementation((updater) => {
        const state = createMockGameState({
          festival: {
            ticksWithoutFestivalStart: 100,
            festivals: {
              'test-festival': Date.now() + 5000,
              'other-festival': Date.now() + 3000,
            },
          },
        });
        capturedState = updater(state);
        return capturedState;
      });

      festivalStop('test-festival');

      expect(
        capturedState?.festival.festivals['test-festival'],
      ).toBeUndefined();
      expect(capturedState?.festival.festivals['other-festival']).toBeDefined();
      expect(capturedState?.festival.ticksWithoutFestivalStart).toBe(100); // Should remain unchanged
    });
  });

  describe('festivalPickRandomByRarity', () => {
    it('should return undefined when no festivals are available', () => {
      vi.mocked(getEntriesByType).mockReturnValue([]);

      const result = festivalPickRandomByRarity();

      expect(result).toBeUndefined();
      expect(getEntriesByType).toHaveBeenCalledWith('festival');
      expect(rngChoiceRarity).toHaveBeenCalledWith([]);
    });

    it('should return a festival ID when festivals are available', () => {
      const festivals = [mockFestival];
      vi.mocked(getEntriesByType).mockReturnValue(festivals);
      vi.mocked(rngChoiceRarity).mockReturnValue(mockFestival);

      // Mock festivalIsActive to return false (not active)
      vi.mocked(gamestate).mockReturnValue(
        createMockGameState({
          festival: {
            ticksWithoutFestivalStart: 0,
            festivals: {},
          },
        }),
      );

      const result = festivalPickRandomByRarity();

      expect(result).toBe('test-festival');
      expect(getEntriesByType).toHaveBeenCalledWith('festival');
      expect(rngChoiceRarity).toHaveBeenCalledWith([mockFestival]);
    });

    it('should filter out active festivals', () => {
      const activeFestival = {
        ...mockFestival,
        id: createFestivalId('active-festival'),
      };
      const inactiveFestival = {
        ...mockFestival,
        id: createFestivalId('inactive-festival'),
      };
      const festivals = [activeFestival, inactiveFestival];

      vi.mocked(getEntriesByType).mockReturnValue(festivals);
      vi.mocked(rngChoiceRarity).mockReturnValue(inactiveFestival);

      // Mock game state with active-festival being active
      vi.mocked(gamestate).mockReturnValue(
        createMockGameState({
          festival: {
            ticksWithoutFestivalStart: 0,
            festivals: {
              'active-festival': Date.now() + 5000,
            },
          },
        }),
      );

      const result = festivalPickRandomByRarity();

      expect(result).toBe('inactive-festival');
      expect(rngChoiceRarity).toHaveBeenCalledWith([inactiveFestival]);
    });

    it('should return undefined when rngChoiceRarity returns undefined', () => {
      const festivals = [mockFestival];
      vi.mocked(getEntriesByType).mockReturnValue(festivals);
      vi.mocked(rngChoiceRarity).mockReturnValue(undefined);

      vi.mocked(gamestate).mockReturnValue(
        createMockGameState({
          festival: {
            ticksWithoutFestivalStart: 0,
            festivals: {},
          },
        }),
      );

      const result = festivalPickRandomByRarity();

      expect(result).toBeUndefined();
    });

    it('should handle multiple festivals with mixed active states', () => {
      const festival1 = {
        ...mockFestival,
        id: createFestivalId('festival-1'),
      };
      const festival2 = {
        ...mockFestival,
        id: createFestivalId('festival-2'),
      };
      const festival3 = {
        ...mockFestival,
        id: createFestivalId('festival-3'),
      };
      const festivals = [festival1, festival2, festival3];

      vi.mocked(getEntriesByType).mockReturnValue(festivals);
      vi.mocked(rngChoiceRarity).mockReturnValue(festival3);

      // Mock state with festival-1 and festival-2 active
      vi.mocked(gamestate).mockReturnValue(
        createMockGameState({
          festival: {
            ticksWithoutFestivalStart: 0,
            festivals: {
              'festival-1': Date.now() + 5000,
              'festival-2': Date.now() + 3000,
            },
          },
        }),
      );

      const result = festivalPickRandomByRarity();

      expect(result).toBe('festival-3');
      expect(rngChoiceRarity).toHaveBeenCalledWith([festival3]); // Only festival-3 should be available
    });
  });

  describe('festivalMaybeStartNew', () => {
    it('should not start festival when chance fails', () => {
      vi.mocked(gamestate).mockReturnValue(
        createMockGameState({
          festival: {
            ticksWithoutFestivalStart: 5000,
            festivals: {},
          },
        }),
      );
      vi.mocked(rngSucceedsChance).mockReturnValue(false);

      festivalMaybeStartNew();

      expect(rngSucceedsChance).toHaveBeenCalledWith(5); // Math.floor(5000 / 1000) = 5
      expect(getEntriesByType).not.toHaveBeenCalled();
    });

    it('should start festival when chance succeeds and festival is available', () => {
      vi.mocked(gamestate).mockReturnValue(
        createMockGameState({
          festival: {
            ticksWithoutFestivalStart: 3000,
            festivals: {},
          },
        }),
      );
      vi.mocked(rngSucceedsChance).mockReturnValue(true);
      vi.mocked(getEntriesByType).mockReturnValue([mockFestival]);
      vi.mocked(rngChoiceRarity).mockReturnValue(mockFestival);
      vi.mocked(getEntry).mockReturnValue(mockFestival);
      vi.mocked(clockGetTickTimer).mockReturnValue(Date.now() + 10000);

      festivalMaybeStartNew();

      expect(rngSucceedsChance).toHaveBeenCalledWith(3); // Math.floor(3000 / 1000) = 3
      expect(getEntriesByType).toHaveBeenCalledWith('festival');
      expect(notify).toHaveBeenCalledWith('Festival', 'A test festival');
    });

    it('should not start festival when chance succeeds but no festival is available', () => {
      vi.mocked(gamestate).mockReturnValue(
        createMockGameState({
          festival: {
            ticksWithoutFestivalStart: 7000,
            festivals: {},
          },
        }),
      );
      vi.mocked(rngSucceedsChance).mockReturnValue(true);
      vi.mocked(getEntriesByType).mockReturnValue([]);
      vi.mocked(rngChoiceRarity).mockReturnValue(undefined);

      festivalMaybeStartNew();

      expect(rngSucceedsChance).toHaveBeenCalledWith(7); // Math.floor(7000 / 1000) = 7
      expect(getEntriesByType).toHaveBeenCalledWith('festival');
      expect(notify).not.toHaveBeenCalled();
      expect(updateGamestate).not.toHaveBeenCalled();
    });

    it('should handle zero ticks without festival start', () => {
      vi.mocked(gamestate).mockReturnValue(
        createMockGameState({
          festival: {
            ticksWithoutFestivalStart: 0,
            festivals: {},
          },
        }),
      );
      vi.mocked(rngSucceedsChance).mockReturnValue(false);

      festivalMaybeStartNew();

      expect(rngSucceedsChance).toHaveBeenCalledWith(0); // Math.floor(0 / 1000) = 0
    });

    it('should handle small tick values that round down to zero', () => {
      vi.mocked(gamestate).mockReturnValue(
        createMockGameState({
          festival: {
            ticksWithoutFestivalStart: 999,
            festivals: {},
          },
        }),
      );
      vi.mocked(rngSucceedsChance).mockReturnValue(false);

      festivalMaybeStartNew();

      expect(rngSucceedsChance).toHaveBeenCalledWith(0); // Math.floor(999 / 1000) = 0
    });

    it('should handle large tick values correctly', () => {
      vi.mocked(gamestate).mockReturnValue(
        createMockGameState({
          festival: {
            ticksWithoutFestivalStart: 15750,
            festivals: {},
          },
        }),
      );
      vi.mocked(rngSucceedsChance).mockReturnValue(false);

      festivalMaybeStartNew();

      expect(rngSucceedsChance).toHaveBeenCalledWith(15); // Math.floor(15750 / 1000) = 15
    });

    it('should integrate with festivalPickRandomByRarity and festivalStart', () => {
      vi.mocked(gamestate).mockReturnValue(
        createMockGameState({
          festival: {
            ticksWithoutFestivalStart: 2500,
            festivals: {},
          },
        }),
      );
      vi.mocked(rngSucceedsChance).mockReturnValue(true);
      vi.mocked(getEntriesByType).mockReturnValue([mockFestival]);
      vi.mocked(rngChoiceRarity).mockReturnValue(mockFestival);
      vi.mocked(getEntry).mockReturnValue(mockFestival);
      vi.mocked(clockGetTickTimer).mockReturnValue(Date.now() + 10000);

      festivalMaybeStartNew();

      // Verify the full chain of calls
      expect(rngSucceedsChance).toHaveBeenCalledWith(2); // Math.floor(2500 / 1000) = 2
      expect(getEntriesByType).toHaveBeenCalledWith('festival');
      expect(rngChoiceRarity).toHaveBeenCalledWith([mockFestival]);
      expect(getEntry).toHaveBeenCalledWith('test-festival');
      expect(clockGetTickTimer).toHaveBeenCalledWith(10000);
      expect(notify).toHaveBeenCalledWith('Festival', 'A test festival');
      expect(updateGamestate).toHaveBeenCalled();
      expect(timerAddFestivalEndAction).toHaveBeenCalled();
    });
  });
});
