import { getNearestTown } from '@helpers/world';
import type { WorldLocation } from '@interfaces';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dependencies
vi.mock('@helpers/state-game', () => ({
  gamestate: vi.fn(),
}));

import { gamestate } from '@helpers/state-game';

describe('World Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getNearestTown', () => {
    it('should return the nearest town to a given position', () => {
      const towns: WorldLocation[] = [
        {
          id: 'town-1',
          name: 'Town A',
          x: 0,
          y: 0,
          nodeType: 'town',
          traitIds: [],
        } as WorldLocation,
        {
          id: 'town-2',
          name: 'Town B',
          x: 10,
          y: 0,
          nodeType: 'town',
          traitIds: [],
        } as WorldLocation,
        {
          id: 'town-3',
          name: 'Town C',
          x: 5,
          y: 0,
          nodeType: 'town',
          traitIds: [],
        } as WorldLocation,
      ];

      const otherNodes: WorldLocation[] = [
        {
          id: 'cave-1',
          name: 'Cave A',
          x: 1,
          y: 0,
          nodeType: 'cave',
          traitIds: [],
        } as WorldLocation,
      ];

      vi.mocked(gamestate).mockReturnValue({
        world: {
          nodes: {
            '0,0': towns[0],
            '10,0': towns[1],
            '5,0': towns[2],
            '1,0': otherNodes[0],
          },
        },
      } as ReturnType<typeof gamestate>);

      // Position at (3, 0) should be closest to Town C at (5, 0)
      const result = getNearestTown({ x: 3, y: 0 });
      expect(result).toEqual(towns[2]);
    });

    it('should return undefined when no towns exist', () => {
      const otherNodes: WorldLocation[] = [
        {
          id: 'cave-1',
          name: 'Cave A',
          x: 1,
          y: 0,
          nodeType: 'cave',
          traitIds: [],
        } as WorldLocation,
      ];

      vi.mocked(gamestate).mockReturnValue({
        world: {
          nodes: {
            '1,0': otherNodes[0],
          },
        },
      } as ReturnType<typeof gamestate>);

      const result = getNearestTown({ x: 0, y: 0 });
      expect(result).toBeUndefined();
    });

    it('should return the only town when only one exists', () => {
      const town: WorldLocation = {
        id: 'town-1',
        name: 'Only Town',
        x: 100,
        y: 100,
        nodeType: 'town',
        traitIds: [],
      } as WorldLocation;

      vi.mocked(gamestate).mockReturnValue({
        world: {
          nodes: {
            '100,100': town,
          },
        },
      } as ReturnType<typeof gamestate>);

      const result = getNearestTown({ x: 0, y: 0 });
      expect(result).toEqual(town);
    });

    it('should choose the closest town when multiple are equally distant', () => {
      const towns: WorldLocation[] = [
        {
          id: 'town-1',
          name: 'Town A',
          x: 1,
          y: 0,
          nodeType: 'town',
          traitIds: [],
        } as WorldLocation,
        {
          id: 'town-2',
          name: 'Town B',
          x: -1,
          y: 0,
          nodeType: 'town',
          traitIds: [],
        } as WorldLocation,
      ];

      vi.mocked(gamestate).mockReturnValue({
        world: {
          nodes: {
            '1,0': towns[0],
            '-1,0': towns[1],
          },
        },
      } as ReturnType<typeof gamestate>);

      // Both towns are distance 1 from origin, should return the first one found
      const result = getNearestTown({ x: 0, y: 0 });
      expect([towns[0], towns[1]]).toContain(result);
    });
  });
});