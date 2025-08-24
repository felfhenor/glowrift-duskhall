import { gameloopTravel } from '@helpers/gameloop-travel';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock all dependencies
vi.mock('@helpers/camera', () => ({
  cameraCenterOnPlayer: vi.fn(),
}));

vi.mock('@helpers/state-game', () => ({
  gamestate: vi.fn(),
  updateGamestate: vi.fn(),
}));

vi.mock('@helpers/state-options', () => ({
  getOption: vi.fn(),
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
  locationArriveAt: vi.fn(),
}));

// Import mocked functions
import { cameraCenterOnPlayer } from '@helpers/camera';
import { gamestate, updateGamestate } from '@helpers/state-game';
import { getOption } from '@helpers/state-options';
import { isTraveling } from '@helpers/travel';
import { globalStatusText } from '@helpers/ui';
import { locationGet, locationGetCurrent } from '@helpers/world-location';
import type {
  GameState,
  GameStateHeroesTraveling,
} from '@interfaces/state-game';
import type { WorldLocation } from '@interfaces/world';

// Mock helper functions
function createMockGameState(
  travelOverrides: Partial<GameStateHeroesTraveling> = {},
): GameState {
  return {
    hero: {
      travel: {
        x: 0,
        y: 0,
        nodeId: '',
        ticksLeft: 0,
        ticksTotal: 0,
        ...travelOverrides,
      },
      position: {
        x: 0,
        y: 0,
        nodeId: '',
      },
      location: {
        ticksTotal: 0,
        ticksLeft: 0,
      },
    },
  } as GameState;
}

function createMockLocation(
  id: string = 'test-location',
  name: string = 'Test Location',
  x: number = 10,
  y: number = 20,
  encounterLevel: number = 5,
  currentlyClaimed: boolean = false,
): WorldLocation {
  return {
    id,
    name,
    x,
    y,
    encounterLevel,
    currentlyClaimed,
    nodeType: 'dungeon',
    elements: [],
    claimCount: 0,
    unclaimTime: 0,
    guardianIds: [],
    claimLootIds: [],
    traitIds: [],
    locationUpgrades: {},
  };
}

