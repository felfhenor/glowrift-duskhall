import { defaultCurrencyBlock } from '@helpers/defaults';
import type { EquipmentItem } from '@interfaces/content-equipment';
import type { GameState } from '@interfaces/state-game';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the dependencies
vi.mock('@helpers/state-game', () => ({
  gamestate: vi.fn(),
  updateGamestate: vi.fn(),
}));

vi.mock('@helpers/town-merchant', () => ({
  merchantGenerateItems: vi.fn(),
  merchantResetTicks: vi.fn(),
}));

// Import the mocked functions and the function under test
import { gameloopTownMerchant } from '@helpers/gameloop-town-merchant';
import { gamestate, updateGamestate } from '@helpers/state-game';
import {
  merchantGenerateItems,
  merchantResetTicks,
} from '@helpers/town-merchant';

// Helper function to create a minimal GameState for testing
const createMockGameState = (merchantData: {
  ticksUntilRefresh: number;
  soldItems: (EquipmentItem | undefined)[];
}): GameState => ({
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
    config: {
      id: 'test-world',
      name: 'Test World',
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
  camera: { x: 0, y: 0 },
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
  inventory: { items: [], skills: [] },
  currency: {
    currencyPerTickEarnings: defaultCurrencyBlock(),
    currencies: defaultCurrencyBlock(),
  },
  actionClock: { numTicks: 0, timers: {} },
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
    merchant: merchantData,
    townUpgrades: {},
  },
  festival: {
    ticksWithoutFestivalStart: 0,
    festivals: {},
  },
});

