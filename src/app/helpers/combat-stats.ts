import { succeedsChance } from '@helpers/rng';
import { skillElements } from '@helpers/skill';
import type { Combatant, CombatantCombatStats } from '@interfaces/combat';
import type { EquipmentSkill } from '@interfaces/content-skill';
import type { ElementBlock } from '@interfaces/element';

export function skillSucceedsElementCombatStatChance(
  skill: EquipmentSkill,
  combatant: Combatant,
  stat: keyof CombatantCombatStats,
): boolean {
  return skillElements(skill).some((el) =>
    succeedsChance((combatant.combatStats[stat] as ElementBlock)[el]),
  );
}
