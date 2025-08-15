import { locationGetAll } from '@helpers/world-location';
import type { LocationType } from '@interfaces';

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
 * Check if a position is revealed by checking if it's within revelation radius of any claimed node
 */
export function fogIsPositionRevealed(x: number, y: number): boolean {
  const claimedNodes = locationGetAll().filter((node) => node.currentlyClaimed);

  for (const claimedNode of claimedNodes) {
    if (!claimedNode.nodeType) continue;

    const radius = REVELATION_RADIUS[claimedNode.nodeType];
    const dx = Math.abs(x - claimedNode.x);
    const dy = Math.abs(y - claimedNode.y);

    // Check if position is within the revelation radius
    if (dx <= radius && dy <= radius) {
      return true;
    }
  }

  return false;
}

/**
 * Get all revealed positions as a set of "x,y" strings
 * This is used for testing compatibility
 */
export function fogGetRevealedNodes(): Set<string> {
  const revealed = new Set<string>();
  const claimedNodes = locationGetAll().filter((node) => node.currentlyClaimed);

  for (const claimedNode of claimedNodes) {
    if (!claimedNode.nodeType) continue;

    const radius = REVELATION_RADIUS[claimedNode.nodeType];

    // Add all positions within the revelation radius
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        const x = claimedNode.x + dx;
        const y = claimedNode.y + dy;
        revealed.add(`${x},${y}`);
      }
    }
  }

  return revealed;
}
