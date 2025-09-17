import { getEntry } from '@helpers/content';
import { defaultAffinities, defaultStats } from '@helpers/defaults';
import { guardianCreateForLocation } from '@helpers/guardian';
import { allHeroes } from '@helpers/hero';
import { heroEquipmentSkills } from '@helpers/hero-skills';
import { heroElements } from '@helpers/hero-stats';
import { heroFullTalentHash } from '@helpers/hero-talent';
import { rngUuid } from '@helpers/rng';
import { skillCreateForHero } from '@helpers/skill';
import { talentCombineIntoCombatStats, talentsForHero } from '@helpers/talent';
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

export function combatGenerateForLocation(location: WorldLocation): Combat {
  const heroes: Combatant[] = allHeroes().map((h) => ({
    id: h.id,
    name: h.name,
    isEnemy: false,

    targettingType: h.targettingType,

    baseStats: structuredClone(h.baseStats),
    statBoosts: defaultStats(),
    totalStats: structuredClone(h.totalStats),
    hp: Math.floor(h.hp),
    level: h.level,
    sprite: h.sprite,
    frames: h.frames,
    skillIds: ['Attack' as EquipmentSkillId, ...heroEquipmentSkills(h)],
    skillRefs: structuredClone(
      h.skills.filter(Boolean).map((s) => skillCreateForHero(h, s!)),
    ) as EquipmentSkill[],

    talents: heroFullTalentHash(h),
    combatStats: talentCombineIntoCombatStats(talentsForHero(h)),

    affinity: {
      ...heroElements(h),
    },

    resistance: {
      ...defaultAffinities(),
    },

    skillUses: {},
    statusEffects: [],
    statusEffectData: {},
  }));

  const guardians: Combatant[] = location.guardianIds
    .map((g) => getEntry<Guardian>(g)!)
    .filter(Boolean)
    .map((g) => guardianCreateForLocation(location, g))
    .map((g, i) => ({
      id: g.id,
      name: `${g.name} Lv.${location.encounterLevel} [${String.fromCharCode(i + 65)}]`,
      isEnemy: true,

      targettingType: g.targettingType,

      baseStats: structuredClone(g.stats),
      statBoosts: defaultStats(),
      totalStats: structuredClone(g.stats),
      hp: Math.floor(g.stats.Health),
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
        ...defaultAffinities(),
        ...g.affinity,
      },

      resistance: {
        ...defaultAffinities(),
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
    id: rngUuid() as CombatId,
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
