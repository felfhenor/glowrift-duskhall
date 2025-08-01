import { allCombatantTalents } from '@helpers/combat';
import { isDead } from '@helpers/combat-end';
import { formatCombatMessage, logCombatMessage } from '@helpers/combat-log';
import {
  applyStatusEffectToTarget,
  createStatusEffect,
} from '@helpers/combat-statuseffects';
import { getEntry } from '@helpers/content';
import {
  getCombatIncomingAttributeMultiplier,
  getCombatOutgoingAttributeMultiplier,
} from '@helpers/festival-combat';
import { succeedsChance } from '@helpers/rng';
import {
  getSkillTechniqueDamageScalingStat,
  getSkillTechniqueStatusEffectChance,
  getSkillTechniqueStatusEffectDuration,
} from '@helpers/skill';
import {
  talentStatBoost,
  talentStatusEffectChanceBoost,
} from '@helpers/talent';
import type {
  Combat,
  Combatant,
  EquipmentSkill,
  EquipmentSkillAttribute,
  EquipmentSkillContentTechnique,
  GameStat,
  StatusEffectContent,
} from '@interfaces';
import { meanBy, sum, sumBy } from 'es-toolkit/compat';

export function techniqueHasAttribute(
  technique: EquipmentSkillContentTechnique,
  attribute: EquipmentSkillAttribute,
): boolean {
  return technique.attributes?.includes(attribute);
}

export function getCombatantBaseStatDamageForTechnique(
  combat: Combat,
  combatant: Combatant,
  skill: EquipmentSkill,
  technique: EquipmentSkillContentTechnique,
  stat: GameStat,
): number {
  const baseCheckMultiplier = technique.damageScaling[stat] ?? 0;
  if (baseCheckMultiplier === 0) return 0;

  const allTalents = allCombatantTalents(combatant);

  const baseMultiplier = getSkillTechniqueDamageScalingStat(
    skill,
    technique,
    stat,
  );

  const talentSkillMultiplierBoost = talentStatBoost(allTalents, skill, stat);

  const affinityElementBoostMultiplier = sumBy(
    technique.elements,
    (el) => combatant.affinity[el] + combat.elementalModifiers[el],
  );

  const baseStatWithoutMultiplier = combatant.totalStats[stat];

  const totalMultiplier =
    baseMultiplier +
    affinityElementBoostMultiplier +
    talentSkillMultiplierBoost;

  const multipliedStat = baseStatWithoutMultiplier * totalMultiplier;

  return baseStatWithoutMultiplier + multipliedStat;
}

export function combatantTakeDamage(combatant: Combatant, damage: number) {
  combatant.hp = Math.max(0, combatant.hp - damage);
}

export function applySkillToTarget(
  combat: Combat,
  combatant: Combatant,
  target: Combatant,
  skill: EquipmentSkill,
  technique: EquipmentSkillContentTechnique,
): void {
  const attackerTalents = allCombatantTalents(combatant);

  const baseDamage = sum(
    (['Force', 'Aura', 'Health', 'Speed'] as GameStat[]).map((stat) =>
      getCombatantBaseStatDamageForTechnique(
        combat,
        combatant,
        skill,
        technique,
        stat,
      ),
    ),
  );

  if (baseDamage > 0) {
    const baseTargetDefense = target.totalStats.Aura;
    const targetDefense =
      technique.elements.length === 0
        ? baseTargetDefense
        : meanBy(
            technique.elements,
            (el) => baseTargetDefense * target.resistance[el],
          );

    let effectiveDamage = baseDamage;

    if (techniqueHasAttribute(technique, 'HealsTarget')) {
      effectiveDamage = Math.min(
        effectiveDamage,
        target.totalStats.Health - target.hp,
      );
      effectiveDamage = -Math.abs(effectiveDamage);
    }

    if (!techniqueHasAttribute(technique, 'BypassDefense')) {
      effectiveDamage = Math.max(0, effectiveDamage - targetDefense);
    }

    if (techniqueHasAttribute(technique, 'AllowPlink')) {
      effectiveDamage = Math.max(baseDamage > 0 ? 1 : 0, effectiveDamage);
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

    combatantTakeDamage(target, effectiveDamage);

    const templateData = {
      combat,
      combatant,
      target,
      skill,
      technique,
      damage: effectiveDamage,
      absdamage: Math.abs(effectiveDamage),
    };

    const message = formatCombatMessage(technique.combatMessage, templateData);
    logCombatMessage(combat, message);
  }

  technique.statusEffects.forEach((effData) => {
    const effectContent = getEntry<StatusEffectContent>(effData.statusEffectId);
    if (!effectContent) return;

    const totalChance =
      getSkillTechniqueStatusEffectChance(skill, effData) +
      talentStatusEffectChanceBoost(attackerTalents, skill, effectContent);

    if (!succeedsChance(totalChance)) return;

    const statusEffect = createStatusEffect(effectContent, skill, combatant, {
      duration: getSkillTechniqueStatusEffectDuration(skill, effData),
    });

    applyStatusEffectToTarget(combat, target, statusEffect);
  });

  if (isDead(target)) {
    logCombatMessage(combat, `**${target.name}** has been defeated!`);
  }
}