describe('gameloopTownMerchant', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('basic functionality', () => {
    it('should decrement ticksUntilRefresh when numTicks is 1 and not trigger refresh', () => {
      const numTicks = 1;
      const initialTicks = 10;
      let capturedUpdateFunction: ((state: GameState) => GameState) | undefined;

      vi.mocked(updateGamestate).mockImplementation((func) => {
        capturedUpdateFunction = func;
      });

      const mockState = createMockGameState({
        ticksUntilRefresh: initialTicks - numTicks, // After update
        soldItems: [],
      });

      vi.mocked(gamestate).mockReturnValue(mockState);

      gameloopTownMerchant(numTicks);

      expect(updateGamestate).toHaveBeenCalledTimes(1);
      expect(updateGamestate).toHaveBeenCalledWith(expect.any(Function));
      expect(gamestate).toHaveBeenCalledTimes(1);
      expect(merchantGenerateItems).not.toHaveBeenCalled();
      expect(merchantResetTicks).not.toHaveBeenCalled();

      // Test the captured update function
      expect(capturedUpdateFunction).toBeDefined();
      if (capturedUpdateFunction) {
        const testState = createMockGameState({
          ticksUntilRefresh: initialTicks,
          soldItems: [],
        });

        const updatedState = capturedUpdateFunction(testState);
        expect(updatedState.town.merchant.ticksUntilRefresh).toBe(
          initialTicks - numTicks,
        );
        expect(updatedState).toBe(testState); // Should return the same object (mutation)
      }
    });

    it('should decrement ticksUntilRefresh with multiple ticks and not trigger refresh', () => {
      const numTicks = 5;
      const initialTicks = 20;
      let capturedUpdateFunction: ((state: GameState) => GameState) | undefined;

      vi.mocked(updateGamestate).mockImplementation((func) => {
        capturedUpdateFunction = func;
      });

      const mockState = createMockGameState({
        ticksUntilRefresh: initialTicks - numTicks,
        soldItems: [],
      });

      vi.mocked(gamestate).mockReturnValue(mockState);

      gameloopTownMerchant(numTicks);

      expect(updateGamestate).toHaveBeenCalledTimes(1);
      expect(gamestate).toHaveBeenCalledTimes(1);
      expect(merchantGenerateItems).not.toHaveBeenCalled();
      expect(merchantResetTicks).not.toHaveBeenCalled();

      // Test the update function decrements correctly
      if (capturedUpdateFunction) {
        const testState = createMockGameState({
          ticksUntilRefresh: initialTicks,
          soldItems: [],
        });

        const updatedState = capturedUpdateFunction(testState);
        expect(updatedState.town.merchant.ticksUntilRefresh).toBe(15);
      }
    });

    it('should trigger refresh when ticksUntilRefresh reaches exactly 0', () => {
      const numTicks = 10;
      const initialTicks = 10;
      let capturedUpdateFunction: ((state: GameState) => GameState) | undefined;

      vi.mocked(updateGamestate).mockImplementation((func) => {
        capturedUpdateFunction = func;
      });

      const mockState = createMockGameState({
        ticksUntilRefresh: 0, // After update, should be 0
        soldItems: [],
      });

      vi.mocked(gamestate).mockReturnValue(mockState);

      gameloopTownMerchant(numTicks);

      expect(updateGamestate).toHaveBeenCalledTimes(1);
      expect(gamestate).toHaveBeenCalledTimes(1);
      expect(merchantGenerateItems).toHaveBeenCalledTimes(1);
      expect(merchantResetTicks).toHaveBeenCalledTimes(1);

      // Verify the update function
      if (capturedUpdateFunction) {
        const testState = createMockGameState({
          ticksUntilRefresh: initialTicks,
          soldItems: [],
        });

        const updatedState = capturedUpdateFunction(testState);
        expect(updatedState.town.merchant.ticksUntilRefresh).toBe(0);
      }
    });

    it('should trigger refresh when ticksUntilRefresh goes negative', () => {
      const numTicks = 15;
      const initialTicks = 10;
      let capturedUpdateFunction: ((state: GameState) => GameState) | undefined;

      vi.mocked(updateGamestate).mockImplementation((func) => {
        capturedUpdateFunction = func;
      });

      const mockState = createMockGameState({
        ticksUntilRefresh: -5, // After update, should be negative
        soldItems: [],
      });

      vi.mocked(gamestate).mockReturnValue(mockState);

      gameloopTownMerchant(numTicks);

      expect(updateGamestate).toHaveBeenCalledTimes(1);
      expect(gamestate).toHaveBeenCalledTimes(1);
      expect(merchantGenerateItems).toHaveBeenCalledTimes(1);
      expect(merchantResetTicks).toHaveBeenCalledTimes(1);

      // Verify the update function creates negative value
      if (capturedUpdateFunction) {
        const testState = createMockGameState({
          ticksUntilRefresh: initialTicks,
          soldItems: [],
        });

        const updatedState = capturedUpdateFunction(testState);
        expect(updatedState.town.merchant.ticksUntilRefresh).toBe(-5);
      }
    });
  });

  describe('function call order and behavior', () => {
    it('should call updateGamestate before gamestate', () => {
      const numTicks = 1;
      const callOrder: string[] = [];

      vi.mocked(updateGamestate).mockImplementation(() => {
        callOrder.push('updateGamestate');
      });

      vi.mocked(gamestate).mockImplementation(() => {
        callOrder.push('gamestate');
        return createMockGameState({
          ticksUntilRefresh: 5,
          soldItems: [],
        });
      });

      gameloopTownMerchant(numTicks);

      expect(callOrder).toEqual(['updateGamestate', 'gamestate']);
    });

    it('should call merchantGenerateItems before merchantResetTicks when refresh is triggered', () => {
      const numTicks = 10;
      const callOrder: string[] = [];

      vi.mocked(updateGamestate).mockImplementation((func) => {
        const testState = createMockGameState({
          ticksUntilRefresh: 10,
          soldItems: [],
        });
        func(testState);
      });

      const mockState = createMockGameState({
        ticksUntilRefresh: 0,
        soldItems: [],
      });

      vi.mocked(gamestate).mockReturnValue(mockState);

      vi.mocked(merchantGenerateItems).mockImplementation(() => {
        callOrder.push('merchantGenerateItems');
      });

      vi.mocked(merchantResetTicks).mockImplementation(() => {
        callOrder.push('merchantResetTicks');
      });

      gameloopTownMerchant(numTicks);

      expect(callOrder).toEqual([
        'merchantGenerateItems',
        'merchantResetTicks',
      ]);
    });

    it('should only call merchant functions when refresh condition is met', () => {
      const testCases = [
        {
          numTicks: 1,
          initialTicks: 10,
          expectedTicks: 9,
          shouldRefresh: false,
        },
        { numTicks: 5, initialTicks: 5, expectedTicks: 0, shouldRefresh: true },
        {
          numTicks: 3,
          initialTicks: 2,
          expectedTicks: -1,
          shouldRefresh: true,
        },
        { numTicks: 0, initialTicks: 0, expectedTicks: 0, shouldRefresh: true },
      ];

      testCases.forEach(
        ({ numTicks, initialTicks, expectedTicks, shouldRefresh }) => {
          vi.clearAllMocks();

          vi.mocked(updateGamestate).mockImplementation((func) => {
            const testState = createMockGameState({
              ticksUntilRefresh: initialTicks,
              soldItems: [],
            });
            func(testState);
          });

          const mockState = createMockGameState({
            ticksUntilRefresh: expectedTicks,
            soldItems: [],
          });

          vi.mocked(gamestate).mockReturnValue(mockState);

          gameloopTownMerchant(numTicks);

          if (shouldRefresh) {
            expect(merchantGenerateItems).toHaveBeenCalledTimes(1);
            expect(merchantResetTicks).toHaveBeenCalledTimes(1);
          } else {
            expect(merchantGenerateItems).not.toHaveBeenCalled();
            expect(merchantResetTicks).not.toHaveBeenCalled();
          }
        },
      );
    });
  });

  describe('state mutation behavior', () => {
    it('should mutate the existing state object rather than creating a new one', () => {
      const numTicks = 3;
      let capturedUpdateFunction: ((state: GameState) => GameState) | undefined;

      vi.mocked(updateGamestate).mockImplementation((func) => {
        capturedUpdateFunction = func;
      });

      const mockState = createMockGameState({
        ticksUntilRefresh: 2,
        soldItems: [],
      });

      vi.mocked(gamestate).mockReturnValue(mockState);

      gameloopTownMerchant(numTicks);

      if (capturedUpdateFunction) {
        const originalState = createMockGameState({
          ticksUntilRefresh: 5,
          soldItems: [undefined, undefined],
        });

        const updatedState = capturedUpdateFunction(originalState);

        // Should return the same object reference
        expect(updatedState).toBe(originalState);

        // Should mutate the original object
        expect(originalState.town.merchant.ticksUntilRefresh).toBe(2);

        // Should preserve other merchant properties
        expect(originalState.town.merchant.soldItems).toEqual([
          undefined,
          undefined,
        ]);
      }
    });

    it('should preserve other town properties while updating merchant ticks', () => {
      const numTicks = 2;
      let capturedUpdateFunction: ((state: GameState) => GameState) | undefined;

      vi.mocked(updateGamestate).mockImplementation((func) => {
        capturedUpdateFunction = func;
      });

      const mockState = createMockGameState({
        ticksUntilRefresh: 8,
        soldItems: [],
      });

      vi.mocked(gamestate).mockReturnValue(mockState);

      gameloopTownMerchant(numTicks);

      if (capturedUpdateFunction) {
        const originalState = createMockGameState({
          ticksUntilRefresh: 10,
          soldItems: [],
        });

        // Store original building levels for comparison
        const originalBuildingLevels = { ...originalState.town.buildingLevels };
        const originalTownUpgrades = { ...originalState.town.townUpgrades };

        const updatedState = capturedUpdateFunction(originalState);

        expect(updatedState.town.merchant.ticksUntilRefresh).toBe(8);
        expect(updatedState.town.buildingLevels).toEqual(
          originalBuildingLevels,
        );
        expect(updatedState.town.townUpgrades).toEqual(originalTownUpgrades);
      }
    });
  });

  describe('return value', () => {
    it('should return void (undefined)', () => {
      const numTicks = 1;

      vi.mocked(updateGamestate).mockImplementation(() => {});
      vi.mocked(gamestate).mockReturnValue(
        createMockGameState({
          ticksUntilRefresh: 5,
          soldItems: [],
        }),
      );

      const result = gameloopTownMerchant(numTicks);

      expect(result).toBeUndefined();
    });

    it('should return void for all scenarios', () => {
      const testCases = [
        { numTicks: 0, ticksUntilRefresh: 5 },
        { numTicks: 1, ticksUntilRefresh: 4 },
        { numTicks: 10, ticksUntilRefresh: 0 }, // Triggers refresh
        { numTicks: -5, ticksUntilRefresh: 10 },
      ];

      testCases.forEach(({ numTicks, ticksUntilRefresh }) => {
        vi.clearAllMocks();

        vi.mocked(updateGamestate).mockImplementation(() => {});
        vi.mocked(gamestate).mockReturnValue(
          createMockGameState({
            ticksUntilRefresh,
            soldItems: [],
          }),
        );

        const result = gameloopTownMerchant(numTicks);
        expect(result).toBeUndefined();
      });
    });
  });

  describe('error handling and resilience', () => {
    it('should propagate errors from updateGamestate', () => {
      const numTicks = 1;
      const error = new Error('Update failed');

      vi.mocked(updateGamestate).mockImplementation(() => {
        throw error;
      });

      expect(() => gameloopTownMerchant(numTicks)).toThrow(error);
      expect(updateGamestate).toHaveBeenCalledTimes(1);
      expect(gamestate).not.toHaveBeenCalled();
      expect(merchantGenerateItems).not.toHaveBeenCalled();
      expect(merchantResetTicks).not.toHaveBeenCalled();
    });

    it('should propagate errors from gamestate', () => {
      const numTicks = 1;
      const error = new Error('Gamestate failed');

      vi.mocked(updateGamestate).mockImplementation(() => {});
      vi.mocked(gamestate).mockImplementation(() => {
        throw error;
      });

      expect(() => gameloopTownMerchant(numTicks)).toThrow(error);
      expect(updateGamestate).toHaveBeenCalledTimes(1);
      expect(gamestate).toHaveBeenCalledTimes(1);
      expect(merchantGenerateItems).not.toHaveBeenCalled();
      expect(merchantResetTicks).not.toHaveBeenCalled();
    });

    it('should propagate errors from merchantGenerateItems', () => {
      const numTicks = 5;
      const error = new Error('Generate items failed');

      vi.mocked(updateGamestate).mockImplementation(() => {});
      vi.mocked(gamestate).mockReturnValue(
        createMockGameState({
          ticksUntilRefresh: 0,
          soldItems: [],
        }),
      );
      vi.mocked(merchantGenerateItems).mockImplementation(() => {
        throw error;
      });

      expect(() => gameloopTownMerchant(numTicks)).toThrow(error);
      expect(updateGamestate).toHaveBeenCalledTimes(1);
      expect(gamestate).toHaveBeenCalledTimes(1);
      expect(merchantGenerateItems).toHaveBeenCalledTimes(1);
      expect(merchantResetTicks).not.toHaveBeenCalled();
    });

    it('should propagate errors from merchantResetTicks', () => {
      const numTicks = 5;
      const error = new Error('Reset ticks failed');

      vi.mocked(updateGamestate).mockImplementation(() => {});
      vi.mocked(gamestate).mockReturnValue(
        createMockGameState({
          ticksUntilRefresh: 0,
          soldItems: [],
        }),
      );
      vi.mocked(merchantGenerateItems).mockImplementation(() => {});
      vi.mocked(merchantResetTicks).mockImplementation(() => {
        throw error;
      });

      expect(() => gameloopTownMerchant(numTicks)).toThrow(error);
      expect(updateGamestate).toHaveBeenCalledTimes(1);
      expect(gamestate).toHaveBeenCalledTimes(1);
      expect(merchantGenerateItems).toHaveBeenCalledTimes(1);
      expect(merchantResetTicks).toHaveBeenCalledTimes(1);
    });
  });

  describe('integration scenarios', () => {
    it('should work correctly when called multiple times without refresh', () => {
      const mockState = createMockGameState({
        ticksUntilRefresh: 100,
        soldItems: [],
      });

      vi.mocked(updateGamestate).mockImplementation(() => {});
      vi.mocked(gamestate).mockReturnValue(mockState);
      vi.mocked(merchantGenerateItems).mockImplementation(() => {});
      vi.mocked(merchantResetTicks).mockImplementation(() => {});

      gameloopTownMerchant(10); // 90 ticks left
      gameloopTownMerchant(20); // 70 ticks left
      gameloopTownMerchant(30); // 40 ticks left

      expect(updateGamestate).toHaveBeenCalledTimes(3);
      expect(gamestate).toHaveBeenCalledTimes(3);
      expect(merchantGenerateItems).not.toHaveBeenCalled();
      expect(merchantResetTicks).not.toHaveBeenCalled();
    });

    it('should work correctly when refresh is triggered multiple times', () => {
      vi.mocked(updateGamestate).mockImplementation(() => {});
      vi.mocked(merchantGenerateItems).mockImplementation(() => {});
      vi.mocked(merchantResetTicks).mockImplementation(() => {});

      // First call - triggers refresh
      vi.mocked(gamestate).mockReturnValueOnce(
        createMockGameState({
          ticksUntilRefresh: 0,
          soldItems: [],
        }),
      );

      // Second call - triggers refresh again
      vi.mocked(gamestate).mockReturnValueOnce(
        createMockGameState({
          ticksUntilRefresh: -5,
          soldItems: [],
        }),
      );

      gameloopTownMerchant(50);
      gameloopTownMerchant(25);

      expect(updateGamestate).toHaveBeenCalledTimes(2);
      expect(gamestate).toHaveBeenCalledTimes(2);
      expect(merchantGenerateItems).toHaveBeenCalledTimes(2);
      expect(merchantResetTicks).toHaveBeenCalledTimes(2);
    });

    it('should handle realistic game scenario with various tick amounts', () => {
      const tickSequence = [1, 5, 10, 3, 7]; // Total: 26 ticks
      const initialTicks = 25;
      let currentTicks = initialTicks;

      vi.mocked(merchantGenerateItems).mockImplementation(() => {});
      vi.mocked(merchantResetTicks).mockImplementation(() => {});

      vi.mocked(updateGamestate).mockImplementation((func) => {
        const testState = createMockGameState({
          ticksUntilRefresh: currentTicks,
          soldItems: [],
        });
        const result = func(testState);
        currentTicks = result.town.merchant.ticksUntilRefresh;
      });

      tickSequence.forEach((numTicks, index) => {
        const expectedTicks = Math.max(
          0,
          initialTicks -
            tickSequence.slice(0, index + 1).reduce((sum, t) => sum + t, 0),
        );

        vi.mocked(gamestate).mockReturnValue(
          createMockGameState({
            ticksUntilRefresh: expectedTicks,
            soldItems: [],
          }),
        );

        gameloopTownMerchant(numTicks);
      });

      expect(updateGamestate).toHaveBeenCalledTimes(5);
      expect(gamestate).toHaveBeenCalledTimes(5);
      // Should trigger refresh once when total ticks (26) exceeds initial (25)
      expect(merchantGenerateItems).toHaveBeenCalledTimes(1);
      expect(merchantResetTicks).toHaveBeenCalledTimes(1);
    });

    it('should maintain isolation between test runs', () => {
      // First run
      vi.mocked(updateGamestate).mockImplementation(() => {});
      vi.mocked(merchantGenerateItems).mockImplementation(() => {});
      vi.mocked(merchantResetTicks).mockImplementation(() => {});
      vi.mocked(gamestate).mockReturnValue(
        createMockGameState({
          ticksUntilRefresh: 5,
          soldItems: [],
        }),
      );

      gameloopTownMerchant(3);

      expect(updateGamestate).toHaveBeenCalledTimes(1);
      expect(gamestate).toHaveBeenCalledTimes(1);

      // Clear and second run
      vi.clearAllMocks();

      vi.mocked(updateGamestate).mockImplementation(() => {});
      vi.mocked(merchantGenerateItems).mockImplementation(() => {});
      vi.mocked(merchantResetTicks).mockImplementation(() => {});
      vi.mocked(gamestate).mockReturnValue(
        createMockGameState({
          ticksUntilRefresh: 0,
          soldItems: [],
        }),
      );

      gameloopTownMerchant(10);

      expect(updateGamestate).toHaveBeenCalledTimes(1);
      expect(gamestate).toHaveBeenCalledTimes(1);
      expect(merchantGenerateItems).toHaveBeenCalledTimes(1);
      expect(merchantResetTicks).toHaveBeenCalledTimes(1);
    });
  });
});
