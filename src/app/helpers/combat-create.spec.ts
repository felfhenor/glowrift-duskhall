import { combatGenerateForLocation } from '@helpers/combat-create';
import type {
  EquipmentSkill,
  EquipmentSkillId,
  Guardian,
  GuardianContent,
  GuardianId,
  Hero,
  HeroId,
  TalentId,
  WorldLocation,
} from '@interfaces';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock all dependencies
vi.mock('@helpers/content', () => ({
  getEntry: vi.fn(),
}));

vi.mock('@helpers/defaults', () => ({
  defaultAffinities: vi.fn(() => ({
    Air: 0,
    Earth: 0,
    Fire: 0,
    Water: 0,
  })),
  defaultStats: vi.fn(() => ({
    Force: 0,
    Health: 0,
    Speed: 0,
    Aura: 0,
  })),
}));

vi.mock('@helpers/guardian', () => ({
  guardianCreateForLocation: vi.fn(),
}));

vi.mock('@helpers/hero', () => ({
  allHeroes: vi.fn(),
  heroGetName: vi.fn((h: Hero) => h.name),
}));

vi.mock('@helpers/hero-skills', () => ({
  heroEquipmentSkills: vi.fn(),
}));

vi.mock('@helpers/hero-stats', () => ({
  heroElements: vi.fn(),
}));

vi.mock('@helpers/hero-talent', () => ({
  heroFullTalentHash: vi.fn(),
}));

vi.mock('@helpers/rng', () => ({
  rngUuid: vi.fn(),
}));

vi.mock('@helpers/skill', () => ({
  skillCreateForHero: vi.fn(),
}));

vi.mock('@helpers/talent', () => ({
  talentCombineIntoCombatStats: vi.fn(),
  talentsForHero: vi.fn(),
}));

vi.mock('@helpers/trait-location-combat', () => ({
  locationTraitCombatElementPercentageModifier: vi.fn(),
}));

import { getEntry } from '@helpers/content';
import { guardianCreateForLocation } from '@helpers/guardian';
import { allHeroes } from '@helpers/hero';
import { heroEquipmentSkills } from '@helpers/hero-skills';
import { heroElements } from '@helpers/hero-stats';
import { heroFullTalentHash } from '@helpers/hero-talent';
import { rngUuid } from '@helpers/rng';
import { skillCreateForHero } from '@helpers/skill';
import { talentCombineIntoCombatStats, talentsForHero } from '@helpers/talent';
import { locationTraitCombatElementPercentageModifier } from '@helpers/trait-location-combat';

