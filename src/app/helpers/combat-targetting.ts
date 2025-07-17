import { getEntry } from '@helpers/content';
import {
  Combat,
  Combatant,
  EquipmentSkill,
  EquipmentSkillContent,
  EquipmentSkillContentTechnique,
  EquipmentSkillTargetBehavior,
  EquipmentSkillTargetType,
} from '@interfaces';
import { intersection, union } from 'lodash';

export function availableSkillsForCombatant(
  combatant: Combatant,
): EquipmentSkill[] {
  return [
    ...combatant.skillIds.map((s) => getEntry<EquipmentSkill>(s)!),
    ...combatant.skillRefs,
  ].filter(
    (skill) =>
      skill.usesPerCombat === -1 ||
      (combatant.skillUses[skill.id] ?? 0) < skill.usesPerCombat,
  );
}

export function filterCombatantTargetListForSkillTechniqueBehavior(
  combatants: Combatant[],
  behavior: EquipmentSkillTargetBehavior,
): Combatant[] {
  const behaviors: Record<
    EquipmentSkillTargetBehavior,
    (c: Combatant[]) => Combatant[]
  > = {
    Always: (list) => list,
    NotMaxHealth: (list) => list.filter((c) => c.hp < c.totalStats.Health),
    NotZeroHealth: (list) => list.filter((c) => c.hp > 0),
  };

  if (!behaviors[behavior])
    throw new Error(`Invalid target behavior: ${behavior}`);

  return behaviors[behavior](combatants);
}

export function filterCombatantTargetListForSkillTechnique(
  combatants: Combatant[],
  technique: EquipmentSkillContentTechnique,
): Combatant[] {
  return intersection(
    ...technique.targetBehaviors.map((b) =>
      filterCombatantTargetListForSkillTechniqueBehavior(
        combatants,
        b.behavior,
      ),
    ),
  );
}

export function getBaseCombatantTargetListForSkillTechnique(
  combat: Combat,
  combatant: Combatant,
  technique: EquipmentSkillContentTechnique,
): Combatant[] {
  const myType = combatant.isEnemy ? 'guardian' : 'hero';
  const allies = myType === 'guardian' ? combat.guardians : combat.heroes;
  const enemies = myType === 'guardian' ? combat.heroes : combat.guardians;

  const targetTypes: Record<EquipmentSkillTargetType, Combatant[]> = {
    All: [...allies, ...enemies],
    Enemies: enemies,
    Allies: allies,
    Self: [combatant],
  };

  if (!targetTypes[technique.targetType])
    throw new Error(`Invalid target type: ${technique.targetType}`);

  return targetTypes[technique.targetType];
}

export function getPossibleCombatantTargetsForSkillTechnique(
  combat: Combat,
  combatant: Combatant,
  skill: EquipmentSkillContent,
  tech: EquipmentSkillContentTechnique,
): Combatant[] {
  const baseList = getBaseCombatantTargetListForSkillTechnique(
    combat,
    combatant,
    tech,
  );
  return filterCombatantTargetListForSkillTechnique(baseList, tech);
}

export function getPossibleCombatantTargetsForSkill(
  combat: Combat,
  combatant: Combatant,
  skill: EquipmentSkillContent,
): Combatant[] {
  return union(
    skill.techniques.flatMap((t) =>
      getPossibleCombatantTargetsForSkillTechnique(combat, combatant, skill, t),
    ),
  );
}
