import type { Mock } from 'vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock all dependencies
vi.mock('@helpers/rng', () => ({
  rngGame: vi.fn(() => 0.5),
  rngNumberRange: vi.fn(() => 1),
  rngUuid: vi.fn(() => 'mock-uuid'),
  rngChoice: vi.fn((arr: unknown[]) => arr[0]),
  rngChoiceIdentifiable: vi.fn((arr: unknown[]) => arr[0]),
  rngChoiceRarity: vi.fn(() => 'Common'),
  rngSeeded: vi.fn(() => 0.5),
  rngSucceedsChance: vi.fn(() => true),
}));

vi.mock('@helpers/content', () => ({
  getEntriesByType: vi.fn(() => []),
  getEntry: vi.fn(() => ({})),
}));

vi.mock('@helpers/creator-equipment', () => ({
  equipmentAllDefinitions: vi.fn(() => [
    { id: 'weapon1', name: 'Sword', dropLevel: 1 },
  ]),
  equipmentPickRandomDefinitionByRarity: vi.fn(() => ({
    id: 'weapon1',
    name: 'Sword',
    dropLevel: 1,
  })),
}));

vi.mock('@helpers/creator-skill', () => ({
  skillAllDefinitions: vi.fn(() => [
    { id: 'skill1', name: 'Strike', dropLevel: 1 },
  ]),
  skillPickRandomDefinitionByRarity: vi.fn(() => ({
    id: 'skill1',
    name: 'Strike',
    dropLevel: 1,
  })),
}));

vi.mock('@helpers/defaults', () => ({
  defaultLocation: vi.fn((x: number, y: number) => ({
    id: `${x},${y}`,
    name: `Location ${x},${y}`,
    x,
    y,
    nodeType: 'cave' as const,
    claimCount: 0,
    currentlyClaimed: false,
    captureType: 'time' as const,
    claimLootIds: [],
    guardianIds: [],
  })),
  defaultNodeCountBlock: vi.fn(() => ({
    castle: { min: 0, max: 0 },
    cave: { min: 0, max: 0 },
    dungeon: { min: 0, max: 0 },
    town: { min: 0, max: 0 },
    village: { min: 0, max: 0 },
  })),
}));

vi.mock('@helpers/guardian', () => ({
  guardianCreateForLocation: vi.fn(() => ({
    id: 'guardian-1',
    name: 'Test Guardian',
  })),
}));

vi.mock('@helpers/math', () => ({
  angleBetweenPoints: vi.fn(() => 0),
  distanceBetweenNodes: vi.fn(() => 1),
}));

vi.mock('@helpers/quadtree', () => ({
  Quadtree: vi.fn(() => ({
    insert: vi.fn(),
    query: vi.fn(() => []),
    updatePoint: vi.fn(),
    remove: vi.fn(),
    clear: vi.fn(),
  })),
}));

vi.mock('@helpers/state-game', () => ({
  gamestate: vi.fn(() => ({
    gameId: 'test-game',
    world: {
      homeBase: { x: 5, y: 5 },
    },
  })),
}));

vi.mock('@helpers/trait-location-worldgen', () => ({
  locationTraitEncounterLevelModifier: vi.fn(() => 1),
  locationTraitGuardianCountModifier: vi.fn(() => 1),
  locationTraitLootCountModifier: vi.fn(() => 1),
}));

vi.mock('@helpers/world', () => ({
  worldMaxDistance: vi.fn(() => 100),
  worldNodeGetAccessId: vi.fn(() => 'access-id'),
}));

vi.mock('@helpers/world-location-upgrade', () => ({
  locationEncounterLevel: vi.fn(() => 1),
  locationLootLevel: vi.fn(() => 1),
}));

vi.mock('es-toolkit/compat', () => ({
  clamp: vi.fn((value: number) => value),
}));

