import {
  distanceBetweenNodes,
  isAtNode,
  isTraveling,
  isTravelingToNode,
  travelTimeBetweenNodes,
  travelTimeFromCurrentLocationTo,
  travelToNode,
} from '@helpers/travel';
import type { WorldLocation, WorldPosition } from '@interfaces';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dependencies
vi.mock('@helpers/festival-exploration', () => ({
  getExplorationTickMultiplier: vi.fn(),
}));

vi.mock('@helpers/notify', () => ({
  notify: vi.fn(),
}));

vi.mock('@helpers/state-game', () => ({
  gamestate: vi.fn(),
  updateGamestate: vi.fn((callback) =>
    callback({ hero: { travel: {}, position: {} } }),
  ),
}));

import { getExplorationTickMultiplier } from '@helpers/festival-exploration';
import { notify } from '@helpers/notify';
import { gamestate } from '@helpers/state-game';

describe('Travel Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isTraveling', () => {
    it('should return true when travel ticks remain', () => {
      vi.mocked(gamestate).mockReturnValue({
        hero: { travel: { ticksLeft: 5 } },
      } as ReturnType<typeof gamestate>);

      expect(isTraveling()).toBe(true);
    });

    it('should return false when no travel ticks remain', () => {
      vi.mocked(gamestate).mockReturnValue({
        hero: { travel: { ticksLeft: 0 } },
      } as ReturnType<typeof gamestate>);

      expect(isTraveling()).toBe(false);
    });
  });

  describe('distanceBetweenNodes', () => {
    it('should calculate correct distance between two points', () => {
      const pointA: WorldPosition = { x: 0, y: 0 };
      const pointB: WorldPosition = { x: 3, y: 4 };

      expect(distanceBetweenNodes(pointA, pointB)).toBe(5);
    });

    it('should handle negative coordinates', () => {
      const pointA: WorldPosition = { x: -1, y: -1 };
      const pointB: WorldPosition = { x: 2, y: 3 };

      expect(distanceBetweenNodes(pointA, pointB)).toBe(5);
    });
  });

  describe('travelTimeBetweenNodes', () => {
    it('should calculate travel time based on distance', () => {
      const pointA: WorldPosition = { x: 0, y: 0 };
      const pointB: WorldPosition = { x: 2, y: 0 };

      // Distance is 2, multiplied by 5 = 10
      expect(travelTimeBetweenNodes(pointA, pointB)).toBe(10);
    });
  });

  describe('travelTimeFromCurrentLocationTo', () => {
    it('should calculate total travel time with multiplier', () => {
      const currentPos: WorldPosition = { x: 0, y: 0, nodeId: 'node-1' };
      const targetPos: WorldPosition = { x: 2, y: 0 };

      vi.mocked(gamestate).mockReturnValue({
        hero: { position: currentPos },
      } as ReturnType<typeof gamestate>);

      vi.mocked(getExplorationTickMultiplier).mockReturnValue(0.5);

      // Base time is 10, modification is 5, total is 15
      expect(travelTimeFromCurrentLocationTo(targetPos)).toBe(15);
    });
  });

  describe('travelToNode', () => {
    it('should update game state with travel information', () => {
      const targetNode: WorldLocation = {
        id: 'node-2',
        name: 'Test Node',
        x: 3,
        y: 4,
      } as WorldLocation;

      vi.mocked(gamestate).mockReturnValue({
        hero: {
          position: { x: 0, y: 0, nodeId: 'node-1' },
          travel: { ticksLeft: 0 },
        },
      } as ReturnType<typeof gamestate>);

      vi.mocked(getExplorationTickMultiplier).mockReturnValue(0.5);

      travelToNode(targetNode);

      expect(notify).toHaveBeenCalledWith(
        'Travel to Test Node initiated...',
        'Travel',
      );
    });
  });

  describe('isAtNode', () => {
    it('should return true when at specified node', () => {
      const node: WorldLocation = {
        id: 'node-1',
      } as WorldLocation;

      vi.mocked(gamestate).mockReturnValue({
        hero: { position: { nodeId: 'node-1' } },
      } as ReturnType<typeof gamestate>);

      expect(isAtNode(node)).toBe(true);
    });

    it('should return false when at different node', () => {
      const node: WorldLocation = {
        id: 'node-2',
      } as WorldLocation;

      vi.mocked(gamestate).mockReturnValue({
        hero: { position: { nodeId: 'node-1' } },
      } as ReturnType<typeof gamestate>);

      expect(isAtNode(node)).toBe(false);
    });
  });

  describe('isTravelingToNode', () => {
    it('should return true when traveling to specified node', () => {
      const node: WorldLocation = {
        id: 'node-2',
      } as WorldLocation;

      vi.mocked(gamestate).mockReturnValue({
        hero: { travel: { nodeId: 'node-2' } },
      } as ReturnType<typeof gamestate>);

      expect(isTravelingToNode(node)).toBe(true);
    });

    it('should return false when traveling to different node', () => {
      const node: WorldLocation = {
        id: 'node-2',
      } as WorldLocation;

      vi.mocked(gamestate).mockReturnValue({
        hero: { travel: { nodeId: 'node-1' } },
      } as ReturnType<typeof gamestate>);

      expect(isTravelingToNode(node)).toBe(false);
    });
  });
});
