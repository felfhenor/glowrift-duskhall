import { describe, expect, it } from 'vitest';

// Import the function under test
import { heroEquipmentSkills } from '@helpers/hero-skills';

// Import types
import type {
  EquipmentItem,
  EquipmentItemId,
} from '@interfaces/content-equipment';
import type { EquipmentSkillId } from '@interfaces/content-skill';
import type { Hero, HeroId } from '@interfaces/hero';

describe('Hero Skills Functions', () => {
  describe('heroEquipmentSkills', () => {
    const createMockEquipmentItem = (
      skillIds: EquipmentSkillId[] = [],
    ): EquipmentItem => ({
      id: 'item-1' as EquipmentItemId,
      name: 'Test Item',
      __type: 'weapon',
      sprite: 'sprite-1',
      rarity: 'Common',
      dropLevel: 1,
      enchantLevel: 0,
      preventDrop: false,
      preventModification: false,
      isFavorite: false,
      unableToUpgrade: [],
      baseStats: {
        Force: 0,
        Health: 0,
        Speed: 0,
        Aura: 0,
      },
      talentBoosts: [],
      elementMultipliers: [],
      traitIds: [],
      skillIds,
    });

    const createMockHero = (
      equipment: Partial<Hero['equipment']> = {},
    ): Hero => ({
      id: 'hero-1' as HeroId,
      name: 'Test Hero',
      sprite: 'hero-sprite',
      frames: 1,
      level: 1,
      xp: 0,
      hp: 100,
      baseStats: {
        Force: 10,
        Health: 100,
        Speed: 5,
        Aura: 5,
      },
      totalStats: {
        Force: 10,
        Health: 100,
        Speed: 5,
        Aura: 5,
      },
      equipment: {
        accessory: equipment.accessory,
        armor: equipment.armor,
        trinket: equipment.trinket,
        weapon: equipment.weapon,
      },
      skills: [],
      talents: {},
      targettingType: 'Random',
    });

    it('should return empty array when hero has no equipment', () => {
      const hero = createMockHero();

      const result = heroEquipmentSkills(hero);

      expect(result).toEqual([]);
    });

    it('should return empty array when equipment has no skillIds', () => {
      const hero = createMockHero({
        weapon: createMockEquipmentItem([]),
        armor: createMockEquipmentItem([]),
      });

      const result = heroEquipmentSkills(hero);

      expect(result).toEqual([]);
    });

    it('should return skillIds from single equipment item', () => {
      const skillIds: EquipmentSkillId[] = [
        'skill-1' as EquipmentSkillId,
        'skill-2' as EquipmentSkillId,
      ];
      const hero = createMockHero({
        weapon: createMockEquipmentItem(skillIds),
      });

      const result = heroEquipmentSkills(hero);

      expect(result).toEqual(skillIds);
    });

    it('should return skillIds from multiple equipment items', () => {
      const weaponSkills: EquipmentSkillId[] = [
        'skill-1' as EquipmentSkillId,
        'skill-2' as EquipmentSkillId,
      ];
      const armorSkills: EquipmentSkillId[] = ['skill-3' as EquipmentSkillId];
      const accessorySkills: EquipmentSkillId[] = [
        'skill-4' as EquipmentSkillId,
        'skill-5' as EquipmentSkillId,
      ];

      const hero = createMockHero({
        weapon: createMockEquipmentItem(weaponSkills),
        armor: createMockEquipmentItem(armorSkills),
        accessory: createMockEquipmentItem(accessorySkills),
      });

      const result = heroEquipmentSkills(hero);

      // Object.values() returns in alphabetical order: accessory, armor, trinket, weapon
      expect(result).toEqual([
        ...accessorySkills,
        ...armorSkills,
        ...weaponSkills,
      ]);
    });

    it('should flatten skillIds from all equipment slots', () => {
      const weaponSkills: EquipmentSkillId[] = [
        'weapon-skill-1' as EquipmentSkillId,
      ];
      const armorSkills: EquipmentSkillId[] = [
        'armor-skill-1' as EquipmentSkillId,
        'armor-skill-2' as EquipmentSkillId,
      ];
      const trinketSkills: EquipmentSkillId[] = [
        'trinket-skill-1' as EquipmentSkillId,
      ];
      const accessorySkills: EquipmentSkillId[] = [
        'accessory-skill-1' as EquipmentSkillId,
        'accessory-skill-2' as EquipmentSkillId,
        'accessory-skill-3' as EquipmentSkillId,
      ];

      const hero = createMockHero({
        weapon: createMockEquipmentItem(weaponSkills),
        armor: createMockEquipmentItem(armorSkills),
        trinket: createMockEquipmentItem(trinketSkills),
        accessory: createMockEquipmentItem(accessorySkills),
      });

      const result = heroEquipmentSkills(hero);

      // Object.values() returns in alphabetical order: accessory, armor, trinket, weapon
      expect(result).toEqual([
        ...accessorySkills,
        ...armorSkills,
        ...trinketSkills,
        ...weaponSkills,
      ]);
      expect(result).toHaveLength(7);
    });

    it('should handle mix of equipped and unequipped items', () => {
      const weaponSkills: EquipmentSkillId[] = [
        'weapon-skill' as EquipmentSkillId,
      ];
      const trinketSkills: EquipmentSkillId[] = [
        'trinket-skill' as EquipmentSkillId,
      ];

      const hero = createMockHero({
        weapon: createMockEquipmentItem(weaponSkills),
        armor: undefined, // No armor equipped
        trinket: createMockEquipmentItem(trinketSkills),
        accessory: undefined, // No accessory equipped
      });

      const result = heroEquipmentSkills(hero);

      // Object.values() returns in alphabetical order: accessory, armor, trinket, weapon
      // Only trinket and weapon have skills (no accessory or armor)
      expect(result).toEqual([...trinketSkills, ...weaponSkills]);
    });

    it('should handle hero with undefined equipment', () => {
      const hero: Hero = {
        id: 'hero-1' as HeroId,
        name: 'Test Hero',
        sprite: 'hero-sprite',
        frames: 1,
        level: 1,
        xp: 0,
        hp: 100,
        baseStats: {
          Force: 10,
          Health: 100,
          Speed: 5,
          Aura: 5,
        },
        totalStats: {
          Force: 10,
          Health: 100,
          Speed: 5,
          Aura: 5,
        },
        equipment: undefined as unknown as Hero['equipment'], // Undefined equipment
        skills: [],
        talents: {},
        targettingType: 'Random',
      };

      const result = heroEquipmentSkills(hero);

      expect(result).toEqual([]);
    });

    it('should handle equipment items with empty skillIds arrays', () => {
      const hero = createMockHero({
        weapon: createMockEquipmentItem([]),
        armor: createMockEquipmentItem([]),
        trinket: createMockEquipmentItem([]),
        accessory: createMockEquipmentItem([]),
      });

      const result = heroEquipmentSkills(hero);

      expect(result).toEqual([]);
    });

    it('should preserve order of skillIds as they appear in equipment', () => {
      const weaponSkills: EquipmentSkillId[] = [
        'first-skill' as EquipmentSkillId,
        'second-skill' as EquipmentSkillId,
      ];
      const armorSkills: EquipmentSkillId[] = [
        'third-skill' as EquipmentSkillId,
      ];

      const hero = createMockHero({
        weapon: createMockEquipmentItem(weaponSkills),
        armor: createMockEquipmentItem(armorSkills),
      });

      const result = heroEquipmentSkills(hero);

      // Object.values() returns in alphabetical order: accessory, armor, trinket, weapon
      // So armor comes before weapon
      expect(result).toEqual(['third-skill', 'first-skill', 'second-skill']);
    });

    it('should handle single skillId per equipment item', () => {
      const hero = createMockHero({
        weapon: createMockEquipmentItem(['weapon-skill' as EquipmentSkillId]),
        armor: createMockEquipmentItem(['armor-skill' as EquipmentSkillId]),
        trinket: createMockEquipmentItem(['trinket-skill' as EquipmentSkillId]),
        accessory: createMockEquipmentItem([
          'accessory-skill' as EquipmentSkillId,
        ]),
      });

      const result = heroEquipmentSkills(hero);

      // Object.values() returns in alphabetical order: accessory, armor, trinket, weapon
      expect(result).toEqual([
        'accessory-skill',
        'armor-skill',
        'trinket-skill',
        'weapon-skill',
      ]);
      expect(result).toHaveLength(4);
    });

    it('should return proper EquipmentSkillId array type', () => {
      const skillIds: EquipmentSkillId[] = ['typed-skill' as EquipmentSkillId];
      const hero = createMockHero({
        weapon: createMockEquipmentItem(skillIds),
      });

      const result = heroEquipmentSkills(hero);

      // Type assertion to verify return type
      const typedResult: EquipmentSkillId[] = result;
      expect(typedResult).toEqual(skillIds);
    });

    it('should handle equipment with null items', () => {
      const hero = createMockHero({
        weapon: createMockEquipmentItem(['weapon-skill' as EquipmentSkillId]),
        armor: null as unknown as EquipmentItem, // Explicitly null
        trinket: undefined,
        accessory: createMockEquipmentItem([
          'accessory-skill' as EquipmentSkillId,
        ]),
      });

      const result = heroEquipmentSkills(hero);

      // createMockHero defines equipment in order: accessory, armor, trinket, weapon
      // Only accessory and weapon have skills, so: accessory-skill, weapon-skill
      expect(result).toEqual(['accessory-skill', 'weapon-skill']);
    });

    it('should filter out falsy values correctly', () => {
      // Mock equipment structure that might have various falsy values
      const hero = createMockHero();
      // Manually set equipment to test filter behavior
      hero.equipment = {
        weapon: createMockEquipmentItem(['weapon-skill' as EquipmentSkillId]),
        armor: undefined,
        trinket: null as unknown as EquipmentItem,
        accessory: createMockEquipmentItem([
          'accessory-skill' as EquipmentSkillId,
        ]),
      };

      const result = heroEquipmentSkills(hero);

      // Object.values() returns in property definition order: weapon, armor, trinket, accessory
      // Only weapon and accessory have skills (armor and trinket are falsy and filtered out)
      expect(result).toEqual(['weapon-skill', 'accessory-skill']);
    });

    it('should handle large numbers of skillIds', () => {
      const manySkills: EquipmentSkillId[] = Array.from(
        { length: 50 },
        (_, i) => `skill-${i}` as EquipmentSkillId,
      );

      const hero = createMockHero({
        weapon: createMockEquipmentItem(manySkills.slice(0, 25)),
        armor: createMockEquipmentItem(manySkills.slice(25, 50)),
      });

      const result = heroEquipmentSkills(hero);

      // Object.values() returns in alphabetical order: accessory, armor, trinket, weapon
      // So armor skills come before weapon skills
      const expectedOrder = [
        ...manySkills.slice(25, 50),
        ...manySkills.slice(0, 25),
      ];
      expect(result).toEqual(expectedOrder);
      expect(result).toHaveLength(50);
    });

    it('should handle equipment items with duplicate skillIds across items', () => {
      const duplicateSkill: EquipmentSkillId =
        'duplicate-skill' as EquipmentSkillId;
      const uniqueSkill1: EquipmentSkillId =
        'unique-skill-1' as EquipmentSkillId;
      const uniqueSkill2: EquipmentSkillId =
        'unique-skill-2' as EquipmentSkillId;

      const hero = createMockHero({
        weapon: createMockEquipmentItem([duplicateSkill, uniqueSkill1]),
        armor: createMockEquipmentItem([duplicateSkill, uniqueSkill2]),
      });

      const result = heroEquipmentSkills(hero);

      // Object.values() returns in alphabetical order: accessory, armor, trinket, weapon
      // So armor skills come before weapon skills
      // Should preserve duplicates as the function doesn't deduplicate
      expect(result).toEqual([
        duplicateSkill,
        uniqueSkill2,
        duplicateSkill,
        uniqueSkill1,
      ]);
    });
  });
});