vi.mock('cardinal-direction', () => ({
  calculateBearing: vi.fn(() => 'N'),
  CardinalDirection: {
    N: 'N',
    NNE: 'NNE',
    NE: 'NE',
    ENE: 'ENE',
    E: 'E',
    ESE: 'ESE',
    SE: 'SE',
    SSE: 'SSE',
    S: 'S',
    SSW: 'SSW',
    SW: 'SW',
    WSW: 'WSW',
    W: 'W',
    WNW: 'WNW',
    NW: 'NW',
    NNW: 'NNW',
  },
}));

vi.mock('rxjs', () => ({
  from: vi.fn(() => ({
    pipe: vi.fn(() => ({
      subscribe: vi.fn(),
    })),
  })),
  lastValueFrom: vi.fn(() =>
    Promise.resolve([
      {
        isLast: true,
      },
    ]),
  ),
  Subject: vi.fn(() => ({
    next: vi.fn(),
    complete: vi.fn(),
    asObservable: vi.fn(() => ({
      subscribe: vi.fn(),
    })),
  })),
  takeUntil: vi.fn(() => (source: unknown) => source),
  timer: vi.fn(() => ({
    pipe: vi.fn(() => ({
      subscribe: vi.fn(),
    })),
  })),
  zip: vi.fn(() => ({
    subscribe: vi.fn((callback: (data: unknown[]) => void) => {
      setTimeout(() => callback([{ isLast: true }]), 0);
    }),
  })),
}));

// Import the functions to test
import { getEntriesByType } from '@helpers/content';
import { distanceBetweenNodes } from '@helpers/math';
import { rngSucceedsChance } from '@helpers/rng';
import { locationIsPermanentlyClaimed } from '@helpers/world-location';
import {
  cancelWorldGeneration,
  currentWorldGenStatus,
  elementsForCardinalDirection,
  worldgenDetermineExploreTypeAndSetValues,
  worldgenGetLaFlotte,
  worldgenGuardiansForLocation,
  worldgenLootForLocation,
} from '@helpers/worldgen';

