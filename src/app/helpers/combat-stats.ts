import { rngSucceedsChance } from '@helpers/rng';
import { skillElements } from '@helpers/skill';
import type { Combatant, CombatantCombatStats } from '@interfaces/combat';
import type { EquipmentSkill } from '@interfaces/content-skill';
import type { ElementBlock, GameElement } from '@interfaces/element';

export function combatElementsSucceedsElementCombatStatChance(
  elements: GameElement[],
  combatant: Combatant,
  stat: keyof CombatantCombatStats,
): boolean {
  return elements.some((el) =>
    rngSucceedsChance((combatant.combatStats[stat] as ElementBlock)[el]),
  );
}

export function combatSkillSucceedsElementCombatStatChance(
  skill: EquipmentSkill,
  combatant: Combatant,
  stat: keyof CombatantCombatStats,
): boolean {
  return combatElementsSucceedsElementCombatStatChance(
    skillElements(skill),
    combatant,
    stat,
  );
}
