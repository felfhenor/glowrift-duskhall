import { intersection, sum } from 'lodash';
import Mustache from 'mustache';
import {
  Combat,
  Combatant,
  EquipmentSkill,
  EquipmentSkillAttribute,
  EquipmentSkillContentTechnique,
  GameElement,
  GameStat,
  TalentContent,
} from '@interfaces';
import { isDead } from '@helpers/combat-end';
import { logCombatMessage } from '@helpers/combat-log';
import { getEntry } from '@helpers/content';
import { getDroppableEquippableBaseId } from '@helpers/droppable';
import {
  getCombatIncomingAttributeMultiplier,
  getCombatOutgoingAttributeMultiplier,
} from '@helpers/festival-combat';

export function techniqueHasAttribute(
  technique: EquipmentSkillContentTechnique,
  attribute: EquipmentSkillAttribute,
): boolean {
  return technique.attributes?.includes(attribute);
}

export function allCombatantTalents(combatant: Combatant): TalentContent[] {
  return Object.entries(combatant.talents)
    .filter(([, level]) => level > 0)
    .map(([talentId]) => getEntry<TalentContent>(talentId))
    .filter((talent): talent is TalentContent => !!talent);
}

export function combatantTalentElementBoost(
  combatant: Combatant,
  elements: GameElement[],
  stat: GameStat,
): number {
  return sum(
    allCombatantTalents(combatant)
      .filter((t) => intersection(t.boostedElements ?? [], elements).length > 0)
      .map((t) => t.boostStats[stat] ?? 0),
  );
}

export function combatantTalentSkillBoost(
  combatant: Combatant,
  skill: EquipmentSkill,
  stat: GameStat,
): number {
  const skillContentId = getDroppableEquippableBaseId(skill);

  return sum(
    allCombatantTalents(combatant)
      .filter((t) => t.boostedSkillIds?.includes(skillContentId))
      .map((t) => t.boostStats[stat] ?? 0),
  );
}

export function getCombatantStatForTechnique(
  combatant: Combatant,
  skill: EquipmentSkill,
  technique: EquipmentSkillContentTechnique,
  stat: GameStat,
): number {
  const baseMultiplier = technique.damageScaling[stat] ?? 0;
  if (baseMultiplier === 0) return 0;

  const talentElementMultiplierBoost = combatantTalentElementBoost(
    combatant,
    technique.elements,
    stat,
  );

  const talentSkillMultiplierBoost = combatantTalentSkillBoost(
    combatant,
    skill,
    stat,
  );

  const totalMultiplier =
    baseMultiplier + talentSkillMultiplierBoost + talentElementMultiplierBoost;

  return combatant.totalStats[stat] * totalMultiplier;
}

export function applySkillToTarget(
  combat: Combat,
  combatant: Combatant,
  target: Combatant,
  skill: EquipmentSkill,
  technique: EquipmentSkillContentTechnique,
): void {
  const baseDamage =
    getCombatantStatForTechnique(combatant, skill, technique, 'Force') +
    getCombatantStatForTechnique(combatant, skill, technique, 'Aura') +
    getCombatantStatForTechnique(combatant, skill, technique, 'Health') +
    getCombatantStatForTechnique(combatant, skill, technique, 'Speed');

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