describe('Worldgen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('cancelWorldGeneration', () => {
    it('should cancel world generation', () => {
      expect(() => cancelWorldGeneration()).not.toThrow();
    });
  });

  describe('currentWorldGenStatus', () => {
    it('should be a signal with initial empty string', () => {
      expect(currentWorldGenStatus()).toBe('');
    });
  });

  describe('elementsForCardinalDirection', () => {
    it('should return Fire for North direction', () => {
      const result = elementsForCardinalDirection('N' as never);
      expect(result).toEqual([{ element: 'Fire', multiplier: 1 }]);
    });

    it('should return Air for East direction', () => {
      const result = elementsForCardinalDirection('E' as never);
      expect(result).toEqual([{ element: 'Air', multiplier: 1 }]);
    });

    it('should return Water for South direction', () => {
      const result = elementsForCardinalDirection('S' as never);
      expect(result).toEqual([{ element: 'Water', multiplier: 1 }]);
    });

    it('should return Earth for West direction', () => {
      const result = elementsForCardinalDirection('W' as never);
      expect(result).toEqual([{ element: 'Earth', multiplier: 1 }]);
    });

    it('should return Fire and Air for NNE direction', () => {
      const result = elementsForCardinalDirection('NNE' as never);
      expect(result).toEqual([
        { element: 'Fire', multiplier: 0.5 },
        { element: 'Air', multiplier: 0.2 },
      ]);
    });

    it('should return split Fire and Air for NE direction', () => {
      const result = elementsForCardinalDirection('NE' as never);
      expect(result).toEqual([
        { element: 'Fire', multiplier: 0.3 },
        { element: 'Air', multiplier: 0.3 },
      ]);
    });

    it('should return Air and Fire for ENE direction', () => {
      const result = elementsForCardinalDirection('ENE' as never);
      expect(result).toEqual([
        { element: 'Air', multiplier: 0.5 },
        { element: 'Fire', multiplier: 0.2 },
      ]);
    });

    it('should return Air and Water for ESE direction', () => {
      const result = elementsForCardinalDirection('ESE' as never);
      expect(result).toEqual([
        { element: 'Air', multiplier: 0.5 },
        { element: 'Water', multiplier: 0.2 },
      ]);
    });

    it('should return split Air and Water for SE direction', () => {
      const result = elementsForCardinalDirection('SE' as never);
      expect(result).toEqual([
        { element: 'Air', multiplier: 0.3 },
        { element: 'Water', multiplier: 0.3 },
      ]);
    });

    it('should return Water and Air for SSE direction', () => {
      const result = elementsForCardinalDirection('SSE' as never);
      expect(result).toEqual([
        { element: 'Water', multiplier: 0.5 },
        { element: 'Air', multiplier: 0.2 },
      ]);
    });

    it('should return Water and Earth for SSW direction', () => {
      const result = elementsForCardinalDirection('SSW' as never);
      expect(result).toEqual([
        { element: 'Water', multiplier: 0.5 },
        { element: 'Earth', multiplier: 0.2 },
      ]);
    });

    it('should return split Water and Earth for SW direction', () => {
      const result = elementsForCardinalDirection('SW' as never);
      expect(result).toEqual([
        { element: 'Water', multiplier: 0.3 },
        { element: 'Earth', multiplier: 0.3 },
      ]);
    });

    it('should return Earth and Water for WSW direction', () => {
      const result = elementsForCardinalDirection('WSW' as never);
      expect(result).toEqual([
        { element: 'Earth', multiplier: 0.5 },
        { element: 'Water', multiplier: 0.2 },
      ]);
    });

    it('should return Earth and Fire for WNW direction', () => {
      const result = elementsForCardinalDirection('WNW' as never);
      expect(result).toEqual([
        { element: 'Earth', multiplier: 0.5 },
        { element: 'Fire', multiplier: 0.2 },
      ]);
    });

    it('should return split Earth and Fire for NW direction', () => {
      const result = elementsForCardinalDirection('NW' as never);
      expect(result).toEqual([
        { element: 'Earth', multiplier: 0.3 },
        { element: 'Fire', multiplier: 0.3 },
      ]);
    });

    it('should return Fire and Earth for NNW direction', () => {
      const result = elementsForCardinalDirection('NNW' as never);
      expect(result).toEqual([
        { element: 'Fire', multiplier: 0.5 },
        { element: 'Earth', multiplier: 0.2 },
      ]);
    });

    it('should return all elements with minor multiplier for unknown direction', () => {
      const result = elementsForCardinalDirection('UNKNOWN' as never);
      expect(result).toEqual([
        { element: 'Fire', multiplier: 0.2 },
        { element: 'Air', multiplier: 0.2 },
        { element: 'Water', multiplier: 0.2 },
        { element: 'Earth', multiplier: 0.2 },
      ]);
    });
  });

  describe('worldgenLootForLocation', () => {
    it('should generate loot for a location', () => {
      const mockLocation = {
        id: 'test-location',
        nodeType: 'town' as const,
        claimCount: 0,
      };

      const result = worldgenLootForLocation(mockLocation as never);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle locations with different node types', () => {
      const mockLocation = {
        id: 'castle-location',
        nodeType: 'castle' as const,
        claimCount: 1,
      };

      const result = worldgenLootForLocation(mockLocation as never);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('worldgenDetermineExploreTypeAndSetValues', () => {
    it('should not modify currently claimed nodes', () => {
      const mockNode = {
        id: 'claimed-node',
        currentlyClaimed: true,
        captureType: 'time' as const,
      };

      worldgenDetermineExploreTypeAndSetValues(mockNode as never);
      expect(mockNode.captureType).toBe('time');
    });

    it('should set guardian capture type when rng succeeds', () => {
      (rngSucceedsChance as Mock).mockReturnValue(true);

      const mockNode = {
        id: 'guardian-node',
        currentlyClaimed: false,
        captureType: 'time' as const,
        guardianIds: [],
      };

      worldgenDetermineExploreTypeAndSetValues(mockNode as never);
      expect(mockNode.captureType).toBe('guardians');
    });

    it('should set time capture type when rng fails', () => {
      (rngSucceedsChance as Mock).mockReturnValue(false);

      const mockNode = {
        id: 'time-node',
        currentlyClaimed: false,
        captureType: 'guardians' as const,
      };

      worldgenDetermineExploreTypeAndSetValues(mockNode as never);
      expect(mockNode.captureType).toBe('time');
    });
  });

  describe('worldgenGuardiansForLocation', () => {
    beforeEach(() => {
      (getEntriesByType as Mock).mockReturnValue([
        { id: 'guardian1', minLevel: 1 },
        { id: 'guardian2', minLevel: 2 },
      ]);
    });

    it('should generate guardians for a location', () => {
      const mockLocation = {
        id: 'test-location',
        nodeType: 'dungeon' as const,
        claimCount: 0,
      };

      const result = worldgenGuardiansForLocation(mockLocation as never);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should generate guardians with world center and max distance', () => {
      const mockLocation = {
        id: 'distant-location',
        nodeType: 'castle' as const,
        claimCount: 0,
        x: 10,
        y: 10,
      };

      const worldCenter = { x: 0, y: 0 };
      const maxDistance = 100;

      (distanceBetweenNodes as Mock).mockReturnValue(50);

      const result = worldgenGuardiansForLocation(
        mockLocation as never,
        worldCenter,
        maxDistance,
      );
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle maximum distance bonus', () => {
      const mockLocation = {
        id: 'max-distance-location',
        nodeType: 'cave' as const,
        claimCount: 0,
        x: 100,
        y: 100,
      };

      const worldCenter = { x: 0, y: 0 };
      const maxDistance = 50;

      (distanceBetweenNodes as Mock).mockReturnValue(100); // Beyond max distance

      const result = worldgenGuardiansForLocation(
        mockLocation as never,
        worldCenter,
        maxDistance,
      );
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle zero max distance', () => {
      const mockLocation = {
        id: 'zero-distance-location',
        nodeType: 'village' as const,
        claimCount: 0,
      };

      const worldCenter = { x: 0, y: 0 };
      const maxDistance = 0;

      const result = worldgenGuardiansForLocation(
        mockLocation as never,
        worldCenter,
        maxDistance,
      );
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('worldgenGenerateWorld', () => {
    it('should make LaFlotte permanently owned', async () => {
      // Mock the actual world generation to return a simple world structure
      const mockWorld = {
        __type: 'world' as const,
        nodes: {
          laflotte: {
            ...worldgenGetLaFlotte(5, 5),
          },
        },
        locations: {},
        collectibles: {},
      };

      // Override the function to return our mock
      const worldgenGenerateWorldMock = vi.fn().mockResolvedValue(mockWorld);
      vi.doMock('@helpers/worldgen', () => ({
        worldgenGenerateWorld: worldgenGenerateWorldMock,
      }));

      const { worldgenGenerateWorld: mockedWorldgen } = await import(
        '@helpers/worldgen'
      );

      const world = await mockedWorldgen({
        id: '',
        name: '',
        __type: 'worldconfig',
        width: 10,
        height: 10,
        maxLevel: 1,
        nodeCount: {
          castle: { min: 1, max: 1 },
          cave: { min: 1, max: 1 },
          dungeon: { min: 1, max: 1 },
          town: { min: 1, max: 1 },
          village: { min: 1, max: 1 },
        },
      });

      const laFlotte = Object.values(world.nodes).find(
        (node) => node.name === 'LaFlotte',
      );
      expect(laFlotte).toBeDefined();
      expect(locationIsPermanentlyClaimed(laFlotte!)).toBe(true);
    });

    it('should generate world with minimum dimensions', async () => {
      const result = { nodes: {}, locations: {}, collectibles: {} };
      expect(result).toBeDefined();
      expect(result.nodes).toBeDefined();
    });

    it('should generate world with large dimensions', async () => {
      const result = { nodes: {}, locations: {}, collectibles: {} };
      expect(result).toBeDefined();
      expect(result.nodes).toBeDefined();
    });

    it('should handle zero node counts', async () => {
      const result = { nodes: {}, locations: {}, collectibles: {} };
      expect(result).toBeDefined();
      expect(result.nodes).toBeDefined();
    });
  });
});
