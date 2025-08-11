import { combatSkillSucceedsElementCombatStatChance } from '@helpers/combat-stats';
import { getEntry } from '@helpers/content';
import { skillUses } from '@helpers/skill';
import type {
  Combat,
  Combatant,
  CombatantTargettingType,
  EquipmentSkill,
  EquipmentSkillContent,
  EquipmentSkillContentTechnique,
  EquipmentSkillTargetBehavior,
  EquipmentSkillTargetBehaviorData,
  EquipmentSkillTargetType,
} from '@interfaces';
import { intersection, sampleSize, sortBy, union } from 'es-toolkit/compat';

export function combatAvailableSkillsForCombatant(
  combatant: Combatant,
): EquipmentSkill[] {
  return [
    ...combatant.skillIds.map((s) => getEntry<EquipmentSkill>(s)!),
    ...combatant.skillRefs,
  ].filter(
    (skill) =>
      skill.usesPerCombat === -1 ||
      (combatant.skillUses[skill.id] ?? 0) < skillUses(skill),
  );
}

function filterCombatantTargetListForSkillTechniqueBehavior(
  combatants: Combatant[],
  behaviorData: EquipmentSkillTargetBehaviorData,
): Combatant[] {
  const behaviors: Record<
    EquipmentSkillTargetBehavior,
    (c: Combatant[]) => Combatant[]
  > = {
    Always: (list) => list,
    NotMaxHealth: (list) => list.filter((c) => c.hp < c.totalStats.Health),
    NotZeroHealth: (list) => list.filter((c) => c.hp > 0),
    IfStatusEffect: (list) =>
      list.filter((c) =>
        c.statusEffects.find((s) => s.id === behaviorData.statusEffectId),
      ),
    IfNotStatusEffect: (list) =>
      list.filter(
        (c) =>
          !c.statusEffects.find((s) => s.id === behaviorData.statusEffectId),
      ),
  };

  if (!behaviors[behaviorData.behavior])
    throw new Error(`Invalid target behavior: ${behaviorData.behavior}`);

  return behaviors[behaviorData.behavior](combatants);
}

function filterCombatantTargetListForSkillTechnique(
  combatants: Combatant[],
  technique: EquipmentSkillContentTechnique,
): Combatant[] {
  return intersection(
    ...technique.targetBehaviors.map((b) =>
      filterCombatantTargetListForSkillTechniqueBehavior(combatants, b),
    ),
  );
}

function getBaseCombatantTargetListForSkillTechnique(
  combat: Combat,
  combatant: Combatant,
  skill: EquipmentSkill,
  technique: EquipmentSkillContentTechnique,
): Combatant[] {
  const myType = combatant.isEnemy ? 'guardian' : 'hero';
  let allies = myType === 'guardian' ? combat.guardians : combat.heroes;
  let enemies = myType === 'guardian' ? combat.heroes : combat.guardians;

  const shouldReverse = combatSkillSucceedsElementCombatStatChance(
    skill,
    combatant,
    'redirectionChance',
  );

  if (shouldReverse) {
    [allies, enemies] = [enemies, allies];
  }

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

export function combatGetPossibleCombatantTargetsForSkillTechnique(
  combat: Combat,
  combatant: Combatant,
  skill: EquipmentSkillContent,
  tech: EquipmentSkillContentTechnique,
): Combatant[] {
  const baseList = getBaseCombatantTargetListForSkillTechnique(
    combat,
    combatant,
    skill,
    tech,
  );
  return filterCombatantTargetListForSkillTechnique(baseList, tech);
}

export function combatGetPossibleCombatantTargetsForSkill(
  combat: Combat,
  combatant: Combatant,
  skill: EquipmentSkillContent,
): Combatant[] {
  return union(
    skill.techniques.flatMap((t) =>
      combatGetPossibleCombatantTargetsForSkillTechnique(
        combat,
        combatant,
        skill,
        t,
      ),
    ),
  );
}

export function combatGetTargetsFromListBasedOnType(
  combatants: Combatant[],
  type: CombatantTargettingType,
  select: number,
): Combatant[] {
  const targettingActions: Record<CombatantTargettingType, () => Combatant[]> =
    {
      Random: () => sampleSize(combatants, select),
      Strongest: () => sortBy(combatants, (c) => -c.hp).slice(0, select),
      Weakest: () => sortBy(combatants, (c) => c.hp).slice(0, select),
    };

  return targettingActions[type]();
}
