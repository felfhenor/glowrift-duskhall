import { handleCombatDefeat } from '@helpers/combat-end';
import { heroLevelUp } from '@helpers/hero-xp';
import { getNodesWithinRiskTolerance } from '@helpers/world';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Combat, Hero, HeroId, WorldLocation } from '@interfaces';

// Mock all dependencies
vi.mock('@helpers/combat-log', () => ({
  logCombatMessage: vi.fn(),
}));

vi.mock('@helpers/explore', () => ({
  travelHome: vi.fn(),
}));

vi.mock('@helpers/hero', () => ({
  updateHeroData: vi.fn(),
}));

vi.mock('@helpers/hero-stats', () => ({
  recalculateStats: vi.fn(),
}));

vi.mock('@helpers/rng', () => ({
  seededrng: vi.fn(),
  randomChoice: vi.fn().mockReturnValue(1),
}));

vi.mock('@helpers/state-game', () => ({
  gamestate: vi.fn(),
  updateGamestate: vi.fn(),
}));

import { gamestate, updateGamestate } from '@helpers/state-game';

describe('Too Hard Nodes Integration Test', () => {
  let mockState: any;
  let baseNode: WorldLocation;
  let testNode1: WorldLocation;
  let testNode2: WorldLocation;
  let testHero: Hero;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup test data
    baseNode = {
      id: 'base-node',
      name: 'Base Node',
      x: 0,
      y: 0,
      elements: [],
      nodeType: 'town',
      claimCount: 0,
      currentlyClaimed: true,
      encounterLevel: 1,
      guardianIds: [],
      claimLootIds: [],
      unclaimTime: 0,
      traitIds: [],
    };

    testNode1 = {
      id: 'test-node-1',
      name: 'Test Node 1',
      x: 1,
      y: 1,
      elements: [],
      nodeType: 'village',
      claimCount: 0,
      currentlyClaimed: false,
      encounterLevel: 3,
      guardianIds: [],
      claimLootIds: [],
      unclaimTime: 0,
      traitIds: [],
    };

    testNode2 = {
      id: 'test-node-2',
      name: 'Test Node 2',
      x: 2,
      y: 2,
      elements: [],
      nodeType: 'cave',
      claimCount: 0,
      currentlyClaimed: false,
      encounterLevel: 4,
      guardianIds: [],
      claimLootIds: [],
      unclaimTime: 0,
      traitIds: [],
    };

    testHero = {
      id: 'test-hero' as HeroId,
      name: 'Test Hero',
      level: 5,
      xp: 0,
      hp: 50,
      baseStats: { Force: 10, Health: 50, Speed: 2, Aura: 3 },
      totalStats: { Force: 10, Health: 50, Speed: 2, Aura: 3 },
      equipment: {
        accessory: undefined,
        armor: undefined,
        trinket: undefined,
        weapon: undefined,
      },
      skills: [],
      talents: {},
      sprite: 'hero',
      frames: 1,
      targettingType: 'Random',
    };

    mockState = {
      hero: {
        riskTolerance: 'medium',
        heroes: [testHero],
        tooHardNodes: [],
      },
    };

    vi.mocked(gamestate).mockReturnValue(mockState);
    vi.mocked(updateGamestate).mockImplementation((updateFn) => {
      updateFn(mockState);
    });
  });

  it('should complete the full workflow: defeat → avoidance → level up → reset', () => {
    const availableNodes = [testNode1, testNode2];

    // Step 1: Initially, both nodes should be available for auto-travel
    let viableNodes = getNodesWithinRiskTolerance(baseNode, availableNodes);
    expect(viableNodes).toHaveLength(2);
    expect(viableNodes.map(n => n.name)).toEqual(['Test Node 1', 'Test Node 2']);
    expect(mockState.hero.tooHardNodes).toEqual([]);

    // Step 2: Heroes get defeated at Test Node 1
    const combat: Combat = {
      heroes: [],
      guardians: [],
      rounds: 1,
      locationPosition: { x: 1, y: 1 }, // testNode1 position
      messages: [],
    };

    handleCombatDefeat(combat);

    // Verify that the node was added to tooHardNodes
    expect(updateGamestate).toHaveBeenCalled();
    expect(mockState.hero.tooHardNodes).toContain('1,1');

    // Step 3: Auto-travel should now de-prioritize Test Node 1 (put it last)
    viableNodes = getNodesWithinRiskTolerance(baseNode, availableNodes);
    expect(viableNodes).toHaveLength(2);
    expect(viableNodes[0].name).toBe('Test Node 2'); // Should come first (not too hard)
    expect(viableNodes[1].name).toBe('Test Node 1'); // Should come last (too hard)

    // Step 4: Hero levels up
    heroLevelUp(testHero);

    // Verify that tooHardNodes was cleared
    expect(mockState.hero.tooHardNodes).toEqual([]);

    // Step 5: Auto-travel should now include both nodes again
    viableNodes = getNodesWithinRiskTolerance(baseNode, availableNodes);
    expect(viableNodes).toHaveLength(2);
    expect(viableNodes.map(n => n.name)).toEqual(['Test Node 1', 'Test Node 2']);
  });

  it('should handle multiple defeats and only clear on level up', () => {
    const availableNodes = [testNode1, testNode2];

    // Defeat at Test Node 1
    const combat1: Combat = {
      heroes: [],
      guardians: [],
      rounds: 1,
      locationPosition: { x: 1, y: 1 },
      messages: [],
    };
    handleCombatDefeat(combat1);
    expect(mockState.hero.tooHardNodes).toContain('1,1');

    // Defeat at Test Node 2
    const combat2: Combat = {
      heroes: [],
      guardians: [],
      rounds: 1,
      locationPosition: { x: 2, y: 2 },
      messages: [],
    };
    handleCombatDefeat(combat2);
    expect(mockState.hero.tooHardNodes).toContain('2,2');

    // Both nodes should now be de-prioritized but still available
    let viableNodes = getNodesWithinRiskTolerance(baseNode, availableNodes);
    expect(viableNodes).toHaveLength(2); // Both nodes should still be available
    // Both should be at the end since both are too hard, but they should still be included
    expect(viableNodes).toContain(testNode1);
    expect(viableNodes).toContain(testNode2);

    // Level up should clear everything
    heroLevelUp(testHero);
    expect(mockState.hero.tooHardNodes).toEqual([]);

    // Both nodes should be available again
    viableNodes = getNodesWithinRiskTolerance(baseNode, availableNodes);
    expect(viableNodes).toHaveLength(2);
  });

  it('should not add duplicate nodes to tooHardNodes', () => {
    // Defeat at same node twice
    const combat: Combat = {
      heroes: [],
      guardians: [],
      rounds: 1,
      locationPosition: { x: 1, y: 1 },
      messages: [],
    };

    handleCombatDefeat(combat);
    expect(mockState.hero.tooHardNodes).toEqual(['1,1']);

    handleCombatDefeat(combat);
    expect(mockState.hero.tooHardNodes).toEqual(['1,1']); // No duplicates
  });
});