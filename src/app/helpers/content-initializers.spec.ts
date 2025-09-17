import { ensureContent } from '@helpers/content-initializers';
import type {
  CombatantCombatStats,
  CurrencyContent,
  CurrencyId,
  ElementBlock,
  EquipmentElement,
  EquipmentItemContent,
  EquipmentItemId,
  EquipmentSkillContent,
  EquipmentSkillContentTechnique,
  EquipmentSkillId,
  EquipmentSkillTargetBehaviorData,
  EquipmentSkillTechniqueStatusEffectApplication,
  GuardianContent,
  GuardianId,
  LocationUpgradeContent,
  LocationUpgradeId,
  StatBlock,
  StatusEffectContent,
  StatusEffectId,
  TalentBoost,
  TalentContent,
  TalentId,
  TalentTownStats,
  TownUpgradeContent,
  TownUpgradeId,
  TraitEquipmentContent,
  TraitEquipmentId,
  TraitLocationContent,
  TraitLocationId,
  WorldConfigContent,
} from '@interfaces';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@helpers/defaults', () => ({
  defaultLocation: vi.fn(),
  defaultCurrencyBlock: vi.fn(() => {}),
  defaultStats: vi.fn(() => ({
    Force: 0,
    Health: 0,
    Speed: 0,
    Aura: 0,
  })),
  defaultAffinities: vi.fn(() => ({
    Air: 0,
    Earth: 0,
    Fire: 0,
    Water: 0,
  })),
}));

import { defaultCurrencyBlock } from '@helpers/defaults';

