import { allCombatantTalents } from '@helpers/combat';
import { combatantTakeDamage } from '@helpers/combat-damage';
import { formatCombatMessage, logCombatMessage } from '@helpers/combat-log';
import { getDroppableEquippableBaseId } from '@helpers/droppable';
import type { Combat, Combatant } from '@interfaces/combat';
import type { EquipmentSkill } from '@interfaces/content-skill';
import type {
  StatusEffect,
  StatusEffectBehavior,
  StatusEffectBehaviorDataChange,
  StatusEffectBehaviorType,
  StatusEffectContent,
  StatusEffectTrigger,
} from '@interfaces/content-statuseffect';
import type { GameStat } from '@interfaces/stat';
import { sum } from 'es-toolkit/compat';

export function canTakeTurn(combatant: Combatant): boolean {
  return !combatant.statusEffectData.isFrozen;
}

export function statusEffectChanceTalentBoost(
  combatant: Combatant,
  skill: EquipmentSkill,
  effect: StatusEffectContent,
): number {
  return sum(
    allCombatantTalents(combatant)
      .filter((t) =>
        t.boostedSkillIds.length === 0
          ? true
          : t.boostedSkillIds.includes(getDroppableEquippableBaseId(skill)),
      )
      .filter((t) => t.boostedStatusEffectIds.includes(effect.id))
      .map((t) => t.boostedStatusEffectChance),
  );
}

export function statusEffectStatTalentBoost(
  combatant: Combatant,
  effect: StatusEffectContent,
  stat: GameStat,
): number {
  return sum(
    allCombatantTalents(combatant)
      .filter((t) => t.boostedStatusEffectIds.includes(effect.id))
      .map((t) => t.boostStatusEffectStats[stat] ?? 0),
  );
}

export function statusEffectDamage(effect: StatusEffect): number {
  return Math.floor(
    effect.creatorStats.Aura * effect.statScaling.Aura +
      effect.creatorStats.Force * effect.statScaling.Force +
      effect.creatorStats.Health * effect.statScaling.Health +
      effect.creatorStats.Speed * effect.statScaling.Speed,
  );
}

export function handleCombatantStatusEffects(
  combat: Combat,
  combatant: Combatant,
  trigger: StatusEffectTrigger,
): void {
  const triggeredEffects = combatant.statusEffects.filter(
    (s) => s.trigger === trigger,
  );
  if (triggeredEffects.length === 0) return;

  triggeredEffects.forEach((eff) => {
    triggerTickStatusEffect(combat, combatant, eff);

    eff.duration--;

    if (eff.duration <= 0) {
      triggerUnapplyStatusEffect(combat, combatant, eff);
    }
  });

  combatant.statusEffects = combatant.statusEffects.filter(
    (s) => s.duration > 0,
  );
}

export function createStatusEffect(
  content: StatusEffectContent,
  creator: Combatant,
  opts: Partial<StatusEffect>,
): StatusEffect {
  return {
    duration: 1,
    ...content,
    ...opts,
    creatorStats: {
      Aura:
        creator.totalStats.Aura +
        creator.totalStats.Aura *
          statusEffectStatTalentBoost(creator, content, 'Aura'),
      Force:
        creator.totalStats.Force +
        creator.totalStats.Force *
          statusEffectStatTalentBoost(creator, content, 'Force'),
      Health:
        creator.totalStats.Health +
        creator.totalStats.Health *
          statusEffectStatTalentBoost(creator, content, 'Health'),
      Speed:
        creator.totalStats.Speed +
        creator.totalStats.Speed *
          statusEffectStatTalentBoost(creator, content, 'Speed'),
    },
  };
}

export function applyStatusEffectToTarget(
  combat: Combat,
  combatant: Combatant,
  statusEffect: StatusEffect,
): void {
  combatant.statusEffects.push(statusEffect);
  triggerApplyStatusEffect(combat, combatant, statusEffect);
}

export function handleStatusEffectBehaviors(
  combat: Combat,
  combatant: Combatant,
  effect: StatusEffect,
  behavior: StatusEffectBehavior,
): void {
  const templateData = {
    damage: 0,
    absdamage: 0,
    combatant,
  };

  const behaviorTypes: Record<StatusEffectBehaviorType, () => void> = {
    SendMessage: () => {},
    ModifyStatusEffectData: () => {
      const behaviorData = behavior as StatusEffectBehaviorDataChange;
      const { key, value } = behaviorData;
      combatant.statusEffectData[key] = value;
    },
    TakeDamage: () => {
      const damage = statusEffectDamage(effect);
      templateData.damage = damage;
      templateData.absdamage = Math.abs(damage);

      combatantTakeDamage(combatant, damage);
    },
  };

  behaviorTypes[behavior.type]();

  if (behavior.combatMessage) {
    const message = formatCombatMessage(behavior.combatMessage, templateData);
    logCombatMessage(combat, message);
  }
}

export function triggerApplyStatusEffect(
  combat: Combat,
  combatant: Combatant,
  statusEffect: StatusEffect,
): void {
  statusEffect.onApply.forEach((beh) =>
    handleStatusEffectBehaviors(combat, combatant, statusEffect, beh),
  );
}

export function triggerTickStatusEffect(
  combat: Combat,
  combatant: Combatant,
  statusEffect: StatusEffect,
): void {
  statusEffect.onTick.forEach((beh) =>
    handleStatusEffectBehaviors(combat, combatant, statusEffect, beh),
  );
}

export function triggerUnapplyStatusEffect(
  combat: Combat,
  combatant: Combatant,
  statusEffect: StatusEffect,
): void {
  statusEffect.onUnapply.forEach((beh) =>
    handleStatusEffectBehaviors(combat, combatant, statusEffect, beh),
  );
}