describe('gameloopTravel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('when not traveling', () => {
    it('should return early when not traveling', () => {
      vi.mocked(isTraveling).mockReturnValue(false);

      gameloopTravel();

      expect(isTraveling).toHaveBeenCalledTimes(1);
      expect(gamestate).not.toHaveBeenCalled();
      expect(updateGamestate).not.toHaveBeenCalled();
      expect(globalStatusText.set).not.toHaveBeenCalled();
    });
  });

  describe('when traveling', () => {
    describe('travel in progress (not finishing)', () => {
      it('should decrement ticksLeft and show travel progress', () => {
        const mockState = createMockGameState({
          x: 10,
          y: 20,
          nodeId: 'destination',
          ticksLeft: 5,
          ticksTotal: 10,
        });
        const mockLocation = createMockLocation('destination', 'Destination');

        vi.mocked(isTraveling).mockReturnValue(true);
        vi.mocked(gamestate).mockReturnValue(mockState);
        vi.mocked(locationGet).mockReturnValue(mockLocation);
        vi.mocked(updateGamestate).mockImplementation((callback) => {
          callback(mockState);
          return Promise.resolve();
        });

        gameloopTravel();

        expect(updateGamestate).toHaveBeenCalledTimes(1);
        expect(locationGet).toHaveBeenCalledWith(10, 20);
        expect(globalStatusText.set).toHaveBeenCalledWith(
          'Traveling to Destination... 4 ticks left.',
        );
      });
    });

    describe('travel completion', () => {
      it('should complete travel when ticksLeft reaches 0', () => {
        const mockState = createMockGameState({
          x: 30,
          y: 40,
          nodeId: 'destination',
          ticksLeft: 1,
          ticksTotal: 10,
        });
        const mockDestination = createMockLocation(
          'destination',
          'Final Destination',
          30,
          40,
          5,
        );

        vi.mocked(isTraveling).mockReturnValue(true);
        vi.mocked(gamestate).mockReturnValue(mockState);
        vi.mocked(locationGet).mockReturnValue(mockDestination);
        vi.mocked(locationGetCurrent).mockReturnValue(mockDestination);
        vi.mocked(getOption).mockReturnValue(false);

        vi.mocked(updateGamestate)
          .mockImplementationOnce((callback) => {
            const updatedState = callback(mockState);
            expect(updatedState.hero.travel.ticksLeft).toBe(0);
            return Promise.resolve();
          })
          .mockImplementationOnce((callback) => {
            const updatedState = callback(mockState);
            const expectedExploreTicks =
              (mockDestination.encounterLevel + 1) * 5;
            expect(updatedState.hero.location.ticksTotal).toBe(
              expectedExploreTicks,
            );
            expect(updatedState.hero.location.ticksLeft).toBe(
              expectedExploreTicks,
            );
            return Promise.resolve();
          });

        gameloopTravel();

        expect(updateGamestate).toHaveBeenCalledTimes(2);
        expect(globalStatusText.set).toHaveBeenCalledWith(
          'Traveling to Final Destination... 0 ticks left.',
        );
        expect(globalStatusText.set).toHaveBeenCalledWith(
          'Arrived at Final Destination!',
        );
      });
    });
  });

  describe('additional coverage', () => {
    it('should handle empty location name with fallback', () => {
      const mockState = createMockGameState({
        x: 15,
        y: 25,
        nodeId: 'unknown',
        ticksLeft: 3,
        ticksTotal: 8,
      });
      const mockLocation = createMockLocation('unknown', '');

      vi.mocked(isTraveling).mockReturnValue(true);
      vi.mocked(gamestate).mockReturnValue(mockState);
      vi.mocked(locationGet).mockReturnValue(mockLocation);
      vi.mocked(updateGamestate).mockImplementation((callback) => {
        callback(mockState);
        return Promise.resolve();
      });

      gameloopTravel();

      expect(globalStatusText.set).toHaveBeenCalledWith(
        'Traveling to new destination... 2 ticks left.',
      );
    });

    it('should center camera when followHeroesOnMap option is enabled', () => {
      const mockState = createMockGameState({
        x: 15,
        y: 25,
        nodeId: 'camera-test',
        ticksLeft: 1,
        ticksTotal: 2,
      });
      const mockLocation = createMockLocation(
        'camera-test',
        'Camera Test',
        15,
        25,
      );

      vi.mocked(isTraveling).mockReturnValue(true);
      vi.mocked(gamestate).mockReturnValue(mockState);
      vi.mocked(locationGet).mockReturnValue(mockLocation);
      vi.mocked(locationGetCurrent).mockReturnValue(mockLocation);
      vi.mocked(getOption).mockReturnValue(true);
      vi.mocked(updateGamestate)
        .mockImplementationOnce((callback) => {
          const updatedState = callback(mockState);
          expect(updatedState.hero.travel.ticksLeft).toBe(0);
          return Promise.resolve();
        })
        .mockImplementationOnce(() => Promise.resolve());

      gameloopTravel();

      expect(getOption).toHaveBeenCalledWith('followHeroesOnMap');
      expect(cameraCenterOnPlayer).toHaveBeenCalledTimes(1);
    });

    it('should set exploration ticks to 0 for claimed locations', () => {
      const mockState = createMockGameState({
        x: 50,
        y: 60,
        nodeId: 'claimed-town',
        ticksLeft: 1,
        ticksTotal: 5,
      });
      const mockClaimedLocation = createMockLocation(
        'claimed-town',
        'Claimed Town',
        50,
        60,
        3,
        true,
      );

      vi.mocked(isTraveling).mockReturnValue(true);
      vi.mocked(gamestate).mockReturnValue(mockState);
      vi.mocked(locationGet).mockReturnValue(mockClaimedLocation);
      vi.mocked(locationGetCurrent).mockReturnValue(mockClaimedLocation);
      vi.mocked(getOption).mockReturnValue(false);

      vi.mocked(updateGamestate)
        .mockImplementationOnce((callback) => {
          const updatedState = callback(mockState);
          expect(updatedState.hero.travel.ticksLeft).toBe(0);
          return Promise.resolve();
        })
        .mockImplementationOnce((callback) => {
          const updatedState = callback(mockState);
          expect(updatedState.hero.location.ticksTotal).toBe(0);
          expect(updatedState.hero.location.ticksLeft).toBe(0);
          return Promise.resolve();
        });

      gameloopTravel();

      expect(globalStatusText.set).toHaveBeenCalledWith(
        'Traveling to Claimed Town... 0 ticks left.',
      );
      expect(globalStatusText.set).toHaveBeenCalledWith(
        'Arrived at Claimed Town!',
      );
    });
  });
});
