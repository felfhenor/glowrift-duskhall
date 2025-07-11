import {
  Combat,
  Combatant,
  CombatId,
  EquipmentSkill,
  EquipmentSkillId,
  Guardian,
  WorldLocation,
} from '../interfaces';
import { getEntry } from './content';
import { getDefaultAffinities } from './defaults';
import { createGuardianForLocation } from './guardian';
import { allHeroes } from './hero';
import { uuid } from './rng';

export function generateCombatForLocation(location: WorldLocation): Combat {
  const heroes: Combatant[] = allHeroes().map((h) => ({
    id: h.id,
    name: h.name,
    isEnemy: false,

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
  }));

  const guardians: Combatant[] = location.guardianIds
    .map((g) => getEntry<Guardian>(g)!)
    .filter(Boolean)
    .map((g) => createGuardianForLocation(location, g))
    .map((g) => ({
      id: g.id,
      name: `${g.name} Lv.${location.encounterLevel}`,
      isEnemy: true,

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