describe('combat-create', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('combatGenerateForLocation', () => {
    it('should generate combat with no heroes and no guardians', () => {
      // Arrange
      const location: WorldLocation = {
        id: 'test-location',
        name: 'Test Location',
        x: 5,
        y: 10,
        encounterLevel: 1,
        guardianIds: [],
        elements: [],
        currentlyClaimed: false,
        claimCount: 0,
        unclaimTime: 0,
        claimLootIds: [],
        traitIds: [],
        locationUpgrades: {},
      };

      vi.mocked(allHeroes).mockReturnValue([]);
      vi.mocked(rngUuid).mockReturnValue('combat-id-123');
      vi.mocked(locationTraitCombatElementPercentageModifier).mockReturnValue(
        0,
      );

      // Act
      const result = combatGenerateForLocation(location);

      // Assert
      expect(result).toEqual({
        id: 'combat-id-123',
        locationName: 'Test Location',
        locationPosition: { x: 5, y: 10 },
        rounds: 0,
        heroes: [],
        guardians: [],
        elementalModifiers: {
          Fire: 0,
          Air: 0,
          Water: 0,
          Earth: 0,
        },
      });
    });

    it('should generate combat with heroes but no guardians', () => {
      // Arrange
      const mockHero: Hero = {
        id: 'hero-1' as HeroId,
        name: 'Test Hero',
        level: 5,
        xp: 100,
        hp: 50,
        baseStats: { Force: 10, Health: 50, Speed: 8, Aura: 6 },
        totalStats: { Force: 15, Health: 60, Speed: 10, Aura: 8 },
        equipment: {
          accessory: undefined,
          armor: undefined,
          trinket: undefined,
          weapon: undefined,
        },
        skills: [],
        talents: {},
        sprite: 'hero-sprite',
        frames: 1,
        targettingType: 'Random',
      };

      const mockSkill: EquipmentSkill = {
        id: 'skill-1' as EquipmentSkillId,
        name: 'Test Skill',
        __type: 'skill',
        sprite: 'skill-sprite',
        frames: 1,
        rarity: 'Common',
        enchantLevel: 0,
        dropLevel: 1,
        preventDrop: false,
        preventModification: false,
        isFavorite: false,
        disableUpgrades: false,
        unableToUpgrade: [],
        usesPerCombat: -1,
        numTargets: 1,
        damageScaling: { Force: 1, Health: 0, Speed: 0, Aura: 0 },
        statusEffectChanceBoost: {},
        statusEffectDurationBoost: {},
        techniques: [],
      };

      const location: WorldLocation = {
        id: 'test-location',
        name: 'Test Location',
        x: 5,
        y: 10,
        encounterLevel: 1,
        guardianIds: [],
        elements: [],
        currentlyClaimed: false,
        claimCount: 0,
        unclaimTime: 0,
        claimLootIds: [],
        traitIds: [],
        locationUpgrades: {},
      };

      vi.mocked(allHeroes).mockReturnValue([mockHero]);
      vi.mocked(heroEquipmentSkills).mockReturnValue([
        'weapon-skill' as EquipmentSkillId,
      ]);
      vi.mocked(skillCreateForHero).mockReturnValue(mockSkill);
      vi.mocked(heroFullTalentHash).mockReturnValue({});
      vi.mocked(talentsForHero).mockReturnValue([]);
      vi.mocked(talentCombineIntoCombatStats).mockReturnValue({
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
      });
      vi.mocked(heroElements).mockReturnValue({
        Air: 5,
        Earth: 0,
        Fire: 10,
        Water: 0,
      });
      vi.mocked(rngUuid).mockReturnValue('combat-id-123');
      vi.mocked(locationTraitCombatElementPercentageModifier).mockReturnValue(
        0,
      );

      // Act
      const result = combatGenerateForLocation(location);

      // Assert
      expect(result.heroes).toHaveLength(1);
      const hero = result.heroes[0];
      expect(hero.id).toBe('hero-1');
      expect(hero.name).toBe('Test Hero');
      expect(hero.isEnemy).toBe(false);
      expect(hero.targettingType).toBe('Random');
      expect(hero.baseStats).toEqual({
        Force: 10,
        Health: 50,
        Speed: 8,
        Aura: 6,
      });
      expect(hero.statBoosts).toEqual({
        Force: 0,
        Health: 0,
        Speed: 0,
        Aura: 0,
      });
      expect(hero.totalStats).toEqual({
        Force: 15,
        Health: 60,
        Speed: 10,
        Aura: 8,
      });
      expect(hero.hp).toBe(50);
      expect(hero.level).toBe(5);
      expect(hero.sprite).toBe('hero-sprite');
      expect(hero.frames).toBe(1);
      expect(hero.skillIds).toEqual(['Attack', 'weapon-skill']);
      expect(hero.skillRefs).toEqual([]); // Empty because hero.skills is empty
      expect(hero.talents).toEqual({});
      expect(hero.combatStats).toBeDefined();
      expect(hero.affinity).toEqual({ Air: 5, Earth: 0, Fire: 10, Water: 0 });
      expect(hero.resistance).toEqual({ Air: 0, Earth: 0, Fire: 0, Water: 0 });
      expect(hero.skillUses).toEqual({});
      expect(hero.statusEffects).toEqual([]);
      expect(hero.statusEffectData).toEqual({});
    });

    it('should generate combat with guardians but no heroes', () => {
      // Arrange
      const location: WorldLocation = {
        id: 'test-location',
        name: 'Test Location',
        x: 5,
        y: 10,
        encounterLevel: 3,
        guardianIds: ['guardian-1' as GuardianId],
        elements: [],
        currentlyClaimed: false,
        claimCount: 0,
        unclaimTime: 0,
        claimLootIds: [],
        traitIds: [],
        locationUpgrades: {},
      };

      const mockGuardianContent: GuardianContent = {
        id: 'guardian-1' as GuardianId,
        name: 'Test Guardian',
        __type: 'guardian',
        sprite: 'guardian-sprite',
        frames: 2,
        minLevel: 1,
        targettingType: 'Strongest',
        statScaling: { Force: 2, Health: 10, Speed: 1, Aura: 1 },
        skillIds: ['guardian-skill' as EquipmentSkillId],
        resistance: { Air: 0, Earth: 0, Fire: 25, Water: -10 },
        affinity: { Air: 0, Earth: 0, Fire: 15, Water: 0 },
        talents: [{ talentId: 'fire-mastery' as TalentId, value: 2 }],
        combatStats: {
          repeatActionChance: { Air: 0, Earth: 0, Fire: 5, Water: 0 },
          skillStrikeAgainChance: { Air: 0, Earth: 0, Fire: 0, Water: 0 },
          skillAdditionalUseChance: { Air: 0, Earth: 0, Fire: 0, Water: 0 },
          skillAdditionalUseCount: { Air: 0, Earth: 0, Fire: 0, Water: 0 },
          redirectionChance: { Air: 0, Earth: 0, Fire: 0, Water: 0 },
          missChance: { Air: 0, Earth: 0, Fire: 0, Water: 0 },
          debuffIgnoreChance: { Air: 0, Earth: 0, Fire: 0, Water: 0 },
          damageReflectPercent: { Air: 0, Earth: 0, Fire: 0, Water: 0 },
          healingIgnorePercent: { Air: 0, Earth: 0, Fire: 0, Water: 0 },
          reviveChance: 0,
        },
      };

      const mockGuardian: Guardian = {
        ...mockGuardianContent,
        hp: 30,
        stats: { Force: 6, Health: 30, Speed: 3, Aura: 3 },
      };

      vi.mocked(allHeroes).mockReturnValue([]);
      vi.mocked(getEntry).mockReturnValue(mockGuardianContent);
      vi.mocked(guardianCreateForLocation).mockReturnValue(mockGuardian);
      vi.mocked(rngUuid).mockReturnValue('combat-id-456');
      vi.mocked(locationTraitCombatElementPercentageModifier).mockReturnValue(
        0,
      );

      // Act
      const result = combatGenerateForLocation(location);

      // Assert
      expect(result.guardians).toHaveLength(1);
      const guardian = result.guardians[0];
      expect(guardian.id).toBe('guardian-1');
      expect(guardian.name).toBe('Test Guardian Lv.3 [A]');
      expect(guardian.isEnemy).toBe(true);
      expect(guardian.targettingType).toBe('Strongest');
      expect(guardian.baseStats).toEqual({
        Force: 6,
        Health: 30,
        Speed: 3,
        Aura: 3,
      });
      expect(guardian.statBoosts).toEqual({
        Force: 0,
        Health: 0,
        Speed: 0,
        Aura: 0,
      });
      expect(guardian.totalStats).toEqual({
        Force: 6,
        Health: 30,
        Speed: 3,
        Aura: 3,
      });
      expect(guardian.hp).toBe(30);
      expect(guardian.level).toBe(3);
      expect(guardian.sprite).toBe('guardian-sprite');
      expect(guardian.frames).toBe(2);
      expect(guardian.skillIds).toEqual(['Attack', 'guardian-skill']);
      expect(guardian.skillRefs).toEqual([]);
      expect(guardian.talents).toEqual({ 'fire-mastery': 2 });
      expect(guardian.combatStats).toBeDefined();
      expect(guardian.affinity).toEqual({
        Air: 0,
        Earth: 0,
        Fire: 15,
        Water: 0,
      });
      expect(guardian.resistance).toEqual({
        Air: 0,
        Earth: 0,
        Fire: 25,
        Water: -10,
      });
      expect(guardian.skillUses).toEqual({});
      expect(guardian.statusEffects).toEqual([]);
      expect(guardian.statusEffectData).toEqual({});
    });

    it('should generate combat with multiple guardians and proper naming', () => {
      // Arrange
      const location: WorldLocation = {
        id: 'test-location',
        name: 'Test Location',
        x: 5,
        y: 10,
        encounterLevel: 2,
        guardianIds: ['guardian-1' as GuardianId, 'guardian-2' as GuardianId],
        elements: [],
        currentlyClaimed: false,
        claimCount: 0,
        unclaimTime: 0,
        claimLootIds: [],
        traitIds: [],
        locationUpgrades: {},
      };

      const mockGuardianContent: GuardianContent = {
        id: 'guardian-1' as GuardianId,
        name: 'Test Guardian',
        __type: 'guardian',
        sprite: 'guardian-sprite',
        frames: 1,
        minLevel: 1,
        targettingType: 'Random',
        statScaling: { Force: 1, Health: 5, Speed: 1, Aura: 1 },
        skillIds: [],
        resistance: { Air: 0, Earth: 0, Fire: 0, Water: 0 },
        affinity: { Air: 0, Earth: 0, Fire: 0, Water: 0 },
        talents: [],
        combatStats: {
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
        },
      };

      const mockGuardian: Guardian = {
        ...mockGuardianContent,
        hp: 10,
        stats: { Force: 2, Health: 10, Speed: 2, Aura: 2 },
      };

      vi.mocked(allHeroes).mockReturnValue([]);
      vi.mocked(getEntry).mockReturnValue(mockGuardianContent);
      vi.mocked(guardianCreateForLocation).mockReturnValue(mockGuardian);
      vi.mocked(rngUuid).mockReturnValue('combat-id-789');
      vi.mocked(locationTraitCombatElementPercentageModifier).mockReturnValue(
        0,
      );

      // Act
      const result = combatGenerateForLocation(location);

      // Assert
      expect(result.guardians).toHaveLength(2);
      expect(result.guardians[0].name).toBe('Test Guardian Lv.2 [A]');
      expect(result.guardians[1].name).toBe('Test Guardian Lv.2 [B]');
    });

    it('should handle guardians with talents correctly', () => {
      // Arrange
      const location: WorldLocation = {
        id: 'test-location',
        name: 'Test Location',
        x: 5,
        y: 10,
        encounterLevel: 1,
        guardianIds: ['guardian-1' as GuardianId],
        elements: [],
        currentlyClaimed: false,
        claimCount: 0,
        unclaimTime: 0,
        claimLootIds: [],
        traitIds: [],
        locationUpgrades: {},
      };

      const mockGuardianContent: GuardianContent = {
        id: 'guardian-1' as GuardianId,
        name: 'Talented Guardian',
        __type: 'guardian',
        sprite: 'guardian-sprite',
        frames: 1,
        minLevel: 1,
        targettingType: 'Random',
        statScaling: { Force: 1, Health: 5, Speed: 1, Aura: 1 },
        skillIds: [],
        resistance: { Air: 0, Earth: 0, Fire: 0, Water: 0 },
        affinity: { Air: 0, Earth: 0, Fire: 0, Water: 0 },
        talents: [
          { talentId: 'talent-1' as TalentId, value: 3 },
          { talentId: 'talent-2' as TalentId, value: 2 },
          { talentId: 'talent-1' as TalentId, value: 1 }, // Duplicate to test accumulation
        ],
        combatStats: {
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
        },
      };

      const mockGuardian: Guardian = {
        ...mockGuardianContent,
        hp: 5,
        stats: { Force: 1, Health: 5, Speed: 1, Aura: 1 },
      };

      vi.mocked(allHeroes).mockReturnValue([]);
      vi.mocked(getEntry).mockReturnValue(mockGuardianContent);
      vi.mocked(guardianCreateForLocation).mockReturnValue(mockGuardian);
      vi.mocked(rngUuid).mockReturnValue('combat-id-talents');
      vi.mocked(locationTraitCombatElementPercentageModifier).mockReturnValue(
        0,
      );

      // Act
      const result = combatGenerateForLocation(location);

      // Assert
      expect(result.guardians[0].talents).toEqual({
        'talent-1': 4, // 3 + 1
        'talent-2': 2,
      });
    });

    it('should filter out null guardians from getEntry', () => {
      // Arrange
      const location: WorldLocation = {
        id: 'test-location',
        name: 'Test Location',
        x: 5,
        y: 10,
        encounterLevel: 1,
        guardianIds: ['guardian-1' as GuardianId, 'guardian-2' as GuardianId],
        elements: [],
        currentlyClaimed: false,
        claimCount: 0,
        unclaimTime: 0,
        claimLootIds: [],
        traitIds: [],
        locationUpgrades: {},
      };

      vi.mocked(allHeroes).mockReturnValue([]);
      vi.mocked(getEntry)
        .mockReturnValueOnce(undefined)
        .mockReturnValueOnce(undefined);
      vi.mocked(rngUuid).mockReturnValue('combat-id-null');
      vi.mocked(locationTraitCombatElementPercentageModifier).mockReturnValue(
        0,
      );

      // Act
      const result = combatGenerateForLocation(location);

      // Assert
      expect(result.guardians).toHaveLength(0);
    });

    it('should apply elemental modifiers from location traits', () => {
      // Arrange
      const location: WorldLocation = {
        id: 'test-location',
        name: 'Elemental Location',
        x: 5,
        y: 10,
        encounterLevel: 1,
        guardianIds: [],
        elements: [],
        currentlyClaimed: false,
        claimCount: 0,
        unclaimTime: 0,
        claimLootIds: [],
        traitIds: [],
        locationUpgrades: {},
      };

      vi.mocked(allHeroes).mockReturnValue([]);
      vi.mocked(rngUuid).mockReturnValue('combat-id-elemental');
      vi.mocked(locationTraitCombatElementPercentageModifier)
        .mockReturnValueOnce(0.15) // Fire
        .mockReturnValueOnce(0.05) // Air
        .mockReturnValueOnce(-0.1) // Water
        .mockReturnValueOnce(0.2); // Earth

      // Act
      const result = combatGenerateForLocation(location);

      // Assert
      expect(result.elementalModifiers).toEqual({
        Fire: 0.15,
        Air: 0.05,
        Water: -0.1,
        Earth: 0.2,
      });
    });

    it('should handle heroes with multiple skills', () => {
      // Arrange
      const mockHero: Hero = {
        id: 'hero-1' as HeroId,
        name: 'Multi-Skill Hero',
        level: 5,
        xp: 100,
        hp: 50,
        baseStats: { Force: 10, Health: 50, Speed: 8, Aura: 6 },
        totalStats: { Force: 15, Health: 60, Speed: 10, Aura: 8 },
        equipment: {
          accessory: undefined,
          armor: undefined,
          trinket: undefined,
          weapon: undefined,
        },
        skills: [
          {
            id: 'skill-1' as EquipmentSkillId,
            name: 'Skill 1',
            __type: 'skill',
            sprite: 'skill-1',
            frames: 1,
            rarity: 'Common',
            enchantLevel: 0,
            dropLevel: 1,
            preventDrop: false,
            preventModification: false,
            isFavorite: false,
            disableUpgrades: false,
            unableToUpgrade: [],
            usesPerCombat: -1,
            numTargets: 1,
            damageScaling: { Force: 1, Health: 0, Speed: 0, Aura: 0 },
            statusEffectChanceBoost: {},
            statusEffectDurationBoost: {},
            techniques: [],
          },
          {
            id: 'skill-2' as EquipmentSkillId,
            name: 'Skill 2',
            __type: 'skill',
            sprite: 'skill-2',
            frames: 1,
            rarity: 'Common',
            enchantLevel: 0,
            dropLevel: 1,
            preventDrop: false,
            preventModification: false,
            isFavorite: false,
            disableUpgrades: false,
            unableToUpgrade: [],
            usesPerCombat: 3,
            numTargets: 2,
            damageScaling: { Force: 0, Health: 0, Speed: 0, Aura: 1 },
            statusEffectChanceBoost: {},
            statusEffectDurationBoost: {},
            techniques: [],
          },
          undefined, // Test filtering of null skills
        ],
        talents: {},
        sprite: 'hero-sprite',
        frames: 1,
        targettingType: 'Random',
      };

      const location: WorldLocation = {
        id: 'test-location',
        name: 'Test Location',
        x: 5,
        y: 10,
        encounterLevel: 1,
        guardianIds: [],
        elements: [],
        currentlyClaimed: false,
        claimCount: 0,
        unclaimTime: 0,
        claimLootIds: [],
        traitIds: [],
        locationUpgrades: {},
      };

      vi.mocked(allHeroes).mockReturnValue([mockHero]);
      vi.mocked(heroEquipmentSkills).mockReturnValue([]);
      vi.mocked(skillCreateForHero)
        .mockReturnValueOnce(mockHero.skills[0]!)
        .mockReturnValueOnce(mockHero.skills[1]!);
      vi.mocked(heroFullTalentHash).mockReturnValue({});
      vi.mocked(talentsForHero).mockReturnValue([]);
      vi.mocked(talentCombineIntoCombatStats).mockReturnValue({
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
      });
      vi.mocked(heroElements).mockReturnValue({
        Air: 0,
        Earth: 0,
        Fire: 0,
        Water: 0,
      });
      vi.mocked(rngUuid).mockReturnValue('combat-id-multi-skill');
      vi.mocked(locationTraitCombatElementPercentageModifier).mockReturnValue(
        0,
      );

      // Act
      const result = combatGenerateForLocation(location);

      // Assert
      expect(result.heroes[0].skillRefs).toHaveLength(2);
      expect(result.heroes[0].skillRefs[0]).toEqual(mockHero.skills[0]);
      expect(result.heroes[0].skillRefs[1]).toEqual(mockHero.skills[1]);
    });

    it('should generate complete combat data structure', () => {
      // Arrange
      const location: WorldLocation = {
        id: 'complete-location',
        name: 'Complete Test Location',
        x: 15,
        y: 25,
        encounterLevel: 10,
        guardianIds: [],
        elements: [],
        currentlyClaimed: false,
        claimCount: 0,
        unclaimTime: 0,
        claimLootIds: [],
        traitIds: [],
        locationUpgrades: {},
      };

      vi.mocked(allHeroes).mockReturnValue([]);
      vi.mocked(rngUuid).mockReturnValue('complete-combat-id');
      vi.mocked(locationTraitCombatElementPercentageModifier).mockReturnValue(
        0,
      );

      // Act
      const result = combatGenerateForLocation(location);

      // Assert
      expect(result).toEqual({
        id: 'complete-combat-id',
        locationName: 'Complete Test Location',
        locationPosition: { x: 15, y: 25 },
        rounds: 0,
        heroes: [],
        guardians: [],
        elementalModifiers: {
          Fire: 0,
          Air: 0,
          Water: 0,
          Earth: 0,
        },
      });

      // Verify all mocks were called correctly
      expect(allHeroes).toHaveBeenCalledTimes(1);
      expect(rngUuid).toHaveBeenCalledTimes(1);
      expect(
        locationTraitCombatElementPercentageModifier,
      ).toHaveBeenCalledTimes(4);
      expect(locationTraitCombatElementPercentageModifier).toHaveBeenCalledWith(
        location,
        'Fire',
      );
      expect(locationTraitCombatElementPercentageModifier).toHaveBeenCalledWith(
        location,
        'Air',
      );
      expect(locationTraitCombatElementPercentageModifier).toHaveBeenCalledWith(
        location,
        'Water',
      );
      expect(locationTraitCombatElementPercentageModifier).toHaveBeenCalledWith(
        location,
        'Earth',
      );
    });

    it('should create deep clones of hero data to avoid mutation', () => {
      // Arrange
      const mockHero: Hero = {
        id: 'hero-1' as HeroId,
        name: 'Clone Test Hero',
        level: 5,
        xp: 100,
        hp: 50,
        baseStats: { Force: 10, Health: 50, Speed: 8, Aura: 6 },
        totalStats: { Force: 15, Health: 60, Speed: 10, Aura: 8 },
        equipment: {
          accessory: undefined,
          armor: undefined,
          trinket: undefined,
          weapon: undefined,
        },
        skills: [],
        talents: { ['talent-1' as TalentId]: 2 },
        sprite: 'hero-sprite',
        frames: 1,
        targettingType: 'Random',
      };

      const location: WorldLocation = {
        id: 'test-location',
        name: 'Test Location',
        x: 5,
        y: 10,
        encounterLevel: 1,
        guardianIds: [],
        elements: [],
        currentlyClaimed: false,
        claimCount: 0,
        unclaimTime: 0,
        claimLootIds: [],
        traitIds: [],
        locationUpgrades: {},
      };

      vi.mocked(allHeroes).mockReturnValue([mockHero]);
      vi.mocked(heroEquipmentSkills).mockReturnValue([]);
      vi.mocked(heroFullTalentHash).mockReturnValue({
        ['talent-1' as TalentId]: 2,
      });
      vi.mocked(talentsForHero).mockReturnValue([]);
      vi.mocked(talentCombineIntoCombatStats).mockReturnValue({
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
      });
      vi.mocked(heroElements).mockReturnValue({
        Air: 0,
        Earth: 0,
        Fire: 0,
        Water: 0,
      });
      vi.mocked(rngUuid).mockReturnValue('combat-id-clone-test');
      vi.mocked(locationTraitCombatElementPercentageModifier).mockReturnValue(
        0,
      );

      // Act
      const result = combatGenerateForLocation(location);

      // Assert - Verify that stats are cloned, not referenced
      const combatant = result.heroes[0];
      expect(combatant.baseStats).not.toBe(mockHero.baseStats);
      expect(combatant.totalStats).not.toBe(mockHero.totalStats);
      expect(combatant.baseStats).toEqual(mockHero.baseStats);
      expect(combatant.totalStats).toEqual(mockHero.totalStats);

      // Modify the original hero stats to ensure they're not linked
      mockHero.baseStats.Force = 999;
      expect(combatant.baseStats.Force).toBe(10); // Should still be original value
    });
  });
});
