import { Animatable } from '@interfaces/artable';
import { ElementBlock } from '@interfaces/element';
import { Branded } from '@interfaces/identifiable';
import { EquipmentSkill, EquipmentSkillId } from '@interfaces/skill';
import { StatBlock } from '@interfaces/stat';
import { StatusEffect } from '@interfaces/statuseffect';
import { TalentId } from '@interfaces/talent';
import { WorldPosition } from '@interfaces/world';

export type CombatId = Branded<string, 'CombatId'>;

export interface CombatLog {
  combatId: CombatId;
  messageId: string;
  timestamp: number;
  locationName: string;
  message: string;
}

export type CombatantStatusEffectData = {
  isFrozen?: boolean;
};

export type CombatantTargettingType = 'Random' | 'Strongest' | 'Weakest';

export type Combatant = Animatable & {
  id: string;
  name: string;

  isEnemy: boolean;

  level: number;
  hp: number;

  targettingType: CombatantTargettingType;

  baseStats: StatBlock;
  totalStats: StatBlock;

  resistance: ElementBlock;
  affinity: ElementBlock;

  skillIds: EquipmentSkillId[];
  skillRefs: EquipmentSkill[];

  talents: Record<TalentId, number>;

  skillUses: Record<EquipmentSkillId, number>;

  statusEffects: StatusEffect[];
  statusEffectData: CombatantStatusEffectData;
};

export interface Combat {
  id: CombatId;
  locationName: string;
  locationPosition: WorldPosition;
  rounds: number;
  heroes: Combatant[];
  guardians: Combatant[];
}
