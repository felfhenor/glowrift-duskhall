import { handleCombatDefeat } from '@helpers/combat-end';
import { heroLevelUp } from '@helpers/hero-xp';
import { getNodesMatchingHeroPreferences } from '@helpers/world';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type {
  Combat,
  CombatId,
  GameState,
  Hero,
  HeroId,
  WorldLocation,
} from '@interfaces';

// Mock dependencies
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
  randomChoice: vi.fn(),
}));

vi.mock('@helpers/state-game', () => ({
  gamestate: vi.fn(),
  updateGamestate: vi.fn(),
}));

import { randomChoice } from '@helpers/rng';
import { gamestate, updateGamestate } from '@helpers/state-game';

// Helper function to create default loot rarity preferences for tests
function getDefaultTestLootRarityPreferences() {
  return {
    Common: true,
    Uncommon: true,
    Rare: true,
    Mystical: true,
    Legendary: true,
    Unique: true,
  };
}

describe('Too Hard Nodes Feature', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(updateGamestate).mockImplementation((updateFn) => {
      const mockState = vi.mocked(gamestate)();
      updateFn(mockState);
    });
  });

  describe('handleCombatDefeat', () => {
    it('should add current node to tooHardNodes list when heroes are defeated', () => {
      const combat: Combat = {
        id: 'test-combat' as CombatId,
        heroes: [],
        guardians: [],
        rounds: 1,
        locationPosition: { x: 5, y: 10 },
        locationName: 'Test Location',
        elementalModifiers: {
          Fire: 0,
          Water: 0,
          Earth: 0,
          Air: 0,
        },
      };

      const mockState = {
        hero: {
          tooHardNodes: ['1,2'],
          nodeTypePreferences: {
            cave: true,
            town: true,
            village: true,
            dungeon: true,
            castle: true,
          },
          lootRarityPreferences: getDefaultTestLootRarityPreferences(),
        },
      } as Partial<GameState>;

      vi.mocked(gamestate).mockReturnValue(mockState as GameState);

      handleCombatDefeat(combat);

      expect(updateGamestate).toHaveBeenCalled();
      const updateFunction = vi.mocked(updateGamestate).mock.calls[0][0];

      // Test that the update function adds the node correctly
      const testState = {
        hero: {
          tooHardNodes: ['1,2'],
        },
      } as Partial<GameState>;

      updateFunction(testState as GameState);
      expect(testState.hero?.tooHardNodes).toContain('5,10');
    });

    it('should not add duplicate nodes to tooHardNodes list', () => {
      const combat: Combat = {
        id: 'test-combat-2' as CombatId,
        heroes: [],
        guardians: [],
        rounds: 1,
        locationPosition: { x: 5, y: 10 },
        locationName: 'Test Location',
        elementalModifiers: {
          Fire: 0,
          Water: 0,
          Earth: 0,
          Air: 0,
        },
      };

      const mockState = {
        hero: {
          tooHardNodes: ['5,10'],
          nodeTypePreferences: {
            cave: true,
            town: true,
            village: true,
            dungeon: true,
            castle: true,
          },
          lootRarityPreferences: getDefaultTestLootRarityPreferences(),
        },
      } as Partial<GameState>;

      vi.mocked(gamestate).mockReturnValue(mockState as GameState);

      handleCombatDefeat(combat);

      expect(updateGamestate).toHaveBeenCalled();
      const updateFunction = vi.mocked(updateGamestate).mock.calls[0][0];

      // Test that the update function doesn't add duplicates
      const testState = {
        hero: {
          tooHardNodes: ['5,10'],
        },
      } as Partial<GameState>;

      updateFunction(testState as GameState);
      expect(testState.hero?.tooHardNodes).toEqual(['5,10']);
    });
  });

  describe('heroLevelUp', () => {
    it('should clear tooHardNodes list when hero levels up', () => {
      const hero: Hero = {
        id: 'test-hero' as HeroId,
        name: 'Test Hero',
        level: 1,
        xp: 0,
        hp: 20,
        baseStats: { Force: 10, Health: 20, Speed: 2, Aura: 3 },
        totalStats: { Force: 10, Health: 20, Speed: 2, Aura: 3 },
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

      vi.mocked(randomChoice)
        .mockReturnValueOnce(2) // Force
        .mockReturnValueOnce(5) // Health
        .mockReturnValueOnce(0.3) // Speed
        .mockReturnValueOnce(1); // Aura

      vi.mocked(gamestate).mockReturnValue({
        hero: {
          heroes: [hero],
          tooHardNodes: ['1,1', '2,2', '3,3'],
          riskTolerance: 'medium',
          nodeTypePreferences: {
            cave: true,
            town: true,
            village: true,
            dungeon: true,
            castle: true,
          },
        },
      } as Partial<GameState> as GameState);

      heroLevelUp(hero);

      expect(updateGamestate).toHaveBeenCalledTimes(1);
      const updateFunction = vi.mocked(updateGamestate).mock.calls[0][0];

      // Test that the update function clears the tooHardNodes
      const testState = {
        hero: {
          tooHardNodes: ['1,1', '2,2', '3,3'],
        },
      } as Partial<GameState>;

      updateFunction(testState as GameState);
      expect(testState.hero?.tooHardNodes).toEqual([]);
    });
  });

  describe('getNodesWithinRiskTolerance', () => {
    it('should de-prioritize nodes that are in tooHardNodes list', () => {
      const baseNode: WorldLocation = {
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

      const validNode: WorldLocation = {
        id: 'valid-node',
        name: 'Valid Node',
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

      const tooHardNode: WorldLocation = {
        id: 'too-hard-node',
        name: 'Too Hard Node',
        x: 2,
        y: 2,
        elements: [],
        nodeType: 'cave',
        claimCount: 0,
        currentlyClaimed: false,
        encounterLevel: 3,
        guardianIds: [],
        claimLootIds: [],
        unclaimTime: 0,
        traitIds: [],
      };

      const highLevelNode: WorldLocation = {
        id: 'high-level-node',
        name: 'High Level Node',
        x: 3,
        y: 3,
        elements: [],
        nodeType: 'dungeon',
        claimCount: 0,
        currentlyClaimed: false,
        encounterLevel: 20,
        guardianIds: [],
        claimLootIds: [],
        unclaimTime: 0,
        traitIds: [],
      };

      vi.mocked(gamestate).mockReturnValue({
        hero: {
          riskTolerance: 'medium',
          heroes: [{ level: 5 } as Hero],
          tooHardNodes: ['2,2'],
          nodeTypePreferences: {
            cave: true,
            town: true,
            village: true,
            dungeon: true,
            castle: true,
          },
          lootRarityPreferences: getDefaultTestLootRarityPreferences(),
        },
      } as unknown as GameState);

      const availableNodes = [validNode, tooHardNode, highLevelNode];
      const result = getNodesMatchingHeroPreferences(baseNode, availableNodes);

      // Should include both validNode and tooHardNode, but exclude highLevelNode (too high level)
      expect(result).toContain(validNode);
      expect(result).toContain(tooHardNode);
      expect(result).not.toContain(highLevelNode);
      expect(result).toHaveLength(2);

      // Valid node should come before too hard node (de-prioritized)
      expect(result.indexOf(validNode)).toBeLessThan(
        result.indexOf(tooHardNode),
      );
    });

    it('should include previously too hard nodes if not in tooHardNodes list', () => {
      const baseNode: WorldLocation = {
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

      const validNode: WorldLocation = {
        id: 'valid-node',
        name: 'Valid Node',
        x: 2,
        y: 2,
        elements: [],
        nodeType: 'village',
        claimCount: 0,
        currentlyClaimed: false,
        encounterLevel: 5,
        guardianIds: [],
        claimLootIds: [],
        unclaimTime: 0,
        traitIds: [],
      };

      vi.mocked(gamestate).mockReturnValue({
        hero: {
          riskTolerance: 'medium',
          heroes: [{ level: 5 } as Hero],
          tooHardNodes: [], // Empty list, so node should be included normally
          nodeTypePreferences: {
            cave: true,
            town: true,
            village: true,
            dungeon: true,
            castle: true,
          },
          lootRarityPreferences: getDefaultTestLootRarityPreferences(),
        },
      } as unknown as GameState);

      const availableNodes = [validNode];
      const result = getNodesMatchingHeroPreferences(baseNode, availableNodes);

      expect(result).toContain(validNode);
      expect(result).toHaveLength(1);
    });

    it('should prioritize multiple nodes correctly based on too hard status', () => {
      const baseNode: WorldLocation = {
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

      const goodNode1: WorldLocation = {
        id: 'good-node-1',
        name: 'Good Node 1',
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

      const goodNode2: WorldLocation = {
        id: 'good-node-2',
        name: 'Good Node 2',
        x: 4,
        y: 4,
        elements: [],
        nodeType: 'village',
        claimCount: 0,
        currentlyClaimed: false,
        encounterLevel: 4,
        guardianIds: [],
        claimLootIds: [],
        unclaimTime: 0,
        traitIds: [],
      };

      const tooHardNode1: WorldLocation = {
        id: 'too-hard-node-1',
        name: 'Too Hard Node 1',
        x: 2,
        y: 2,
        elements: [],
        nodeType: 'cave',
        claimCount: 0,
        currentlyClaimed: false,
        encounterLevel: 3,
        guardianIds: [],
        claimLootIds: [],
        unclaimTime: 0,
        traitIds: [],
      };

      const tooHardNode2: WorldLocation = {
        id: 'too-hard-node-2',
        name: 'Too Hard Node 2',
        x: 3,
        y: 3,
        elements: [],
        nodeType: 'cave',
        claimCount: 0,
        currentlyClaimed: false,
        encounterLevel: 5,
        guardianIds: [],
        claimLootIds: [],
        unclaimTime: 0,
        traitIds: [],
      };

      vi.mocked(gamestate).mockReturnValue({
        hero: {
          riskTolerance: 'medium',
          heroes: [{ level: 5 } as Hero],
          tooHardNodes: ['2,2', '3,3'],
          nodeTypePreferences: {
            cave: true,
            town: true,
            village: true,
            dungeon: true,
            castle: true,
          },
          lootRarityPreferences: getDefaultTestLootRarityPreferences(),
        },
      } as unknown as GameState);

      const availableNodes = [tooHardNode1, goodNode1, tooHardNode2, goodNode2];
      const result = getNodesMatchingHeroPreferences(baseNode, availableNodes);

      // Should include all 4 nodes
      expect(result).toHaveLength(4);
      expect(result).toContain(goodNode1);
      expect(result).toContain(goodNode2);
      expect(result).toContain(tooHardNode1);
      expect(result).toContain(tooHardNode2);

      // Good nodes should come before too hard nodes
      const goodNode1Index = result.indexOf(goodNode1);
      const goodNode2Index = result.indexOf(goodNode2);
      const tooHardNode1Index = result.indexOf(tooHardNode1);
      const tooHardNode2Index = result.indexOf(tooHardNode2);

      expect(goodNode1Index).toBeLessThan(tooHardNode1Index);
      expect(goodNode1Index).toBeLessThan(tooHardNode2Index);
      expect(goodNode2Index).toBeLessThan(tooHardNode1Index);
      expect(goodNode2Index).toBeLessThan(tooHardNode2Index);
    });
  });
});
