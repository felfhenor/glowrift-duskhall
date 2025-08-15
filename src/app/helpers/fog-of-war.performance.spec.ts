import { describe, expect, it, beforeEach, vi } from 'vitest';
import type { LocationType, WorldLocation } from '@interfaces';

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

// Mock the locationGetAll function to return test nodes
let mockClaimedNodes: WorldLocation[] = [];

vi.mock('@helpers/world-location', () => ({
  locationGetAll: () => mockClaimedNodes,
}));

// Import the functions under test after mocking
import {
  fogIsPositionRevealed,
  fogInvalidateCache,
} from '@helpers/fog-of-war';

describe('Fog of War Performance Tests', () => {
  beforeEach(() => {
    // Reset mock nodes and cache
    mockClaimedNodes = [];
    fogInvalidateCache();
  });

  it('should efficiently handle many position checks with cached results', () => {
    // Create several claimed nodes
    const town = defaultLocation(0, 0);
    town.nodeType = 'town' as LocationType;
    town.currentlyClaimed = true;

    const village = defaultLocation(10, 10);
    village.nodeType = 'village' as LocationType;
    village.currentlyClaimed = true;

    const cave = defaultLocation(20, 20);
    cave.nodeType = 'cave' as LocationType;
    cave.currentlyClaimed = true;

    mockClaimedNodes = [town, village, cave];

    // Perform many position checks - this should be efficient with caching
    const positionsToCheck = 100;
    const results: boolean[] = [];

    for (let i = 0; i < positionsToCheck; i++) {
      results.push(fogIsPositionRevealed(i % 30, Math.floor(i / 30)));
    }

    // Verify some expected results
    expect(fogIsPositionRevealed(0, 0)).toBe(true); // Town center
    expect(fogIsPositionRevealed(5, 0)).toBe(true); // Within town radius (5)
    expect(fogIsPositionRevealed(10, 10)).toBe(true); // Village center
    expect(fogIsPositionRevealed(13, 10)).toBe(true); // Within village radius (3)
    expect(fogIsPositionRevealed(20, 20)).toBe(true); // Cave center
    expect(fogIsPositionRevealed(21, 20)).toBe(true); // Within cave radius (1)
    
    // Outside all radii
    expect(fogIsPositionRevealed(50, 50)).toBe(false);

    // Verify that we got results for all checks
    expect(results).toHaveLength(positionsToCheck);
  });

  it('should invalidate cache when needed', () => {
    const cave = defaultLocation(5, 5);
    cave.nodeType = 'cave' as LocationType;
    cave.currentlyClaimed = true;
    mockClaimedNodes = [cave];

    // First check builds cache
    expect(fogIsPositionRevealed(5, 5)).toBe(true);

    // Remove the claimed node
    mockClaimedNodes = [];

    // Without invalidation, cache would still show position as revealed
    // With invalidation, it should show as not revealed
    fogInvalidateCache();
    expect(fogIsPositionRevealed(5, 5)).toBe(false);
  });
});
