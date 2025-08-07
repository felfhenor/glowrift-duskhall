import { handleCombatDefeat } from '@helpers/combat-end';
import { heroLevelUp } from '@helpers/hero-xp';
import { getNodesWithinRiskTolerance } from '@helpers/world';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Combat, Hero, HeroId, WorldLocation } from '@interfaces';

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
        heroes: [],
        guardians: [],
        rounds: 1,
        locationPosition: { x: 5, y: 10 },
        messages: [],
      };

      const mockState = {
        hero: {
          tooHardNodes: ['1,2'],
        },
      };

      vi.mocked(gamestate).mockReturnValue(mockState);

      handleCombatDefeat(combat);

      expect(updateGamestate).toHaveBeenCalled();
      const updateFunction = vi.mocked(updateGamestate).mock.calls[0][0];
      
      // Test that the update function adds the node correctly
      const testState = {
        hero: {
          tooHardNodes: ['1,2'],
        },
      };
      
      updateFunction(testState);
      expect(testState.hero.tooHardNodes).toContain('5,10');
    });

    it('should not add duplicate nodes to tooHardNodes list', () => {
      const combat: Combat = {
        heroes: [],
        guardians: [],
        rounds: 1,
        locationPosition: { x: 5, y: 10 },
        messages: [],
      };

      const mockState = {
        hero: {
          tooHardNodes: ['5,10'],
        },
      };

      vi.mocked(gamestate).mockReturnValue(mockState);

      handleCombatDefeat(combat);

      expect(updateGamestate).toHaveBeenCalled();
      const updateFunction = vi.mocked(updateGamestate).mock.calls[0][0];
      
      // Test that the update function doesn't add duplicates
      const testState = {
        hero: {
          tooHardNodes: ['5,10'],
        },
      };
      
      updateFunction(testState);
      expect(testState.hero.tooHardNodes).toEqual(['5,10']);
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
        },
      });

      heroLevelUp(hero);

      expect(updateGamestate).toHaveBeenCalledTimes(1);
      const updateFunction = vi.mocked(updateGamestate).mock.calls[0][0];
      
      // Test that the update function clears the tooHardNodes
      const testState = {
        hero: {
          tooHardNodes: ['1,1', '2,2', '3,3'],
        },
      };
      
      updateFunction(testState);
      expect(testState.hero.tooHardNodes).toEqual([]);
    });
  });

  describe('getNodesWithinRiskTolerance', () => {
    it('should filter out nodes that are in tooHardNodes list', () => {
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
          heroes: [{ level: 5 }],
          tooHardNodes: ['2,2'],
        },
      });

      const availableNodes = [validNode, tooHardNode, highLevelNode];
      const result = getNodesWithinRiskTolerance(baseNode, availableNodes);

      // Should include validNode but exclude tooHardNode and highLevelNode
      expect(result).toContain(validNode);
      expect(result).not.toContain(tooHardNode);
      expect(result).not.toContain(highLevelNode);
      expect(result).toHaveLength(1);
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
          heroes: [{ level: 5 }],
          tooHardNodes: [], // Empty list, so node should be included
        },
      });

      const availableNodes = [validNode];
      const result = getNodesWithinRiskTolerance(baseNode, availableNodes);

      expect(result).toContain(validNode);
      expect(result).toHaveLength(1);
    });
  });
});