import { addSkillToInventory, maxSkillInventorySize } from '@helpers/inventory-skill';
import type { EquipmentSkill, GameState } from '@interfaces';
import { describe, expect, it, beforeEach, vi } from 'vitest';

// Mock dependencies
vi.mock('@helpers/rng', () => ({
  uuid: vi.fn(() => 'mock-uuid'),
}));

vi.mock('@helpers/currency', () => ({
  gainCurrency: vi.fn(),
}));

vi.mock('@helpers/action-skill', () => ({
  skillSalvageValue: vi.fn(() => 10),
}));

// Mock state management
let mockGameState: GameState;

vi.mock('@helpers/state-game', () => ({
  gamestate: vi.fn(() => mockGameState),
  updateGamestate: vi.fn((callback) => {
    mockGameState = callback(mockGameState);
    return mockGameState;
  }),
}));

describe('Inventory Skill Management', () => {
  beforeEach(() => {
    // Reset mock game state
    mockGameState = {
      inventory: {
        items: [],
        skills: [],
      },
    } as GameState;
  });

  function createTestSkill(rarity: string, dropLevel: number): EquipmentSkill {
    return {
      id: `skill-${rarity}-${dropLevel}-${Math.random()}`,
      name: `Test ${rarity} Skill`,
      __type: 'skill',
      rarity: rarity as 'Common' | 'Uncommon' | 'Rare' | 'Mystical' | 'Legendary' | 'Unique',
      dropLevel,
      sprite: '',
      baseStats: {},
      elementMultipliers: [],
      cooldownTurns: 1,
      maxTargets: 1,
      targetFilter: 'Enemy',
      damageMultiplier: 1,
      healingMultiplier: 0,
      statusEffectIds: [],
      enchantLevel: 0,
    } as EquipmentSkill;
  }

  describe('addSkillToInventory when inventory has space', () => {
    it('should add skill to empty inventory', () => {
      const skill = createTestSkill('Common', 1);
      addSkillToInventory(skill);
      
      const inventory = mockGameState.inventory.skills;
      expect(inventory).toHaveLength(1);
      expect(inventory[0].id).toBe(skill.id);
    });

    it('should add multiple skills to inventory', () => {
      const skill1 = createTestSkill('Common', 1);
      const skill2 = createTestSkill('Rare', 2);
      
      addSkillToInventory(skill1);
      addSkillToInventory(skill2);
      
      const inventory = mockGameState.inventory.skills;
      expect(inventory).toHaveLength(2);
      expect(inventory.map(s => s.rarity)).toEqual(['Rare', 'Common']); // Sorted by rarity
    });
  });

  describe('addSkillToInventory when inventory is full', () => {
    beforeEach(() => {
      // Fill inventory to capacity
      const maxSize = maxSkillInventorySize();
      for (let i = 0; i < maxSize; i++) {
        const skill = createTestSkill('Common', 1);
        addSkillToInventory(skill);
      }
    });

    it('should have exactly max skills after filling', () => {
      const inventory = mockGameState.inventory.skills;
      expect(inventory).toHaveLength(maxSkillInventorySize());
    });

    it('should keep new skill and remove worst existing skill when new skill is better', () => {
      const newBetterSkill = createTestSkill('Legendary', 10);
      
      addSkillToInventory(newBetterSkill);
      
      const finalInventory = mockGameState.inventory.skills;
      expect(finalInventory).toHaveLength(maxSkillInventorySize());
      expect(finalInventory.some(s => s.id === newBetterSkill.id)).toBe(true);
      
      // The worst skill should be removed
      expect(finalInventory.filter(s => s.id !== newBetterSkill.id)).toHaveLength(maxSkillInventorySize() - 1);
    });

    it('should keep new skill and remove worst existing skill even when new skill is worse [CURRENT BUG]', () => {
      const initialInventory = [...mockGameState.inventory.skills];
      const worstExistingSkill = initialInventory[initialInventory.length - 1];
      const newWorseSkill = createTestSkill('Common', 0); // Worse than existing skills
      
      addSkillToInventory(newWorseSkill);
      
      const finalInventory = mockGameState.inventory.skills;
      expect(finalInventory).toHaveLength(maxSkillInventorySize());
      
      // The new skill should be kept (this is the bug we're fixing)
      expect(finalInventory.some(s => s.id === newWorseSkill.id)).toBe(true);
      
      // The previously worst skill should be removed
      expect(finalInventory.some(s => s.id === worstExistingSkill.id)).toBe(false);
    });
  });
});