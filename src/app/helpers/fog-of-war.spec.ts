import { describe, expect, it, beforeEach, vi } from 'vitest';
import type { LocationType, GameState } from '@interfaces';
import { defaultLocation } from '@helpers/defaults';

// Mock the game state functions
const mockGameState: GameState = {
  world: {
    revealedNodes: [] as string[],
  },
} as any;

vi.mock('@helpers/state-game', () => ({
  gamestate: () => mockGameState,
  updateGamestate: (fn: (state: GameState) => GameState) => {
    const newState = fn(mockGameState);
    Object.assign(mockGameState, newState);
    return newState;
  },
}));

vi.mock('@helpers/world', () => ({
  worldNodeGetAccessId: (location: any) => `${location.x},${location.y}`,
}));

// Import the functions under test after mocking
import {
  fogIsNodeRevealed,
  fogIsLocationRevealed,
  fogRevealNode,
  fogRevealLocation,
  fogRevealAreaAroundLocation,
  fogGetRevealedNodes,
  fogIsPositionRevealed,
} from '@helpers/fog-of-war';

describe('Fog of War', () => {
  beforeEach(() => {
    // Reset the mock game state
    mockGameState.world.revealedNodes = [];
  });

  describe('Node Revelation', () => {
    it('should initially have no revealed nodes except when explicitly added', () => {
      expect(fogIsNodeRevealed('0,0')).toBe(false);
      expect(fogIsNodeRevealed('1,1')).toBe(false);
    });

    it('should reveal a node when calling fogRevealNode', () => {
      const nodeId = '5,5';
      expect(fogIsNodeRevealed(nodeId)).toBe(false);
      
      fogRevealNode(nodeId);
      
      expect(fogIsNodeRevealed(nodeId)).toBe(true);
    });

    it('should not duplicate nodes when revealing the same node twice', () => {
      const nodeId = '3,3';
      
      fogRevealNode(nodeId);
      fogRevealNode(nodeId);
      
      const revealedNodes = fogGetRevealedNodes();
      const nodeCount = Array.from(revealedNodes).filter(id => id === nodeId).length;
      expect(nodeCount).toBe(1);
    });

    it('should reveal a location when calling fogRevealLocation', () => {
      const location = defaultLocation(10, 10);
      location.id = 'test-location';
      
      expect(fogIsLocationRevealed(location)).toBe(false);
      
      fogRevealLocation(location);
      
      expect(fogIsLocationRevealed(location)).toBe(true);
    });
  });

  describe('Area Revelation', () => {
    it('should reveal a 3x3 area around a cave', () => {
      const cave = defaultLocation(5, 5);
      cave.nodeType = 'cave' as LocationType;
      
      fogRevealAreaAroundLocation(cave);
      
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

    it('should reveal a 5x5 area around a dungeon', () => {
      const dungeon = defaultLocation(10, 10);
      dungeon.nodeType = 'dungeon' as LocationType;
      
      fogRevealAreaAroundLocation(dungeon);
      
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

    it('should reveal an 11x11 area around a town', () => {
      const town = defaultLocation(15, 15);
      town.nodeType = 'town' as LocationType;
      
      fogRevealAreaAroundLocation(town);
      
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

    it('should not reveal anything for locations without nodeType', () => {
      const location = defaultLocation(20, 20);
      location.nodeType = undefined;
      
      fogRevealAreaAroundLocation(location);
      
      expect(fogIsPositionRevealed(20, 20)).toBe(false);
      expect(fogIsPositionRevealed(19, 19)).toBe(false);
      expect(fogIsPositionRevealed(21, 21)).toBe(false);
    });
  });

  describe('Position Checking', () => {
    it('should correctly check if a position is revealed', () => {
      expect(fogIsPositionRevealed(0, 0)).toBe(false);
      
      fogRevealNode('0,0');
      
      expect(fogIsPositionRevealed(0, 0)).toBe(true);
      expect(fogIsPositionRevealed(1, 1)).toBe(false);
    });
  });
});