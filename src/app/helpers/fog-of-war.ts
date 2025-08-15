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

// Cache for revealed positions to avoid recalculating on every check
let cachedRevealedPositions: Set<string> | null = null;

/**
 * Builds the cache of all revealed positions based on currently claimed nodes
 */
function buildRevealedPositionsCache(): Set<string> {
  const revealedPositions = new Set<string>();
  const claimedNodes = locationGetAll().filter((node) => node.currentlyClaimed);

  for (const claimedNode of claimedNodes) {
    if (!claimedNode.nodeType) continue;

    const radius = REVELATION_RADIUS[claimedNode.nodeType];

    // Add all positions within the revelation radius
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        const x = claimedNode.x + dx;
        const y = claimedNode.y + dy;
        revealedPositions.add(`${x},${y}`);
      }
    }
  }

  return revealedPositions;
}

/**
 * Gets the cached revealed positions, building the cache if it doesn't exist
 */
function getRevealedPositionsCache(): Set<string> {
  if (cachedRevealedPositions === null) {
    cachedRevealedPositions = buildRevealedPositionsCache();
  }
  return cachedRevealedPositions;
}

/**
 * Invalidates the revealed positions cache, forcing it to be rebuilt on next access
 */
export function fogInvalidateCache(): void {
  cachedRevealedPositions = null;
}

/**
 * Check if a position is revealed by checking if it's within revelation radius of any claimed node
 * Now uses cached revealed positions for better performance
 */
export function fogIsPositionRevealed(x: number, y: number): boolean {
  const revealedPositions = getRevealedPositionsCache();
  return revealedPositions.has(`${x},${y}`);
}

/**
 * Get all revealed positions as a set of "x,y" strings
 * Now uses cached revealed positions for better performance
 */
export function fogGetRevealedNodes(): Set<string> {
  return new Set(getRevealedPositionsCache());
}
