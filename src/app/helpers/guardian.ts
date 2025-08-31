import { getEntry } from '@helpers/content';
import { skillTechniqueDamageScalingStat } from '@helpers/skill';
import type {
  EquipmentSkill,
  EquipmentSkillContent,
  GameElement,
  GameStat,
  Guardian,
  GuardianContent,
  WorldLocation,
} from '@interfaces';
import { sumBy } from 'es-toolkit/compat';

export function guardianCreateForLocation(
  location: WorldLocation,
  guardianData: GuardianContent,
): Guardian {
  const stats: Record<GameStat, number> = {
    Aura: location.encounterLevel * guardianData.statScaling.Aura,
    Force: location.encounterLevel * guardianData.statScaling.Force,
    Health: location.encounterLevel * guardianData.statScaling.Health,
    Speed: location.encounterLevel * guardianData.statScaling.Speed,
  };

  return {
    ...guardianData,
    hp: stats.Health,
    stats,
  };
}

export function guardianMaxDamage(guardian: Guardian): number {
  return Math.max(
    ...['Attack', ...guardian.skillIds]
      .map((id) => getEntry<EquipmentSkillContent>(id))
      .filter(Boolean)
      .map((s) => guardianMaxDamageForSkill(guardian, s!)),
  );
}

function guardianMaxDamageForSkill(
  guardian: Guardian,
  skill: EquipmentSkill,
): number {
  return Math.max(
    ...skill.techniques.map((tech) => {
      const statScalars = Object.keys(tech.damageScaling)
        .filter((d) => tech.damageScaling[d as GameStat])
        .map((d) => {
          const statMult = skillTechniqueDamageScalingStat(
            skill,
            tech,
            d as GameStat,
          );

          return { stat: d, multiplier: statMult };
        });

      const baseDamage = sumBy(
        statScalars,
        (s) => s.multiplier * guardian.stats[s.stat as GameStat],
      );

      const affinityElementBoostMultiplier = sumBy(
        tech.elements,
        (el) => 1 + guardian.affinity[el as GameElement],
      );

      return baseDamage * affinityElementBoostMultiplier;
    }),
  );
}
