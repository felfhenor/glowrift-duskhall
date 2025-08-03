import { gamestate } from '@helpers/state-game';
import type {
  EquipmentSkill,
  EquipmentSkillContentTechnique,
  EquipmentSkillId,
  EquipmentSkillTechniqueStatusEffectApplication,
} from '@interfaces/content-skill';
import type { GameStat } from '@interfaces/stat';

export function getSkillEnchantLevel(skill: EquipmentSkill): number {
  return skill.enchantLevel + (skill.mods?.enchantLevel ?? 0);
}

export function getSkillById(
  skillId: EquipmentSkillId,
): EquipmentSkill | undefined {
  return gamestate().inventory.skills.find((i) => i.id === skillId);
}

export function getSkillUses(skill: EquipmentSkill): number {
  return skill.usesPerCombat + (skill.mods?.usesPerCombat ?? 0);
}

export function getSkillTechniqueNumTargets(
  skill: EquipmentSkill,
  technique: EquipmentSkillContentTechnique,
): number {
  return technique.targets + (skill.mods?.numTargets ?? 0);
}

export function getSkillTechniqueDamageScalingStat(
  skill: EquipmentSkill,
  technique: EquipmentSkillContentTechnique,
  stat: GameStat,
): number {
  return (
    technique.damageScaling[stat] + (skill.mods?.damageScaling?.[stat] ?? 0)
  );
}

export function getSkillTechniqueStatusEffectChance(
  skill: EquipmentSkill,
  techniqueApplication: EquipmentSkillTechniqueStatusEffectApplication,
): number {
  return (
    techniqueApplication.chance +
    (skill.mods?.statusEffectChanceBoost?.[
      techniqueApplication.statusEffectId
    ] ?? 0)
  );
}

export function getSkillTechniqueStatusEffectDuration(
  skill: EquipmentSkill,
  techniqueApplication: EquipmentSkillTechniqueStatusEffectApplication,
): number {
  return (
    techniqueApplication.duration +
    (skill.mods?.statusEffectDurationBoost?.[
      techniqueApplication.statusEffectId
    ] ?? 0)
  );
}
