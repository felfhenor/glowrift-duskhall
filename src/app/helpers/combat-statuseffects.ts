import { combatAllCombatantTalents } from '@helpers/combat';
import { combatCombatantTakeDamage } from '@helpers/combat-damage';
import { combatFormatMessage, combatMessageLog } from '@helpers/combat-log';
import { combatElementsSucceedsElementCombatStatChance } from '@helpers/combat-stats';
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

export function combatCanTakeTurn(combatant: Combatant): boolean {
  return !combatant.statusEffectData.isFrozen;
}

function statusEffectDamage(effect: StatusEffect): number {
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

export function combatHandleCombatantStatusEffects(
  combat: Combat,
  combatant: Combatant,
  trigger: StatusEffectTrigger,
): void {
  const triggeredEffects = combatant.statusEffects.filter(
    (s) => s.trigger === trigger,
  );
  if (triggeredEffects.length === 0) return;

  triggeredEffects.forEach((eff) => {
    combatTriggerTickStatusEffect(combat, combatant, eff);

    eff.duration--;

    if (eff.duration <= 0) {
      combatTriggerUnapplyStatusEffect(combat, combatant, eff);
    }
  });

  combatant.statusEffects = combatant.statusEffects.filter(
    (s) => s.duration > 0,
  );
}

export function combatCreateStatusEffect(
  content: StatusEffectContent,
  skill: EquipmentSkill,
  creator: Combatant,
  target: Combatant,
  opts: Partial<StatusEffect>,
  capturedCreatorStats?: StatBlock,
): StatusEffect {
  const creatorTalents = combatAllCombatantTalents(creator);
  const targetTalents = combatAllCombatantTalents(target);

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

export function combatApplyStatusEffectToTarget(
  combat: Combat,
  combatant: Combatant,
  statusEffect: StatusEffect,
): void {
  const existingEffect = combatant.statusEffects.find(
    (s) => s.id === statusEffect.id,
  );
  if (existingEffect) return;

  const shouldIgnoreDebuff = combatElementsSucceedsElementCombatStatChance(
    statusEffect.elements,
    combatant,
    'debuffIgnoreChance',
  );

  if (statusEffect.effectType === 'Debuff' && shouldIgnoreDebuff) {
    combatMessageLog(
      combat,
      `**${statusEffect.name}** is shrugged off by **${combatant.name}**!`,
      combatant,
    );
    return;
  }

  combatant.statusEffects.push(statusEffect);
  combatTriggerApplyStatusEffect(combat, combatant, statusEffect);
}

function combatApplyStatDeltaToCombatant(
  combatant: Combatant,
  stat: GameStat,
  value: number,
): void {
  combatant.statBoosts[stat] += value;
  combatant.totalStats[stat] += value;
}

function combatApplyCombatStatElementDeltaToCombatant(
  combatant: Combatant,
  stat: keyof CombatantCombatStats,
  element: GameElement,
  value: number,
): void {
  const ref = combatant.combatStats[stat];
  if (!ref || !isObject(ref)) return;

  (combatant.combatStats[stat] as ElementBlock)[element] += value;
}

function combatApplyCombatStatNumberDeltaToCombatant(
  combatant: Combatant,
  stat: keyof CombatantCombatStats,
  value: number,
): void {
  const ref = combatant.combatStats[stat];
  if (!isNumber(ref)) return;

  (combatant.combatStats[stat] as number) += value;
}

function combatHandleStatusEffectBehaviors(
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

      combatCombatantTakeDamage(combatant, -healing);
    },
    TakeDamage: () => {
      const damage = statusEffectDamage(effect);
      templateData.damage = damage;
      templateData.absdamage = Math.abs(damage);

      combatCombatantTakeDamage(combatant, damage);
    },
    AddDamageToStat: () => {
      const behaviorData = behavior as StatusEffectBehaviorAddStat;

      const damage = statusEffectDamage(effect);
      templateData.damage = damage;

      combatApplyStatDeltaToCombatant(
        combatant,
        behaviorData.modifyStat,
        damage,
      );
    },
    TakeDamageFromStat: () => {
      const behaviorData = behavior as StatusEffectBehaviorTakeStat;

      const damage = statusEffectDamage(effect);
      templateData.damage = damage;

      combatApplyStatDeltaToCombatant(
        combatant,
        behaviorData.modifyStat,
        -damage,
      );
    },
    AddCombatStatElement: () => {
      const behaviorData = behavior as StatusEffectAddCombatStatElement;

      combatApplyCombatStatElementDeltaToCombatant(
        combatant,
        behaviorData.combatStat,
        behaviorData.element,
        behaviorData.value,
      );
    },
    TakeCombatStatElement: () => {
      const behaviorData = behavior as StatusEffectTakeCombatStatElement;

      combatApplyCombatStatElementDeltaToCombatant(
        combatant,
        behaviorData.combatStat,
        behaviorData.element,
        -behaviorData.value,
      );
    },
    AddCombatStatNumber: () => {
      const behaviorData = behavior as StatusEffectAddCombatStatNumber;

      combatApplyCombatStatNumberDeltaToCombatant(
        combatant,
        behaviorData.combatStat,
        behaviorData.value,
      );
    },
    TakeCombatStatNumber: () => {
      const behaviorData = behavior as StatusEffectTakeCombatStatNumber;

      combatApplyCombatStatNumberDeltaToCombatant(
        combatant,
        behaviorData.combatStat,
        -behaviorData.value,
      );
    },
  };

  behaviorTypes[behavior.type]();

  if (!suppressMessages && behavior.combatMessage) {
    const message = combatFormatMessage(behavior.combatMessage, templateData);
    combatMessageLog(combat, message, combatant);
  }
}

function combatTriggerApplyStatusEffect(
  combat: Combat,
  combatant: Combatant,
  statusEffect: StatusEffect,
): void {
  statusEffect.onApply.forEach((beh) =>
    combatHandleStatusEffectBehaviors(combat, combatant, statusEffect, beh),
  );
}

function combatTriggerTickStatusEffect(
  combat: Combat,
  combatant: Combatant,
  statusEffect: StatusEffect,
): void {
  statusEffect.onTick.forEach((beh) =>
    combatHandleStatusEffectBehaviors(combat, combatant, statusEffect, beh),
  );
}

function combatTriggerUnapplyStatusEffect(
  combat: Combat,
  combatant: Combatant,
  statusEffect: StatusEffect,
): void {
  statusEffect.onUnapply.forEach((beh) =>
    combatHandleStatusEffectBehaviors(combat, combatant, statusEffect, beh),
  );
}

export function combatUnapplyAllStatusEffects(
  combat: Combat,
  combatant: Combatant,
): void {
  combatant.statusEffects.forEach((statusEffect) => {
    statusEffect.onUnapply.forEach((beh) =>
      combatHandleStatusEffectBehaviors(
        combat,
        combatant,
        statusEffect,
        beh,
        true,
      ),
    );
  });
}
