import type { GuardianContent, WorldLocation } from '@interfaces';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the dependencies
vi.mock('@helpers/content', () => ({
  getEntriesByType: vi.fn(),
  getEntry: vi.fn(),
}));

vi.mock('@helpers/state-game', () => ({
  gamestate: vi.fn(() => ({ gameId: 'test-game' })),
}));

vi.mock('@helpers/rng', () => ({
  rngSeeded: vi.fn(() => Math.random),
  rngChoiceIdentifiable: vi.fn(() => 'guardian-1'),
}));

vi.mock('@helpers/guardian', () => ({
  guardianCreateForLocation: vi.fn(() => ({ id: 'guardian-1' })),
}));

vi.mock('@helpers/trait-location-worldgen', () => ({
  locationTraitGuardianCountModifier: vi.fn(() => 0),
  locationTraitEncounterLevelModifier: vi.fn(() => 0),
}));

// Import the functions to test
import { distanceBetweenNodes } from '@helpers/math';
import { worldgenGuardiansForLocation } from '@helpers/worldgen';

describe('Distance-based Guardian Scaling', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    // Mock content for guardian data
    const { getEntriesByType, getEntry } = await import('@helpers/content');
    vi.mocked(getEntriesByType).mockReturnValue([
      { id: 'guardian-1', name: 'Test Guardian' },
    ]);
    vi.mocked(getEntry).mockReturnValue({
      id: 'guardian-1',
      name: 'Test Guardian',
      __type: 'guardian',
      sprite: 'test',
      frames: 1,
      minLevel: 1,
      statScaling: { Force: 1, Health: 1, Speed: 1, Aura: 1 },
      skillIds: [],
      resistance: {},
      affinity: {},
      talents: [],
      targettingType: 'Random',
      combatStats: {
        hp: 100,
        block: 0,
        accuracy: 100,
        crit: 0,
        critMultiplier: 1,
      },
    } as unknown as GuardianContent);
  });

  it('should add more guardians to locations further from world center', () => {
    const worldCenter = { x: 10, y: 10 };
    const maxDistance = distanceBetweenNodes({ x: 10, y: 0 }, worldCenter); // ~10 units

    // Create locations at different distances
    const nearLocation: WorldLocation = {
      id: 'near-cave',
      name: 'Near Cave',
      x: 11, // distance ~1 from center (10% of max distance)
      y: 10,
      nodeType: 'cave',
      encounterLevel: 5,
      elements: [],
      currentlyClaimed: false,
      claimCount: 0,
      unclaimTime: 0,
      guardianIds: [],
      claimLootIds: [],
      traitIds: [],
      locationUpgrades: {},
    };

    const farLocation: WorldLocation = {
      id: 'far-cave',
      name: 'Far Cave',
      x: 10, // distance 10 from center (100% of max distance)
      y: 0,
      nodeType: 'cave',
      encounterLevel: 5,
      elements: [],
      currentlyClaimed: false,
      claimCount: 0,
      unclaimTime: 0,
      guardianIds: [],
      claimLootIds: [],
      traitIds: [],
      locationUpgrades: {},
    };

    // Test that far locations have more guardians than near locations
    const nearGuardians = worldgenGuardiansForLocation(
      nearLocation,
      worldCenter,
      maxDistance,
    );
    const farGuardians = worldgenGuardiansForLocation(
      farLocation,
      worldCenter,
      maxDistance,
    );

    // Near location should have base count (1) + small distance bonus (~0-1)
    expect(nearGuardians.length).toBeGreaterThanOrEqual(1);
    expect(nearGuardians.length).toBeLessThanOrEqual(2);

    // Far location should have base count (1) + distance bonus (~5)
    expect(farGuardians.length).toBeGreaterThanOrEqual(5);
    expect(farGuardians.length).toBeLessThanOrEqual(7);

    // Far location should have significantly more guardians than near location
    expect(farGuardians.length).toBeGreaterThan(nearGuardians.length);
  });

  it('should work correctly without world center parameters (backward compatibility)', () => {
    const location: WorldLocation = {
      id: 'test-cave',
      name: 'Test Cave',
      x: 5,
      y: 5,
      nodeType: 'cave',
      encounterLevel: 5,
      elements: [],
      currentlyClaimed: false,
      claimCount: 0,
      unclaimTime: 0,
      guardianIds: [],
      claimLootIds: [],
      traitIds: [],
      locationUpgrades: {},
    };

    // Should work without distance parameters and return base count
    const guardians = worldgenGuardiansForLocation(location);
    expect(guardians.length).toBe(1); // Base cave count without distance bonus
  });

  it('should scale guardians correctly for different location types', () => {
    const worldCenter = { x: 10, y: 10 };
    const maxDistance = 10;

    const farCastle: WorldLocation = {
      id: 'far-castle',
      name: 'Far Castle',
      x: 10,
      y: 0, // max distance
      nodeType: 'castle',
      encounterLevel: 10,
      elements: [],
      currentlyClaimed: false,
      claimCount: 0,
      unclaimTime: 0,
      guardianIds: [],
      claimLootIds: [],
      traitIds: [],
      locationUpgrades: {},
    };

    const guardians = worldgenGuardiansForLocation(
      farCastle,
      worldCenter,
      maxDistance,
    );

    // Castle base (10) + distance bonus (5) = 15 guardians
    expect(guardians.length).toBe(15);
  });
});
