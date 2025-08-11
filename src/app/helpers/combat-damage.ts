import { combatantIsDead } from '@helpers/combat-end';
import { combatFormatMessage, combatMessageLog } from '@helpers/combat-log';
import {
  combatApplyStatusEffectToTarget,
  combatCreateStatusEffect,
} from '@helpers/combat-statuseffects';
import { getEntry } from '@helpers/content';
import {
  festivalGetCombatIncomingAttributeMultiplier,
  festivalGetCombatOutgoingAttributeMultiplier,
} from '@helpers/festival-combat';
import { rngSucceedsChance } from '@helpers/rng';
import {
  skillTechniqueDamageScalingStat,
  skillTechniqueStatusEffectChance,
  skillTechniqueStatusEffectDuration,
} from '@helpers/skill';
import type {
  Combat,
  Combatant,
  EquipmentSkill,
  EquipmentSkillAttribute,
  EquipmentSkillContentTechnique,
  GameStat,
  StatBlock,
  StatusEffectContent,
} from '@interfaces';
import { clamp, meanBy, sum, sumBy } from 'es-toolkit/compat';

function techniqueHasAttribute(
  technique: EquipmentSkillContentTechnique,
  attribute: EquipmentSkillAttribute,
): boolean {
  return technique.attributes?.includes(attribute);
}

function getCombatantBaseStatDamageForTechnique(
  combat: Combat,
  combatant: Combatant,
  skill: EquipmentSkill,
  technique: EquipmentSkillContentTechnique,
  stat: GameStat,
): number {
  const baseCheckMultiplier = technique.damageScaling[stat] ?? 0;
  if (baseCheckMultiplier === 0) return 0;

  const baseMultiplier = skillTechniqueDamageScalingStat(
    skill,
    technique,
    stat,
  );

  const affinityElementBoostMultiplier = sumBy(
    technique.elements,
    (el) => combatant.affinity[el] + combat.elementalModifiers[el],
  );

  const baseStatWithoutMultiplier = combatant.totalStats[stat];

  const totalMultiplier = baseMultiplier + affinityElementBoostMultiplier;

  const multipliedStat = baseStatWithoutMultiplier * totalMultiplier;

  return baseStatWithoutMultiplier + multipliedStat;
}

function getDeadlockPreventionDamageMultiplier(rounds: number): number {
  const multiplierTiers = Math.floor(rounds / 25);
  return 1 + 0.25 * multiplierTiers;
}

export function combatCombatantTakeDamage(
  combatant: Combatant,
  damage: number,
) {
  combatant.hp = clamp(combatant.hp - damage, 0, combatant.totalStats.Health);
}

export function combatApplySkillToTarget(
  combat: Combat,
  combatant: Combatant,
  target: Combatant,
  skill: EquipmentSkill,
  technique: EquipmentSkillContentTechnique,
  capturedCreatorStats?: StatBlock,
): void {
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

  const templateData = {
    combat,
    combatant,
    target,
    skill,
    technique,
    damage: 0,
    absdamage: 0,
  };

  let retaliationDamage = 0;

  if (baseDamage > 0) {
    const baseTargetDefense = target.totalStats.Aura;
    const targetDefense =
      technique.elements.length === 0
        ? baseTargetDefense
        : meanBy(
            technique.elements,
            (el) => baseTargetDefense * (1 - target.resistance[el]),
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
        1 + festivalGetCombatIncomingAttributeMultiplier('damage');
    }

    if (!combatant.isEnemy && target.isEnemy && effectiveDamage > 0) {
      damageMultiplierFromFestivals =
        1 + festivalGetCombatOutgoingAttributeMultiplier('damage');
    }

    // Apply deadlock prevention damage multiplier (only for damage, not healing)
    let deadlockPreventionMultiplier = 1;
    if (effectiveDamage > 0) {
      deadlockPreventionMultiplier = getDeadlockPreventionDamageMultiplier(
        combat.rounds,
      );
    }

    effectiveDamage *=
      damageMultiplierFromFestivals * deadlockPreventionMultiplier;
    effectiveDamage = Math.floor(effectiveDamage);

    combatCombatantTakeDamage(target, effectiveDamage);

    templateData.damage = effectiveDamage;
    templateData.absdamage = Math.abs(effectiveDamage);

    const damageReflectPercent = meanBy(
      technique.elements,
      (el) => target.combatStats.damageReflectPercent[el],
    );
    if (effectiveDamage > 0 && damageReflectPercent > 0) {
      retaliationDamage = Math.floor(
        (effectiveDamage * damageReflectPercent) / 100,
      );
    }
  }

  if (technique.combatMessage) {
    const message = combatFormatMessage(technique.combatMessage, templateData);
    combatMessageLog(combat, message, combatant);
  }

  if (retaliationDamage > 0) {
    combatCombatantTakeDamage(combatant, retaliationDamage);

    combatMessageLog(
      combat,
      `**${combatant.name}** took ${retaliationDamage} damage in retaliation (${combatant.hp}/${combatant.totalStats.Health} HP remaining)!`,
      combatant,
    );
  }

  technique.statusEffects.forEach((effData) => {
    const effectContent = getEntry<StatusEffectContent>(effData.statusEffectId);
    if (!effectContent) return;

    const totalChance = skillTechniqueStatusEffectChance(skill, effData);

    if (!rngSucceedsChance(totalChance)) return;

    const statusEffect = combatCreateStatusEffect(
      effectContent,
      skill,
      combatant,
      target,
      {
        duration: skillTechniqueStatusEffectDuration(skill, effData),
      },
      capturedCreatorStats,
    );

    combatApplyStatusEffectToTarget(combat, target, statusEffect);
  });

  if (combatantIsDead(target)) {
    combatMessageLog(
      combat,
      `**${target.name}** has been defeated!`,
      combatant,
    );
  }
}
