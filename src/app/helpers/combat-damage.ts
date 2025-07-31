import { allCombatantTalents } from '@helpers/combat';
import { isDead } from '@helpers/combat-end';
import { formatCombatMessage, logCombatMessage } from '@helpers/combat-log';
import {
  applyStatusEffectToTarget,
  createStatusEffect,
  statusEffectChanceTalentBoost,
} from '@helpers/combat-statuseffects';
import { getEntry } from '@helpers/content';
import { getDroppableEquippableBaseId } from '@helpers/droppable';
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
import type {
  Combat,
  Combatant,
  EquipmentSkill,
  EquipmentSkillAttribute,
  EquipmentSkillContentTechnique,
  GameElement,
  GameStat,
  StatusEffectContent,
  TalentId,
} from '@interfaces';
import { intersection, meanBy, sum, sumBy } from 'es-toolkit/compat';

export function techniqueHasAttribute(
  technique: EquipmentSkillContentTechnique,
  attribute: EquipmentSkillAttribute,
): boolean {
  return technique.attributes?.includes(attribute);
}

export function combatantTalentLevel(
  combatant: Combatant,
  talentId: TalentId,
): number {
  return combatant.talents[talentId] ?? 0;
}

export function combatantTalentElementBoost(
  combatant: Combatant,
  elements: GameElement[],
  stat: GameStat,
): number {
  return sum(
    allCombatantTalents(combatant)
      .filter((t) => intersection(t.boostedElements ?? [], elements).length > 0)
      .map(
        (t) =>
          combatantTalentLevel(combatant, t.id) * (t.boostStats[stat] ?? 0),
      ),
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
      .map(
        (t) =>
          combatantTalentLevel(combatant, t.id) * (t.boostStats[stat] ?? 0),
      ),
  );
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

  const baseMultiplier = getSkillTechniqueDamageScalingStat(
    skill,
    technique,
    stat,
  );

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

  const affinityElementBoostMultiplier = sumBy(
    technique.elements,
    (el) => combatant.affinity[el] + combat.elementalModifiers[el],
  );

  const baseStatWithoutMultiplier = combatant.totalStats[stat];

  const totalMultiplier =
    baseMultiplier +
    affinityElementBoostMultiplier +
    talentSkillMultiplierBoost +
    talentElementMultiplierBoost;

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
      statusEffectChanceTalentBoost(combatant, skill, effectContent);

    if (!succeedsChance(totalChance)) return;

    const statusEffect = createStatusEffect(effectContent, combatant, {
      duration: getSkillTechniqueStatusEffectDuration(skill, effData),
    });

    applyStatusEffectToTarget(combat, target, statusEffect);
  });

  if (isDead(target)) {
    logCombatMessage(combat, `**${target.name}** has been defeated!`);
  }
}
