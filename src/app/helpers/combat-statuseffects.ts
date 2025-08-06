import { allCombatantTalents } from '@helpers/combat';
import { combatantTakeDamage } from '@helpers/combat-damage';
import { formatCombatMessage, logCombatMessage } from '@helpers/combat-log';
import { elementsSucceedsElementCombatStatChance } from '@helpers/combat-stats';
import { talentStatusEffectStatBoost } from '@helpers/talent';
import type {
  Combat,
  Combatant,
  CombatantCombatStats,
} from '@interfaces/combat';
import type { EquipmentSkill } from '@interfaces/content-skill';
import type {
  StatusEffect,
  StatusEffectAddCombatStatElement,
  StatusEffectAddCombatStatNumber,
  StatusEffectBehavior,
  StatusEffectBehaviorAddStat,
  StatusEffectBehaviorDataChange,
  StatusEffectBehaviorTakeStat,
  StatusEffectBehaviorType,
  StatusEffectContent,
  StatusEffectTakeCombatStatElement,
  StatusEffectTakeCombatStatNumber,
  StatusEffectTrigger,
} from '@interfaces/content-statuseffect';
import type { ElementBlock, GameElement } from '@interfaces/element';
import type { GameStat, StatBlock } from '@interfaces/stat';
import { isNumber, isObject } from 'es-toolkit/compat';

export function canTakeTurn(combatant: Combatant): boolean {
  return !combatant.statusEffectData.isFrozen;
}

export function statusEffectDamage(effect: StatusEffect): number {
  const statBlock = effect.useTargetStats
    ? effect.targetStats
    : effect.creatorStats;

  return Math.floor(
    statBlock.Aura * effect.statScaling.Aura +
      statBlock.Force * effect.statScaling.Force +
      statBlock.Health * effect.statScaling.Health +
      statBlock.Speed * effect.statScaling.Speed,
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
  capturedCreatorStats?: StatBlock,
): StatusEffect {
  const creatorTalents = allCombatantTalents(creator);
  const targetTalents = allCombatantTalents(target);

  // Use captured stats if provided, otherwise use current stats
  const baseCreatorStats = capturedCreatorStats || creator.totalStats;

  return {
    duration: 1,
    ...content,
    ...opts,
    creatorStats: {
      Aura:
        baseCreatorStats.Aura +
        baseCreatorStats.Aura *
          talentStatusEffectStatBoost(creatorTalents, skill, content, 'Aura'),
      Force:
        baseCreatorStats.Force +
        baseCreatorStats.Force *
          talentStatusEffectStatBoost(creatorTalents, skill, content, 'Force'),
      Health:
        baseCreatorStats.Health +
        baseCreatorStats.Health *
          talentStatusEffectStatBoost(creatorTalents, skill, content, 'Health'),
      Speed:
        baseCreatorStats.Speed +
        baseCreatorStats.Speed *
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
  const existingEffect = combatant.statusEffects.find(
    (s) => s.id === statusEffect.id,
  );
  if (existingEffect) return;

  const shouldIgnoreDebuff = elementsSucceedsElementCombatStatChance(
    statusEffect.elements,
    combatant,
    'debuffIgnoreChance',
  );

  if (statusEffect.effectType === 'Debuff' && shouldIgnoreDebuff) {
    logCombatMessage(
      combat,
      `**${statusEffect.name}** is shrugged off by **${combatant.name}**!`,
      combatant,
    );
    return;
  }

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

export function applyCombatStatElementDeltaToCombatant(
  combatant: Combatant,
  stat: keyof CombatantCombatStats,
  element: GameElement,
  value: number,
): void {
  const ref = combatant.combatStats[stat];
  if (!ref || !isObject(ref)) return;

  (combatant.combatStats[stat] as ElementBlock)[element] += value;
}

export function applyCombatStatNumberDeltaToCombatant(
  combatant: Combatant,
  stat: keyof CombatantCombatStats,
  value: number,
): void {
  const ref = combatant.combatStats[stat];
  if (!isNumber(ref)) return;

  (combatant.combatStats[stat] as number) += value;
}

export function handleStatusEffectBehaviors(
  combat: Combat,
  combatant: Combatant,
  effect: StatusEffect,
  behavior: StatusEffectBehavior,
  suppressMessages = false,
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
    AddCombatStatElement: () => {
      const behaviorData = behavior as StatusEffectAddCombatStatElement;

      applyCombatStatElementDeltaToCombatant(
        combatant,
        behaviorData.combatStat,
        behaviorData.element,
        behaviorData.value,
      );
    },
    TakeCombatStatElement: () => {
      const behaviorData = behavior as StatusEffectTakeCombatStatElement;

      applyCombatStatElementDeltaToCombatant(
        combatant,
        behaviorData.combatStat,
        behaviorData.element,
        -behaviorData.value,
      );
    },
    AddCombatStatNumber: () => {
      const behaviorData = behavior as StatusEffectAddCombatStatNumber;

      applyCombatStatNumberDeltaToCombatant(
        combatant,
        behaviorData.combatStat,
        behaviorData.value,
      );
    },
    TakeCombatStatNumber: () => {
      const behaviorData = behavior as StatusEffectTakeCombatStatNumber;

      applyCombatStatNumberDeltaToCombatant(
        combatant,
        behaviorData.combatStat,
        -behaviorData.value,
      );
    },
  };

  behaviorTypes[behavior.type]();

  if (!suppressMessages && behavior.combatMessage) {
    const message = formatCombatMessage(behavior.combatMessage, templateData);
    logCombatMessage(combat, message, combatant);
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

export function unapplyAllStatusEffects(
  combat: Combat,
  combatant: Combatant,
): void {
  combatant.statusEffects.forEach((statusEffect) => {
    statusEffect.onUnapply.forEach((beh) =>
      handleStatusEffectBehaviors(combat, combatant, statusEffect, beh, true),
    );
  });
}
