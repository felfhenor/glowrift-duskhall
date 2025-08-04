import { gamestate } from '@helpers/state-game';
import type {
  EquipmentSkill,
  EquipmentSkillContentTechnique,
  EquipmentSkillId,
  EquipmentSkillTechniqueStatusEffectApplication,
} from '@interfaces/content-skill';
import type { GameElement } from '@interfaces/element';
import type { GameStat } from '@interfaces/stat';
import { intersection, uniq } from 'es-toolkit/compat';

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

export function skillElements(skill: EquipmentSkill): GameElement[] {
  return uniq(skill.techniques.flatMap((t) => t.elements)).sort();
}

export function skillDisplayElement(skill: EquipmentSkill): string {
  const elements = skillElements(skill);

  if (intersection(elements, ['Air', 'Fire', 'Water', 'Earth']).length === 4)
    return 'Holy';

  if (intersection(elements, ['Fire', 'Water']).length === 2) return 'Steam';
  if (intersection(elements, ['Fire', 'Air']).length === 2) return 'Heat';
  if (intersection(elements, ['Fire', 'Earth']).length === 2) return 'Molten';
  if (intersection(elements, ['Water', 'Earth']).length === 2) return 'Mud';
  if (intersection(elements, ['Water', 'Air']).length === 2) return 'Mist';
  if (intersection(elements, ['Earth', 'Air']).length === 2) return 'Sand';

  if (intersection(elements, ['Fire']).length === 1) return 'Fire';
  if (intersection(elements, ['Water']).length === 1) return 'Water';
  if (intersection(elements, ['Earth']).length === 1) return 'Earth';
  if (intersection(elements, ['Air']).length === 1) return 'Air';

  return elements.join(', ');
}
