import { gamestate, updateGamestate } from '@helpers/state-game';
import { worldNodeGetAccessId } from '@helpers/world';
import type { LocationType, WorldLocation } from '@interfaces';

/**
 * Revelation radius for each location type when claimed
 */
const REVELATION_RADIUS: Record<LocationType, number> = {
  cave: 1, // 3x3 area (radius 1)
  dungeon: 2, // 5x5 area (radius 2)
  village: 3, // 7x7 area (radius 3)
  castle: 4, // 9x9 area (radius 4)
  town: 5, // 11x11 area (radius 5)
};

/**
 * Check if a node is revealed (visible to the player)
 */
export function fogIsNodeRevealed(nodeAccessId: string): boolean {
  const { world } = gamestate();
  return world.revealedNodes.includes(nodeAccessId);
}

/**
 * Check if a world location is revealed (visible to the player)
 */
export function fogIsLocationRevealed(location: WorldLocation): boolean {
  return fogIsNodeRevealed(worldNodeGetAccessId(location));
}

/**
 * Reveal a specific node by its access ID
 */
export function fogRevealNode(nodeAccessId: string): void {
  updateGamestate((state) => {
    if (!state.world.revealedNodes.includes(nodeAccessId)) {
      state.world.revealedNodes.push(nodeAccessId);
    }
    return state;
  });
}

/**
 * Reveal a specific location
 */
export function fogRevealLocation(location: WorldLocation): void {
  fogRevealNode(worldNodeGetAccessId(location));
}

/**
 * Reveal an area around a location when it's claimed
 */
export function fogRevealAreaAroundLocation(location: WorldLocation): void {
  if (!location.nodeType) return;

  const radius = REVELATION_RADIUS[location.nodeType];
  const centerX = location.x;
  const centerY = location.y;

  const nodesToReveal: string[] = [];

  // Reveal nodes in a square area around the location
  for (let dx = -radius; dx <= radius; dx++) {
    for (let dy = -radius; dy <= radius; dy++) {
      const x = centerX + dx;
      const y = centerY + dy;
      const nodeAccessId = `${x},${y}`;
      nodesToReveal.push(nodeAccessId);
    }
  }

  updateGamestate((state) => {
    nodesToReveal.forEach((nodeId) => {
      if (!state.world.revealedNodes.includes(nodeId)) {
        state.world.revealedNodes.push(nodeId);
      }
    });
    return state;
  });
}

/**
 * Get all revealed node access IDs
 */
export function fogGetRevealedNodes(): Set<string> {
  return new Set(gamestate().world.revealedNodes);
}

/**
 * Check if a position is revealed (for use in rendering)
 */
export function fogIsPositionRevealed(x: number, y: number): boolean {
  const nodeAccessId = `${x},${y}`;
  return fogIsNodeRevealed(nodeAccessId);
}