import { defaultCurrencyBlock } from '@helpers/defaults';
import type { GameState } from '@interfaces/state-game';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the dependencies
vi.mock('@helpers/festival', () => ({
  festivalMaybeStartNew: vi.fn(),
}));

vi.mock('@helpers/state-game', () => ({
  updateGamestate: vi.fn(),
}));

// Import the mocked functions and the function under test
import { festivalMaybeStartNew } from '@helpers/festival';
import { gameloopFestival } from '@helpers/gameloop-festival';
import { updateGamestate } from '@helpers/state-game';

// Helper function to create a minimal GameState for testing
const createMockGameState = (festivalData: {
  ticksWithoutFestivalStart: number;
  festivals: Record<string, number>;
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
    merchant: {
      ticksUntilRefresh: 0,
      soldItems: [],
    },
    townUpgrades: {},
  },
  festival: festivalData,
});

describe('gameloopFestival', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('basic functionality', () => {
    it('should update festival ticks and call festivalMaybeStartNew when numTicks is 1', () => {
      const numTicks = 1;
      let capturedUpdateFunction: ((state: GameState) => GameState) | undefined;

      vi.mocked(updateGamestate).mockImplementation((func) => {
        capturedUpdateFunction = func;
      });

      gameloopFestival(numTicks);

      expect(updateGamestate).toHaveBeenCalledTimes(1);
      expect(updateGamestate).toHaveBeenCalledWith(expect.any(Function));
      expect(festivalMaybeStartNew).toHaveBeenCalledTimes(1);
      expect(festivalMaybeStartNew).toHaveBeenCalledWith();

      // Test the captured update function
      expect(capturedUpdateFunction).toBeDefined();
      if (capturedUpdateFunction) {
        const mockState = createMockGameState({
          ticksWithoutFestivalStart: 100,
          festivals: {},
        });

        const updatedState = capturedUpdateFunction(mockState);
        expect(updatedState.festival.ticksWithoutFestivalStart).toBe(101);
        expect(updatedState).toBe(mockState); // Should return the same object (mutation)
      }
    });

    it('should add multiple ticks to ticksWithoutFestivalStart', () => {
      const numTicks = 5;
      let capturedUpdateFunction: ((state: GameState) => GameState) | undefined;

      vi.mocked(updateGamestate).mockImplementation((func) => {
        capturedUpdateFunction = func;
      });

      gameloopFestival(numTicks);

      expect(updateGamestate).toHaveBeenCalledTimes(1);
      expect(festivalMaybeStartNew).toHaveBeenCalledTimes(1);

      // Test the captured update function with multiple ticks
      if (capturedUpdateFunction) {
        const mockState = createMockGameState({
          ticksWithoutFestivalStart: 200,
          festivals: { 'existing-festival': 50 },
        });

        const updatedState = capturedUpdateFunction(mockState);
        expect(updatedState.festival.ticksWithoutFestivalStart).toBe(205);
        expect(updatedState.festival.festivals).toEqual({
          'existing-festival': 50,
        });
      }
    });

    it('should handle zero numTicks', () => {
      const numTicks = 0;
      let capturedUpdateFunction: ((state: GameState) => GameState) | undefined;

      vi.mocked(updateGamestate).mockImplementation((func) => {
        capturedUpdateFunction = func;
      });

      gameloopFestival(numTicks);

      expect(updateGamestate).toHaveBeenCalledTimes(1);
      expect(festivalMaybeStartNew).toHaveBeenCalledTimes(1);

      // Test that zero ticks are added
      if (capturedUpdateFunction) {
        const mockState: GameState = {
          festival: {
            ticksWithoutFestivalStart: 300,
            festivals: {},
          },
        } as GameState;

        const updatedState = capturedUpdateFunction(mockState);
        expect(updatedState.festival.ticksWithoutFestivalStart).toBe(300);
      }
    });

    it('should handle negative numTicks', () => {
      const numTicks = -3;
      let capturedUpdateFunction: ((state: GameState) => GameState) | undefined;

      vi.mocked(updateGamestate).mockImplementation((func) => {
        capturedUpdateFunction = func;
      });

      gameloopFestival(numTicks);

      expect(updateGamestate).toHaveBeenCalledTimes(1);
      expect(festivalMaybeStartNew).toHaveBeenCalledTimes(1);

      // Test that negative ticks are subtracted
      if (capturedUpdateFunction) {
        const mockState: GameState = {
          festival: {
            ticksWithoutFestivalStart: 100,
            festivals: {},
          },
        } as GameState;

        const updatedState = capturedUpdateFunction(mockState);
        expect(updatedState.festival.ticksWithoutFestivalStart).toBe(97);
      }
    });
  });

  describe('edge cases', () => {
    it('should handle very large numTicks values', () => {
      const numTicks = 1000000;
      let capturedUpdateFunction: ((state: GameState) => GameState) | undefined;

      vi.mocked(updateGamestate).mockImplementation((func) => {
        capturedUpdateFunction = func;
      });

      gameloopFestival(numTicks);

      expect(updateGamestate).toHaveBeenCalledTimes(1);
      expect(festivalMaybeStartNew).toHaveBeenCalledTimes(1);

      if (capturedUpdateFunction) {
        const mockState: GameState = {
          festival: {
            ticksWithoutFestivalStart: 0,
            festivals: {},
          },
        } as GameState;

        const updatedState = capturedUpdateFunction(mockState);
        expect(updatedState.festival.ticksWithoutFestivalStart).toBe(1000000);
      }
    });

    it('should handle floating point numTicks', () => {
      const numTicks = 2.7;
      let capturedUpdateFunction: ((state: GameState) => GameState) | undefined;

      vi.mocked(updateGamestate).mockImplementation((func) => {
        capturedUpdateFunction = func;
      });

      gameloopFestival(numTicks);

      expect(updateGamestate).toHaveBeenCalledTimes(1);
      expect(festivalMaybeStartNew).toHaveBeenCalledTimes(1);

      if (capturedUpdateFunction) {
        const mockState: GameState = {
          festival: {
            ticksWithoutFestivalStart: 10,
            festivals: {},
          },
        } as GameState;

        const updatedState = capturedUpdateFunction(mockState);
        expect(updatedState.festival.ticksWithoutFestivalStart).toBe(12.7);
      }
    });

    it('should handle maximum safe integer values', () => {
      const numTicks = Number.MAX_SAFE_INTEGER;
      let capturedUpdateFunction: ((state: GameState) => GameState) | undefined;

      vi.mocked(updateGamestate).mockImplementation((func) => {
        capturedUpdateFunction = func;
      });

      gameloopFestival(numTicks);

      expect(updateGamestate).toHaveBeenCalledTimes(1);
      expect(festivalMaybeStartNew).toHaveBeenCalledTimes(1);

      if (capturedUpdateFunction) {
        const mockState: GameState = {
          festival: {
            ticksWithoutFestivalStart: 1000,
            festivals: {},
          },
        } as GameState;

        const updatedState = capturedUpdateFunction(mockState);
        expect(updatedState.festival.ticksWithoutFestivalStart).toBe(
          1000 + Number.MAX_SAFE_INTEGER,
        );
      }
    });

    it('should handle negative values that could result in negative ticksWithoutFestivalStart', () => {
      const numTicks = -150;
      let capturedUpdateFunction: ((state: GameState) => GameState) | undefined;

      vi.mocked(updateGamestate).mockImplementation((func) => {
        capturedUpdateFunction = func;
      });

      gameloopFestival(numTicks);

      if (capturedUpdateFunction) {
        const mockState: GameState = {
          festival: {
            ticksWithoutFestivalStart: 100,
            festivals: {},
          },
        } as GameState;

        const updatedState = capturedUpdateFunction(mockState);
        expect(updatedState.festival.ticksWithoutFestivalStart).toBe(-50);
      }
    });
  });

  describe('function call order and behavior', () => {
    it('should call updateGamestate before festivalMaybeStartNew', () => {
      const numTicks = 1;
      const updateOrder: string[] = [];

      vi.mocked(updateGamestate).mockImplementation(() => {
        updateOrder.push('updateGamestate');
      });

      vi.mocked(festivalMaybeStartNew).mockImplementation(() => {
        updateOrder.push('festivalMaybeStartNew');
      });

      gameloopFestival(numTicks);

      expect(updateOrder).toEqual(['updateGamestate', 'festivalMaybeStartNew']);
    });

    it('should call functions exactly once regardless of numTicks value', () => {
      const testCases = [0, 1, 5, 100, -10];

      testCases.forEach((numTicks) => {
        vi.clearAllMocks();

        gameloopFestival(numTicks);

        expect(updateGamestate).toHaveBeenCalledTimes(1);
        expect(festivalMaybeStartNew).toHaveBeenCalledTimes(1);
      });
    });

    it('should always call festivalMaybeStartNew with no arguments', () => {
      const numTicks = 42;

      gameloopFestival(numTicks);

      expect(festivalMaybeStartNew).toHaveBeenCalledWith();
    });
  });

  describe('state mutation behavior', () => {
    it('should mutate the existing state object rather than creating a new one', () => {
      const numTicks = 3;
      let capturedUpdateFunction: ((state: GameState) => GameState) | undefined;

      vi.mocked(updateGamestate).mockImplementation((func) => {
        capturedUpdateFunction = func;
      });

      gameloopFestival(numTicks);

      if (capturedUpdateFunction) {
        const originalState = createMockGameState({
          ticksWithoutFestivalStart: 50,
          festivals: { 'test-festival': 25 },
        });

        const updatedState = capturedUpdateFunction(originalState);

        // Should return the same object reference
        expect(updatedState).toBe(originalState);

        // Should mutate the original object
        expect(originalState.festival.ticksWithoutFestivalStart).toBe(53);
        expect(originalState.festival.festivals).toEqual({
          'test-festival': 25,
        });
      }
    });

    it('should preserve other festival properties while updating ticksWithoutFestivalStart', () => {
      const numTicks = 7;
      let capturedUpdateFunction: ((state: GameState) => GameState) | undefined;

      vi.mocked(updateGamestate).mockImplementation((func) => {
        capturedUpdateFunction = func;
      });

      gameloopFestival(numTicks);

      if (capturedUpdateFunction) {
        const mockState = createMockGameState({
          ticksWithoutFestivalStart: 200,
          festivals: {
            'spring-festival': 100,
            'autumn-festival': 50,
            'winter-festival': 75,
          },
        });

        const updatedState = capturedUpdateFunction(mockState);

        expect(updatedState.festival.ticksWithoutFestivalStart).toBe(207);
        expect(updatedState.festival.festivals).toEqual({
          'spring-festival': 100,
          'autumn-festival': 50,
          'winter-festival': 75,
        });
      }
    });
  });

  describe('return value', () => {
    it('should return void (undefined)', () => {
      const numTicks = 1;

      const result = gameloopFestival(numTicks);

      expect(result).toBeUndefined();
    });

    it('should return void for all numTicks values', () => {
      const testCases = [0, 1, -1, 100, 2.5];

      testCases.forEach((numTicks) => {
        const result = gameloopFestival(numTicks);
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

      expect(() => gameloopFestival(numTicks)).toThrow(error);
      expect(updateGamestate).toHaveBeenCalledTimes(1);
      expect(festivalMaybeStartNew).not.toHaveBeenCalled();
    });

    it('should propagate errors from festivalMaybeStartNew', () => {
      const numTicks = 1;
      const error = new Error('Festival start failed');

      // Ensure updateGamestate works normally
      vi.mocked(updateGamestate).mockImplementation((func) => {
        const mockState = createMockGameState({
          ticksWithoutFestivalStart: 100,
          festivals: {},
        });
        func(mockState);
      });

      vi.mocked(festivalMaybeStartNew).mockImplementation(() => {
        throw error;
      });

      expect(() => gameloopFestival(numTicks)).toThrow(error);
      expect(updateGamestate).toHaveBeenCalledTimes(1);
      expect(festivalMaybeStartNew).toHaveBeenCalledTimes(1);
    });

    it('should handle errors in the update function gracefully', () => {
      const numTicks = 1;
      const error = new Error('State update error');

      vi.mocked(updateGamestate).mockImplementation(() => {
        // Mock an error in the update function itself
        throw error;
      });

      expect(() => gameloopFestival(numTicks)).toThrow(error);
    });
  });

  describe('integration scenarios', () => {
    it('should work correctly when called multiple times in sequence', () => {
      let totalUpdateCalls = 0;
      let totalFestivalCalls = 0;

      vi.mocked(updateGamestate).mockImplementation(() => {
        totalUpdateCalls++;
      });

      vi.mocked(festivalMaybeStartNew).mockImplementation(() => {
        totalFestivalCalls++;
      });

      gameloopFestival(1);
      gameloopFestival(3);
      gameloopFestival(2);

      expect(totalUpdateCalls).toBe(3);
      expect(totalFestivalCalls).toBe(3);
    });

    it('should handle realistic game scenario with accumulating ticks', () => {
      const updates: number[] = [];
      let currentTicks = 1000;

      vi.mocked(updateGamestate).mockImplementation((func) => {
        const mockState = {
          festival: { ticksWithoutFestivalStart: currentTicks, festivals: {} },
        } as GameState;

        const result = func(mockState);
        currentTicks = result.festival.ticksWithoutFestivalStart;
        updates.push(currentTicks);
      });

      // Simulate several game loop iterations
      gameloopFestival(1); // Should go from 1000 to 1001
      gameloopFestival(5); // Should go from 1001 to 1006
      gameloopFestival(10); // Should go from 1006 to 1016

      expect(updates).toEqual([1001, 1006, 1016]);
      expect(festivalMaybeStartNew).toHaveBeenCalledTimes(3);
    });

    it('should maintain correct behavior with different data types', () => {
      const testCases = [
        { input: 1, expected: 1 },
        { input: 0, expected: 0 },
        { input: -5, expected: -5 },
        { input: 3.14, expected: 3.14 },
        { input: 1e6, expected: 1e6 },
      ];

      testCases.forEach(({ input, expected }) => {
        let capturedUpdateFunction:
          | ((state: GameState) => GameState)
          | undefined;

        vi.mocked(updateGamestate).mockImplementation((func) => {
          capturedUpdateFunction = func;
        });

        gameloopFestival(input);

        if (capturedUpdateFunction) {
          const mockState = {
            festival: { ticksWithoutFestivalStart: 100, festivals: {} },
          } as GameState;

          const result = capturedUpdateFunction(mockState);
          expect(result.festival.ticksWithoutFestivalStart).toBe(
            100 + expected,
          );
        }
      });
    });
  });
});
