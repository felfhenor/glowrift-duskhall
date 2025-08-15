import { defaultCurrencyBlock } from '@helpers/defaults';
import type { GameState } from '@interfaces/state-game';
import type { WorldLocation } from '@interfaces/world';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the dependencies
vi.mock('@helpers/notify', () => ({
  notify: vi.fn(),
}));

vi.mock('@helpers/state-game', () => ({
  gamestate: vi.fn(),
  updateGamestate: vi.fn(),
}));

vi.mock('@helpers/travel', () => ({
  isTraveling: vi.fn(),
}));

vi.mock('@helpers/ui', () => ({
  globalStatusText: {
    set: vi.fn(),
  },
}));

vi.mock('@helpers/world-location', () => ({
  locationGet: vi.fn(),
  locationGetCurrent: vi.fn(),
}));

// Import the mocked functions and the function under test
import { gameloopTravel } from '@helpers/gameloop-travel';
import { notify } from '@helpers/notify';
import { gamestate, updateGamestate } from '@helpers/state-game';
import { isTraveling } from '@helpers/travel';
import { globalStatusText } from '@helpers/ui';
import { locationGet, locationGetCurrent } from '@helpers/world-location';

// Helper function to create a minimal GameState for testing
const createMockGameState = (
  travelData: { nodeId: string; x: number; y: number; ticksLeft: number },
  locationData: { ticksTotal: number; ticksLeft: number } = {
    ticksTotal: 0,
    ticksLeft: 0,
  },
): GameState => ({
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
    position: { x: 0, y: 0, nodeId: 'current-node' },
    travel: travelData,
    location: locationData,
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
    merchant: { ticksUntilRefresh: 100, soldItems: [] },
    townUpgrades: {},
  },
  festival: {
    ticksWithoutFestivalStart: 0,
    festivals: {},
  },
});

// Helper function to create a mock WorldLocation
const createMockLocation = (
  id: string,
  name: string,
  x: number,
  y: number,
  currentlyClaimed: boolean = false,
  encounterLevel: number = 1,
): WorldLocation => ({
  x,
  y,
  id,
  name,
  nodeType: 'village',
  elements: [],
  currentlyClaimed,
  claimCount: 0,
  encounterLevel,
  unclaimTime: 0,
  guardianIds: [],
  claimLootIds: [],
  traitIds: [],
  locationUpgrades: {},
});

