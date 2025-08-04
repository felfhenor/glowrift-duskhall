import { allCombatantTalents } from '@helpers/combat';
import { combatantTakeDamage } from '@helpers/combat-damage';
import { formatCombatMessage, logCombatMessage } from '@helpers/combat-log';
import { talentStatusEffectStatBoost } from '@helpers/talent';
import type { Combat, Combatant } from '@interfaces/combat';
import type { EquipmentSkill } from '@interfaces/content-skill';
import type {
  StatusEffect,
  StatusEffectBehavior,
  StatusEffectBehaviorAddStat,
  StatusEffectBehaviorDataChange,
  StatusEffectBehaviorTakeStat,
  StatusEffectBehaviorType,
  StatusEffectContent,
  StatusEffectTrigger,
} from '@interfaces/content-statuseffect';
import type { GameStat } from '@interfaces/stat';

export function canTakeTurn(combatant: Combatant): boolean {
  return !combatant.statusEffectData.isFrozen;
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
  skill: EquipmentSkill,
  creator: Combatant,
  target: Combatant,
  opts: Partial<StatusEffect>,
): StatusEffect {
  const creatorTalents = allCombatantTalents(creator);
  const targetTalents = allCombatantTalents(target);

  return {
    duration: 1,
    ...content,
    ...opts,
    creatorStats: {
      Aura:
        creator.totalStats.Aura +
        creator.totalStats.Aura *
          talentStatusEffectStatBoost(creatorTalents, skill, content, 'Aura'),
      Force:
        creator.totalStats.Force +
        creator.totalStats.Force *
          talentStatusEffectStatBoost(creatorTalents, skill, content, 'Force'),
      Health:
        creator.totalStats.Health +
        creator.totalStats.Health *
          talentStatusEffectStatBoost(creatorTalents, skill, content, 'Health'),
      Speed:
        creator.totalStats.Speed +
        creator.totalStats.Speed *
          talentStatusEffectStatBoost(creatorTalents, skill, content, 'Speed'),
    },
    targetStats: {
      Aura:
        target.totalStats.Aura +
        target.totalStats.Aura *
          talentStatusEffectStatBoost(targetTalents, skill, content, 'Aura'),
      Force:
        target.totalStats.Force +
        target.totalStats.Force *
          talentStatusEffectStatBoost(targetTalents, skill, content, 'Force'),
      Health:
        target.totalStats.Health +
        target.totalStats.Health *
          talentStatusEffectStatBoost(targetTalents, skill, content, 'Health'),
      Speed:
        target.totalStats.Speed +
        target.totalStats.Speed *
          talentStatusEffectStatBoost(targetTalents, skill, content, 'Speed'),
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

export function applyStatDeltaToCombatant(
  combatant: Combatant,
  stat: GameStat,
  value: number,
): void {
  combatant.statBoosts[stat] += value;
  combatant.totalStats[stat] += value;
}

export function handleStatusEffectBehaviors(
  combat: Combat,
  combatant: Combatant,
  effect: StatusEffect,
  behavior: StatusEffectBehavior,
): void {
  const templateData = {
    damage: 0,
    healing: 0,
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
    HealDamage: () => {
      const healing = statusEffectDamage(effect);
      templateData.healing = healing;

      combatantTakeDamage(combatant, -healing);
    },
    TakeDamage: () => {
      const damage = statusEffectDamage(effect);
      templateData.damage = damage;
      templateData.absdamage = Math.abs(damage);

      combatantTakeDamage(combatant, damage);
    },
    AddDamageToStat: () => {
      const behaviorData = behavior as StatusEffectBehaviorAddStat;

      const damage = statusEffectDamage(effect);
      templateData.damage = damage;

      applyStatDeltaToCombatant(combatant, behaviorData.modifyStat, damage);
    },
    TakeDamageFromStat: () => {
      const behaviorData = behavior as StatusEffectBehaviorTakeStat;

      const damage = statusEffectDamage(effect);
      templateData.damage = damage;

      applyStatDeltaToCombatant(combatant, behaviorData.modifyStat, -damage);
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