describe('content-initializers', () => {
  describe('ensureContent', () => {
    describe('worldconfig type', () => {
      it('should initialize worldconfig with all required defaults', () => {
        const partial: Partial<WorldConfigContent> = {
          __type: 'worldconfig',
          id: 'test-world',
        };

        const result = ensureContent(partial as WorldConfigContent);

        expect(result).toEqual({
          id: 'test-world',
          name: 'UNKNOWN',
          __type: 'worldconfig',
          width: 50,
          height: 50,
          maxLevel: 25,
          nodeCount: {
            castle: { min: 1, max: 10 },
            cave: { min: 1, max: 10 },
            dungeon: { min: 1, max: 10 },
            town: { min: 1, max: 2 },
            village: { min: 1, max: 3 },
          },
        });
      });

      it('should preserve existing worldconfig values', () => {
        const partial: WorldConfigContent = {
          id: 'custom-world',
          name: 'Custom World',
          __type: 'worldconfig',
          width: 100,
          height: 75,
          maxLevel: 50,
          nodeCount: {
            castle: { min: 2, max: 3 },
            cave: { min: 1, max: 2 },
            dungeon: { min: 2, max: 4 },
            town: { min: 3, max: 5 },
            village: { min: 5, max: 10 },
          },
        };

        const result = ensureContent(partial);

        expect(result).toEqual(partial);
      });
    });

    describe('currency type', () => {
      it('should initialize currency with all required defaults', () => {
        const partial: Partial<CurrencyContent> = {
          __type: 'currency',
          id: 'test-currency' as CurrencyId,
        };

        const result = ensureContent(partial as CurrencyContent);

        expect(result).toEqual({
          id: 'test-currency',
          name: 'UNKNOWN',
          __type: 'currency',
          value: 0,
        });
      });

      it('should preserve existing currency values', () => {
        const partial: CurrencyContent = {
          id: 'mana-currency' as CurrencyId,
          name: 'Mana',
          __type: 'currency',
          value: 100,
        };

        const result = ensureContent(partial);

        expect(result).toEqual(partial);
      });
    });

    describe('guardian type', () => {
      it('should initialize guardian with all required defaults', () => {
        const partial: Partial<GuardianContent> = {
          __type: 'guardian',
          id: 'test-guardian' as GuardianId,
        };

        const result = ensureContent(partial as GuardianContent);

        const expectedCombatStats: CombatantCombatStats = {
          repeatActionChance: { Air: 0, Earth: 0, Fire: 0, Water: 0 },
          skillStrikeAgainChance: { Air: 0, Earth: 0, Fire: 0, Water: 0 },
          skillAdditionalUseChance: { Air: 0, Earth: 0, Fire: 0, Water: 0 },
          skillAdditionalUseCount: { Air: 0, Earth: 0, Fire: 0, Water: 0 },
          redirectionChance: { Air: 0, Earth: 0, Fire: 0, Water: 0 },
          missChance: { Air: 0, Earth: 0, Fire: 0, Water: 0 },
          debuffIgnoreChance: { Air: 0, Earth: 0, Fire: 0, Water: 0 },
          damageReflectPercent: { Air: 0, Earth: 0, Fire: 0, Water: 0 },
          healingIgnorePercent: { Air: 0, Earth: 0, Fire: 0, Water: 0 },
          reviveChance: 0,
        };

        expect(result).toEqual({
          id: 'test-guardian',
          name: 'UNKNOWN',
          __type: 'guardian',
          frames: 1,
          sprite: '0000',
          minLevel: 1,
          targettingType: 'Random',
          statScaling: { Force: 0, Health: 0, Speed: 0, Aura: 0 },
          skillIds: [],
          resistance: { Air: 0, Earth: 0, Fire: 0, Water: 0 },
          affinity: { Air: 0, Earth: 0, Fire: 0, Water: 0 },
          talents: [],
          combatStats: expectedCombatStats,
        });
      });

      it('should preserve existing guardian values', () => {
        const partial: GuardianContent = {
          id: 'dragon' as GuardianId,
          name: 'Fire Dragon',
          __type: 'guardian',
          frames: 4,
          sprite: 'dragon-sprite',
          minLevel: 10,
          targettingType: 'Strongest',
          statScaling: { Force: 10, Health: 50, Speed: 5, Aura: 8 },
          skillIds: ['fireball' as EquipmentSkillId],
          resistance: { Air: 0, Earth: 0, Fire: 50, Water: -25 },
          affinity: { Air: 0, Earth: 0, Fire: 25, Water: 0 },
          talents: [{ talentId: 'fire-mastery' as TalentId, value: 3 }],
          combatStats: {
            repeatActionChance: { Air: 0, Earth: 0, Fire: 10, Water: 0 },
            skillStrikeAgainChance: { Air: 0, Earth: 0, Fire: 0, Water: 0 },
            skillAdditionalUseChance: { Air: 0, Earth: 0, Fire: 0, Water: 0 },
            skillAdditionalUseCount: { Air: 0, Earth: 0, Fire: 0, Water: 0 },
            redirectionChance: { Air: 0, Earth: 0, Fire: 0, Water: 0 },
            missChance: { Air: 0, Earth: 0, Fire: 0, Water: 0 },
            debuffIgnoreChance: { Air: 0, Earth: 0, Fire: 5, Water: 0 },
            damageReflectPercent: { Air: 0, Earth: 0, Fire: 0, Water: 0 },
            healingIgnorePercent: { Air: 0, Earth: 0, Fire: 0, Water: 0 },
            reviveChance: 0,
          },
        };

        const result = ensureContent(partial);

        expect(result).toEqual(partial);
      });
    });

    describe('skill type', () => {
      it('should initialize skill with all required defaults', () => {
        const partial: Partial<EquipmentSkillContent> = {
          __type: 'skill',
          id: 'test-skill' as EquipmentSkillId,
        };

        const result = ensureContent(partial as EquipmentSkillContent);

        expect(result).toEqual({
          id: 'test-skill',
          name: 'UNKNOWN',
          __type: 'skill',
          description: '',
          disableUpgrades: false,
          unableToUpgrade: [],
          sprite: '0000',
          frames: 1,
          rarity: 'Common',
          enchantLevel: 0,
          dropLevel: 0,
          preventDrop: false,
          preventModification: false,
          isFavorite: false,
          usesPerCombat: -1,
          numTargets: 0,
          damageScaling: { Force: 0, Health: 0, Speed: 0, Aura: 0 },
          statusEffectChanceBoost: {},
          statusEffectDurationBoost: {},
          techniques: [],
          symmetryCount: 0,
        });
      });

      it('should initialize skill with complex technique data', () => {
        const technique: Partial<EquipmentSkillContentTechnique> = {
          attributes: ['DamagesTarget'],
          elements: ['Fire'],
          targets: 3,
          statusEffects: [
            {
              statusEffectId: 'burn' as StatusEffectId,
              chance: 50,
            } as EquipmentSkillTechniqueStatusEffectApplication,
          ],
        };

        const partial: Partial<EquipmentSkillContent> = {
          __type: 'skill',
          id: 'fireball-skill' as EquipmentSkillId,
          name: 'Fireball',
          techniques: [technique as EquipmentSkillContentTechnique],
        };

        const result = ensureContent(partial as EquipmentSkillContent);

        const expectedTechnique: EquipmentSkillContentTechnique = {
          attributes: ['DamagesTarget'],
          elements: ['Fire'],
          targets: 3,
          targetType: 'Enemies',
          targetBehaviors: [{ behavior: 'NotZeroHealth' }],
          statusEffects: [
            {
              statusEffectId: 'burn' as StatusEffectId,
              chance: 50,
              duration: 0,
            },
          ],
          combatMessage: '',
          damageScaling: { Force: 0, Health: 0, Speed: 0, Aura: 0 },
        };

        expect(result.techniques).toEqual([expectedTechnique]);
      });
    });

    describe('equipment item type', () => {
      it('should initialize trinket equipment with all required defaults', () => {
        const partial: Partial<EquipmentItemContent> = {
          __type: 'trinket',
          id: 'test-trinket' as EquipmentItemId,
        };

        const result = ensureContent(partial as EquipmentItemContent);

        expect(result).toEqual({
          id: 'test-trinket',
          name: 'UNKNOWN',
          description: '',
          __type: 'trinket',
          unableToUpgrade: [],
          sprite: '0000',
          rarity: 'Common',
          dropLevel: 0,
          preventDrop: false,
          preventModification: false,
          isFavorite: false,
          enchantLevel: 0,
          baseStats: { Force: 0, Health: 0, Speed: 0, Aura: 0 },
          talentBoosts: [],
          elementMultipliers: [],
          traitIds: [],
          skillIds: [],
          symmetryCount: 0,
        });
      });

      it('should initialize weapon equipment with complex data', () => {
        const elementMultiplier: Partial<EquipmentElement> = {
          element: 'Fire',
          multiplier: 1.5,
        };

        const talentBoost: Partial<TalentBoost> = {
          talentId: 'sword-mastery' as TalentId,
          value: 2,
        };

        const partial: Partial<EquipmentItemContent> = {
          __type: 'weapon',
          id: 'fire-sword' as EquipmentItemId,
          name: 'Flaming Sword',
          baseStats: { Force: 15, Health: 0, Speed: 2, Aura: 1 },
          elementMultipliers: [elementMultiplier as EquipmentElement],
          talentBoosts: [talentBoost as TalentBoost],
          skillIds: ['sword-slash' as EquipmentSkillId],
        };

        const result = ensureContent(partial as EquipmentItemContent);

        expect(result.elementMultipliers).toEqual([
          {
            element: 'Fire',
            multiplier: 1.5,
          },
        ]);
        expect(result.talentBoosts).toEqual([
          {
            talentId: 'sword-mastery',
            value: 2,
          },
        ]);
        expect(result.baseStats).toEqual({
          Force: 15,
          Health: 0,
          Speed: 2,
          Aura: 1,
        });
      });
    });

    describe('trait location type', () => {
      it('should initialize trait location with all required defaults', () => {
        const partial: Partial<TraitLocationContent> = {
          __type: 'traitlocation',
          id: 'test-trait' as TraitLocationId,
        };

        const result = ensureContent(partial as TraitLocationContent);

        expect(result).toEqual({
          id: 'test-trait',
          name: 'UNKNOWN',
          __type: 'traitlocation',
          description: 'UNKNOWN',
          effects: {},
          rarity: 'Common',
        } as TraitLocationContent);
      });

      it('should preserve existing trait location values', () => {
        const partial: TraitLocationContent = {
          id: 'dangerous-caves' as TraitLocationId,
          name: 'Dangerous Caves',
          rarity: 'Rare',
          effects: {},
          __type: 'traitlocation',
          description: 'These caves are filled with powerful monsters',
        };

        const result = ensureContent(partial);

        expect(result).toEqual(partial);
      });
    });

    describe('talent type', () => {
      it('should initialize talent with all required defaults', () => {
        const partial: Partial<TalentContent> = {
          __type: 'talent',
          id: 'test-talent' as TalentId,
        };

        const result = ensureContent(partial as TalentContent);

        const expectedCombatStats: CombatantCombatStats = {
          repeatActionChance: { Air: 0, Earth: 0, Fire: 0, Water: 0 },
          skillStrikeAgainChance: { Air: 0, Earth: 0, Fire: 0, Water: 0 },
          skillAdditionalUseChance: { Air: 0, Earth: 0, Fire: 0, Water: 0 },
          skillAdditionalUseCount: { Air: 0, Earth: 0, Fire: 0, Water: 0 },
          redirectionChance: { Air: 0, Earth: 0, Fire: 0, Water: 0 },
          missChance: { Air: 0, Earth: 0, Fire: 0, Water: 0 },
          debuffIgnoreChance: { Air: 0, Earth: 0, Fire: 0, Water: 0 },
          damageReflectPercent: { Air: 0, Earth: 0, Fire: 0, Water: 0 },
          healingIgnorePercent: { Air: 0, Earth: 0, Fire: 0, Water: 0 },
          reviveChance: 0,
        };

        const expectedTownStats: TalentTownStats = {
          breakdownCurrencyBonus: 0,
          healOverTimeBonus: 0,
          marketTradeBonusPercent: 0,
          merchantFindItemBonus: 0,
        };

        expect(result).toEqual({
          id: 'test-talent' as TalentId,
          name: 'UNKNOWN',
          __type: 'talent',
          sprite: '0000',
          description: 'UNKNOWN',
          requireTalentId: '' as TalentId,
          addTechniques: [],
          additionalTargets: 0,
          applyStatusEffects: [],
          applyToAllSkills: false,
          applyToAllStatusEffects: false,
          applyToAttributes: [],
          applyToElements: [],
          applyToStatusEffectIds: [],
          applyToSkillIds: [],
          combatStats: expectedCombatStats,
          townStats: expectedTownStats,
          boostStats: {
            Aura: 0,
            Force: 0,
            Health: 0,
            Speed: 0,
          },
          boostStatusEffectStats: {
            Aura: 0,
            Force: 0,
            Health: 0,
            Speed: 0,
          },
          boostedStatusEffectChance: 0,
          boostedStatusEffectDuration: 0,
          chanceToIgnoreConsume: 0,
        } as TalentContent);
      });

      it('should preserve existing talent values with complex data', () => {
        const partial: TalentContent = {
          id: 'fire-mastery' as TalentId,
          name: 'Fire Mastery',
          __type: 'talent',
          sprite: 'fire-talent',
          description: 'Increases fire damage and effects',
          applyToAttributes: ['DamagesTarget'],
          applyToElements: ['Fire'],
          applyToStatusEffectIds: ['burn' as StatusEffectId],
          combatStats: {
            repeatActionChance: { Air: 0, Earth: 0, Fire: 5, Water: 0 },
            skillStrikeAgainChance: { Air: 0, Earth: 0, Fire: 0, Water: 0 },
            skillAdditionalUseChance: { Air: 0, Earth: 0, Fire: 0, Water: 0 },
            skillAdditionalUseCount: { Air: 0, Earth: 0, Fire: 0, Water: 0 },
            redirectionChance: { Air: 0, Earth: 0, Fire: 0, Water: 0 },
            missChance: { Air: 0, Earth: 0, Fire: 0, Water: 0 },
            debuffIgnoreChance: { Air: 0, Earth: 0, Fire: 10, Water: 0 },
            damageReflectPercent: { Air: 0, Earth: 0, Fire: 0, Water: 0 },
            healingIgnorePercent: { Air: 0, Earth: 0, Fire: 0, Water: 0 },
            reviveChance: 0,
          },
          townStats: {
            breakdownCurrencyBonus: 0,
            healOverTimeBonus: 0,
            marketTradeBonusPercent: 0,
            merchantFindItemBonus: 0,
          },
          additionalTargets: 0,
          addTechniques: [],
          applyStatusEffects: [],
          applyToAllSkills: false,
          applyToAllStatusEffects: false,
          applyToSkillIds: [],
          boostedStatusEffectChance: 0,
          boostedStatusEffectDuration: 0,
          boostStats: {
            Aura: 0,
            Force: 0,
            Health: 0,
            Speed: 0,
          },
          boostStatusEffectStats: {
            Aura: 0,
            Force: 0,
            Health: 0,
            Speed: 0,
          },
          chanceToIgnoreConsume: 0,
          requireTalentId: '' as TalentId,
        };

        const result = ensureContent(partial);

        expect(result).toEqual(partial);
      });
    });

    describe('status effect type', () => {
      it('should initialize status effect with all required defaults', () => {
        const partial: Partial<StatusEffectContent> = {
          __type: 'statuseffect',
          id: 'test-effect' as StatusEffectId,
        };

        const result = ensureContent(partial as StatusEffectContent);

        expect(result).toEqual({
          id: 'test-effect' as StatusEffectId,
          name: 'UNKNOWN',
          __type: 'statuseffect',
          effectType: 'Buff',
          trigger: 'TurnEnd',
          onApply: [],
          onTick: [],
          onUnapply: [],
          elements: [],
          statScaling: { Force: 0, Health: 0, Speed: 0, Aura: 0 },
          useTargetStats: false,
        } as StatusEffectContent);
      });

      it('should preserve existing status effect values', () => {
        const partial: StatusEffectContent = {
          id: 'poison' as StatusEffectId,
          name: 'Poison',
          __type: 'statuseffect',
          effectType: 'Debuff',
          elements: ['Earth'],
          statScaling: { Force: 0, Health: 0, Speed: 0, Aura: 0.5 },
          useTargetStats: false,
          onApply: [],
          onTick: [],
          onUnapply: [],
          trigger: 'TurnStart',
        };

        const result = ensureContent(partial);

        expect(result).toEqual(partial);
      });
    });

    describe('trait equipment type', () => {
      it('should initialize trait equipment with all required defaults', () => {
        const partial: Partial<TraitEquipmentContent> = {
          __type: 'traitequipment',
          id: 'test-trait' as TraitEquipmentId,
        };

        const result = ensureContent(partial as TraitEquipmentContent);

        expect(result).toEqual({
          id: 'test-trait',
          name: 'UNKNOWN',
          __type: 'traitequipment',
          description: 'UNKNOWN',
          rarity: 'Common',
          enchantLevel: 0,
          baseStats: { Force: 0, Health: 0, Speed: 0, Aura: 0 },
          elementMultipliers: [],
          skillIds: [],
          traitIds: [],
          talentBoosts: [],
          symmetryCount: 0,
        });
      });

      it('should preserve existing trait equipment values', () => {
        const partial: TraitEquipmentContent = {
          id: 'vampiric' as TraitEquipmentId,
          name: 'Vampiric',
          __type: 'traitequipment',
          description: 'Heals the wielder on successful attacks',
          rarity: 'Rare',
          enchantLevel: 3,
          baseStats: { Force: 2, Health: 5, Speed: 0, Aura: 1 },
          elementMultipliers: [],
          skillIds: ['life-drain' as EquipmentSkillId],
          traitIds: [],
          symmetryCount: 0,
          talentBoosts: [
            {
              talentId: 'life-steal' as TalentId,
              value: 1,
            },
          ],
        };

        const result = ensureContent(partial);

        expect(result).toEqual(partial);
      });
    });

    describe('town upgrade type', () => {
      it('should initialize town upgrade with all required defaults', () => {
        const partial: Partial<TownUpgradeContent> = {
          __type: 'townupgrade',
          id: 'test-upgrade' as TownUpgradeId,
          cost: defaultCurrencyBlock(),
        };

        const result = ensureContent(partial as TownUpgradeContent);

        expect(result).toEqual({
          id: 'test-upgrade' as TownUpgradeId,
          name: 'UNKNOWN',
          __type: 'townupgrade',
          description: 'UNKNOWN',
          cost: {
            ...defaultCurrencyBlock(),
          },
          levelRequirement: 1,
          appliesToTypes: [],
        } as TownUpgradeContent);
      });

      it('should preserve existing town upgrade values', () => {
        const partial: TownUpgradeContent = {
          id: 'blacksmith-upgrade' as TownUpgradeId,
          name: 'Blacksmith Forge',
          __type: 'townupgrade',
          description: 'Improves equipment enchanting capabilities',
          appliesToTypes: [],
          cost: {
            ...defaultCurrencyBlock(),
            'Air Core': 1,
          },
          levelRequirement: 5,
        };

        const result = ensureContent(partial);

        expect(result).toEqual(partial);
      });
    });

    describe('location upgrade type', () => {
      it('should initialize location upgrade with all required defaults', () => {
        const partial: Partial<LocationUpgradeContent> = {
          __type: 'locationupgrade',
          id: 'test-location-upgrade' as LocationUpgradeId,
        };

        const result = ensureContent(partial as LocationUpgradeContent);

        expect(result).toEqual({
          id: 'test-location-upgrade' as LocationUpgradeId,
          name: 'UNKNOWN',
          pairedLocationUpgradeId: '' as LocationUpgradeId,
          requireClaimType: '',
          __type: 'locationupgrade',
          description: 'UNKNOWN',
          appliesToTypes: [],
          baseCost: {
            ...defaultCurrencyBlock(),
          },
          boostedLootLevelPerLevel: 0,
          boostedProductionValuePercentPerLevel: 0,
          boostedTicksPerLevel: 0,
          boostedUnclaimableCount: 0,
          boostedDustProductionPerLevel: 0,
          boostedRebellionPerLevel: 0,
          costScalePerTile: 1,
          requiresTownUpgradeId: '' as TownUpgradeId,
        } as LocationUpgradeContent);
      });

      it('should preserve existing location upgrade values', () => {
        const partial: LocationUpgradeContent = {
          id: 'monster-den' as LocationUpgradeId,
          name: 'Monster Den',
          __type: 'locationupgrade',
          description: 'Attracts more powerful monsters',
          pairedLocationUpgradeId: 'monster-den-upgrade' as LocationUpgradeId,
          appliesToTypes: ['cave'],
          baseCost: {
            ...defaultCurrencyBlock(),
            Mana: 10,
          },
          boostedLootLevelPerLevel: 0,
          boostedProductionValuePercentPerLevel: 0,
          boostedTicksPerLevel: 0,
          boostedUnclaimableCount: 0,
          boostedDustProductionPerLevel: 0,
          boostedRebellionPerLevel: 0,
          costScalePerTile: 0,
          requireClaimType: '',
          requiresTownUpgradeId: 'monster-den-upgrade' as TownUpgradeId,
        };

        const result = ensureContent(partial);

        expect(result).toEqual(partial);
      });
    });

    describe('edge cases and type safety', () => {
      it('should handle undefined values in nested objects', () => {
        const partial: Partial<EquipmentSkillContent> = {
          __type: 'skill',
          id: 'test-skill' as EquipmentSkillId,
          techniques: [{} as EquipmentSkillContentTechnique],
        };

        const result = ensureContent(partial as EquipmentSkillContent);

        expect(result.techniques[0]).toEqual({
          attributes: [],
          elements: [],
          targets: 1,
          targetType: 'Enemies',
          targetBehaviors: [{ behavior: 'NotZeroHealth' }],
          statusEffects: [],
          combatMessage: '',
          damageScaling: { Force: 0, Health: 0, Speed: 0, Aura: 0 },
        } as EquipmentSkillContentTechnique);
      });

      it('should handle partial target behavior data', () => {
        const targetBehavior: Partial<EquipmentSkillTargetBehaviorData> = {
          behavior: 'IfStatusEffect',
          // statusEffectId is undefined
        };

        const technique: Partial<EquipmentSkillContentTechnique> = {
          targetBehaviors: [targetBehavior as EquipmentSkillTargetBehaviorData],
        };

        const partial: Partial<EquipmentSkillContent> = {
          __type: 'skill',
          id: 'test-skill' as EquipmentSkillId,
          techniques: [technique as EquipmentSkillContentTechnique],
        };

        const result = ensureContent(partial as EquipmentSkillContent);

        expect(result.techniques[0].targetBehaviors[0]).toEqual({
          behavior: 'IfStatusEffect',
        });
      });

      it('should handle partial status effect applications', () => {
        const statusEffect: Partial<EquipmentSkillTechniqueStatusEffectApplication> =
          {
            statusEffectId: 'burn' as StatusEffectId,
            // chance and duration are undefined
          };

        const technique: Partial<EquipmentSkillContentTechnique> = {
          statusEffects: [
            statusEffect as EquipmentSkillTechniqueStatusEffectApplication,
          ],
        };

        const partial: Partial<EquipmentSkillContent> = {
          __type: 'skill',
          id: 'test-skill' as EquipmentSkillId,
          techniques: [technique as EquipmentSkillContentTechnique],
        };

        const result = ensureContent(partial as EquipmentSkillContent);

        expect(result.techniques[0].statusEffects[0]).toEqual({
          statusEffectId: 'burn',
          chance: 0,
          duration: 0,
        });
      });

      it('should handle partial talent boosts', () => {
        const talentBoost: Partial<TalentBoost> = {
          talentId: 'test-talent' as TalentId,
          // value is undefined
        };

        const partial: Partial<EquipmentItemContent> = {
          __type: 'weapon',
          id: 'test-weapon' as EquipmentItemId,
          talentBoosts: [talentBoost as TalentBoost],
        };

        const result = ensureContent(partial as EquipmentItemContent);

        expect(result.talentBoosts[0]).toEqual({
          talentId: 'test-talent',
          value: 0,
        });
      });

      it('should handle partial element multipliers', () => {
        const elementMultiplier: Partial<EquipmentElement> = {
          element: 'Fire',
          // multiplier is undefined
        };

        const partial: Partial<EquipmentItemContent> = {
          __type: 'armor',
          id: 'test-armor' as EquipmentItemId,
          elementMultipliers: [elementMultiplier as EquipmentElement],
        };

        const result = ensureContent(partial as EquipmentItemContent);

        expect(result.elementMultipliers[0]).toEqual({
          element: 'Fire',
          multiplier: 0,
        });
      });

      it('should handle partial stat blocks', () => {
        const partialStats: Partial<StatBlock> = {
          Force: 10,
          // Health, Speed, Aura are undefined
        };

        const partial: Partial<GuardianContent> = {
          __type: 'guardian',
          id: 'test-guardian' as GuardianId,
          statScaling: partialStats as StatBlock,
        };

        const result = ensureContent(partial as GuardianContent);

        expect(result.statScaling).toEqual({
          Force: 10,
          Health: 0,
          Speed: 0,
          Aura: 0,
        });
      });

      it('should handle partial element blocks', () => {
        const partialElements: Partial<ElementBlock> = {
          Fire: 25,
          // Air, Earth, Water are undefined
        };

        const partial: Partial<GuardianContent> = {
          __type: 'guardian',
          id: 'test-guardian' as GuardianId,
          affinity: partialElements as ElementBlock,
        };

        const result = ensureContent(partial as GuardianContent);

        expect(result.affinity).toEqual({
          Air: 0,
          Earth: 0,
          Fire: 25,
          Water: 0,
        });
      });

      it('should handle partial combat stats', () => {
        const partialCombatStats: Partial<CombatantCombatStats> = {
          reviveChance: 15,
          missChance: { Fire: 10 } as ElementBlock,
          // Other properties are undefined
        };

        const partial: Partial<GuardianContent> = {
          __type: 'guardian',
          id: 'test-guardian' as GuardianId,
          combatStats: partialCombatStats as CombatantCombatStats,
        };

        const result = ensureContent(partial as GuardianContent);

        expect(result.combatStats.reviveChance).toBe(15);
        expect(result.combatStats.missChance).toEqual({
          Air: 0,
          Earth: 0,
          Fire: 10,
          Water: 0,
        });
        expect(result.combatStats.damageReflectPercent).toEqual({
          Air: 0,
          Earth: 0,
          Fire: 0,
          Water: 0,
        });
      });

      it('should handle partial town stats', () => {
        const partialTownStats: Partial<TalentTownStats> = {
          merchantFindItemBonus: 5,
          // Other properties are undefined
        };

        const partial: Partial<TalentContent> = {
          __type: 'talent',
          id: 'test-talent' as TalentId,
          townStats: partialTownStats as TalentTownStats,
        };

        const result = ensureContent(partial as TalentContent);

        expect(result.townStats).toEqual({
          breakdownCurrencyBonus: 0,
          healOverTimeBonus: 0,
          marketTradeBonusPercent: 0,
          merchantFindItemBonus: 5,
        });
      });
    });

    describe('type-specific edge cases', () => {
      it('should handle skill with multiple techniques and complex data', () => {
        const technique1: Partial<EquipmentSkillContentTechnique> = {
          attributes: ['DamagesTarget', 'BypassDefense'],
          elements: ['Fire', 'Air'],
          targets: 2,
          targetType: 'Enemies',
          statusEffects: [
            {
              statusEffectId: 'burn' as StatusEffectId,
              chance: 75,
              duration: 3,
            },
            {
              statusEffectId: 'stun' as StatusEffectId,
              chance: 25,
            } as EquipmentSkillTechniqueStatusEffectApplication,
          ],
        };

        const technique2: Partial<EquipmentSkillContentTechnique> = {
          attributes: ['HealsTarget'],
          targetType: 'Allies',
        };

        const partial: Partial<EquipmentSkillContent> = {
          __type: 'skill',
          id: 'complex-skill' as EquipmentSkillId,
          name: 'Complex Skill',
          techniques: [
            technique1 as EquipmentSkillContentTechnique,
            technique2 as EquipmentSkillContentTechnique,
          ],
          usesPerCombat: 3,
          statusEffectChanceBoost: {
            ['burn' as StatusEffectId]: 0.1,
          },
          statusEffectDurationBoost: {
            ['burn' as StatusEffectId]: 1,
          },
        };

        const result = ensureContent(partial as EquipmentSkillContent);

        expect(result.techniques).toHaveLength(2);
        expect(result.techniques[0].statusEffects).toEqual([
          {
            statusEffectId: 'burn',
            chance: 75,
            duration: 3,
          },
          {
            statusEffectId: 'stun',
            chance: 25,
            duration: 0,
          },
        ]);
        expect(result.techniques[1].attributes).toEqual(['HealsTarget']);
        expect(result.techniques[1].targetType).toBe('Allies');
      });

      it('should handle equipment with all slot types', () => {
        const basePartial = {
          name: 'Test Item',
          baseStats: { Force: 5, Health: 5, Speed: 5, Aura: 5 },
          id: 'test-item' as EquipmentItemId,
        };

        const accessory = ensureContent({
          ...basePartial,
          __type: 'accessory' as const,
        });
        const armor = ensureContent({
          ...basePartial,
          __type: 'armor' as const,
        });
        const trinket = ensureContent({
          ...basePartial,
          __type: 'trinket' as const,
        });
        const weapon = ensureContent({
          ...basePartial,
          __type: 'weapon' as const,
        });

        expect(accessory.__type).toBe('accessory');
        expect(armor.__type).toBe('armor');
        expect(trinket.__type).toBe('trinket');
        expect(weapon.__type).toBe('weapon');

        // All should have same base structure
        [accessory, armor, trinket, weapon].forEach((item) => {
          expect(item.baseStats).toEqual({
            Force: 5,
            Health: 5,
            Speed: 5,
            Aura: 5,
          });
          expect(item.name).toBe('Test Item');
        });
      });

      it('should handle guardian with all targeting types', () => {
        const basePartial = {
          __type: 'guardian' as const,
          name: 'Test Guardian',
        };

        const randomGuardian = ensureContent({
          ...basePartial,
          id: 'random-guardian' as GuardianId,
          targettingType: 'Random' as const,
        });

        const strongestGuardian = ensureContent({
          ...basePartial,
          id: 'strongest-guardian' as GuardianId,
          targettingType: 'Strongest' as const,
        });

        const weakestGuardian = ensureContent({
          ...basePartial,
          id: 'weakest-guardian' as GuardianId,
          targettingType: 'Weakest' as const,
        });

        expect(randomGuardian.targettingType).toBe('Random');
        expect(strongestGuardian.targettingType).toBe('Strongest');
        expect(weakestGuardian.targettingType).toBe('Weakest');
      });

      it('should handle status effect with all effect types and triggers', () => {
        const buffEffect = ensureContent({
          __type: 'statuseffect' as const,
          id: 'buff-effect' as StatusEffectId,
          effectType: 'Buff' as const,
          trigger: 'StartOfTurn' as const,
        } as unknown as StatusEffectContent);

        const debuffEffect = ensureContent({
          __type: 'statuseffect' as const,
          id: 'debuff-effect' as StatusEffectId,
          effectType: 'Debuff' as const,
          trigger: 'EndOfTurn' as const,
        } as unknown as StatusEffectContent);

        const neutralEffect = ensureContent({
          __type: 'statuseffect' as const,
          id: 'neutral-effect' as StatusEffectId,
          effectType: 'Neutral' as const,
          trigger: 'OnApply' as const,
        } as unknown as StatusEffectContent);

        expect(buffEffect.effectType).toBe('Buff');
        expect(buffEffect.trigger).toBe('StartOfTurn');
        expect(debuffEffect.effectType).toBe('Debuff');
        expect(debuffEffect.trigger).toBe('EndOfTurn');
        expect(neutralEffect.effectType).toBe('Neutral');
        expect(neutralEffect.trigger).toBe('OnApply');
      });
    });
  });
});
