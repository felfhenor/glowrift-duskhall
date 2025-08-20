import { describe, expect, it, vi, beforeEach } from 'vitest';

import type { LocationType, WorldConfigContent, WorldLocation } from '@interfaces';
import { distanceBetweenNodes } from '@helpers/math';

// Mock the dependencies
vi.mock('@helpers/state-game', () => ({
  gamestate: vi.fn(() => ({ gameId: 'test-game' })),
}));

vi.mock('@helpers/content', () => ({
  getEntriesByType: vi.fn(() => []),
  getEntry: vi.fn(),
}));

vi.mock('@helpers/rng', () => ({
  rngGame: vi.fn(() => Math.random),
  rngSeeded: vi.fn(() => Math.random),
  rngUuid: vi.fn(() => 'test-uuid'),
  rngChoice: vi.fn((arr) => arr[0]),
  rngChoiceIdentifiable: vi.fn(() => 'test-id'),
  rngChoiceRarity: vi.fn((arr) => arr[0]),
  rngNumberRange: vi.fn((min, max) => min),
  rngSucceedsChance: vi.fn(() => true),
}));

describe('World Generation Village/Town Spacing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function distanceBetweenPositions(pos1: { x: number; y: number }, pos2: { x: number; y: number }): number {
    return Math.sqrt((pos1.x - pos2.x) ** 2 + (pos1.y - pos2.y) ** 2);
  }

  function createTestLocation(x: number, y: number, nodeType: LocationType): WorldLocation {
    return {
      id: `test-${nodeType}-${x}-${y}`,
      x,
      y,
      nodeType,
      name: `Test ${nodeType}`,
      currentlyClaimed: false,
      claimCount: 0,
      encounterLevel: 1,
      unclaimTime: 0,
      guardianIds: [],
      claimLootIds: [],
      traitIds: [],
      locationUpgrades: {},
      elements: [],
    };
  }

  it('should check that 7+ spacing is required between villages and towns', () => {
    // Test the distance calculation logic directly
    const village1 = createTestLocation(0, 0, 'village');
    const village2 = createTestLocation(6, 0, 'village'); // 6 units away
    const village3 = createTestLocation(7, 0, 'village'); // 7 units away
    const village4 = createTestLocation(8, 0, 'village'); // 8 units away

    expect(distanceBetweenNodes(village1, village2)).toBe(6);
    expect(distanceBetweenNodes(village1, village3)).toBe(7);
    expect(distanceBetweenNodes(village1, village4)).toBe(8);

    // Test that 6 units is too close (should be < 7)
    expect(distanceBetweenNodes(village1, village2)).toBeLessThan(7);
    
    // Test that 7+ units is acceptable
    expect(distanceBetweenNodes(village1, village3)).toBeGreaterThanOrEqual(7);
    expect(distanceBetweenNodes(village1, village4)).toBeGreaterThanOrEqual(7);
  });

  it('should validate spacing constraint logic for villages and towns', () => {
    const existingNodes: WorldLocation[] = [
      createTestLocation(5, 5, 'town'),   // Central town
      createTestLocation(15, 5, 'village'), // Village to the right
    ];

    // Function to simulate our spacing validation logic
    const isPositionValidForVillageTown = (
      x: number,
      y: number,
      nodeType: LocationType,
    ): boolean => {
      // Only apply spacing constraints to villages and towns
      if (nodeType !== 'village' && nodeType !== 'town') return true;

      // Check distance to all existing villages and towns
      const existingVillagesAndTowns = existingNodes.filter(
        (node) => node.nodeType === 'village' || node.nodeType === 'town'
      );

      for (const existingNode of existingVillagesAndTowns) {
        const distance = distanceBetweenNodes({ x, y }, existingNode);
        if (distance < 7) {
          return false;
        }
      }

      return true;
    };

    // Test positions that should be valid
    expect(isPositionValidForVillageTown(5, 13, 'village')).toBe(true);  // 8 units from town, 12+ from village
    expect(isPositionValidForVillageTown(23, 5, 'town')).toBe(true);     // 8 units from village, 18 from town
    
    // Test positions that should be invalid
    expect(isPositionValidForVillageTown(10, 5, 'village')).toBe(false); // Only 5 units from town
    expect(isPositionValidForVillageTown(9, 5, 'village')).toBe(false);  // Only 4 units from town
    expect(isPositionValidForVillageTown(12, 5, 'town')).toBe(false);    // Only 7 units from town, 3 from village
    
    // Test that non-village/town types are not affected
    expect(isPositionValidForVillageTown(6, 5, 'cave')).toBe(true);      // Cave can be placed anywhere
    expect(isPositionValidForVillageTown(10, 5, 'dungeon')).toBe(true);  // Dungeon can be placed anywhere
    expect(isPositionValidForVillageTown(12, 5, 'castle')).toBe(true);   // Castle can be placed anywhere
  });

  it('should calculate correct distances for diagonal placements', () => {
    const centerTown = createTestLocation(10, 10, 'town');
    
    // Test diagonal distances
    const diagonald5 = createTestLocation(13, 14, 'village'); // ~5 units diagonally
    const diagonal7 = createTestLocation(15, 15, 'village');  // ~7.07 units diagonally
    const diagonal10 = createTestLocation(17, 17, 'village'); // ~9.9 units diagonally

    expect(distanceBetweenNodes(centerTown, diagonald5)).toBeCloseTo(5, 1);
    expect(distanceBetweenNodes(centerTown, diagonal7)).toBeCloseTo(7.07, 1);
    expect(distanceBetweenNodes(centerTown, diagonal10)).toBeCloseTo(9.9, 1);

    // Test that only >= 7 distance is acceptable
    expect(distanceBetweenNodes(centerTown, diagonald5)).toBeLessThan(7);
    expect(distanceBetweenNodes(centerTown, diagonal7)).toBeGreaterThanOrEqual(7);
    expect(distanceBetweenNodes(centerTown, diagonal10)).toBeGreaterThanOrEqual(7);
  });

  it('should handle edge cases with multiple existing nodes', () => {
    const existingNodes: WorldLocation[] = [
      createTestLocation(0, 0, 'town'),
      createTestLocation(10, 0, 'village'),
      createTestLocation(20, 0, 'town'),
      createTestLocation(5, 10, 'village'),
    ];

    const isPositionValidForVillageTown = (
      x: number,
      y: number,
      nodeType: LocationType,
    ): boolean => {
      if (nodeType !== 'village' && nodeType !== 'town') return true;

      const existingVillagesAndTowns = existingNodes.filter(
        (node) => node.nodeType === 'village' || node.nodeType === 'town'
      );

      for (const existingNode of existingVillagesAndTowns) {
        const distance = distanceBetweenNodes({ x, y }, existingNode);
        if (distance < 7) {
          return false;
        }
      }

      return true;
    };

    // Test a position that's far from all existing nodes
    expect(isPositionValidForVillageTown(15, 15, 'village')).toBe(true);
    
    // Test a position that's too close to at least one existing node
    expect(isPositionValidForVillageTown(5, 5, 'village')).toBe(false); // Too close to town at (0,0) and village at (5,10)
    
    // Test a position that needs to be 7+ units from ALL existing villages/towns
    expect(isPositionValidForVillageTown(30, 0, 'village')).toBe(true); // Far from all existing nodes
  });
});