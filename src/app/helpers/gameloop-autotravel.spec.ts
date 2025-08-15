import type { WorldLocation } from '@interfaces/world';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the dependencies
vi.mock('@helpers/explore', () => ({
  isExploring: vi.fn(),
}));

vi.mock('@helpers/hero', () => ({
  heroAreAllDead: vi.fn(),
  heroRecoveringInTown: vi.fn(),
  heroRecoveryPercent: vi.fn(),
}));

vi.mock('@helpers/travel', () => ({
  isTraveling: vi.fn(),
  travelToNode: vi.fn(),
}));

vi.mock('@helpers/ui', () => ({
  globalStatusText: {
    set: vi.fn(),
  },
}));

vi.mock('@helpers/world-location', () => ({
  locationGetAllMatchingPreferences: vi.fn(),
  locationGetClosestUnclaimedClaimableLocation: vi.fn(),
  locationGetCurrent: vi.fn(),
  locationGetInOrderOfCloseness: vi.fn(),
}));

// Import the mocked functions and the function under test
import { isExploring } from '@helpers/explore';
import { gameloopAutoTravel } from '@helpers/gameloop-autotravel';
import {
  heroAreAllDead,
  heroRecoveringInTown,
  heroRecoveryPercent,
} from '@helpers/hero';
import { isTraveling, travelToNode } from '@helpers/travel';
import { globalStatusText } from '@helpers/ui';
import {
  locationGetAllMatchingPreferences,
  locationGetClosestUnclaimedClaimableLocation,
  locationGetCurrent,
  locationGetInOrderOfCloseness,
} from '@helpers/world-location';

