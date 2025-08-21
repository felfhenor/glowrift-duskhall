import { getEntry } from '@helpers/content';
import { gamestate, updateGamestate } from '@helpers/state-game';
import { symmetryLevel } from '@helpers/symmetry';
import {
  talentAddedTechniques,
  talentsForHero,
  talentStatusEffectChanceBoost,
  talentStatusEffectDurationBoost,
  talentTargetCountBoost,
  talentTechniqueAddedStats,
  talentTechniqueAddedStatusEffects,
} from '@helpers/talent';
import type {
  EquipmentSkill,
  EquipmentSkillContentTechnique,
  EquipmentSkillId,
  EquipmentSkillTechniqueStatusEffectApplication,
} from '@interfaces/content-skill';
import type { StatusEffectContent } from '@interfaces/content-statuseffect';
import type { GameElement } from '@interfaces/element';
import type { Hero } from '@interfaces/hero';
import type { GameStat } from '@interfaces/stat';
import type { GameState } from '@interfaces/state-game';
import { intersection, sortBy, uniq } from 'es-toolkit/compat';

export function skillEnchantLevel(skill: EquipmentSkill): number {
  return skill.enchantLevel + (skill.mods?.enchantLevel ?? 0);
}

export function skillGetById(
  skillId: EquipmentSkillId,
): EquipmentSkill | undefined {
  const state = gamestate();
  return [
    ...state.hero.heroes.flatMap((h) => h.skills),
    ...state.inventory.skills,
  ]
    .filter(Boolean)
    .find((i) => i!.id === skillId);
}

export function skillUses(skill: EquipmentSkill): number {
  return skill.usesPerCombat + (skill.mods?.usesPerCombat ?? 0);
}

export function skillTechniqueNumTargets(
  skill: EquipmentSkill,
  technique: EquipmentSkillContentTechnique,
): number {
  return technique.targets + (skill.mods?.numTargets ?? 0);
}

export function skillTechniqueDamageScalingStat(
  skill: EquipmentSkill,
  technique: EquipmentSkillContentTechnique,
  stat: GameStat,
): number {
  return (
    technique.damageScaling[stat] + (skill.mods?.damageScaling?.[stat] ?? 0)
  );
}

export function skillTechniqueStatusEffectChance(
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

export function skillTechniqueStatusEffectDuration(
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

export function skillCreateWithSymmetry(
  skillData: EquipmentSkill,
): EquipmentSkill {
  const skill = structuredClone(skillData);

  const allSkillTechniques = skill.techniques;
  const copyTechniques = structuredClone(allSkillTechniques);

  const skillSymmetry = symmetryLevel(skill);
  let copyStatValue = 0;
  if (skillSymmetry >= 3) copyStatValue = 0.25;
  if (skillSymmetry >= 5) copyStatValue = 0.5;

  if (copyStatValue > 0) {
    copyTechniques.forEach((t) => {
      Object.keys(t.damageScaling).forEach((stat) => {
        t.damageScaling[stat as GameStat] *= copyStatValue;
      });
    });

    allSkillTechniques.push(...copyTechniques);
  }

  skill.techniques = allSkillTechniques;

  return skill;
}

export function skillCreateForHero(
  hero: Hero,
  skillBeforeSymmetry: EquipmentSkill,
): EquipmentSkill {
  const skillData = skillCreateWithSymmetry(skillBeforeSymmetry);

  const talents = talentsForHero(hero);
  const skill = structuredClone(skillData);

  const addedTechniques = structuredClone(
    talentAddedTechniques(talents, skill),
  );

  skill.techniques = [...skill.techniques, ...addedTechniques].map((t) => {
    t.targets += talentTargetCountBoost(talents, skill);

    Object.keys(t.damageScaling).forEach((stat) => {
      t.damageScaling[stat as GameStat] += talentTechniqueAddedStats(
        talents,
        skill,
        t,
        stat as GameStat,
      );
    });

    const addedStatusEffects = structuredClone(
      talentTechniqueAddedStatusEffects(talents, skill, t),
    );

    t.statusEffects = sortBy(
      [...t.statusEffects, ...addedStatusEffects],
      (s) => getEntry<StatusEffectContent>(s.statusEffectId)?.name,
    )
      .map((s) => {
        const statusEffect = getEntry<StatusEffectContent>(s.statusEffectId);
        if (!statusEffect) return undefined;

        s.chance += talentStatusEffectChanceBoost(talents, skill, statusEffect);

        s.duration += talentStatusEffectDurationBoost(
          talents,
          skill,
          statusEffect,
        );

        return s;
      })
      .filter(Boolean) as EquipmentSkillTechniqueStatusEffectApplication[];

    return t;
  });

  return skill;
}

export function skillFindInState(
  state: GameState,
  skill: EquipmentSkill,
): EquipmentSkill | undefined {
  const heroSkills = state.hero.heroes.flatMap((h) => h.skills);
  const updateItem = [...heroSkills, ...state.inventory.skills]
    .filter(Boolean)
    .find((i) => i!.id === skill.id);

  return updateItem;
}

export function skillUpdateInState(skill: EquipmentSkill): void {
  updateGamestate((state) => {
    const updateItem = skillFindInState(state, skill);
    if (!updateItem) return state;

    updateItem.mods = structuredClone(skill.mods);

    return state;
  });
}
