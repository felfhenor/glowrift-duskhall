import { CombatantStatusEffectData } from '@interfaces/combat';
import { Branded, Content } from '@interfaces/identifiable';
import { StatBlock } from '@interfaces/stat';

export type StatusEffectId = Branded<string, 'StatusEffectId'>;

export type StatusEffectTrigger = 'TurnStart' | 'TurnEnd';

export type StatusEffectBehaviorType =
  | 'ModifyStatusEffectData'
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

export type StatusEffectBehaviorTakeDamage = {
  type: 'TakeDamage';
  combatMessage: string;
};

export type StatusEffectBehavior =
  | StatusEffectBehaviorSendMessage
  | StatusEffectBehaviorDataChange
  | StatusEffectBehaviorTakeDamage;

export interface StatusEffectContent extends Content {
  id: StatusEffectId;
  __type: 'statuseffect';

  trigger: StatusEffectTrigger;

  onApply: StatusEffectBehavior[];
  onTick: StatusEffectBehavior[];
  onUnapply: StatusEffectBehavior[];

  statScaling: StatBlock;
}

export type StatusEffect = StatusEffectContent & {
  duration: number;

  creatorStats: StatBlock;
};
