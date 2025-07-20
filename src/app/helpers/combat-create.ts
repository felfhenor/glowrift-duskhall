import { getEntry } from '@helpers/content';
import { getDefaultAffinities } from '@helpers/defaults';
import { createGuardianForLocation } from '@helpers/guardian';
import { allHeroes } from '@helpers/hero';
import { uuid } from '@helpers/rng';
import type {
  Combat,
  Combatant,
  CombatId,
  EquipmentSkill,
  EquipmentSkillId,
  Guardian,
  WorldLocation,
} from '@interfaces';

export function generateCombatForLocation(location: WorldLocation): Combat {
  const heroes: Combatant[] = allHeroes().map((h) => ({
    id: h.id,
    name: h.name,
    isEnemy: false,

    targettingType: h.targettingType,

    baseStats: h.baseStats,
    totalStats: h.baseStats,
    hp: h.baseStats.Health,
    level: h.level,
    sprite: h.sprite,
    frames: h.frames,
    skillIds: ['Attack' as EquipmentSkillId],
    skillRefs: h.skills.filter(Boolean) as EquipmentSkill[],

    talents: h.talents,

    affinity: {
      ...getDefaultAffinities(),
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

      baseStats: g.stats,
      totalStats: g.stats,
      hp: g.stats.Health,
      level: location.encounterLevel,
      sprite: g.sprite,
      frames: g.frames,
      skillIds: ['Attack' as EquipmentSkillId, ...g.skillIds],
      skillRefs: [],
      talents: g.talentIds ?? {},

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
  };
}