// Helper function to create a minimal WorldLocation for testing
const createMockLocation = (
  id: string,
  name: string,
  x: number,
  y: number,
  currentlyClaimed = false,
  encounterLevel = 1,
  nodeType:
    | 'town'
    | 'village'
    | 'cave'
    | 'dungeon'
    | 'castle'
    | undefined = 'cave',
): WorldLocation => ({
  id,
  name,
  x,
  y,
  nodeType,
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

describe('gameloopAutoTravel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('early returns', () => {
    it('should return early when exploring', () => {
      vi.mocked(isExploring).mockReturnValue(true);

      gameloopAutoTravel();

      expect(isExploring).toHaveBeenCalledTimes(1);
      expect(isTraveling).not.toHaveBeenCalled();
      expect(heroAreAllDead).not.toHaveBeenCalled();
      expect(heroRecoveringInTown).not.toHaveBeenCalled();
      expect(locationGetCurrent).not.toHaveBeenCalled();
      expect(globalStatusText.set).not.toHaveBeenCalled();
      expect(travelToNode).not.toHaveBeenCalled();
    });

    it('should return early when traveling', () => {
      vi.mocked(isExploring).mockReturnValue(false);
      vi.mocked(isTraveling).mockReturnValue(true);

      gameloopAutoTravel();

      expect(isExploring).toHaveBeenCalledTimes(1);
      expect(isTraveling).toHaveBeenCalledTimes(1);
      expect(heroAreAllDead).not.toHaveBeenCalled();
      expect(heroRecoveringInTown).not.toHaveBeenCalled();
      expect(locationGetCurrent).not.toHaveBeenCalled();
      expect(globalStatusText.set).not.toHaveBeenCalled();
      expect(travelToNode).not.toHaveBeenCalled();
    });

    it('should return early and set status when all heroes are dead', () => {
      vi.mocked(isExploring).mockReturnValue(false);
      vi.mocked(isTraveling).mockReturnValue(false);
      vi.mocked(heroAreAllDead).mockReturnValue(true);

      gameloopAutoTravel();

      expect(isExploring).toHaveBeenCalledTimes(1);
      expect(isTraveling).toHaveBeenCalledTimes(1);
      expect(heroAreAllDead).toHaveBeenCalledTimes(1);
      expect(heroRecoveringInTown).not.toHaveBeenCalled();
      expect(locationGetCurrent).not.toHaveBeenCalled();
      expect(globalStatusText.set).toHaveBeenCalledWith(
        'All heroes are defeated; cannot travel.',
      );
      expect(travelToNode).not.toHaveBeenCalled();
    });

    it('should return early and set status when heroes are recovering in town', () => {
      vi.mocked(isExploring).mockReturnValue(false);
      vi.mocked(isTraveling).mockReturnValue(false);
      vi.mocked(heroAreAllDead).mockReturnValue(false);
      vi.mocked(heroRecoveringInTown).mockReturnValue(true);
      vi.mocked(heroRecoveryPercent).mockReturnValue('75');

      gameloopAutoTravel();

      expect(isExploring).toHaveBeenCalledTimes(1);
      expect(isTraveling).toHaveBeenCalledTimes(1);
      expect(heroAreAllDead).toHaveBeenCalledTimes(1);
      expect(heroRecoveringInTown).toHaveBeenCalledTimes(1);
      expect(heroRecoveryPercent).toHaveBeenCalledTimes(1);
      expect(locationGetCurrent).not.toHaveBeenCalled();
      expect(globalStatusText.set).toHaveBeenCalledWith(
        'Heroes are recovering in town; cannot travel (75% recovered).',
      );
      expect(travelToNode).not.toHaveBeenCalled();
    });

    it('should handle zero recovery percent when heroes are recovering', () => {
      vi.mocked(isExploring).mockReturnValue(false);
      vi.mocked(isTraveling).mockReturnValue(false);
      vi.mocked(heroAreAllDead).mockReturnValue(false);
      vi.mocked(heroRecoveringInTown).mockReturnValue(true);
      vi.mocked(heroRecoveryPercent).mockReturnValue('0');

      gameloopAutoTravel();

      expect(heroRecoveryPercent).toHaveBeenCalledTimes(1);
      expect(globalStatusText.set).toHaveBeenCalledWith(
        'Heroes are recovering in town; cannot travel (0% recovered).',
      );
    });

    it('should handle 100 recovery percent when heroes are recovering', () => {
      vi.mocked(isExploring).mockReturnValue(false);
      vi.mocked(isTraveling).mockReturnValue(false);
      vi.mocked(heroAreAllDead).mockReturnValue(false);
      vi.mocked(heroRecoveringInTown).mockReturnValue(true);
      vi.mocked(heroRecoveryPercent).mockReturnValue('100');

      gameloopAutoTravel();

      expect(heroRecoveryPercent).toHaveBeenCalledTimes(1);
      expect(globalStatusText.set).toHaveBeenCalledWith(
        'Heroes are recovering in town; cannot travel (100% recovered).',
      );
    });
  });

  describe('no current node scenarios', () => {
    it('should handle when locationGetCurrent returns undefined', () => {
      vi.mocked(isExploring).mockReturnValue(false);
      vi.mocked(isTraveling).mockReturnValue(false);
      vi.mocked(heroAreAllDead).mockReturnValue(false);
      vi.mocked(heroRecoveringInTown).mockReturnValue(false);
      vi.mocked(locationGetCurrent).mockReturnValue(undefined);

      gameloopAutoTravel();

      expect(locationGetCurrent).toHaveBeenCalledTimes(1);
      expect(locationGetInOrderOfCloseness).not.toHaveBeenCalled();
      expect(
        locationGetClosestUnclaimedClaimableLocation,
      ).not.toHaveBeenCalled();
      expect(locationGetAllMatchingPreferences).not.toHaveBeenCalled();
      expect(globalStatusText.set).not.toHaveBeenCalled();
      expect(travelToNode).not.toHaveBeenCalled();
    });

    it('should handle when locationGetCurrent returns null', () => {
      vi.mocked(isExploring).mockReturnValue(false);
      vi.mocked(isTraveling).mockReturnValue(false);
      vi.mocked(heroAreAllDead).mockReturnValue(false);
      vi.mocked(heroRecoveringInTown).mockReturnValue(false);
      vi.mocked(locationGetCurrent).mockReturnValue(undefined);

      gameloopAutoTravel();

      expect(locationGetCurrent).toHaveBeenCalledTimes(1);
      expect(locationGetInOrderOfCloseness).not.toHaveBeenCalled();
      expect(
        locationGetClosestUnclaimedClaimableLocation,
      ).not.toHaveBeenCalled();
      expect(locationGetAllMatchingPreferences).not.toHaveBeenCalled();
      expect(globalStatusText.set).not.toHaveBeenCalled();
      expect(travelToNode).not.toHaveBeenCalled();
    });
  });

  describe('no unclaimed nodes available', () => {
    it('should set idle status when no unclaimed nodes exist', () => {
      const currentNode = createMockLocation(
        'current',
        'Current Location',
        0,
        0,
      );
      const nearbyNodes = [
        createMockLocation('nearby1', 'Nearby 1', 10, 10, true), // claimed
        createMockLocation('nearby2', 'Nearby 2', 20, 20, true), // claimed
      ];

      vi.mocked(isExploring).mockReturnValue(false);
      vi.mocked(isTraveling).mockReturnValue(false);
      vi.mocked(heroAreAllDead).mockReturnValue(false);
      vi.mocked(heroRecoveringInTown).mockReturnValue(false);
      vi.mocked(locationGetCurrent).mockReturnValue(currentNode);
      vi.mocked(locationGetInOrderOfCloseness).mockReturnValue(nearbyNodes);
      vi.mocked(locationGetClosestUnclaimedClaimableLocation).mockReturnValue(
        undefined!,
      );

      gameloopAutoTravel();

      expect(locationGetCurrent).toHaveBeenCalledTimes(1);
      expect(locationGetInOrderOfCloseness).toHaveBeenCalledWith(currentNode);
      expect(locationGetClosestUnclaimedClaimableLocation).toHaveBeenCalledWith(
        currentNode,
        nearbyNodes,
      );
      expect(locationGetAllMatchingPreferences).not.toHaveBeenCalled();
      expect(globalStatusText.set).toHaveBeenCalledWith(
        'No unclaimed nodes available; idle.',
      );
      expect(travelToNode).not.toHaveBeenCalled();
    });

    it('should handle when locationGetInOrderOfCloseness returns empty array', () => {
      const currentNode = createMockLocation(
        'current',
        'Current Location',
        0,
        0,
      );

      vi.mocked(isExploring).mockReturnValue(false);
      vi.mocked(isTraveling).mockReturnValue(false);
      vi.mocked(heroAreAllDead).mockReturnValue(false);
      vi.mocked(heroRecoveringInTown).mockReturnValue(false);
      vi.mocked(locationGetCurrent).mockReturnValue(currentNode);
      vi.mocked(locationGetInOrderOfCloseness).mockReturnValue([]);
      vi.mocked(locationGetClosestUnclaimedClaimableLocation).mockReturnValue(
        undefined!,
      );

      gameloopAutoTravel();

      expect(locationGetInOrderOfCloseness).toHaveBeenCalledWith(currentNode);
      expect(locationGetClosestUnclaimedClaimableLocation).toHaveBeenCalledWith(
        currentNode,
        [],
      );
      expect(globalStatusText.set).toHaveBeenCalledWith(
        'No unclaimed nodes available; idle.',
      );
    });
  });

  describe('risk tolerance scenarios', () => {
    it('should set adjust risk tolerance status when no nodes match preferences', () => {
      const currentNode = createMockLocation(
        'current',
        'Current Location',
        0,
        0,
      );
      const nearbyNodes = [
        createMockLocation('nearby1', 'Nearby 1', 10, 10, false), // unclaimed but too risky
        createMockLocation('nearby2', 'Nearby 2', 20, 20, false), // unclaimed but too risky
      ];
      const unclaimedNode = createMockLocation(
        'unclaimed',
        'Unclaimed Node',
        30,
        30,
        false,
      );

      vi.mocked(isExploring).mockReturnValue(false);
      vi.mocked(isTraveling).mockReturnValue(false);
      vi.mocked(heroAreAllDead).mockReturnValue(false);
      vi.mocked(heroRecoveringInTown).mockReturnValue(false);
      vi.mocked(locationGetCurrent).mockReturnValue(currentNode);
      vi.mocked(locationGetInOrderOfCloseness).mockReturnValue(nearbyNodes);
      vi.mocked(locationGetClosestUnclaimedClaimableLocation)
        .mockReturnValueOnce(unclaimedNode) // First call for anyUnclaimedNode
        .mockReturnValueOnce(undefined!); // Second call for nextNode
      vi.mocked(locationGetAllMatchingPreferences).mockReturnValue([]); // No nodes match preferences

      gameloopAutoTravel();

      expect(locationGetCurrent).toHaveBeenCalledTimes(1);
      expect(locationGetInOrderOfCloseness).toHaveBeenCalledWith(currentNode);
      expect(
        locationGetClosestUnclaimedClaimableLocation,
      ).toHaveBeenCalledTimes(2);
      expect(
        locationGetClosestUnclaimedClaimableLocation,
      ).toHaveBeenNthCalledWith(1, currentNode, nearbyNodes);
      expect(locationGetAllMatchingPreferences).toHaveBeenCalledWith(
        currentNode,
      );
      expect(
        locationGetClosestUnclaimedClaimableLocation,
      ).toHaveBeenNthCalledWith(2, currentNode, []);
      expect(globalStatusText.set).toHaveBeenCalledWith(
        'Hero party idle; adjust risk tolerance.',
      );
      expect(travelToNode).not.toHaveBeenCalled();
    });

    it('should handle when risk tolerance preferences return nodes but none are suitable', () => {
      const currentNode = createMockLocation(
        'current',
        'Current Location',
        0,
        0,
      );
      const nearbyNodes = [
        createMockLocation('nearby1', 'Nearby 1', 10, 10, false),
        createMockLocation('nearby2', 'Nearby 2', 20, 20, false),
      ];
      const unclaimedNode = createMockLocation(
        'unclaimed',
        'Unclaimed Node',
        30,
        30,
        false,
      );
      const preferredNodes = [
        createMockLocation('preferred1', 'Preferred 1', 40, 40, true), // claimed
        createMockLocation('preferred2', 'Preferred 2', 50, 50, true), // claimed
      ];

      vi.mocked(isExploring).mockReturnValue(false);
      vi.mocked(isTraveling).mockReturnValue(false);
      vi.mocked(heroAreAllDead).mockReturnValue(false);
      vi.mocked(heroRecoveringInTown).mockReturnValue(false);
      vi.mocked(locationGetCurrent).mockReturnValue(currentNode);
      vi.mocked(locationGetInOrderOfCloseness).mockReturnValue(nearbyNodes);
      vi.mocked(locationGetClosestUnclaimedClaimableLocation)
        .mockReturnValueOnce(unclaimedNode) // First call for anyUnclaimedNode
        .mockReturnValueOnce(undefined!); // Second call for nextNode (no unclaimed in preferred)
      vi.mocked(locationGetAllMatchingPreferences).mockReturnValue(
        preferredNodes,
      );

      gameloopAutoTravel();

      expect(locationGetAllMatchingPreferences).toHaveBeenCalledWith(
        currentNode,
      );
      expect(
        locationGetClosestUnclaimedClaimableLocation,
      ).toHaveBeenNthCalledWith(2, currentNode, preferredNodes);
      expect(globalStatusText.set).toHaveBeenCalledWith(
        'Hero party idle; adjust risk tolerance.',
      );
      expect(travelToNode).not.toHaveBeenCalled();
    });
  });

  describe('successful travel scenarios', () => {
    it('should travel to node when conditions are met', () => {
      const currentNode = createMockLocation(
        'current',
        'Current Location',
        0,
        0,
      );
      const nearbyNodes = [
        createMockLocation('nearby1', 'Nearby 1', 10, 10, false),
        createMockLocation('nearby2', 'Nearby 2', 20, 20, false),
      ];
      const unclaimedNode = createMockLocation(
        'unclaimed',
        'Unclaimed Node',
        30,
        30,
        false,
      );
      const preferredNodes = [
        createMockLocation('preferred1', 'Preferred 1', 40, 40, false),
        createMockLocation('preferred2', 'Preferred 2', 50, 50, true),
      ];
      const targetNode = createMockLocation(
        'target',
        'Target Node',
        60,
        60,
        false,
      );

      vi.mocked(isExploring).mockReturnValue(false);
      vi.mocked(isTraveling).mockReturnValue(false);
      vi.mocked(heroAreAllDead).mockReturnValue(false);
      vi.mocked(heroRecoveringInTown).mockReturnValue(false);
      vi.mocked(locationGetCurrent).mockReturnValue(currentNode);
      vi.mocked(locationGetInOrderOfCloseness).mockReturnValue(nearbyNodes);
      vi.mocked(locationGetClosestUnclaimedClaimableLocation)
        .mockReturnValueOnce(unclaimedNode) // First call for anyUnclaimedNode
        .mockReturnValueOnce(targetNode); // Second call for nextNode
      vi.mocked(locationGetAllMatchingPreferences).mockReturnValue(
        preferredNodes,
      );

      gameloopAutoTravel();

      expect(locationGetCurrent).toHaveBeenCalledTimes(1);
      expect(locationGetInOrderOfCloseness).toHaveBeenCalledWith(currentNode);
      expect(
        locationGetClosestUnclaimedClaimableLocation,
      ).toHaveBeenCalledTimes(2);
      expect(locationGetAllMatchingPreferences).toHaveBeenCalledWith(
        currentNode,
      );
      expect(globalStatusText.set).toHaveBeenCalledWith('');
      expect(travelToNode).toHaveBeenCalledWith(targetNode);
    });

    it('should clear status text and travel when finding suitable node', () => {
      const currentNode = createMockLocation(
        'current',
        'Current Location',
        100,
        100,
      );
      const nearbyNodes = [
        createMockLocation('cave1', 'Cave 1', 110, 110, false, 2, 'cave'),
        createMockLocation(
          'dungeon1',
          'Dungeon 1',
          120,
          120,
          false,
          5,
          'dungeon',
        ),
      ];
      const targetNode = createMockLocation(
        'target',
        'Target Cave',
        150,
        150,
        false,
        3,
        'cave',
      );

      vi.mocked(isExploring).mockReturnValue(false);
      vi.mocked(isTraveling).mockReturnValue(false);
      vi.mocked(heroAreAllDead).mockReturnValue(false);
      vi.mocked(heroRecoveringInTown).mockReturnValue(false);
      vi.mocked(locationGetCurrent).mockReturnValue(currentNode);
      vi.mocked(locationGetInOrderOfCloseness).mockReturnValue(nearbyNodes);
      vi.mocked(locationGetClosestUnclaimedClaimableLocation)
        .mockReturnValueOnce(targetNode) // anyUnclaimedNode
        .mockReturnValueOnce(targetNode); // nextNode
      vi.mocked(locationGetAllMatchingPreferences).mockReturnValue(nearbyNodes);

      gameloopAutoTravel();

      expect(globalStatusText.set).toHaveBeenCalledWith('');
      expect(travelToNode).toHaveBeenCalledWith(targetNode);
    });
  });

  describe('function call order', () => {
    it('should call functions in correct order for successful travel', () => {
      const currentNode = createMockLocation(
        'current',
        'Current Location',
        0,
        0,
      );
      const nearbyNodes = [
        createMockLocation('nearby', 'Nearby', 10, 10, false),
      ];
      const targetNode = createMockLocation('target', 'Target', 20, 20, false);

      vi.mocked(isExploring).mockReturnValue(false);
      vi.mocked(isTraveling).mockReturnValue(false);
      vi.mocked(heroAreAllDead).mockReturnValue(false);
      vi.mocked(heroRecoveringInTown).mockReturnValue(false);
      vi.mocked(locationGetCurrent).mockReturnValue(currentNode);
      vi.mocked(locationGetInOrderOfCloseness).mockReturnValue(nearbyNodes);
      vi.mocked(locationGetClosestUnclaimedClaimableLocation)
        .mockReturnValueOnce(targetNode)
        .mockReturnValueOnce(targetNode);
      vi.mocked(locationGetAllMatchingPreferences).mockReturnValue(nearbyNodes);

      gameloopAutoTravel();

      // Verify the call order
      const calls = [
        vi.mocked(isExploring).mock.invocationCallOrder[0],
        vi.mocked(isTraveling).mock.invocationCallOrder[0],
        vi.mocked(heroAreAllDead).mock.invocationCallOrder[0],
        vi.mocked(heroRecoveringInTown).mock.invocationCallOrder[0],
        vi.mocked(locationGetCurrent).mock.invocationCallOrder[0],
        vi.mocked(locationGetInOrderOfCloseness).mock.invocationCallOrder[0],
        vi.mocked(locationGetClosestUnclaimedClaimableLocation).mock
          .invocationCallOrder[0],
        vi.mocked(locationGetAllMatchingPreferences).mock
          .invocationCallOrder[0],
        vi.mocked(locationGetClosestUnclaimedClaimableLocation).mock
          .invocationCallOrder[1],
        vi.mocked(globalStatusText.set).mock.invocationCallOrder[0],
        vi.mocked(travelToNode).mock.invocationCallOrder[0],
      ];

      // Verify calls are in ascending order
      for (let i = 1; i < calls.length; i++) {
        expect(calls[i]).toBeGreaterThan(calls[i - 1]);
      }
    });

    it('should call functions in correct order for early return scenarios', () => {
      vi.mocked(isExploring).mockReturnValue(true);

      gameloopAutoTravel();

      expect(isExploring).toHaveBeenCalledTimes(1);
      // Ensure no other functions are called
      expect(isTraveling).not.toHaveBeenCalled();
      expect(heroAreAllDead).not.toHaveBeenCalled();
      expect(heroRecoveringInTown).not.toHaveBeenCalled();
      expect(locationGetCurrent).not.toHaveBeenCalled();
    });
  });

  describe('return value', () => {
    it('should return void (undefined) in all scenarios', () => {
      // Test early return scenario
      vi.mocked(isExploring).mockReturnValue(true);
      let result = gameloopAutoTravel();
      expect(result).toBeUndefined();

      // Test successful travel scenario
      vi.clearAllMocks();
      const currentNode = createMockLocation('current', 'Current', 0, 0);
      const targetNode = createMockLocation('target', 'Target', 10, 10, false);

      vi.mocked(isExploring).mockReturnValue(false);
      vi.mocked(isTraveling).mockReturnValue(false);
      vi.mocked(heroAreAllDead).mockReturnValue(false);
      vi.mocked(heroRecoveringInTown).mockReturnValue(false);
      vi.mocked(locationGetCurrent).mockReturnValue(currentNode);
      vi.mocked(locationGetInOrderOfCloseness).mockReturnValue([targetNode]);
      vi.mocked(locationGetClosestUnclaimedClaimableLocation)
        .mockReturnValueOnce(targetNode)
        .mockReturnValueOnce(targetNode);
      vi.mocked(locationGetAllMatchingPreferences).mockReturnValue([
        targetNode,
      ]);

      result = gameloopAutoTravel();
      expect(result).toBeUndefined();

      // Test no nodes available scenario
      vi.clearAllMocks();
      vi.mocked(isExploring).mockReturnValue(false);
      vi.mocked(isTraveling).mockReturnValue(false);
      vi.mocked(heroAreAllDead).mockReturnValue(false);
      vi.mocked(heroRecoveringInTown).mockReturnValue(false);
      vi.mocked(locationGetCurrent).mockReturnValue(currentNode);
      vi.mocked(locationGetInOrderOfCloseness).mockReturnValue([]);
      vi.mocked(locationGetClosestUnclaimedClaimableLocation).mockReturnValue(
        undefined!,
      );

      result = gameloopAutoTravel();
      expect(result).toBeUndefined();
    });
  });

  describe('error handling and resilience', () => {
    it('should propagate errors from isExploring', () => {
      const error = new Error('IsExploring failed');
      vi.mocked(isExploring).mockImplementation(() => {
        throw error;
      });

      expect(() => gameloopAutoTravel()).toThrow(error);
      expect(isExploring).toHaveBeenCalledTimes(1);
    });

    it('should propagate errors from isTraveling', () => {
      const error = new Error('IsTraveling failed');
      vi.mocked(isExploring).mockReturnValue(false);
      vi.mocked(isTraveling).mockImplementation(() => {
        throw error;
      });

      expect(() => gameloopAutoTravel()).toThrow(error);
      expect(isTraveling).toHaveBeenCalledTimes(1);
    });

    it('should propagate errors from heroAreAllDead', () => {
      const error = new Error('HeroAreAllDead failed');
      vi.mocked(isExploring).mockReturnValue(false);
      vi.mocked(isTraveling).mockReturnValue(false);
      vi.mocked(heroAreAllDead).mockImplementation(() => {
        throw error;
      });

      expect(() => gameloopAutoTravel()).toThrow(error);
      expect(heroAreAllDead).toHaveBeenCalledTimes(1);
    });

    it('should propagate errors from heroRecoveringInTown', () => {
      const error = new Error('HeroRecoveringInTown failed');
      vi.mocked(isExploring).mockReturnValue(false);
      vi.mocked(isTraveling).mockReturnValue(false);
      vi.mocked(heroAreAllDead).mockReturnValue(false);
      vi.mocked(heroRecoveringInTown).mockImplementation(() => {
        throw error;
      });

      expect(() => gameloopAutoTravel()).toThrow(error);
      expect(heroRecoveringInTown).toHaveBeenCalledTimes(1);
    });

    it('should propagate errors from heroRecoveryPercent', () => {
      const error = new Error('HeroRecoveryPercent failed');
      vi.mocked(isExploring).mockReturnValue(false);
      vi.mocked(isTraveling).mockReturnValue(false);
      vi.mocked(heroAreAllDead).mockReturnValue(false);
      vi.mocked(heroRecoveringInTown).mockReturnValue(true);
      vi.mocked(heroRecoveryPercent).mockImplementation(() => {
        throw error;
      });

      expect(() => gameloopAutoTravel()).toThrow(error);
      expect(heroRecoveryPercent).toHaveBeenCalledTimes(1);
    });

    it('should propagate errors from locationGetCurrent', () => {
      const error = new Error('LocationGetCurrent failed');
      vi.mocked(isExploring).mockReturnValue(false);
      vi.mocked(isTraveling).mockReturnValue(false);
      vi.mocked(heroAreAllDead).mockReturnValue(false);
      vi.mocked(heroRecoveringInTown).mockReturnValue(false);
      vi.mocked(locationGetCurrent).mockImplementation(() => {
        throw error;
      });

      expect(() => gameloopAutoTravel()).toThrow(error);
      expect(locationGetCurrent).toHaveBeenCalledTimes(1);
    });

    it('should propagate errors from locationGetInOrderOfCloseness', () => {
      const error = new Error('LocationGetInOrderOfCloseness failed');
      const currentNode = createMockLocation('current', 'Current', 0, 0);

      vi.mocked(isExploring).mockReturnValue(false);
      vi.mocked(isTraveling).mockReturnValue(false);
      vi.mocked(heroAreAllDead).mockReturnValue(false);
      vi.mocked(heroRecoveringInTown).mockReturnValue(false);
      vi.mocked(locationGetCurrent).mockReturnValue(currentNode);
      vi.mocked(locationGetInOrderOfCloseness).mockImplementation(() => {
        throw error;
      });

      expect(() => gameloopAutoTravel()).toThrow(error);
      expect(locationGetInOrderOfCloseness).toHaveBeenCalledWith(currentNode);
    });

    it('should propagate errors from locationGetClosestUnclaimedClaimableLocation', () => {
      const error = new Error(
        'LocationGetClosestUnclaimedClaimableLocation failed',
      );
      const currentNode = createMockLocation('current', 'Current', 0, 0);
      const nearbyNodes = [
        createMockLocation('nearby', 'Nearby', 10, 10, false),
      ];

      vi.mocked(isExploring).mockReturnValue(false);
      vi.mocked(isTraveling).mockReturnValue(false);
      vi.mocked(heroAreAllDead).mockReturnValue(false);
      vi.mocked(heroRecoveringInTown).mockReturnValue(false);
      vi.mocked(locationGetCurrent).mockReturnValue(currentNode);
      vi.mocked(locationGetInOrderOfCloseness).mockReturnValue(nearbyNodes);
      vi.mocked(
        locationGetClosestUnclaimedClaimableLocation,
      ).mockImplementation(() => {
        throw error;
      });

      expect(() => gameloopAutoTravel()).toThrow(error);
      expect(locationGetClosestUnclaimedClaimableLocation).toHaveBeenCalledWith(
        currentNode,
        nearbyNodes,
      );
    });

    it('should propagate errors from locationGetAllMatchingPreferences', () => {
      const error = new Error('LocationGetAllMatchingPreferences failed');
      const currentNode = createMockLocation('current', 'Current', 0, 0);
      const nearbyNodes = [
        createMockLocation('nearby', 'Nearby', 10, 10, false),
      ];
      const unclaimedNode = createMockLocation(
        'unclaimed',
        'Unclaimed',
        20,
        20,
        false,
      );

      vi.mocked(isExploring).mockReturnValue(false);
      vi.mocked(isTraveling).mockReturnValue(false);
      vi.mocked(heroAreAllDead).mockReturnValue(false);
      vi.mocked(heroRecoveringInTown).mockReturnValue(false);
      vi.mocked(locationGetCurrent).mockReturnValue(currentNode);
      vi.mocked(locationGetInOrderOfCloseness).mockReturnValue(nearbyNodes);
      vi.mocked(
        locationGetClosestUnclaimedClaimableLocation,
      ).mockReturnValueOnce(unclaimedNode);
      vi.mocked(locationGetAllMatchingPreferences).mockImplementation(() => {
        throw error;
      });

      expect(() => gameloopAutoTravel()).toThrow(error);
      expect(locationGetAllMatchingPreferences).toHaveBeenCalledWith(
        currentNode,
      );
    });
  });

  describe('integration scenarios', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should handle complete workflow from start to travel initiation', () => {
      const currentNode = createMockLocation(
        'home',
        'Home Base',
        0,
        0,
        true,
        1,
        'town',
      );
      const nearbyNodes = [
        createMockLocation('cave1', 'Goblin Cave', 10, 15, false, 2, 'cave'),
        createMockLocation('cave2', 'Spider Den', 20, 25, false, 3, 'cave'),
        createMockLocation(
          'dungeon1',
          'Dark Dungeon',
          30,
          35,
          false,
          5,
          'dungeon',
        ),
        createMockLocation('claimed1', 'Claimed Cave', 5, 10, true, 1, 'cave'),
      ];
      const preferredNodes = [
        nearbyNodes[0], // cave1 - should be preferred
        nearbyNodes[1], // cave2 - also preferred
      ];
      const targetNode = nearbyNodes[0]; // cave1 is closest unclaimed preferred

      vi.mocked(isExploring).mockReturnValue(false);
      vi.mocked(isTraveling).mockReturnValue(false);
      vi.mocked(heroAreAllDead).mockReturnValue(false);
      vi.mocked(heroRecoveringInTown).mockReturnValue(false);
      vi.mocked(locationGetCurrent).mockReturnValue(currentNode);
      vi.mocked(locationGetInOrderOfCloseness).mockReturnValue(nearbyNodes);
      vi.mocked(locationGetClosestUnclaimedClaimableLocation)
        .mockReturnValueOnce(nearbyNodes[0]) // anyUnclaimedNode - first unclaimed found
        .mockReturnValueOnce(targetNode); // nextNode - first unclaimed from preferred
      vi.mocked(locationGetAllMatchingPreferences).mockReturnValue(
        preferredNodes,
      );

      gameloopAutoTravel();

      expect(isExploring).toHaveBeenCalledTimes(1);
      expect(isTraveling).toHaveBeenCalledTimes(1);
      expect(heroAreAllDead).toHaveBeenCalledTimes(1);
      expect(heroRecoveringInTown).toHaveBeenCalledTimes(1);
      expect(locationGetCurrent).toHaveBeenCalledTimes(1);
      expect(locationGetInOrderOfCloseness).toHaveBeenCalledWith(currentNode);
      expect(
        locationGetClosestUnclaimedClaimableLocation,
      ).toHaveBeenCalledTimes(2);
      expect(locationGetAllMatchingPreferences).toHaveBeenCalledWith(
        currentNode,
      );
      expect(globalStatusText.set).toHaveBeenCalledWith('');
      expect(travelToNode).toHaveBeenCalledWith(targetNode);
    });

    it('should handle multiple node types and preferences correctly', () => {
      const currentNode = createMockLocation(
        'current',
        'Current Location',
        50,
        50,
        false,
        3,
        'village',
      );
      const mixedNodes = [
        createMockLocation('town1', 'Friendly Town', 60, 60, false, 1, 'town'),
        createMockLocation('cave1', 'Dark Cave', 70, 70, false, 4, 'cave'),
        createMockLocation(
          'dungeon1',
          'Ancient Dungeon',
          80,
          80,
          false,
          8,
          'dungeon',
        ),
        createMockLocation(
          'castle1',
          'Ruined Castle',
          90,
          90,
          false,
          10,
          'castle',
        ),
        createMockLocation(
          'village1',
          'Peaceful Village',
          65,
          65,
          true,
          2,
          'village',
        ), // claimed
      ];
      const riskToleranceFiltered = [mixedNodes[0], mixedNodes[1]]; // only town and cave pass risk filter
      const chosenTarget = mixedNodes[0]; // town is chosen

      vi.mocked(isExploring).mockReturnValue(false);
      vi.mocked(isTraveling).mockReturnValue(false);
      vi.mocked(heroAreAllDead).mockReturnValue(false);
      vi.mocked(heroRecoveringInTown).mockReturnValue(false);
      vi.mocked(locationGetCurrent).mockReturnValue(currentNode);
      vi.mocked(locationGetInOrderOfCloseness).mockReturnValue(mixedNodes);
      vi.mocked(locationGetClosestUnclaimedClaimableLocation)
        .mockReturnValueOnce(mixedNodes[0]) // anyUnclaimedNode
        .mockReturnValueOnce(chosenTarget); // nextNode from risk tolerance filtered
      vi.mocked(locationGetAllMatchingPreferences).mockReturnValue(
        riskToleranceFiltered,
      );

      gameloopAutoTravel();

      expect(locationGetInOrderOfCloseness).toHaveBeenCalledWith(currentNode);
      expect(
        locationGetClosestUnclaimedClaimableLocation,
      ).toHaveBeenNthCalledWith(1, currentNode, mixedNodes);
      expect(locationGetAllMatchingPreferences).toHaveBeenCalledWith(
        currentNode,
      );
      expect(
        locationGetClosestUnclaimedClaimableLocation,
      ).toHaveBeenNthCalledWith(2, currentNode, riskToleranceFiltered);
      expect(travelToNode).toHaveBeenCalledWith(chosenTarget);
    });

    it('should handle edge case with single node scenario', () => {
      const currentNode = createMockLocation(
        'only',
        'Only Location',
        0,
        0,
        false,
        1,
        'town',
      );
      const singleNodeArray = [
        createMockLocation(
          'target',
          'Single Target',
          100,
          100,
          false,
          2,
          'cave',
        ),
      ];

      vi.mocked(isExploring).mockReturnValue(false);
      vi.mocked(isTraveling).mockReturnValue(false);
      vi.mocked(heroAreAllDead).mockReturnValue(false);
      vi.mocked(heroRecoveringInTown).mockReturnValue(false);
      vi.mocked(locationGetCurrent).mockReturnValue(currentNode);
      vi.mocked(locationGetInOrderOfCloseness).mockReturnValue(singleNodeArray);
      vi.mocked(locationGetClosestUnclaimedClaimableLocation)
        .mockReturnValueOnce(singleNodeArray[0])
        .mockReturnValueOnce(singleNodeArray[0]);
      vi.mocked(locationGetAllMatchingPreferences).mockReturnValue(
        singleNodeArray,
      );

      gameloopAutoTravel();

      expect(travelToNode).toHaveBeenCalledWith(singleNodeArray[0]);
      expect(globalStatusText.set).toHaveBeenCalledWith('');
    });
  });
});
