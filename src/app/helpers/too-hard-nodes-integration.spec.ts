import { handleCombatDefeat } from '@helpers/combat-end';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type {
  Combat,
  GameState,
  Hero,
  HeroId,
  WorldLocation,
} from '@interfaces';

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
  let mockState: GameState;
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
        nodeTypePreferences: {
          cave: true,
          town: true,
          village: true,
          dungeon: true,
          castle: true,
        },
      },
    };

    vi.mocked(gamestate).mockReturnValue(mockState);
    vi.mocked(updateGamestate).mockImplementation((updateFn) => {
      updateFn(mockState);
    });
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
