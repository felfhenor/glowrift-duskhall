import {
  combatElementsSucceedsElementCombatStatChance,
  combatSkillAverageValueByElements,
  combatSkillSucceedsElementCombatStatChance,
} from '@helpers/combat-stats';
import type { Combatant, CombatantCombatStats } from '@interfaces/combat';
import type {
  EquipmentSkill,
  EquipmentSkillId,
} from '@interfaces/content-skill';
import type { ElementBlock, GameElement } from '@interfaces/element';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dependencies
vi.mock('@helpers/rng', () => ({
  rngSucceedsChance: vi.fn(),
}));

vi.mock('@helpers/skill', () => ({
  skillElements: vi.fn(),
}));

import { rngSucceedsChance } from '@helpers/rng';
import { skillElements } from '@helpers/skill';

describe('Combat Stats Functions', () => {
  let mockCombatant: Combatant;
  let mockSkill: EquipmentSkill;
  let mockElementBlock: ElementBlock;
  let mockCombatStats: CombatantCombatStats;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create a complete ElementBlock
    mockElementBlock = {
      Fire: 25,
      Water: 30,
      Earth: 15,
      Air: 20,
    };

    // Create complete CombatantCombatStats with all 10 properties
    mockCombatStats = {
      repeatActionChance: { ...mockElementBlock },
      skillStrikeAgainChance: { ...mockElementBlock },
      skillAdditionalUseChance: { ...mockElementBlock },
      skillAdditionalUseCount: { ...mockElementBlock },
      redirectionChance: { ...mockElementBlock },
      missChance: { ...mockElementBlock },
      debuffIgnoreChance: { ...mockElementBlock },
      damageReflectPercent: { ...mockElementBlock },
      healingIgnorePercent: { ...mockElementBlock },
      reviveChance: 10,
    };

    // Create complete Combatant implementing all required interfaces
    mockCombatant = {
      // From Animatable interface
      frames: 4,

      // From Combatant interface
      id: 'combatant-1',
      name: 'Test Combatant',
      sprite: 'combatant-sprite',
      isEnemy: false,
      level: 10,
      hp: 85,
      targettingType: 'Random',
      baseStats: {
        Force: 50,
        Health: 100,
        Speed: 75,
        Aura: 60,
      },
      statBoosts: {
        Force: 0,
        Health: 0,
        Speed: 0,
        Aura: 0,
      },
      totalStats: {
        Force: 50,
        Health: 100,
        Speed: 75,
        Aura: 60,
      },
      combatStats: mockCombatStats,
      resistance: { ...mockElementBlock },
      affinity: { ...mockElementBlock },
      skillIds: [],
      skillRefs: [],
      talents: {},
      skillUses: {},
      statusEffects: [],
      statusEffectData: {},
    };

    // Create complete EquipmentSkill
    mockSkill = {
      id: 'skill-1' as EquipmentSkillId,
      name: 'Test Skill',
      __type: 'skill',
      sprite: 'skill-sprite',
      frames: 1,
      rarity: 'Common',
      dropLevel: 5,
      enchantLevel: 0,
      techniques: [
        {
          targets: 1,
          targetType: 'Enemies',
          targetBehaviors: [{ behavior: 'NotZeroHealth' }],
          elements: ['Fire', 'Earth'],
          attributes: ['DamagesTarget'],
          damageScaling: {
            Force: 1.0,
            Health: 0,
            Speed: 0,
            Aura: 0.5,
          },
          statusEffects: [],
          combatMessage: '',
        },
      ],
      usesPerCombat: -1,
      numTargets: 1,
      damageScaling: {
        Force: 1.0,
        Health: 0,
        Speed: 0,
        Aura: 0.5,
      },
      statusEffectDurationBoost: {},
      statusEffectChanceBoost: {},
      disableUpgrades: false,
      unableToUpgrade: [],
      mods: {
        enchantLevel: 0,
        techniques: [],
        usesPerCombat: 0,
        numTargets: 0,
        damageScaling: {
          Force: 0,
          Health: 0,
          Speed: 0,
          Aura: 0,
        },
        statusEffectDurationBoost: {},
        statusEffectChanceBoost: {},
      },
    };
  });

  describe('combatElementsSucceedsElementCombatStatChance', () => {
    it('should return true if any element succeeds the chance check', () => {
      const elements: GameElement[] = ['Fire', 'Water'];
      vi.mocked(rngSucceedsChance)
        .mockReturnValueOnce(false) // Fire fails
        .mockReturnValueOnce(true); // Water succeeds

      const result = combatElementsSucceedsElementCombatStatChance(
        elements,
        mockCombatant,
        'repeatActionChance',
      );

      expect(result).toBe(true);
      expect(rngSucceedsChance).toHaveBeenCalledTimes(2);
      expect(rngSucceedsChance).toHaveBeenNthCalledWith(1, 25); // Fire value
      expect(rngSucceedsChance).toHaveBeenNthCalledWith(2, 30); // Water value
    });

    it('should return false if no elements succeed the chance check', () => {
      const elements: GameElement[] = ['Fire', 'Water'];
      vi.mocked(rngSucceedsChance)
        .mockReturnValueOnce(false) // Fire fails
        .mockReturnValueOnce(false); // Water fails

      const result = combatElementsSucceedsElementCombatStatChance(
        elements,
        mockCombatant,
        'skillStrikeAgainChance',
      );

      expect(result).toBe(false);
      expect(rngSucceedsChance).toHaveBeenCalledTimes(2);
    });

    it('should return true on first successful element (short-circuit)', () => {
      const elements: GameElement[] = ['Fire', 'Water', 'Earth'];
      vi.mocked(rngSucceedsChance).mockReturnValueOnce(true); // Fire succeeds, should short-circuit

      const result = combatElementsSucceedsElementCombatStatChance(
        elements,
        mockCombatant,
        'missChance',
      );

      expect(result).toBe(true);
      expect(rngSucceedsChance).toHaveBeenCalledTimes(1); // Only called once due to short-circuit
      expect(rngSucceedsChance).toHaveBeenCalledWith(25); // Fire value
    });

    it('should work with single element', () => {
      const elements: GameElement[] = ['Earth'];
      vi.mocked(rngSucceedsChance).mockReturnValueOnce(true);

      const result = combatElementsSucceedsElementCombatStatChance(
        elements,
        mockCombatant,
        'debuffIgnoreChance',
      );

      expect(result).toBe(true);
      expect(rngSucceedsChance).toHaveBeenCalledWith(15); // Earth value
    });

    it('should work with empty elements array', () => {
      const elements: GameElement[] = [];

      const result = combatElementsSucceedsElementCombatStatChance(
        elements,
        mockCombatant,
        'damageReflectPercent',
      );

      expect(result).toBe(false);
      expect(rngSucceedsChance).not.toHaveBeenCalled();
    });

    it('should work with different combat stat properties', () => {
      const elements: GameElement[] = ['Air'];
      vi.mocked(rngSucceedsChance).mockReturnValueOnce(true);

      // Test different stat property
      const result = combatElementsSucceedsElementCombatStatChance(
        elements,
        mockCombatant,
        'skillAdditionalUseChance',
      );

      expect(result).toBe(true);
      expect(rngSucceedsChance).toHaveBeenCalledWith(20); // Air value from skillAdditionalUseChance
    });

    it('should handle all four elements', () => {
      const elements: GameElement[] = ['Fire', 'Water', 'Earth', 'Air'];
      vi.mocked(rngSucceedsChance)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true); // Air succeeds

      const result = combatElementsSucceedsElementCombatStatChance(
        elements,
        mockCombatant,
        'redirectionChance',
      );

      expect(result).toBe(true);
      expect(rngSucceedsChance).toHaveBeenCalledTimes(4);
    });
  });

  describe('combatSkillSucceedsElementCombatStatChance', () => {
    it('should use skill elements to check success', () => {
      const skillElementsValue: GameElement[] = ['Fire', 'Water'];
      vi.mocked(skillElements).mockReturnValue(skillElementsValue);
      vi.mocked(rngSucceedsChance).mockReturnValue(true);

      const result = combatSkillSucceedsElementCombatStatChance(
        mockSkill,
        mockCombatant,
        'healingIgnorePercent',
      );

      expect(result).toBe(true);
      expect(skillElements).toHaveBeenCalledWith(mockSkill);
      expect(rngSucceedsChance).toHaveBeenCalledWith(25); // Fire value
    });

    it('should delegate to combatElementsSucceedsElementCombatStatChance', () => {
      const skillElementsValue: GameElement[] = ['Earth'];
      vi.mocked(skillElements).mockReturnValue(skillElementsValue);
      vi.mocked(rngSucceedsChance).mockReturnValue(false);

      const result = combatSkillSucceedsElementCombatStatChance(
        mockSkill,
        mockCombatant,
        'skillAdditionalUseCount',
      );

      expect(result).toBe(false);
      expect(skillElements).toHaveBeenCalledWith(mockSkill);
      expect(rngSucceedsChance).toHaveBeenCalledWith(15); // Earth value
    });

    it('should work with skill having multiple elements', () => {
      const skillElementsValue: GameElement[] = ['Fire', 'Air', 'Water'];
      vi.mocked(skillElements).mockReturnValue(skillElementsValue);
      vi.mocked(rngSucceedsChance)
        .mockReturnValueOnce(false) // Fire fails
        .mockReturnValueOnce(true); // Air succeeds

      const result = combatSkillSucceedsElementCombatStatChance(
        mockSkill,
        mockCombatant,
        'damageReflectPercent',
      );

      expect(result).toBe(true);
      expect(rngSucceedsChance).toHaveBeenCalledTimes(2);
    });

    it('should work with skill having no elements', () => {
      vi.mocked(skillElements).mockReturnValue([]);

      const result = combatSkillSucceedsElementCombatStatChance(
        mockSkill,
        mockCombatant,
        'missChance',
      );

      expect(result).toBe(false);
      expect(skillElements).toHaveBeenCalledWith(mockSkill);
      expect(rngSucceedsChance).not.toHaveBeenCalled();
    });

    it('should work with different combat stats', () => {
      const skillElementsValue: GameElement[] = ['Water'];
      vi.mocked(skillElements).mockReturnValue(skillElementsValue);
      vi.mocked(rngSucceedsChance).mockReturnValue(true);

      const result = combatSkillSucceedsElementCombatStatChance(
        mockSkill,
        mockCombatant,
        'redirectionChance',
      );

      expect(result).toBe(true);
      expect(rngSucceedsChance).toHaveBeenCalledWith(30); // Water value from redirectionChance
    });
  });

  describe('combatSkillAverageValueByElements', () => {
    it('should calculate correct average for multiple elements', () => {
      const elements: GameElement[] = ['Fire', 'Water'];
      // Fire: 25, Water: 30, Average: (25 + 30) / 2 = 27.5

      const result = combatSkillAverageValueByElements(
        mockCombatant,
        elements,
        'healingIgnorePercent',
      );

      expect(result).toBe(27.5);
    });

    it('should return single value for single element', () => {
      const elements: GameElement[] = ['Earth'];
      // Earth: 15

      const result = combatSkillAverageValueByElements(
        mockCombatant,
        elements,
        'skillStrikeAgainChance',
      );

      expect(result).toBe(15);
    });

    it('should calculate average for all four elements', () => {
      const elements: GameElement[] = ['Fire', 'Water', 'Earth', 'Air'];
      // Fire: 25, Water: 30, Earth: 15, Air: 20
      // Average: (25 + 30 + 15 + 20) / 4 = 90 / 4 = 22.5

      const result = combatSkillAverageValueByElements(
        mockCombatant,
        elements,
        'damageReflectPercent',
      );

      expect(result).toBe(22.5);
    });

    it('should work with different combat stat properties', () => {
      const elements: GameElement[] = ['Fire', 'Air'];
      // Fire: 25, Air: 20, Average: (25 + 20) / 2 = 22.5

      const result = combatSkillAverageValueByElements(
        mockCombatant,
        elements,
        'missChance',
      );

      expect(result).toBe(22.5);
    });

    it('should handle empty elements array', () => {
      const elements: GameElement[] = [];

      const result = combatSkillAverageValueByElements(
        mockCombatant,
        elements,
        'debuffIgnoreChance',
      );

      // meanBy returns NaN for empty array
      expect(result).toBeNaN();
    });

    it('should work with different ElementBlock values for different stats', () => {
      // Modify combat stats to have different values for a specific stat
      mockCombatant.combatStats.skillAdditionalUseCount = {
        Fire: 100,
        Water: 200,
        Earth: 300,
        Air: 400,
      };

      const elements: GameElement[] = ['Water', 'Earth'];
      // Water: 200, Earth: 300, Average: (200 + 300) / 2 = 250

      const result = combatSkillAverageValueByElements(
        mockCombatant,
        elements,
        'skillAdditionalUseCount',
      );

      expect(result).toBe(250);
    });

    it('should calculate average with decimal precision', () => {
      // Set up values that will result in a decimal average
      mockCombatant.combatStats.redirectionChance = {
        Fire: 10,
        Water: 15,
        Earth: 20,
        Air: 25,
      };

      const elements: GameElement[] = ['Fire', 'Water', 'Earth'];
      // Fire: 10, Water: 15, Earth: 20
      // Average: (10 + 15 + 20) / 3 = 45 / 3 = 15

      const result = combatSkillAverageValueByElements(
        mockCombatant,
        elements,
        'redirectionChance',
      );

      expect(result).toBe(15);
    });

    it('should work with uneven averages', () => {
      mockCombatant.combatStats.missChance = {
        Fire: 1,
        Water: 2,
        Earth: 3,
        Air: 5,
      };

      const elements: GameElement[] = ['Fire', 'Water'];
      // Fire: 1, Water: 2, Average: (1 + 2) / 2 = 1.5

      const result = combatSkillAverageValueByElements(
        mockCombatant,
        elements,
        'missChance',
      );

      expect(result).toBe(1.5);
    });
  });
});
