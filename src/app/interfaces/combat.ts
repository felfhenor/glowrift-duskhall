import type { Animatable } from '@interfaces/artable';
import type {
  EquipmentSkill,
  EquipmentSkillId,
} from '@interfaces/content-skill';
import type { StatusEffect } from '@interfaces/content-statuseffect';
import type { TalentId } from '@interfaces/content-talent';
import type { ElementBlock } from '@interfaces/element';
import type { Branded } from '@interfaces/identifiable';
import type { StatBlock } from '@interfaces/stat';
import type { WorldPosition } from '@interfaces/world';

export type CombatId = Branded<string, 'CombatId'>;

export interface CombatLog {
  combatId: CombatId;
  messageId: string;
  timestamp: number;
  locationName: string;
  message: string;
  spritesheet?: 'guardian' | 'hero';
  sprite?: string;
}

export type CombatantStatusEffectData = {
  isFrozen?: boolean;
};

export type CombatantCombatStats = {
  repeatActionChance: ElementBlock;
  skillStrikeAgainChance: ElementBlock;
  skillAdditionalUseChance: ElementBlock;
  skillAdditionalUseCount: ElementBlock;
  redirectionChance: ElementBlock;
  reviveChance: number;
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
  statBoosts: StatBlock;
  totalStats: StatBlock;

  combatStats: CombatantCombatStats;

  resistance: ElementBlock;
  affinity: ElementBlock;

  skillIds: EquipmentSkillId[];
  skillRefs: EquipmentSkill[];

  talents: Record<TalentId, number>;

  skillUses: Record<EquipmentSkillId, number>;

  statusEffects: StatusEffect[];
  statusEffectData: CombatantStatusEffectData;

  sprite?: string;
};

export interface Combat {
  id: CombatId;
  locationName: string;
  locationPosition: WorldPosition;
  rounds: number;
  heroes: Combatant[];
  guardians: Combatant[];

  elementalModifiers: ElementBlock;
}
