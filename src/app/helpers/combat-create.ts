import { getEntry } from '@helpers/content';
import { getDefaultAffinities, getDefaultStats } from '@helpers/defaults';
import { createGuardianForLocation } from '@helpers/guardian';
import { allHeroes } from '@helpers/hero';
import { heroEquipmentSkills } from '@helpers/hero-skills';
import { heroElements } from '@helpers/hero-stats';
import { getFullHeroTalentHash } from '@helpers/hero-talent';
import { uuid } from '@helpers/rng';
import { makeSkillForHero } from '@helpers/skill';
import { allHeroTalents, combineTalentsIntoCombatStats } from '@helpers/talent';
import { locationTraitCombatElementPercentageModifier } from '@helpers/trait-location-combat';
import type {
  Combat,
  Combatant,
  CombatId,
  ElementBlock,
  EquipmentSkill,
  EquipmentSkillId,
  Guardian,
  TalentId,
  WorldLocation,
} from '@interfaces';

export function generateCombatForLocation(location: WorldLocation): Combat {
  const heroes: Combatant[] = allHeroes().map((h) => ({
    id: h.id,
    name: h.name,
    isEnemy: false,

    targettingType: h.targettingType,

    baseStats: structuredClone(h.baseStats),
    statBoosts: getDefaultStats(),
    totalStats: structuredClone(h.totalStats),
    hp: h.hp,
    level: h.level,
    sprite: h.sprite,
    frames: h.frames,
    skillIds: ['Attack' as EquipmentSkillId, ...heroEquipmentSkills(h)],
    skillRefs: structuredClone(
      h.skills.filter(Boolean).map((s) => makeSkillForHero(h, s!)),
    ) as EquipmentSkill[],

    talents: getFullHeroTalentHash(h),
    combatStats: combineTalentsIntoCombatStats(allHeroTalents(h)),

    affinity: {
      ...heroElements(h),
    },

    resistance: {
      ...getDefaultAffinities(),
    },

    skillUses: {},
    statusEffects: [],
    statusEffectData: {},
  }));

  const guardians: Combatant[] = location.guardianIds
    .map((g) => getEntry<Guardian>(g)!)
    .filter(Boolean)
    .map((g) => createGuardianForLocation(location, g))
    .map((g, i) => ({
      id: g.id,
      name: `${g.name} Lv.${location.encounterLevel} [${String.fromCharCode(i + 65)}]`,
      isEnemy: true,

      targettingType: g.targettingType,

      baseStats: structuredClone(g.stats),
      statBoosts: getDefaultStats(),
      totalStats: structuredClone(g.stats),
      hp: g.stats.Health,
      level: location.encounterLevel,
      sprite: g.sprite,
      frames: g.frames,
      skillIds: ['Attack' as EquipmentSkillId, ...g.skillIds],
      skillRefs: [],
      talents: g.talents.reduce(
        (acc, t) => {
          const talentId = t.talentId as TalentId;

          acc[talentId] = (acc[talentId] ?? 0) + (t.value ?? 0);
          return acc;
        },
        {} as Record<TalentId, number>,
      ),
      combatStats: structuredClone(g.combatStats),

      affinity: {
        ...getDefaultAffinities(),
        ...g.affinity,
      },

      resistance: {
        ...getDefaultAffinities(),
        ...g.resistance,
      },

      skillUses: {},
      statusEffects: [],
      statusEffectData: {},
    }));

  const elementalModifiers: ElementBlock = {
    Fire: locationTraitCombatElementPercentageModifier(location, 'Fire'),
    Air: locationTraitCombatElementPercentageModifier(location, 'Air'),
    Water: locationTraitCombatElementPercentageModifier(location, 'Water'),
    Earth: locationTraitCombatElementPercentageModifier(location, 'Earth'),
  };

  return {
    id: uuid() as CombatId,
    locationName: location.name,
    locationPosition: {
      x: location.x,
      y: location.y,
    },
    rounds: 0,
    heroes,
    guardians,

    elementalModifiers,
  };
}
