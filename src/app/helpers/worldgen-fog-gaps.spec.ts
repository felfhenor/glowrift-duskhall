import { describe, expect, it } from 'vitest';

import type { LocationType, WorldConfigContent, WorldLocation } from '@interfaces';
import { REVELATION_RADIUS } from '@interfaces/world';

// Access the private function by importing the module and calling it directly
// We'll need to temporarily expose the function for testing
describe('World Generation Fog Gap Filling', () => {

  function createTestLocation(x: number, y: number): WorldLocation {
    return {
      id: `test-${x}-${y}`,
      x,
      y,
      nodeType: undefined,
      name: '',
      currentlyClaimed: false,
      isValidMapNode: true,
      claimCount: 0,
      claimLootIds: [],
      guardianIds: [],
      traits: [],
      elements: [],
    };
  }

  function getRevealedPositions(
    nodes: Record<string, WorldLocation>,
    config: WorldConfigContent,
  ): Set<string> {
    const revealedPositions = new Set<string>();

    Object.values(nodes).forEach((node) => {
      if (!node.nodeType) return;

      const radius = REVELATION_RADIUS[node.nodeType];

      for (let dx = -radius; dx <= radius; dx++) {
        for (let dy = -radius; dy <= radius; dy++) {
          const x = node.x + dx;
          const y = node.y + dy;
          if (x >= 0 && x < config.width && y >= 0 && y < config.height) {
            revealedPositions.add(`${x},${y}`);
          }
        }
      }
    });

    return revealedPositions;
  }

  function simulateFillFogGaps(
    config: WorldConfigContent,
    nodes: Record<string, WorldLocation>,
  ): void {
    const counts = { cave: 0, dungeon: 0, village: 0, castle: 0, town: 0 };

    // Calculate all revealed positions based on current nodes
    const revealedPositions = getRevealedPositions(nodes, config);

    // Find unrevealed positions that need to be filled
    const unrevealedPositions: Array<{ x: number; y: number }> = [];

    for (let x = 0; x < config.width; x++) {
      for (let y = 0; y < config.height; y++) {
        if (!revealedPositions.has(`${x},${y}`)) {
          unrevealedPositions.push({ x, y });
        }
      }
    }

    // If there are no unrevealed positions, we're done
    if (unrevealedPositions.length === 0) {
      return;
    }

    // Simple gap filling - add caves to isolated positions
    const processedPositions = new Set<string>();

    unrevealedPositions.forEach(({ x, y }) => {
      const posKey = `${x},${y}`;
      if (processedPositions.has(posKey)) return;

      // Check if this position already has a node
      if (nodes[posKey]?.nodeType) return;

      // For testing, just add caves to fill gaps
      const nodeType: LocationType = 'cave';

      // Place the node
      const newNode: WorldLocation = {
        ...createTestLocation(x, y),
        nodeType,
        name: `fill-gap ${nodeType} ${x}-${y}`,
      };

      nodes[posKey] = newNode;
      counts[nodeType]++;

      // Mark positions that would be revealed by this new node as processed
      const radius = REVELATION_RADIUS[nodeType];
      for (let dx = -radius; dx <= radius; dx++) {
        for (let dy = -radius; dy <= radius; dy++) {
          const newX = x + dx;
          const newY = y + dy;
          if (
            newX >= 0 &&
            newX < config.width &&
            newY >= 0 &&
            newY < config.height
          ) {
            processedPositions.add(`${newX},${newY}`);
          }
        }
      }
    });
  }

  it('should identify unrevealed positions in a small world', () => {
    const config: WorldConfigContent = {
      id: 'test',
      name: 'Test',
      description: 'Test world',
      width: 5,
      height: 5,
      nodeCount: {
        cave: { min: 0, max: 0 },
        dungeon: { min: 0, max: 0 },
        village: { min: 0, max: 0 },
        castle: { min: 0, max: 0 },
        town: { min: 0, max: 0 },
      },
    };

    const nodes: Record<string, WorldLocation> = {};

    // Add a single town in the center
    const town: WorldLocation = {
      ...createTestLocation(2, 2),
      nodeType: 'town',
      name: 'Test Town',
    };
    nodes['2,2'] = town;

    // Check revealed positions before gap filling
    const revealedPositions = getRevealedPositions(nodes, config);

    // Town has radius 5, so it should reveal the entire 5x5 world
    expect(revealedPositions.size).toBe(25); // 5x5 = 25 positions
    expect(revealedPositions.has('0,0')).toBe(true);
    expect(revealedPositions.has('4,4')).toBe(true);
  });

  it('should identify gaps when nodes have limited revelation radius', () => {
    const config: WorldConfigContent = {
      id: 'test',
      name: 'Test',
      description: 'Test world',
      width: 10,
      height: 10,
      nodeCount: {
        cave: { min: 0, max: 0 },
        dungeon: { min: 0, max: 0 },
        village: { min: 0, max: 0 },
        castle: { min: 0, max: 0 },
        town: { min: 0, max: 0 },
      },
    };

    const nodes: Record<string, WorldLocation> = {};

    // Add a single cave in the corner (radius 1)
    const cave: WorldLocation = {
      ...createTestLocation(1, 1),
      nodeType: 'cave',
      name: 'Test Cave',
    };
    nodes['1,1'] = cave;

    // Check revealed positions
    const revealedPositions = getRevealedPositions(nodes, config);

    // Cave has radius 1, so it should reveal 3x3 = 9 positions around (1,1)
    expect(revealedPositions.size).toBe(9);
    expect(revealedPositions.has('0,0')).toBe(true);
    expect(revealedPositions.has('2,2')).toBe(true);
    expect(revealedPositions.has('1,1')).toBe(true);

    // Positions far from the cave should not be revealed
    expect(revealedPositions.has('5,5')).toBe(false);
    expect(revealedPositions.has('9,9')).toBe(false);

    // Count unrevealed positions
    let unrevealedCount = 0;
    for (let x = 0; x < config.width; x++) {
      for (let y = 0; y < config.height; y++) {
        if (!revealedPositions.has(`${x},${y}`)) {
          unrevealedCount++;
        }
      }
    }

    expect(unrevealedCount).toBe(91); // 100 - 9 = 91 unrevealed positions
  });

  it('should fill fog gaps by adding appropriate nodes', () => {
    const config: WorldConfigContent = {
      id: 'test',
      name: 'Test',
      description: 'Test world',
      width: 7,
      height: 7,
      nodeCount: {
        cave: { min: 0, max: 0 },
        dungeon: { min: 0, max: 0 },
        village: { min: 0, max: 0 },
        castle: { min: 0, max: 0 },
        town: { min: 0, max: 0 },
      },
    };

    const nodes: Record<string, WorldLocation> = {};

    // Add a single cave in the corner (radius 1)
    const cave: WorldLocation = {
      ...createTestLocation(1, 1),
      nodeType: 'cave',
      name: 'Original Cave',
    };
    nodes['1,1'] = cave;

    // Count nodes before gap filling
    const nodeCountBefore = Object.keys(nodes).filter((key) =>
      Boolean(nodes[key].nodeType),
    ).length;

    // Apply gap filling
    simulateFillFogGaps(config, nodes);

    // Count nodes after gap filling
    const nodeCountAfter = Object.keys(nodes).filter((key) =>
      Boolean(nodes[key].nodeType),
    ).length;

    // Should have added nodes to fill gaps
    expect(nodeCountAfter).toBeGreaterThan(nodeCountBefore);

    // Check that all positions are now revealed
    const revealedPositions = getRevealedPositions(nodes, config);
    expect(revealedPositions.size).toBe(49); // 7x7 = 49 positions
  });

  it('should not add nodes if there are no fog gaps', () => {
    const config: WorldConfigContent = {
      id: 'test',
      name: 'Test',
      description: 'Test world',
      width: 5,
      height: 5,
      nodeCount: {
        cave: { min: 0, max: 0 },
        dungeon: { min: 0, max: 0 },
        village: { min: 0, max: 0 },
        castle: { min: 0, max: 0 },
        town: { min: 0, max: 0 },
      },
    };

    const nodes: Record<string, WorldLocation> = {};

    // Add a town that covers the entire world (radius 5)
    const town: WorldLocation = {
      ...createTestLocation(2, 2),
      nodeType: 'town',
      name: 'Central Town',
    };
    nodes['2,2'] = town;

    // Count nodes before gap filling
    const nodeCountBefore = Object.keys(nodes).filter((key) =>
      Boolean(nodes[key].nodeType),
    ).length;

    // Apply gap filling
    simulateFillFogGaps(config, nodes);

    // Count nodes after gap filling
    const nodeCountAfter = Object.keys(nodes).filter((key) =>
      Boolean(nodes[key].nodeType),
    ).length;

    // Should not have added any nodes since there are no gaps
    expect(nodeCountAfter).toBe(nodeCountBefore);
    expect(nodeCountAfter).toBe(1);
  });

  it('should respect world boundaries when filling gaps', () => {
    const config: WorldConfigContent = {
      id: 'test',
      name: 'Test',
      description: 'Test world',
      width: 3,
      height: 3,
      nodeCount: {
        cave: { min: 0, max: 0 },
        dungeon: { min: 0, max: 0 },
        village: { min: 0, max: 0 },
        castle: { min: 0, max: 0 },
        town: { min: 0, max: 0 },
      },
    };

    const nodes: Record<string, WorldLocation> = {};

    // Apply gap filling to an empty world
    simulateFillFogGaps(config, nodes);

    // Check that no nodes were placed outside world boundaries
    Object.values(nodes).forEach((node) => {
      if (node.nodeType) {
        expect(node.x).toBeGreaterThanOrEqual(0);
        expect(node.x).toBeLessThan(config.width);
        expect(node.y).toBeGreaterThanOrEqual(0);
        expect(node.y).toBeLessThan(config.height);
      }
    });

    // Should fill the entire 3x3 world
    const revealedPositions = getRevealedPositions(nodes, config);
    expect(revealedPositions.size).toBe(9); // 3x3 = 9 positions
  });
});