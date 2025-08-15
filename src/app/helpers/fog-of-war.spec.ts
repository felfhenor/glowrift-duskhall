import type { LocationType, WorldLocation } from '@interfaces';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Create a simple defaultLocation function for tests
function defaultLocation(x: number, y: number): WorldLocation {
  return {
    id: `test-${x}-${y}`,
    name: `Test Location ${x},${y}`,
    x,
    y,
    elements: [],
    currentlyClaimed: false,
    claimCount: 0,
    encounterLevel: 1,
    unclaimTime: 0,
    guardianIds: [],
    claimLootIds: [],
    traitIds: [],
    locationUpgrades: {},
  };
}

// Mock the locationGetAll function to return our test nodes
let mockClaimedNodes: WorldLocation[] = [];

vi.mock('@helpers/world-location', () => ({
  locationGetAll: () => mockClaimedNodes,
}));

// Import the functions under test after mocking
import {
  fogGetRevealedNodes,
  fogInvalidateCache,
  fogIsPositionRevealed,
  fogRevealAreaAroundLocation,
} from '@helpers/fog-of-war';

describe('Fog of War (Claimed-based)', () => {
  beforeEach(() => {
    // Reset mock nodes
    mockClaimedNodes = [];
    // Invalidate fog cache to ensure tests start with clean state
    fogInvalidateCache();
  });

  describe('Position Revelation', () => {
    it('should initially have no revealed positions when no nodes are claimed', () => {
      expect(fogIsPositionRevealed(0, 0)).toBe(false);
      expect(fogIsPositionRevealed(1, 1)).toBe(false);
      expect(fogIsPositionRevealed(5, 5)).toBe(false);
    });

    it('should reveal positions around a claimed cave (3x3 area)', () => {
      const cave = defaultLocation(5, 5);
      cave.nodeType = 'cave' as LocationType;
      cave.currentlyClaimed = true;
      mockClaimedNodes = [cave];

      // Check center and surrounding nodes (3x3 area, radius 1)
      expect(fogIsPositionRevealed(5, 5)).toBe(true); // center
      expect(fogIsPositionRevealed(4, 4)).toBe(true); // top-left
      expect(fogIsPositionRevealed(6, 6)).toBe(true); // bottom-right
      expect(fogIsPositionRevealed(4, 6)).toBe(true); // bottom-left
      expect(fogIsPositionRevealed(6, 4)).toBe(true); // top-right

      // Check that nodes outside the area are not revealed
      expect(fogIsPositionRevealed(3, 3)).toBe(false); // outside area
      expect(fogIsPositionRevealed(7, 7)).toBe(false); // outside area
    });

    it('should reveal positions around a claimed dungeon (5x5 area)', () => {
      const dungeon = defaultLocation(10, 10);
      dungeon.nodeType = 'dungeon' as LocationType;
      dungeon.currentlyClaimed = true;
      mockClaimedNodes = [dungeon];

      // Check center and corners of 5x5 area (radius 2)
      expect(fogIsPositionRevealed(10, 10)).toBe(true); // center
      expect(fogIsPositionRevealed(8, 8)).toBe(true); // top-left corner
      expect(fogIsPositionRevealed(12, 12)).toBe(true); // bottom-right corner
      expect(fogIsPositionRevealed(8, 12)).toBe(true); // bottom-left corner
      expect(fogIsPositionRevealed(12, 8)).toBe(true); // top-right corner

      // Check that nodes outside the area are not revealed
      expect(fogIsPositionRevealed(7, 7)).toBe(false); // outside area
      expect(fogIsPositionRevealed(13, 13)).toBe(false); // outside area
    });

    it('should reveal positions around a claimed town (11x11 area)', () => {
      const town = defaultLocation(15, 15);
      town.nodeType = 'town' as LocationType;
      town.currentlyClaimed = true;
      mockClaimedNodes = [town];

      // Check center and corners of 11x11 area (radius 5)
      expect(fogIsPositionRevealed(15, 15)).toBe(true); // center
      expect(fogIsPositionRevealed(10, 10)).toBe(true); // top-left corner
      expect(fogIsPositionRevealed(20, 20)).toBe(true); // bottom-right corner
      expect(fogIsPositionRevealed(10, 20)).toBe(true); // bottom-left corner
      expect(fogIsPositionRevealed(20, 10)).toBe(true); // top-right corner

      // Check that nodes outside the area are not revealed
      expect(fogIsPositionRevealed(9, 9)).toBe(false); // outside area
      expect(fogIsPositionRevealed(21, 21)).toBe(false); // outside area
    });

    it('should not reveal positions around unclaimed nodes', () => {
      const cave = defaultLocation(5, 5);
      cave.nodeType = 'cave' as LocationType;
      cave.currentlyClaimed = false; // not claimed
      mockClaimedNodes = [cave]; // still in the list but not claimed

      expect(fogIsPositionRevealed(5, 5)).toBe(false);
      expect(fogIsPositionRevealed(4, 4)).toBe(false);
      expect(fogIsPositionRevealed(6, 6)).toBe(false);
    });

    it('should not reveal positions around nodes without nodeType', () => {
      const location = defaultLocation(20, 20);
      location.nodeType = undefined;
      location.currentlyClaimed = true;
      mockClaimedNodes = [location];

      expect(fogIsPositionRevealed(20, 20)).toBe(false);
      expect(fogIsPositionRevealed(19, 19)).toBe(false);
      expect(fogIsPositionRevealed(21, 21)).toBe(false);
    });

    it('should reveal overlapping areas from multiple claimed nodes', () => {
      const cave1 = defaultLocation(5, 5);
      cave1.nodeType = 'cave' as LocationType;
      cave1.currentlyClaimed = true;

      const cave2 = defaultLocation(7, 7);
      cave2.nodeType = 'cave' as LocationType;
      cave2.currentlyClaimed = true;

      mockClaimedNodes = [cave1, cave2];

      // Position (6,6) should be revealed by both caves
      expect(fogIsPositionRevealed(6, 6)).toBe(true);

      // Positions only revealed by cave1
      expect(fogIsPositionRevealed(4, 4)).toBe(true);

      // Positions only revealed by cave2
      expect(fogIsPositionRevealed(8, 8)).toBe(true);
    });
  });

  describe('Location Revelation', () => {
    it('should check if a location is revealed based on its position', () => {
      const town = defaultLocation(10, 10);
      town.nodeType = 'town' as LocationType;
      town.currentlyClaimed = true;
      mockClaimedNodes = [town];

      const nearbyLocation = defaultLocation(12, 12);
      const farLocation = defaultLocation(20, 20);

      expect(fogIsPositionRevealed(nearbyLocation.x, nearbyLocation.y)).toBe(
        true,
      ); // within town's radius
      expect(fogIsPositionRevealed(farLocation.x, farLocation.y)).toBe(false); // outside town's radius
    });
  });

  describe('Get Revealed Nodes', () => {
    it('should return all revealed positions as a set', () => {
      const cave = defaultLocation(5, 5);
      cave.nodeType = 'cave' as LocationType;
      cave.currentlyClaimed = true;
      mockClaimedNodes = [cave];

      const revealedNodes = fogGetRevealedNodes();

      // Should include all positions in the 3x3 area around the cave
      expect(revealedNodes.has('5,5')).toBe(true); // center
      expect(revealedNodes.has('4,4')).toBe(true); // corner
      expect(revealedNodes.has('6,6')).toBe(true); // corner
      expect(revealedNodes.has('3,3')).toBe(false); // outside

      // Should have exactly 9 nodes (3x3)
      expect(revealedNodes.size).toBe(9);
    });
  });

  describe('Legacy Function Compatibility', () => {
    it('should safely handle fogRevealAreaAroundLocation as a no-op', () => {
      const cave = defaultLocation(5, 5);
      cave.nodeType = 'cave' as LocationType;

      // This should not throw and should be a no-op
      expect(() => fogRevealAreaAroundLocation(cave)).not.toThrow();

      // Position should not be revealed since the cave is not claimed
      expect(fogIsPositionRevealed(5, 5)).toBe(false);
    });
  });
});