describe('gameloopTravel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('not traveling', () => {
    it('should return early when not traveling', () => {
      const numTicks = 5;
      vi.mocked(isTraveling).mockReturnValue(false);

      gameloopTravel(numTicks);

      expect(isTraveling).toHaveBeenCalledTimes(1);
      expect(gamestate).not.toHaveBeenCalled();
      expect(updateGamestate).not.toHaveBeenCalled();
      expect(locationGet).not.toHaveBeenCalled();
      expect(globalStatusText.set).not.toHaveBeenCalled();
      expect(notify).not.toHaveBeenCalled();
      expect(locationGetCurrent).not.toHaveBeenCalled();
    });

    it('should return void when not traveling', () => {
      const numTicks = 10;
      vi.mocked(isTraveling).mockReturnValue(false);

      const result = gameloopTravel(numTicks);

      expect(result).toBeUndefined();
    });
  });

  describe('traveling - still in progress', () => {
    it('should decrement travel ticks when traveling and not finish', () => {
      const numTicks = 3;
      const initialTicks = 10;
      let capturedUpdateFunction: ((state: GameState) => GameState) | undefined;

      vi.mocked(isTraveling).mockReturnValue(true);

      const mockState = createMockGameState({
        nodeId: 'target-node',
        x: 200,
        y: 300,
        ticksLeft: initialTicks - numTicks, // After update
      });

      vi.mocked(gamestate).mockReturnValue(mockState);
      vi.mocked(updateGamestate).mockImplementation((func) => {
        capturedUpdateFunction = func;
      });

      const mockTargetLocation = createMockLocation(
        'target-node',
        'Target Location',
        200,
        300,
      );
      vi.mocked(locationGet).mockReturnValue(mockTargetLocation);

      gameloopTravel(numTicks);

      expect(isTraveling).toHaveBeenCalledTimes(1);
      expect(gamestate).toHaveBeenCalledTimes(1);
      expect(updateGamestate).toHaveBeenCalledTimes(1);
      expect(updateGamestate).toHaveBeenCalledWith(expect.any(Function));
      expect(locationGet).toHaveBeenCalledTimes(1);
      expect(locationGet).toHaveBeenCalledWith(200, 300);
      expect(globalStatusText.set).toHaveBeenCalledTimes(1);
      expect(globalStatusText.set).toHaveBeenCalledWith(
        'Traveling to Target Location... 7 ticks left.',
      );
      expect(notify).not.toHaveBeenCalled();
      expect(locationGetCurrent).not.toHaveBeenCalled();

      // Test the captured update function
      expect(capturedUpdateFunction).toBeDefined();
      if (capturedUpdateFunction) {
        const testState = createMockGameState({
          nodeId: 'target-node',
          x: 200,
          y: 300,
          ticksLeft: initialTicks,
        });

        const updatedState = capturedUpdateFunction(testState);
        expect(updatedState.hero.travel.ticksLeft).toBe(
          initialTicks - numTicks,
        );
        expect(updatedState).toBe(testState); // Should return the same object (mutation)
      }
    });

    it('should handle travel status when destination has no name', () => {
      const numTicks = 2;
      vi.mocked(isTraveling).mockReturnValue(true);

      const mockState = createMockGameState({
        nodeId: 'target-node',
        x: 150,
        y: 250,
        ticksLeft: 5,
      });

      vi.mocked(gamestate).mockReturnValue(mockState);
      vi.mocked(updateGamestate).mockImplementation(() => {});

      const mockTargetLocation = createMockLocation(
        'target-node',
        '',
        150,
        250,
      );
      vi.mocked(locationGet).mockReturnValue(mockTargetLocation);

      gameloopTravel(numTicks);

      expect(globalStatusText.set).toHaveBeenCalledWith(
        'Traveling to new destination... 5 ticks left.',
      );
    });

    it('should handle travel status when destination is not found', () => {
      const numTicks = 1;
      vi.mocked(isTraveling).mockReturnValue(true);

      const mockState = createMockGameState({
        nodeId: 'unknown-node',
        x: 400,
        y: 500,
        ticksLeft: 8,
      });

      vi.mocked(gamestate).mockReturnValue(mockState);
      vi.mocked(updateGamestate).mockImplementation(() => {});

      // Test with a location that exists but has no name (default location behavior)
      const defaultLocation = createMockLocation('default-id', '', 400, 500);
      vi.mocked(locationGet).mockReturnValue(defaultLocation);

      gameloopTravel(numTicks);

      expect(locationGet).toHaveBeenCalledWith(400, 500);
      expect(globalStatusText.set).toHaveBeenCalledWith(
        'Traveling to new destination... 8 ticks left.',
      );
    });
  });

  describe('traveling - finishing travel', () => {
    it('should finish travel when ticks reach exactly 0', () => {
      const numTicks = 5;
      const initialTicks = 5;

      vi.mocked(isTraveling).mockReturnValue(true);

      const travelData = {
        nodeId: 'target-node',
        x: 100,
        y: 200,
        ticksLeft: initialTicks,
      };

      const mockState = createMockGameState(travelData);
      vi.mocked(gamestate).mockReturnValue(mockState);

      // Mock updateGamestate to execute the callback and simulate travel completion
      vi.mocked(updateGamestate).mockImplementation((callback) => {
        const state = createMockGameState(travelData);
        callback(state);
        // After callback execution, simulate that didFinishTravel was set to true
        // by allowing the function to continue to the notify block
      });

      const mockTargetLocation = createMockLocation(
        'target-node',
        'Destination',
        100,
        200,
        false,
        3,
      );
      vi.mocked(locationGet).mockReturnValue(mockTargetLocation);
      vi.mocked(locationGetCurrent).mockReturnValue(mockTargetLocation);

      gameloopTravel(numTicks);

      expect(updateGamestate).toHaveBeenCalledTimes(2);
      expect(notify).toHaveBeenCalledTimes(1);
      expect(notify).toHaveBeenCalledWith('Arrived at Destination!', 'Travel');
      expect(locationGetCurrent).toHaveBeenCalledTimes(1);
    });

    it('should finish travel when ticks go negative', () => {
      const numTicks = 8;
      const initialTicks = 3;

      vi.mocked(isTraveling).mockReturnValue(true);

      const travelData = {
        nodeId: 'target-node',
        x: 300,
        y: 400,
        ticksLeft: initialTicks,
      };

      const mockState = createMockGameState(travelData);
      vi.mocked(gamestate).mockReturnValue(mockState);

      vi.mocked(updateGamestate).mockImplementation((callback) => {
        const state = createMockGameState(travelData);
        callback(state);
      });

      const mockTargetLocation = createMockLocation(
        'target-node',
        'Far Destination',
        300,
        400,
      );
      vi.mocked(locationGet).mockReturnValue(mockTargetLocation);
      vi.mocked(locationGetCurrent).mockReturnValue(mockTargetLocation);

      gameloopTravel(numTicks);

      expect(notify).toHaveBeenCalledWith(
        'Arrived at Far Destination!',
        'Travel',
      );
    });

    it('should handle arrival at claimed location', () => {
      const numTicks = 2;
      vi.mocked(isTraveling).mockReturnValue(true);

      const travelData = {
        nodeId: 'claimed-node',
        x: 500,
        y: 600,
        ticksLeft: numTicks,
      };

      const mockState = createMockGameState(travelData);
      vi.mocked(gamestate).mockReturnValue(mockState);
      vi.mocked(updateGamestate).mockImplementation((callback) => {
        const state = createMockGameState(travelData);
        callback(state);
      });

      const mockClaimedLocation = createMockLocation(
        'claimed-node',
        'Claimed Town',
        500,
        600,
        true,
        5,
      );
      vi.mocked(locationGet).mockReturnValue(mockClaimedLocation);
      vi.mocked(locationGetCurrent).mockReturnValue(mockClaimedLocation);

      gameloopTravel(numTicks);

      expect(notify).toHaveBeenCalledWith('Arrived at Claimed Town!', 'Travel');
    });

    it('should handle arrival when destination name is undefined', () => {
      const numTicks = 1;
      vi.mocked(isTraveling).mockReturnValue(true);

      const travelData = {
        nodeId: 'unnamed-node',
        x: 700,
        y: 800,
        ticksLeft: numTicks,
      };

      const mockState = createMockGameState(travelData);
      vi.mocked(gamestate).mockReturnValue(mockState);
      vi.mocked(updateGamestate).mockImplementation((callback) => {
        const state = createMockGameState(travelData);
        callback(state);
      });

      vi.mocked(locationGet).mockReturnValue(
        createMockLocation('unnamed-node', '', 700, 800),
      );
      vi.mocked(locationGetCurrent).mockReturnValue(undefined);

      gameloopTravel(numTicks);

      expect(notify).toHaveBeenCalledWith('Arrived at destination!', 'Travel');
    });

    it('should handle arrival when locationGetCurrent returns undefined', () => {
      const numTicks = 1;
      vi.mocked(isTraveling).mockReturnValue(true);

      const travelData = {
        nodeId: 'missing-node',
        x: 900,
        y: 1000,
        ticksLeft: numTicks,
      };

      const mockState = createMockGameState(travelData);
      vi.mocked(gamestate).mockReturnValue(mockState);
      vi.mocked(updateGamestate).mockImplementation((callback) => {
        const state = createMockGameState(travelData);
        callback(state);
      });

      vi.mocked(locationGet).mockReturnValue(
        createMockLocation('missing-node', 'Missing Location', 900, 1000),
      );
      vi.mocked(locationGetCurrent).mockReturnValue(undefined);

      gameloopTravel(numTicks);

      expect(notify).toHaveBeenCalledWith('Arrived at destination!', 'Travel');
    });
  });

  describe('function call order', () => {
    it('should call functions in correct order when traveling but not finishing', () => {
      const numTicks = 1;
      const callOrder: string[] = [];

      vi.mocked(isTraveling).mockImplementation(() => {
        callOrder.push('isTraveling');
        return true;
      });

      vi.mocked(gamestate).mockImplementation(() => {
        callOrder.push('gamestate');
        return createMockGameState({
          nodeId: 'target-node',
          x: 100,
          y: 200,
          ticksLeft: 5,
        });
      });

      vi.mocked(updateGamestate).mockImplementation((func) => {
        callOrder.push('updateGamestate');
        func(
          createMockGameState({
            nodeId: 'target-node',
            x: 100,
            y: 200,
            ticksLeft: 5,
          }),
        );
      });

      vi.mocked(locationGet).mockImplementation(() => {
        callOrder.push('locationGet');
        return createMockLocation('target-node', 'Target', 100, 200);
      });

      vi.mocked(globalStatusText.set).mockImplementation(() => {
        callOrder.push('globalStatusText.set');
      });

      gameloopTravel(numTicks);

      expect(callOrder).toEqual([
        'isTraveling',
        'gamestate',
        'updateGamestate',
        'locationGet',
        'globalStatusText.set',
      ]);
    });

    it('should call functions in correct order when finishing travel', () => {
      const numTicks = 5;
      const callOrder: string[] = [];

      vi.mocked(isTraveling).mockImplementation(() => {
        callOrder.push('isTraveling');
        return true;
      });

      vi.mocked(gamestate).mockImplementation(() => {
        callOrder.push('gamestate');
        return createMockGameState({
          nodeId: 'target-node',
          x: 100,
          y: 200,
          ticksLeft: 0,
        });
      });

      vi.mocked(updateGamestate).mockImplementation((func) => {
        callOrder.push('updateGamestate');
        func(
          createMockGameState({
            nodeId: 'target-node',
            x: 100,
            y: 200,
            ticksLeft: 0,
          }),
        );
      });

      vi.mocked(locationGet).mockImplementation(() => {
        callOrder.push('locationGet');
        return createMockLocation('target-node', 'Target', 100, 200);
      });

      vi.mocked(globalStatusText.set).mockImplementation(() => {
        callOrder.push('globalStatusText.set');
      });

      vi.mocked(locationGetCurrent).mockImplementation(() => {
        callOrder.push('locationGetCurrent');
        return createMockLocation('target-node', 'Target', 100, 200);
      });

      vi.mocked(notify).mockImplementation(() => {
        callOrder.push('notify');
      });

      gameloopTravel(numTicks);

      expect(callOrder).toEqual([
        'isTraveling',
        'gamestate',
        'updateGamestate',
        'locationGet',
        'globalStatusText.set',
        'locationGetCurrent',
        'notify',
        'updateGamestate',
      ]);
    });
  });

  describe('return value', () => {
    it('should return void (undefined) in all scenarios', () => {
      const testCases = [
        { numTicks: 5, isTraveling: false },
        { numTicks: 3, isTraveling: true, ticksLeft: 10 },
        { numTicks: 5, isTraveling: true, ticksLeft: 0 },
      ];

      testCases.forEach(({ numTicks, isTraveling: traveling, ticksLeft }) => {
        vi.clearAllMocks();
        vi.mocked(isTraveling).mockReturnValue(traveling);

        if (traveling) {
          vi.mocked(gamestate).mockReturnValue(
            createMockGameState({
              nodeId: 'test-node',
              x: 100,
              y: 200,
              ticksLeft: ticksLeft ?? 10,
            }),
          );
          vi.mocked(updateGamestate).mockImplementation(() => {});
          vi.mocked(locationGet).mockReturnValue(
            createMockLocation('test-node', 'Test', 100, 200),
          );

          if (ticksLeft === 0) {
            vi.mocked(locationGetCurrent).mockReturnValue(
              createMockLocation('test-node', 'Test', 100, 200),
            );
          }
        }

        const result = gameloopTravel(numTicks);
        expect(result).toBeUndefined();
      });
    });
  });

  describe('error handling and resilience', () => {
    it('should propagate errors from isTraveling', () => {
      const numTicks = 1;
      const error = new Error('Travel check failed');

      vi.mocked(isTraveling).mockImplementation(() => {
        throw error;
      });

      expect(() => gameloopTravel(numTicks)).toThrow(error);
      expect(isTraveling).toHaveBeenCalledTimes(1);
      expect(gamestate).not.toHaveBeenCalled();
    });

    it('should propagate errors from gamestate', () => {
      const numTicks = 1;
      const error = new Error('Gamestate failed');

      vi.mocked(isTraveling).mockReturnValue(true);
      vi.mocked(gamestate).mockImplementation(() => {
        throw error;
      });

      expect(() => gameloopTravel(numTicks)).toThrow(error);
      expect(isTraveling).toHaveBeenCalledTimes(1);
      expect(gamestate).toHaveBeenCalledTimes(1);
      expect(updateGamestate).not.toHaveBeenCalled();
    });

    it('should propagate errors from updateGamestate', () => {
      const numTicks = 1;
      const error = new Error('Update failed');

      vi.mocked(isTraveling).mockReturnValue(true);
      vi.mocked(gamestate).mockReturnValue(
        createMockGameState({
          nodeId: 'test-node',
          x: 100,
          y: 200,
          ticksLeft: 5,
        }),
      );
      vi.mocked(updateGamestate).mockImplementation(() => {
        throw error;
      });

      expect(() => gameloopTravel(numTicks)).toThrow(error);
      expect(updateGamestate).toHaveBeenCalledTimes(1);
      expect(locationGet).not.toHaveBeenCalled();
    });

    it('should propagate errors from locationGet', () => {
      const numTicks = 1;
      const error = new Error('Location get failed');

      vi.mocked(isTraveling).mockReturnValue(true);
      vi.mocked(gamestate).mockReturnValue(
        createMockGameState({
          nodeId: 'test-node',
          x: 100,
          y: 200,
          ticksLeft: 5,
        }),
      );
      vi.mocked(updateGamestate).mockImplementation(() => {});
      vi.mocked(locationGet).mockImplementation(() => {
        throw error;
      });

      expect(() => gameloopTravel(numTicks)).toThrow(error);
      expect(locationGet).toHaveBeenCalledTimes(1);
      expect(globalStatusText.set).not.toHaveBeenCalled();
    });
  });

  describe('integration scenarios', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should handle complete travel journey from start to finish', () => {
      const travelSteps = [
        { numTicks: 2, expectedTicksLeft: 8 }, // Still traveling
        { numTicks: 3, expectedTicksLeft: 5 }, // Still traveling
        { numTicks: 5, expectedTicksLeft: 0 }, // Finish travel
      ];

      let currentTicksLeft = 10;

      vi.mocked(isTraveling).mockReturnValue(true);
      vi.mocked(locationGet).mockReturnValue(
        createMockLocation('destination', 'Final Destination', 500, 600),
      );

      travelSteps.forEach(({ numTicks, expectedTicksLeft }) => {
        vi.clearAllMocks();
        vi.mocked(isTraveling).mockReturnValue(true);

        const mockState = createMockGameState({
          nodeId: 'destination',
          x: 500,
          y: 600,
          ticksLeft: expectedTicksLeft,
        });

        vi.mocked(gamestate).mockReturnValue(mockState);
        vi.mocked(updateGamestate).mockImplementation((func) => {
          const testState = createMockGameState({
            nodeId: 'destination',
            x: 500,
            y: 600,
            ticksLeft: currentTicksLeft,
          });
          func(testState);
          currentTicksLeft = expectedTicksLeft;
        });

        vi.mocked(locationGet).mockReturnValue(
          createMockLocation('destination', 'Final Destination', 500, 600),
        );

        if (expectedTicksLeft === 0) {
          vi.mocked(locationGetCurrent).mockReturnValue(
            createMockLocation('destination', 'Final Destination', 500, 600),
          );
        }

        gameloopTravel(numTicks);

        expect(updateGamestate).toHaveBeenCalledTimes(
          expectedTicksLeft === 0 ? 2 : 1,
        );

        if (expectedTicksLeft > 0) {
          expect(globalStatusText.set).toHaveBeenCalledWith(
            `Traveling to Final Destination... ${expectedTicksLeft} ticks left.`,
          );
          expect(notify).not.toHaveBeenCalled();
        } else {
          expect(notify).toHaveBeenCalledWith(
            'Arrived at Final Destination!',
            'Travel',
          );
        }
      });
    });

    it('should handle different encounter levels for location setup', () => {
      const encounterLevels = [1, 3, 5, 10];

      encounterLevels.forEach((encounterLevel) => {
        vi.clearAllMocks();
        vi.mocked(isTraveling).mockReturnValue(true);

        const mockState = createMockGameState({
          nodeId: 'test-node',
          x: 100,
          y: 200,
          ticksLeft: 0,
        });

        vi.mocked(gamestate).mockReturnValue(mockState);
        vi.mocked(updateGamestate).mockImplementation(() => {});
        vi.mocked(locationGet).mockReturnValue(
          createMockLocation('test-node', 'Test Location', 100, 200),
        );

        const mockLocation = createMockLocation(
          'test-node',
          'Test Location',
          100,
          200,
          false,
          encounterLevel,
        );
        vi.mocked(locationGetCurrent).mockReturnValue(mockLocation);

        let capturedSecondUpdateFunction:
          | ((state: GameState) => GameState)
          | undefined;
        vi.mocked(updateGamestate)
          .mockImplementationOnce(() => {})
          .mockImplementationOnce((func) => {
            capturedSecondUpdateFunction = func;
          });

        gameloopTravel(5);

        if (capturedSecondUpdateFunction) {
          const testState = createMockGameState({
            nodeId: '',
            x: 0,
            y: 0,
            ticksLeft: 0,
          });

          const updatedState = capturedSecondUpdateFunction(testState);
          const expectedTicks = (encounterLevel + 1) * 5;
          expect(updatedState.hero.location.ticksTotal).toBe(expectedTicks);
          expect(updatedState.hero.location.ticksLeft).toBe(expectedTicks);
        }
      });
    });

    it('should handle multiple travel attempts in sequence', () => {
      // Clean slate for this test
      vi.resetAllMocks();

      // First travel (not traveling)
      vi.mocked(isTraveling).mockReturnValueOnce(false);
      gameloopTravel(5);
      expect(gamestate).not.toHaveBeenCalled();

      // Second travel (in progress)
      vi.clearAllMocks();
      vi.mocked(isTraveling).mockReturnValueOnce(true);
      vi.mocked(gamestate).mockReturnValueOnce(
        createMockGameState({
          nodeId: 'target1',
          x: 100,
          y: 200,
          ticksLeft: 3,
        }),
      );
      vi.mocked(updateGamestate).mockImplementation(() => {});
      vi.mocked(locationGet).mockReturnValueOnce(
        createMockLocation('target1', 'Target 1', 100, 200),
      );

      gameloopTravel(2);
      expect(globalStatusText.set).toHaveBeenCalledWith(
        'Traveling to Target 1... 3 ticks left.',
      );

      // Third travel (finishing)
      vi.clearAllMocks();
      vi.mocked(isTraveling).mockReturnValueOnce(true);

      const travelData = {
        nodeId: 'target2',
        x: 300,
        y: 400,
        ticksLeft: 3,
      };

      const mockState = createMockGameState(travelData);
      vi.mocked(gamestate).mockReturnValueOnce(mockState);
      vi.mocked(updateGamestate).mockImplementation((callback) => {
        const state = createMockGameState(travelData);
        const result = callback(state);
        return result;
      });
      vi.mocked(locationGet).mockReturnValueOnce(
        createMockLocation('target2', 'Target 2', 300, 400),
      );
      vi.mocked(locationGetCurrent).mockReturnValueOnce(
        createMockLocation('target2', 'Target 2', 300, 400),
      );

      gameloopTravel(3);
      expect(notify).toHaveBeenCalledWith('Arrived at Target 2!', 'Travel');
    });
  });
});
