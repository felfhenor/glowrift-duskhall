import type { CombatantStatusEffectData } from '@interfaces/combat';
import type { Branded, IsContentItem } from '@interfaces/identifiable';
import type { GameStat, StatBlock } from '@interfaces/stat';

export type StatusEffectId = Branded<string, 'StatusEffectId'>;

export type StatusEffectTrigger = 'TurnStart' | 'TurnEnd';

export type StatusEffectBehaviorType =
  | 'ModifyStatusEffectData'
  | 'AddDamageToStat'
  | 'TakeDamageFromStat'
  | 'HealDamage'
  | 'TakeDamage'
  | 'SendMessage';

export type StatusEffectBehaviorSendMessage = {
  type: 'SendMessage';
  combatMessage: string;
};

export type StatusEffectBehaviorDataChange = {
  type: 'ModifyStatusEffectData';
  combatMessage: string;
  key: keyof CombatantStatusEffectData;
  value: CombatantStatusEffectData[keyof CombatantStatusEffectData];
};

export type StatusEffectBehaviorAddStat = {
  type: 'AddDamageToStat';
  combatMessage: string;
  modifyStat: GameStat;
};

export type StatusEffectBehaviorTakeStat = {
  type: 'TakeDamageFromStat';
  combatMessage: string;
  modifyStat: GameStat;
};

export type StatusEffectBehaviorTakeDamage = {
  type: 'TakeDamage';
  combatMessage: string;
};

export type StatusEffectBehaviorHealDamage = {
  type: 'HealDamage';
  combatMessage: string;
};

export type StatusEffectBehavior =
  | StatusEffectBehaviorSendMessage
  | StatusEffectBehaviorDataChange
  | StatusEffectBehaviorTakeDamage
  | StatusEffectBehaviorHealDamage
  | StatusEffectBehaviorAddStat
  | StatusEffectBehaviorTakeStat;

export type StatusEffectContent = IsContentItem & {
  id: StatusEffectId;
  __type: 'statuseffect';

  trigger: StatusEffectTrigger;

  onApply: StatusEffectBehavior[];
  onTick: StatusEffectBehavior[];
  onUnapply: StatusEffectBehavior[];

  statScaling: StatBlock;
};

export type StatusEffect = StatusEffectContent & {
  duration: number;

  creatorStats: StatBlock;
};
