import { createStatusEffect, applyStatDeltaToCombatant } from '@helpers/combat-statuseffects';
import type {
  Combatant,
  EquipmentSkill,
  StatusEffectContent,
} from '@interfaces';
import type { StatusEffectId } from '@interfaces/content-statuseffect';
import type { EquipmentSkillId } from '@interfaces/content-skill';
import type { GameElement } from '@interfaces/element';
import type { GameStat } from '@interfaces/stat';
import { describe, expect, it, beforeEach, vi } from 'vitest';

// Mock the uuid function to avoid state-game dependencies
vi.mock('@helpers/rng', () => ({
  uuid: () => 'test-uuid',
  randomrng: () => () => 0.5,
  seededrng: () => () => 0.5,
  gamerng: () => () => 0.5,
  succeedsChance: () => true,
}));

describe('Combat Status Effects', () => {
  let caster: Combatant;
  let ally1: Combatant;
  let ally2: Combatant;
  let stonemistSkill: EquipmentSkill;
  let fortifiedStatusEffect: StatusEffectContent;

  beforeEach(() => {
    // Create base combatant structure
    const baseCombatant = {
      name: '',
      id: '',
      hp: 100,
      isEnemy: false,
      totalStats: {
        Force: 10,
        Health: 100,
        Speed: 5,
        Aura: 20,
      },
      statBoosts: {
        Force: 0,
        Health: 0,
        Speed: 0,
        Aura: 0,
      },
      statusEffects: [],
      statusEffectData: {
        isFrozen: false,
      },
      skillUses: {},
      affinity: {
        Fire: 0,
        Water: 0,
        Earth: 0,
        Air: 0,
      },
      resistance: {
        Fire: 1,
        Water: 1,
        Earth: 1,
        Air: 1,
      },
      combatStats: {
        debuffIgnoreChance: {
          Fire: 0,
          Water: 0,
          Earth: 0,
          Air: 0,
        },
        damageReflectPercent: {
          Fire: 0,
          Water: 0,
          Earth: 0,
          Air: 0,
        },
        missChance: {
          Fire: 0,
          Water: 0,
          Earth: 0,
          Air: 0,
        },
        skillStrikeAgainChance: {
          Fire: 0,
          Water: 0,
          Earth: 0,
          Air: 0,
        },
        skillAdditionalUseChance: {
          Fire: 0,
          Water: 0,
          Earth: 0,
          Air: 0,
        },
        skillAdditionalUseCount: {
          Fire: 0,
          Water: 0,
          Earth: 0,
          Air: 0,
        },
        repeatActionChance: {
          Fire: 0,
          Water: 0,
          Earth: 0,
          Air: 0,
        },
        reviveChance: 0,
      },
      talents: {},
      targettingType: 'Random' as const,
    };

    // Create caster and allies
    caster = {
      ...baseCombatant,
      name: 'Caster',
      id: 'caster-1',
    };

    ally1 = {
      ...baseCombatant,
      name: 'Ally1',
      id: 'ally-1',
    };

    ally2 = {
      ...baseCombatant,
      name: 'Ally2', 
      id: 'ally-2',
    };

    // Create Stonemist III skill (simplified)
    stonemistSkill = {
      id: '45ad27c9-c975-4cba-9d1b-ff71198aa57c' as EquipmentSkillId,
      name: 'Stonemist III',
      __type: 'skill',
      sprite: '0358',
      frames: 6,
      rarity: 'Mystical',
      dropLevel: 28,
      usesPerCombat: 3,
      techniques: [
        {
          elements: ['Earth'] as GameElement[],
          targets: 3,
          targetType: 'Allies',
          targetBehaviors: [],
          statusEffects: [
            {
              statusEffectId: 'dfbe0520-8e83-41ce-997b-369c051bd67b' as StatusEffectId,
              chance: 100,
              duration: 5,
            },
          ],
          combatMessage: '**{{ combatant.name }}** cast **{{ skill.name }}** on **{{ target.name }}**.',
        },
      ],
    } as EquipmentSkill;

    // Create Fortified status effect (simplified)
    fortifiedStatusEffect = {
      id: 'dfbe0520-8e83-41ce-997b-369c051bd67b' as StatusEffectId,
      name: 'Fortified',
      __type: 'statuseffect',
      effectType: 'Buff',
      elements: ['Earth'] as GameElement[],
      trigger: 'TurnStart',
      statScaling: {
        Force: 0,
        Health: 0,
        Speed: 0,
        Aura: 0.5,
      },
      useTargetStats: false,
      onApply: [
        {
          type: 'AddDamageToStat',
          combatMessage: '**{{ combatant.name }}** has been fortified (+{{ damage }} Aura)!',
          modifyStat: 'Aura' as GameStat,
        },
      ],
      onTick: [],
      onUnapply: [
        {
          type: 'TakeDamageFromStat',
          combatMessage: '**{{ combatant.name }}** has lost their fortification (-{{ damage }} Aura)!',
          modifyStat: 'Aura' as GameStat,
        },
      ],
    } as StatusEffectContent;
  });

  describe('Stat Buff Consistency Issue', () => {
    it('should apply the same buff amount to all targets when self-buffing changes caster stats', () => {
      // Arrange: Caster has 20 Aura, so 0.5 * 20 = 10 expected buff for each target
      const expectedBuffAmount = 10;

      // Capture the caster's original stats (simulating the fix)
      const capturedCreatorStats = { ...caster.totalStats };

      // Act: Simulate applying Stonemist III to caster, then ally1, then ally2
      // Now using the captured stats for all applications

      // First target (caster gets fortified)
      const statusEffect1 = createStatusEffect(
        fortifiedStatusEffect,
        stonemistSkill,
        caster,
        caster,
        { duration: 5 },
        capturedCreatorStats, // Use captured stats
      );
      
      // Record initial buff amount
      const firstTargetBuffAmount = Math.floor(
        statusEffect1.creatorStats.Aura * fortifiedStatusEffect.statScaling.Aura
      );

      // Apply the stat boost to the caster (this simulates the old bug behavior)
      applyStatDeltaToCombatant(caster, 'Aura', firstTargetBuffAmount);

      // Second target (ally1 gets fortified, using captured stats instead of current stats)
      const statusEffect2 = createStatusEffect(
        fortifiedStatusEffect,
        stonemistSkill,
        caster, // Same caster, but now with boosted stats
        ally1,
        { duration: 5 },
        capturedCreatorStats, // Use captured stats - this is the fix
      );

      const secondTargetBuffAmount = Math.floor(
        statusEffect2.creatorStats.Aura * fortifiedStatusEffect.statScaling.Aura
      );

      // Apply the stat boost to the caster again
      applyStatDeltaToCombatant(caster, 'Aura', secondTargetBuffAmount);

      // Third target (ally2 gets fortified, using captured stats)
      const statusEffect3 = createStatusEffect(
        fortifiedStatusEffect,
        stonemistSkill,
        caster, // Same caster, but now with even more boosted stats
        ally2,
        { duration: 5 },
        capturedCreatorStats, // Use captured stats - this is the fix
      );

      const thirdTargetBuffAmount = Math.floor(
        statusEffect3.creatorStats.Aura * fortifiedStatusEffect.statScaling.Aura
      );

      // Assert: All buff amounts should be the same now that we use captured stats
      console.log('First target buff:', firstTargetBuffAmount);
      console.log('Second target buff:', secondTargetBuffAmount);
      console.log('Third target buff:', thirdTargetBuffAmount);
      console.log('Expected buff amount:', expectedBuffAmount);

      // With the fix, all values should be the same
      expect(firstTargetBuffAmount).toBe(expectedBuffAmount);
      expect(secondTargetBuffAmount).toBe(expectedBuffAmount);
      expect(thirdTargetBuffAmount).toBe(expectedBuffAmount);

      // All buff amounts should be identical
      expect(firstTargetBuffAmount).toBe(secondTargetBuffAmount);
      expect(secondTargetBuffAmount).toBe(thirdTargetBuffAmount);
    });

    it('should still apply escalating buffs without captured stats (proving the old behavior)', () => {
      // This test proves the old behavior still happens when we don't provide captured stats
      
      // Act: Apply effects without captured stats
      const statusEffect1 = createStatusEffect(
        fortifiedStatusEffect,
        stonemistSkill,
        caster,
        caster,
        { duration: 5 },
        // No captured stats - uses current behavior
      );
      
      const firstBuffAmount = Math.floor(
        statusEffect1.creatorStats.Aura * fortifiedStatusEffect.statScaling.Aura
      );
      
      applyStatDeltaToCombatant(caster, 'Aura', firstBuffAmount);
      
      const statusEffect2 = createStatusEffect(
        fortifiedStatusEffect,
        stonemistSkill,
        caster,
        ally1,
        { duration: 5 },
        // No captured stats - uses current behavior
      );
      
      const secondBuffAmount = Math.floor(
        statusEffect2.creatorStats.Aura * fortifiedStatusEffect.statScaling.Aura
      );

      // Assert: Should still show the escalating behavior
      expect(firstBuffAmount).toBe(10); // 20 * 0.5
      expect(secondBuffAmount).toBe(15); // (20 + 10) * 0.5
      expect(firstBuffAmount).not.toBe(secondBuffAmount);
    });
  });
});