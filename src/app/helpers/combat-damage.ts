import { sum } from 'lodash';
import Mustache from 'mustache';
import {
  Combat,
  Combatant,
  EquipmentSkill,
  EquipmentSkillDefinitionTechnique,
  EquippableSkillAttribute,
} from '../interfaces';
import { isDead } from './combat-end';
import { logCombatMessage } from './combat-log';
import {
  getCombatIncomingAttributeMultiplier,
  getCombatOutgoingAttributeMultiplier,
} from './festival-combat';

export function techniqueHasAttribute(
  technique: EquipmentSkillDefinitionTechnique,
  attribute: EquippableSkillAttribute,
): boolean {
  return technique.attributes?.includes(attribute);
}

export function applySkillToTarget(
  combat: Combat,
  combatant: Combatant,
  target: Combatant,
  skill: EquipmentSkill,
  technique: EquipmentSkillDefinitionTechnique,
): void {
  const baseDamage =
    combatant.totalStats.Force * (technique.damageScaling.Force ?? 0) +
    combatant.totalStats.Aura * (technique.damageScaling.Aura ?? 0) +
    combatant.totalStats.Health * (technique.damageScaling.Health ?? 0) +
    combatant.totalStats.Speed * (technique.damageScaling.Speed ?? 0);

  const damage =
    technique.elements.length === 0
      ? baseDamage
      : sum(
          technique.elements.map((el) => baseDamage * combatant.affinity[el]),
        ) / technique.elements.length;

  const baseTargetDefense = target.totalStats.Aura;
  const targetDefense =
    technique.elements.length === 0
      ? baseTargetDefense
      : sum(
          technique.elements.map(
            (el) => baseTargetDefense * target.resistance[el],
          ),
        ) / technique.elements.length;

  let effectiveDamage = damage;

  if (!techniqueHasAttribute(technique, 'AllowNegative')) {
    effectiveDamage = Math.max(0, effectiveDamage);
  }

  if (!techniqueHasAttribute(technique, 'BypassDefense')) {
    effectiveDamage = Math.max(0, effectiveDamage - targetDefense);
  }

  if (techniqueHasAttribute(technique, 'AllowPlink')) {
    effectiveDamage = Math.max(damage > 0 ? 1 : 0, effectiveDamage);
  }

  let damageMultiplierFromFestivals = 1;
  if (combatant.isEnemy && !target.isEnemy && effectiveDamage > 0) {
    damageMultiplierFromFestivals =
      1 + getCombatIncomingAttributeMultiplier('damage');
  }

  if (!combatant.isEnemy && target.isEnemy && effectiveDamage > 0) {
    damageMultiplierFromFestivals =
      1 + getCombatOutgoingAttributeMultiplier('damage');
  }

  effectiveDamage *= damageMultiplierFromFestivals;

  effectiveDamage = Math.floor(effectiveDamage);

  target.hp = Math.max(0, target.hp - effectiveDamage);

  const templateData = {
    combat,
    combatant,
    target,
    skill,
    technique,
    damage: effectiveDamage,
    absdamage: Math.abs(effectiveDamage),
  };
  const message = Mustache.render(technique.combatMessage, templateData);
  logCombatMessage(combat, message);

  if (isDead(target)) {
    logCombatMessage(combat, `**${target.name}** has been defeated!`);
  }
}
