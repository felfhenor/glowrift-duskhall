import type { LocationType } from '@interfaces/content-worldconfig';
import type { WorldLocation } from '@interfaces/world';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the dependencies
vi.mock('@helpers/hero', () => ({
  heroHealAll: vi.fn(),
}));

vi.mock('@helpers/hero-xp', () => ({
  heroAllGainXp: vi.fn(),
}));

vi.mock('@helpers/world-location', () => ({
  locationGetCurrent: vi.fn(),
}));

// Import the mocked functions and the function under test
import { gameloopTown } from '@helpers/gameloop-town';
import { heroHealAll } from '@helpers/hero';
import { heroAllGainXp } from '@helpers/hero-xp';
import { locationGetCurrent } from '@helpers/world-location';

// Helper function to create a mock WorldLocation
const createMockLocation = (
  nodeType: LocationType | undefined,
): WorldLocation => ({
  x: 100,
  y: 100,
  id: 'test-location-id',
  name: 'Test Location',
  nodeType,
  elements: [],
  currentlyClaimed: false,
  claimCount: 0,
  encounterLevel: 1,
  unclaimTime: 0,
  guardianIds: [],
  claimLootIds: [],
  traitIds: [],
  locationUpgrades: {},
});

describe('gameloopTown', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('town-specific behavior', () => {
    it('should call heroAllGainXp and heroHealAll when current location is a town', () => {
      const numTicks = 10;
      const mockTownLocation = createMockLocation('town');
      vi.mocked(locationGetCurrent).mockReturnValue(mockTownLocation);

      gameloopTown(numTicks);

      expect(locationGetCurrent).toHaveBeenCalledTimes(1);
      expect(heroAllGainXp).toHaveBeenCalledTimes(1);
      expect(heroAllGainXp).toHaveBeenCalledWith(numTicks);
      expect(heroHealAll).toHaveBeenCalledTimes(1);
      expect(heroHealAll).toHaveBeenCalledWith(numTicks);
    });

    it('should not call heroAllGainXp and heroHealAll when current location is not a town', () => {
      const numTicks = 8;
      const mockVillageLocation = createMockLocation('village');
      vi.mocked(locationGetCurrent).mockReturnValue(mockVillageLocation);

      gameloopTown(numTicks);

      expect(locationGetCurrent).toHaveBeenCalledTimes(1);
      expect(heroAllGainXp).not.toHaveBeenCalled();
      expect(heroHealAll).not.toHaveBeenCalled();
    });

    it('should not call heroAllGainXp and heroHealAll when currentNode is undefined', () => {
      const numTicks = 6;
      vi.mocked(locationGetCurrent).mockReturnValue(undefined);

      gameloopTown(numTicks);

      expect(locationGetCurrent).toHaveBeenCalledTimes(1);
      expect(heroAllGainXp).not.toHaveBeenCalled();
      expect(heroHealAll).not.toHaveBeenCalled();
    });

    it('should not call heroAllGainXp and heroHealAll when nodeType is undefined', () => {
      const numTicks = 4;
      const mockLocationWithoutType = createMockLocation(undefined);
      vi.mocked(locationGetCurrent).mockReturnValue(mockLocationWithoutType);

      gameloopTown(numTicks);

      expect(locationGetCurrent).toHaveBeenCalledTimes(1);
      expect(heroAllGainXp).not.toHaveBeenCalled();
      expect(heroHealAll).not.toHaveBeenCalled();
    });
  });

  describe('different location types', () => {
    const locationTypes: (LocationType | undefined)[] = [
      'town',
      'village',
      'cave',
      'dungeon',
      'castle',
      undefined,
    ];

    locationTypes.forEach((locationType) => {
      it(`should handle location type: ${locationType ?? 'undefined'}`, () => {
        const numTicks = 12;
        const mockLocation = locationType
          ? createMockLocation(locationType)
          : undefined;
        vi.mocked(locationGetCurrent).mockReturnValue(mockLocation);

        gameloopTown(numTicks);

        expect(locationGetCurrent).toHaveBeenCalledTimes(1);

        if (locationType === 'town') {
          expect(heroAllGainXp).toHaveBeenCalledTimes(1);
          expect(heroAllGainXp).toHaveBeenCalledWith(numTicks);
          expect(heroHealAll).toHaveBeenCalledTimes(1);
          expect(heroHealAll).toHaveBeenCalledWith(numTicks);
        } else {
          expect(heroAllGainXp).not.toHaveBeenCalled();
          expect(heroHealAll).not.toHaveBeenCalled();
        }
      });
    });
  });

  describe('function call order', () => {
    it('should call locationGetCurrent before hero functions when in town', () => {
      const numTicks = 1;
      const callOrder: string[] = [];

      vi.mocked(locationGetCurrent).mockImplementation(() => {
        callOrder.push('locationGetCurrent');
        return createMockLocation('town');
      });

      vi.mocked(heroAllGainXp).mockImplementation(() => {
        callOrder.push('heroAllGainXp');
      });

      vi.mocked(heroHealAll).mockImplementation(() => {
        callOrder.push('heroHealAll');
      });

      gameloopTown(numTicks);

      expect(callOrder.indexOf('locationGetCurrent')).toBeLessThan(
        callOrder.indexOf('heroAllGainXp'),
      );
      expect(callOrder.indexOf('locationGetCurrent')).toBeLessThan(
        callOrder.indexOf('heroHealAll'),
      );
    });

    it('should call heroAllGainXp before heroHealAll when in town', () => {
      const numTicks = 1;
      const callOrder: string[] = [];

      vi.mocked(locationGetCurrent).mockReturnValue(createMockLocation('town'));

      vi.mocked(heroAllGainXp).mockImplementation(() => {
        callOrder.push('heroAllGainXp');
      });

      vi.mocked(heroHealAll).mockImplementation(() => {
        callOrder.push('heroHealAll');
      });

      gameloopTown(numTicks);

      expect(callOrder).toEqual(['heroAllGainXp', 'heroHealAll']);
    });

    it('should not call hero functions if not in town, regardless of call order setup', () => {
      const numTicks = 1;
      const callOrder: string[] = [];

      vi.mocked(locationGetCurrent).mockReturnValue(
        createMockLocation('village'),
      );

      vi.mocked(heroAllGainXp).mockImplementation(() => {
        callOrder.push('heroAllGainXp');
      });

      vi.mocked(heroHealAll).mockImplementation(() => {
        callOrder.push('heroHealAll');
      });

      gameloopTown(numTicks);

      expect(callOrder).toEqual([]);
      expect(heroAllGainXp).not.toHaveBeenCalled();
      expect(heroHealAll).not.toHaveBeenCalled();
    });
  });

  describe('return value', () => {
    it('should return void (undefined)', () => {
      const numTicks = 1;
      vi.mocked(locationGetCurrent).mockReturnValue(createMockLocation('town'));

      const result = gameloopTown(numTicks);

      expect(result).toBeUndefined();
    });

    it('should return void for all scenarios', () => {
      const testCases = [
        { numTicks: 0, location: createMockLocation('town') },
        { numTicks: 1, location: createMockLocation('village') },
        { numTicks: 10, location: undefined },
        { numTicks: -5, location: createMockLocation('town') },
      ];

      testCases.forEach(({ numTicks, location }) => {
        vi.clearAllMocks();
        vi.mocked(locationGetCurrent).mockReturnValue(location);

        const result = gameloopTown(numTicks);
        expect(result).toBeUndefined();
      });
    });
  });

  describe('error handling and resilience', () => {
    it('should propagate errors from locationGetCurrent', () => {
      const numTicks = 1;
      const error = new Error('Location get failed');

      vi.mocked(locationGetCurrent).mockImplementation(() => {
        throw error;
      });

      expect(() => gameloopTown(numTicks)).toThrow(error);
      expect(locationGetCurrent).toHaveBeenCalledTimes(1);
      expect(heroAllGainXp).not.toHaveBeenCalled();
      expect(heroHealAll).not.toHaveBeenCalled();
    });

    it('should propagate errors from heroAllGainXp when in town', () => {
      const numTicks = 1;
      const error = new Error('Hero XP gain failed');

      vi.mocked(locationGetCurrent).mockReturnValue(createMockLocation('town'));
      vi.mocked(heroAllGainXp).mockImplementation(() => {
        throw error;
      });

      expect(() => gameloopTown(numTicks)).toThrow(error);
      expect(locationGetCurrent).toHaveBeenCalledTimes(1);
      expect(heroAllGainXp).toHaveBeenCalledTimes(1);
      expect(heroHealAll).not.toHaveBeenCalled();
    });

    it('should propagate errors from heroHealAll when in town', () => {
      const numTicks = 1;
      const error = new Error('Hero heal failed');

      vi.mocked(locationGetCurrent).mockReturnValue(createMockLocation('town'));
      vi.mocked(heroAllGainXp).mockImplementation(() => {});
      vi.mocked(heroHealAll).mockImplementation(() => {
        throw error;
      });

      expect(() => gameloopTown(numTicks)).toThrow(error);
      expect(locationGetCurrent).toHaveBeenCalledTimes(1);
      expect(heroAllGainXp).toHaveBeenCalledTimes(1);
      expect(heroHealAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('integration scenarios', () => {
    it('should work correctly when called multiple times with different locations', () => {
      const testSequence = [
        { numTicks: 5, location: createMockLocation('town') },
        { numTicks: 3, location: createMockLocation('village') },
        { numTicks: 7, location: undefined },
        { numTicks: 2, location: createMockLocation('town') },
      ];

      testSequence.forEach(({ numTicks, location }) => {
        vi.clearAllMocks();
        vi.mocked(heroAllGainXp).mockImplementation(() => {});
        vi.mocked(heroHealAll).mockImplementation(() => {});
        vi.mocked(locationGetCurrent).mockReturnValue(location);

        gameloopTown(numTicks);

        expect(locationGetCurrent).toHaveBeenCalledTimes(1);

        if (location?.nodeType === 'town') {
          expect(heroAllGainXp).toHaveBeenCalledTimes(1);
          expect(heroAllGainXp).toHaveBeenCalledWith(numTicks);
          expect(heroHealAll).toHaveBeenCalledTimes(1);
          expect(heroHealAll).toHaveBeenCalledWith(numTicks);
        } else {
          expect(heroAllGainXp).not.toHaveBeenCalled();
          expect(heroHealAll).not.toHaveBeenCalled();
        }
      });
    });

    it('should maintain correct behavior across multiple calls without clearing mocks', () => {
      vi.mocked(heroAllGainXp).mockImplementation(() => {});
      vi.mocked(heroHealAll).mockImplementation(() => {});

      // First call - town
      vi.mocked(locationGetCurrent).mockReturnValueOnce(
        createMockLocation('town'),
      );
      gameloopTown(10);

      // Second call - village
      vi.mocked(locationGetCurrent).mockReturnValueOnce(
        createMockLocation('village'),
      );
      gameloopTown(5);

      // Third call - town again
      vi.mocked(locationGetCurrent).mockReturnValueOnce(
        createMockLocation('town'),
      );
      gameloopTown(8);

      expect(locationGetCurrent).toHaveBeenCalledTimes(3);

      // Hero functions should only be called for town calls (1st and 3rd)
      expect(heroAllGainXp).toHaveBeenCalledTimes(2);
      expect(heroAllGainXp).toHaveBeenNthCalledWith(1, 10);
      expect(heroAllGainXp).toHaveBeenNthCalledWith(2, 8);

      expect(heroHealAll).toHaveBeenCalledTimes(2);
      expect(heroHealAll).toHaveBeenNthCalledWith(1, 10);
      expect(heroHealAll).toHaveBeenNthCalledWith(2, 8);
    });

    it('should handle realistic game scenario with various tick amounts and locations', () => {
      const gameScenario = [
        { numTicks: 1, location: 'town' as LocationType },
        { numTicks: 50, location: 'cave' as LocationType },
        { numTicks: 25, location: 'town' as LocationType },
        { numTicks: 100, location: 'dungeon' as LocationType },
        { numTicks: 10, location: 'town' as LocationType },
      ];

      vi.mocked(heroAllGainXp).mockImplementation(() => {});
      vi.mocked(heroHealAll).mockImplementation(() => {});

      gameScenario.forEach(({ numTicks, location }) => {
        vi.mocked(locationGetCurrent).mockReturnValueOnce(
          createMockLocation(location),
        );
        gameloopTown(numTicks);
      });

      expect(locationGetCurrent).toHaveBeenCalledTimes(5);

      // Should call hero functions only for town locations (1st, 3rd, 5th calls)
      expect(heroAllGainXp).toHaveBeenCalledTimes(3);
      expect(heroAllGainXp).toHaveBeenNthCalledWith(1, 1);
      expect(heroAllGainXp).toHaveBeenNthCalledWith(2, 25);
      expect(heroAllGainXp).toHaveBeenNthCalledWith(3, 10);

      expect(heroHealAll).toHaveBeenCalledTimes(3);
      expect(heroHealAll).toHaveBeenNthCalledWith(1, 1);
      expect(heroHealAll).toHaveBeenNthCalledWith(2, 25);
      expect(heroHealAll).toHaveBeenNthCalledWith(3, 10);
    });
  });

  describe('specific location type coverage', () => {
    it('should handle location with nodeType as town', () => {
      const numTicks = 15;
      const townLocation = createMockLocation('town');
      vi.mocked(locationGetCurrent).mockReturnValue(townLocation);

      gameloopTown(numTicks);

      expect(heroAllGainXp).toHaveBeenCalledWith(numTicks);
      expect(heroHealAll).toHaveBeenCalledWith(numTicks);
    });

    it('should handle location with nodeType as village', () => {
      const numTicks = 20;
      const villageLocation = createMockLocation('village');
      vi.mocked(locationGetCurrent).mockReturnValue(villageLocation);

      gameloopTown(numTicks);

      expect(heroAllGainXp).not.toHaveBeenCalled();
      expect(heroHealAll).not.toHaveBeenCalled();
    });

    it('should handle location with nodeType as cave', () => {
      const numTicks = 25;
      const caveLocation = createMockLocation('cave');
      vi.mocked(locationGetCurrent).mockReturnValue(caveLocation);

      gameloopTown(numTicks);

      expect(heroAllGainXp).not.toHaveBeenCalled();
      expect(heroHealAll).not.toHaveBeenCalled();
    });

    it('should handle location with nodeType as dungeon', () => {
      const numTicks = 30;
      const dungeonLocation = createMockLocation('dungeon');
      vi.mocked(locationGetCurrent).mockReturnValue(dungeonLocation);

      gameloopTown(numTicks);

      expect(heroAllGainXp).not.toHaveBeenCalled();
      expect(heroHealAll).not.toHaveBeenCalled();
    });

    it('should handle location with nodeType as castle', () => {
      const numTicks = 35;
      const castleLocation = createMockLocation('castle');
      vi.mocked(locationGetCurrent).mockReturnValue(castleLocation);

      gameloopTown(numTicks);

      expect(heroAllGainXp).not.toHaveBeenCalled();
      expect(heroHealAll).not.toHaveBeenCalled();
    });
  });
});
