import { succeedsChance } from '@helpers/rng';
import { skillElements } from '@helpers/skill';
import type { Combatant, CombatantCombatStats } from '@interfaces/combat';
import type { EquipmentSkill } from '@interfaces/content-skill';
import type { ElementBlock, GameElement } from '@interfaces/element';

export function elementsSucceedsElementCombatStatChance(
  elements: GameElement[],
  combatant: Combatant,
  stat: keyof CombatantCombatStats,
): boolean {
  return elements.some((el) =>
    succeedsChance((combatant.combatStats[stat] as ElementBlock)[el]),
  );
}

export function skillSucceedsElementCombatStatChance(
  skill: EquipmentSkill,
  combatant: Combatant,
  stat: keyof CombatantCombatStats,
): boolean {
  return elementsSucceedsElementCombatStatChance(
    skillElements(skill),
    combatant,
    stat,
  );
}
